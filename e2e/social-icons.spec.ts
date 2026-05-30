import { test, expect } from 'playwright/test'

const EXPECTED_SOCIAL_URLS = [
  'https://www.linkedin.com/in/behlanmol/',
  'https://github.com/behl1anmol',
  'https://medium.com/@behl1anmol',
  'https://behlanmol.gumroad.com/',
  'https://www.instagram.com/thestudioprompts.ai/',
  'https://x.com/behl1anmol',
]

test('main page hero: 6 social icon links with correct URLs', async ({ page }) => {
  await page.goto('/')
  for (const url of EXPECTED_SOCIAL_URLS) {
    const link = page.locator(`a[href="${url}"]`).first()
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  }
})

test('about page: 6 platform cards with correct URLs', async ({ page }) => {
  await page.goto('/about')
  for (const url of EXPECTED_SOCIAL_URLS) {
    const card = page.locator(`a[href="${url}"]`)
    await expect(card.first()).toBeVisible()
  }
})

test('about page: platform cards display labels and descriptions', async ({ page }) => {
  await page.goto('/about')
  for (const label of ['LINKEDIN', 'GITHUB', 'MEDIUM', 'GUMROAD', 'INSTAGRAM', 'X']) {
    await expect(page.locator('.pill-filter', { hasText: label }).first()).toBeVisible()
  }
  await expect(page.getByText('Find the Work')).toBeVisible()
})

test('main page: Explore Prompts button removed', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Explore Prompts')).not.toBeVisible()
})
