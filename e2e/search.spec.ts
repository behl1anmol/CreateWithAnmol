import { test, expect } from 'playwright/test'

test.describe('Search feature', () => {

  test.describe('Navbar search icon', () => {
    test('search icon visible on desktop', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByTestId('search-icon-desktop')).toBeVisible()
    })

    test('search icon visible on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto('/')
      await expect(page.getByTestId('search-icon-mobile')).toBeVisible()
    })

    test('clicking search icon navigates to /search', async ({ page }) => {
      await page.goto('/')
      await page.getByTestId('search-icon-desktop').click()
      await expect(page).toHaveURL('/search')
    })
  })

  test.describe('/search page', () => {
    test('input is auto-focused on page load', async ({ page }) => {
      await page.goto('/search')
      const input = page.getByTestId('search-input')
      await expect(input).toBeFocused()
    })

    test('landing state visible with no query', async ({ page }) => {
      await page.goto('/search')
      await expect(page.getByTestId('search-landing')).toBeVisible()
    })

    test('landing state hidden when query has 2+ chars', async ({ page }) => {
      await page.goto('/search')
      await page.getByTestId('search-input').fill('ai')
      await expect(page.getByTestId('search-landing')).not.toBeVisible()
    })

    test('clears to landing state when input emptied', async ({ page }) => {
      await page.goto('/search')
      const input = page.getByTestId('search-input')
      await input.fill('ai')
      await expect(page.getByTestId('search-landing')).not.toBeVisible()
      await input.fill('')
      await expect(page.getByTestId('search-landing')).toBeVisible()
    })

    test('no-results state shown for nonsense query', async ({ page }) => {
      await page.goto('/search')
      await page.getByTestId('search-input').fill('xxxxxxxxxnotreal99999')
      await expect(page.getByTestId('search-no-results')).toBeVisible({ timeout: 5000 })
    })

    test('URL updates with ?q= on Enter key press', async ({ page }) => {
      await page.goto('/search')
      const input = page.getByTestId('search-input')
      await input.fill('design')
      await input.press('Enter')
      await expect(page).toHaveURL(/\/search\?q=design/)
    })

    test('loading /search?q=term pre-fills the input', async ({ page }) => {
      await page.goto('/search?q=design')
      const input = page.getByTestId('search-input')
      await expect(input).toHaveValue('design')
    })
  })

  test.describe('Search results sections', () => {
    test('results section structure matches expected testids', async ({ page }) => {
      await page.goto('/search')
      const input = page.getByTestId('search-input')

      await input.fill('design')

      await Promise.race([
        page.getByTestId('section-prompts').waitFor({ timeout: 5000 }).catch(() => {}),
        page.getByTestId('section-products').waitFor({ timeout: 5000 }).catch(() => {}),
        page.getByTestId('section-blogs').waitFor({ timeout: 5000 }).catch(() => {}),
        page.getByTestId('search-no-results').waitFor({ timeout: 5000 }).catch(() => {}),
      ])

      const hasPrompts = await page.getByTestId('section-prompts').isVisible()
      const hasProducts = await page.getByTestId('section-products').isVisible()
      const hasBlogs = await page.getByTestId('section-blogs').isVisible()
      const hasNoResults = await page.getByTestId('search-no-results').isVisible()

      expect(hasPrompts || hasProducts || hasBlogs || hasNoResults).toBe(true)
    })

    test('sections not shown when input is below 2 chars', async ({ page }) => {
      await page.goto('/search')
      await page.getByTestId('search-input').fill('a')
      await expect(page.getByTestId('section-prompts')).not.toBeVisible()
      await expect(page.getByTestId('section-products')).not.toBeVisible()
      await expect(page.getByTestId('section-blogs')).not.toBeVisible()
    })
  })

})
