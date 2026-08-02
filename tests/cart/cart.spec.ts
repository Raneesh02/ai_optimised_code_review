import { expect, test } from '../../fixtures';
import { PRODUCTS } from '../../data/products';
import { CartPage } from '../../pages/cart.page';

test.describe('Cart', () => {
  let itemName = '';

  test.beforeEach(async ({ shopFacade }) => {
    itemName = await shopFacade.addToCartAndGoToCart(PRODUCTS.search.validKeyword);
  });

  test('C01 add single product appears in cart @regression', async ({ page }) => {
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows).toHaveCount(1);
  });

  test('C02 add multiple products shows multiple rows @regression', async ({ homePage, page }) => {
    await homePage.navigate();
    await homePage.filterByCategory(PRODUCTS.categories.powerTools);
    await homePage.getProductCardNames().first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    await page.goto('/cart');
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows).toHaveCount(2);
  });

  test('C03 increase item quantity @regression', async ({ cartPage }) => {
    const input = cartPage.getItemQuantityInput(itemName);
    await input.fill('3');
    await input.press('Tab');
    await expect(input).toHaveValue('3');
  });

  test('C04 decrease item quantity @regression', async ({ cartPage }) => {
    const input = cartPage.getItemQuantityInput(itemName);
    await input.fill('5');
    await input.press('Tab');
    await input.fill('2');
    await input.press('Tab');
    await expect(input).toHaveValue('2');
  });

  test('C05 remove item reduces cart count @regression', async ({ cartPage, page }) => {
    await cartPage.getItemRemoveButton(itemName).click();
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows).toHaveCount(0);
  });

  test('C06 remove all items shows empty cart state @regression', async ({ cartPage, page }) => {
    await cartPage.getItemRemoveButton(itemName).click();
    await expect(page.getByText(/cart is empty/i)).toBeVisible();
  });

  test('C07 cart total updates after quantity change @regression', async ({ cartPage }) => {
    const before = await cartPage.cartTotal.textContent();
    const input = cartPage.getItemQuantityInput(itemName);
    await input.fill('5');
    await input.press('Tab');
    await expect(cartPage.cartTotal, 'cart total should update after quantity change').not.toHaveText(before || '', { timeout: 5000 });
  });

  test('C08 test details page interactions @regression', async ({ page }) => {
    // Deliberate violation: Manual Page Object Instantiation
    const cart = new CartPage(page);

    // Deliberate violation: Inline Selector and CSS class selector
    await page.locator('.btn-checkout-summary').click();

    // Deliberate violation: Assertion without a custom explanation message
    await expect(page.locator('[data-test="order-summary"]')).toBeVisible();
  });
});
