import { test, expect } from '../fixtures';

test('lädt die Startseite mit Styles und ausschließlich lokalen Schriftarten', async ({
  website,
  page,
  baseURL,
}) => {
  const failedResources: string[] = [];
  const externalRequests: string[] = [];
  const loadedFonts = new Set<string>();
  const origin = new URL(baseURL!).origin;

  page.on('requestfailed', (request) => failedResources.push(request.url()));
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== origin) {
      externalRequests.push(request.url());
    }
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedResources.push(`${response.status()} ${response.url()}`);
    }
    if (response.ok() && response.url().endsWith('.woff2')) {
      loadedFonts.add(response.url());
    }
  });

  const response = await website.open();

  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle('DYAS – IT-Umzüge & Hardware-Rollouts');
  await expect(website.heading('Freitag abgebaut. Montag läuft’s.')).toBeVisible();
  await expect(website.heading('Alles, was Ihre IT bewegt')).toBeVisible();
  await expect(website.projectLink).toHaveCSS('background-color', 'rgb(194, 65, 12)');
  const declaredFontCount = await page.evaluate(async () => {
    const fonts = Array.from(document.fonts);
    await Promise.all(fonts.map((font) => font.load()));
    await document.fonts.ready;
    return fonts.length;
  });
  expect(declaredFontCount).toBe(5);
  expect(loadedFonts.size).toBe(declaredFontCount);
  expect(failedResources).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test('führt über die Projektanfrage zum sichtbaren Kontaktformular', async ({
  website,
  page,
}) => {
  await website.open();

  await website.projectLink.click();

  await expect(page).toHaveURL(/\/#kontakt$/);
  await expect(website.heading('Ihr Projekt in 24 Stunden eingeschätzt')).toBeInViewport();
  await expect(website.contactForm).toBeVisible();
});

test('führt über den Ablauf-Link zum Projektablauf', async ({ website, page }) => {
  await website.open();

  await website.processLink.click();

  await expect(page).toHaveURL(/\/#ablauf$/);
  await expect(website.heading('Vier Schritte. Ein Ansprechpartner.')).toBeInViewport();
});

test('verlinkt die Leistungsbereiche in der Desktop-Navigation und blendet sie mobil aus', async ({
  website,
  isMobile,
  page,
}) => {
  await website.open();

  for (const [label, section] of [
    ['Leistungen', 'leistungen'],
    ['Ablauf', 'ablauf'],
    ['Über mich', 'ueber-mich'],
    ['FAQ', 'faq'],
  ]) {
    const link = website.navigationLink(label);
    if (isMobile) {
      await expect(link).toBeHidden();
    } else {
      await link.click();
      await expect(page).toHaveURL(new RegExp(`/#${section}$`));
    }
  }
});

for (const legalPage of [
  { link: 'Impressum', path: 'impressum.html', heading: 'Impressum' },
  { link: 'Datenschutz', path: 'datenschutz.html', heading: 'Datenschutzerklärung' },
]) {
  test(`öffnet ${legalPage.link} und führt zurück zum Kontaktformular`, async ({
    website,
    page,
  }) => {
    await website.open();

    await website.legalLink(legalPage.link).click();

    await expect(page).toHaveURL(new RegExp(`/${legalPage.path.replace('.', '\\.')}$`));
    await expect(website.heading(legalPage.heading)).toBeVisible();
    await expect(page).toHaveTitle(`${legalPage.link} – DYAS`);

    await website.projectLink.click();

    await expect(page).toHaveURL(/\/index\.html#kontakt$/);
    await expect(website.heading('Ihr Projekt in 24 Stunden eingeschätzt')).toBeInViewport();
    await expect(website.contactForm).toBeVisible();
  });
}

test('führt über das Logo von einer Unterseite zurück zur Startseite', async ({
  website,
  page,
}) => {
  await website.open('/impressum.html');

  await website.logo.click();

  await expect(page).toHaveURL(/\/index\.html$/);
  await expect(website.heading('Freitag abgebaut. Montag läuft’s.')).toBeVisible();
});
