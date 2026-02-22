const { test, expect } = require('@playwright/test');

test('full flow smoke', async ({ page, request }) => {
  await page.goto('/register');
  await page.fill('input[placeholder="name"]', 'Photographer');
  await page.fill('input[placeholder="email"]', `p${Date.now()}@mail.com`);
  await page.fill('input[placeholder="password"]', 'password123');
  await page.click('button:has-text("Create account")');
  await expect(page.locator('h1')).toHaveText('Projects');

  await page.fill('input[placeholder="Project name"]', 'Shoot A');
  await page.click('button:has-text("Create Project")');
  await expect(page.locator('.card')).toContainText('Shoot A');

  const token = await page.evaluate(() => localStorage.getItem('token'));
  const projects = await request.get(`${process.env.VITE_API_URL || 'http://localhost:5000'}/api/projects`, { headers: { Authorization: `Bearer ${token}` } });
  expect(projects.ok()).toBeTruthy();
});
