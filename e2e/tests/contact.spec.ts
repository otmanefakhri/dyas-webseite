import { test, expect } from '../fixtures';

test('verhindert das Absenden bei fehlenden Pflichtfeldern und fehlender Einwilligung', async ({
  website,
  page,
}) => {
  await website.open('/#kontakt');

  await website.submitButton.click();
  await expect(website.nameInput).toBeFocused();

  await website.nameInput.fill('Erika Muster');
  await website.submitButton.click();
  await expect(website.companyInput).toBeFocused();

  await website.companyInput.fill('E2E Testunternehmen');
  await website.submitButton.click();
  await expect(website.emailInput).toBeFocused();

  await website.emailInput.fill('erika@example.com');
  await website.submitButton.click();
  await expect(website.consentInput).toBeFocused();
  await expect(page).toHaveURL(/\/#kontakt$/);
});

test('verhindert das Absenden einer ungültigen E-Mail-Adresse', async ({
  website,
  page,
}) => {
  await website.open('/#kontakt');
  await website.fillRequiredContactFields();
  await website.emailInput.fill('keine-gueltige-email');
  await website.consentInput.check();

  await website.submitButton.click();

  await expect(website.emailInput).toBeFocused();
  expect(await website.emailInput.evaluate(
    (input: HTMLInputElement) => input.validity.typeMismatch,
  )).toBe(true);
  await expect(page).toHaveURL(/\/#kontakt$/);
});

test('übermittelt die Formulardaten ausschließlich an einen gemockten Formspree-Dienst', async ({
  website,
  page,
}) => {
  await page.route('https://formspree.io/f/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: '<!doctype html><html lang="de"><head><title>Testantwort</title></head><body><h1>Testanfrage empfangen</h1></body></html>',
    }),
  );
  await website.open('/#kontakt');
  await website.fillRequiredContactFields();
  await website.phoneInput.fill('+49 30 000000');
  await website.projectType.selectOption('Hardware-Rollout');
  await website.workplaceCount.selectOption('26–100');
  await website.requestedDate.fill('Ende Q1');
  await website.messageInput.fill('Automatisierte Testanfrage – nicht versenden.');
  await website.consentInput.check();
  const responsePromise = page.waitForResponse((response) =>
    response.url().startsWith('https://formspree.io/f/')
      && response.request().method() === 'POST',
  );

  await website.submitButton.click();
  const response = await responsePromise;

  expect(response.status()).toBe(200);
  expect(Object.fromEntries(new URLSearchParams(
    response.request().postData() ?? '',
  ))).toEqual({
    _subject: 'Neue Projektanfrage über dyas-Webseite',
    _gotcha: '',
    name: 'Erika Muster',
    unternehmen: 'E2E Testunternehmen',
    email: 'erika@example.com',
    telefon: '+49 30 000000',
    projektart: 'Hardware-Rollout',
    arbeitsplaetze: '26–100',
    wunschtermin: 'Ende Q1',
    nachricht: 'Automatisierte Testanfrage – nicht versenden.',
    datenschutz: 'zugestimmt',
  });
  await expect(website.heading('Testanfrage empfangen')).toBeVisible();
});

test('öffnet die Datenschutzerklärung direkt aus der Einwilligung', async ({
  website,
  page,
}) => {
  await website.open('/#kontakt');

  await website.privacyLink.click();

  await expect(page).toHaveURL(/\/datenschutz\.html$/);
  await expect(website.heading('Datenschutzerklärung')).toBeVisible();
});
