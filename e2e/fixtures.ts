import { test as base, expect } from '@playwright/test';
import { WebsitePage } from './pages/website.page';

export const test = base.extend<{ website: WebsitePage }>({
  website: async ({ page, context }, use) => {
    // Ein Test darf auch bei einem Fehler niemals eine echte Anfrage versenden.
    await context.route('https://formspree.io/**', (route) =>
      route.abort('blockedbyclient'),
    );
    await use(new WebsitePage(page));
  },
});

export { expect };
