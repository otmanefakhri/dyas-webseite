import { test, expect } from '../fixtures';

for (const path of ['/', '/impressum.html', '/datenschutz.html']) {
  test(`zeigt ${path} ohne horizontales Scrollen und mit erreichbarer Projektanfrage`, async ({
    website,
    page,
  }) => {
    await website.open(path);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    await expect(website.logo).toBeInViewport();
    await expect(website.projectLink).toBeInViewport();
    const dimensions = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);

    await website.projectLink.click();

    await expect(website.heading('Ihr Projekt in 24 Stunden eingeschätzt')).toBeInViewport();
    await website.nameInput.scrollIntoViewIfNeeded();
    await expect(website.nameInput).toBeInViewport();
    await expect(website.submitButton).toBeEnabled();
  });
}
