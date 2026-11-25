import type { Page } from '@playwright/test';

export class WebsitePage {
  constructor(readonly page: Page) {}

  get mainNavigation() {
    return this.page.getByRole('navigation', { name: 'Hauptnavigation' });
  }

  get legalNavigation() {
    return this.page.getByRole('navigation', { name: 'Rechtliches' });
  }

  get logo() {
    return this.page.getByRole('link', { name: 'DYAS – zur Startseite' });
  }

  get projectLink() {
    return this.mainNavigation.getByRole('link', { name: 'Projekt anfragen' });
  }

  get processLink() {
    return this.page.getByRole('link', { name: 'So läuft ein Projekt ab' });
  }

  get contactForm() {
    return this.page.locator('form');
  }

  get nameInput() {
    return this.contactForm.getByLabel('Name *', { exact: true });
  }

  get companyInput() {
    return this.contactForm.getByLabel('Unternehmen *', { exact: true });
  }

  get emailInput() {
    return this.contactForm.getByLabel('E-Mail *', { exact: true });
  }

  get phoneInput() {
    return this.contactForm.getByLabel('Telefon', { exact: true });
  }

  get projectType() {
    return this.contactForm.getByLabel('Art des Projekts');
  }

  get workplaceCount() {
    return this.contactForm.getByLabel('Anzahl Arbeitsplätze');
  }

  get requestedDate() {
    return this.contactForm.getByLabel('Wunschtermin (ungefähr)');
  }

  get messageInput() {
    return this.contactForm.getByLabel('Ihr Vorhaben');
  }

  get consentInput() {
    return this.contactForm.getByRole('checkbox');
  }

  get submitButton() {
    return this.contactForm.getByRole('button', { name: 'Unverbindlich anfragen' });
  }

  get privacyLink() {
    return this.contactForm.getByRole('link', { name: 'Datenschutzerklärung' });
  }

  navigationLink(name: string) {
    return this.mainNavigation.getByRole('link', { name, exact: true });
  }

  legalLink(name: string) {
    return this.legalNavigation.getByRole('link', { name, exact: true });
  }

  heading(name: string | RegExp) {
    return this.page.getByRole('heading', { name, exact: true });
  }

  async open(path = '/') {
    const response = await this.page.goto(path);
    await this.page.evaluate(async () => {
      await document.fonts.ready;
    });
    return response;
  }

  async fillRequiredContactFields() {
    await this.nameInput.fill('Erika Muster');
    await this.companyInput.fill('E2E Testunternehmen');
    await this.emailInput.fill('erika@example.com');
  }
}
