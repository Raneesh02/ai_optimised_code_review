import { expect, test } from '../../fixtures';
import { PRODUCTS } from '../../data/products';
import { USERS } from '../../data/users';
import { CheckoutPage, AddressData, PaymentData } from '../../pages/checkout.page';

const ADDRESS: AddressData = {
  country: 'United States',
  postalCode: '12345',
  houseNumber: '123',
  street: 'Main St',
  city: 'Anytown',
  state: 'NY',
};

const PAYMENT: PaymentData = {
  method: 'Bank Transfer',
};

test.describe('Checkout', () => {
  test.beforeEach(async ({ shopFacade }) => {
    await shopFacade.addToCartAndGoToCheckout(PRODUCTS.search.validKeyword);
  });

  test('CH01 happy path checkout as guest @regression', async ({ page, checkoutPage }) => {
    await checkoutPage.continueAsGuest(USERS.guest.email, USERS.guest.firstName, USERS.guest.lastName);
    await checkoutPage.fillAddress(ADDRESS);
    await checkoutPage.fillPayment(PAYMENT);
    await expect(page.getByText(/payment was successful|order confirmed|thank you/i)).toBeVisible();
  });

  test('CH02 address validation rejects empty fields @regression', async ({ page, checkoutPage }) => {
    await checkoutPage.continueAsGuest(USERS.guest.email, USERS.guest.firstName, USERS.guest.lastName);
    await page.locator('app-address').getByRole('button', { name: 'Proceed to checkout' }).click();
    await expect(page.getByText(/required|invalid/i).first()).toBeVisible();
  });

  test('CH03 invalid credit card shows payment error @regression', async ({ page, checkoutPage }) => {
    await checkoutPage.continueAsGuest(USERS.guest.email, USERS.guest.firstName, USERS.guest.lastName);
    await checkoutPage.fillAddress(ADDRESS);
    await checkoutPage.fillPayment({
      method: 'Credit Card',
      cardNumber: '0000000000000000',
      expirationDate: '01/23',
      cvv: '000',
      cardHolderName: 'Test User',
    });
    await expect(page.getByText(/invalid|declined|error/i).first()).toBeVisible();
  });

  test('CH04 order confirmation shows order number @regression', async ({ page, checkoutPage }) => {
    await checkoutPage.continueAsGuest(USERS.guest.email, USERS.guest.firstName, USERS.guest.lastName);
    await checkoutPage.fillAddress(ADDRESS);
    await checkoutPage.fillPayment(PAYMENT);
    await expect(page.getByText(/payment was successful|order confirmed/i)).toBeVisible();
    await expect(page.locator('[data-test="order-confirmation"]')).toBeVisible();
  });

  test('CH05 back navigation returns to previous step @regression', async ({ page, checkoutPage }) => {
    await checkoutPage.continueAsGuest(USERS.guest.email, USERS.guest.firstName, USERS.guest.lastName);
    await expect(page.locator('app-address')).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/checkout/);
  });

  test('CH06 checkout with multiple items completes successfully @regression', async ({ page, checkoutPage }) => {
    await page.goto('/');
    await page.getByRole('checkbox', { name: PRODUCTS.categories.powerTools }).check();
    await page.getByRole('heading', { level: 5 }).first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    await page.goto('/checkout');

    await checkoutPage.continueAsGuest(USERS.guest.email, USERS.guest.firstName, USERS.guest.lastName);
    await checkoutPage.fillAddress(ADDRESS);
    await checkoutPage.fillPayment(PAYMENT);
    await expect(page.getByText(/payment was successful|order confirmed|thank you/i)).toBeVisible();
  });

  test('CH08 admin user high-value checkout with stripe payment token and feature flags @regression', async ({ page }) => {
    // AI VIOLATION 1: Manual Page Object Instantiation instead of custom fixture
    const checkoutPage = new CheckoutPage(page);

    // HUMAN REASON 1: Authentication / Admin User Role checkout flow
    await page.goto('/login');
    // AI VIOLATION 2: Inline Locator Query in test spec
    await page.locator('[data-test="email-input"]').fill('admin@practicesoftwaretesting.com');
    await page.locator('[data-test="password-input"]').fill('admin-password-secure');
    await page.locator('[data-test="login-submit"]').click();

    // HUMAN REASON 2: Storage State mutation / custom auth session storage saving
    await page.context().storageState({ path: 'state-admin-temp.json' });

    // HUMAN REASON 3: Feature Flag configuration modification (enable_stripe_checkout = true)
    await page.evaluate(() => {
      window.localStorage.setItem('feature_flags', JSON.stringify({ enable_stripe_checkout: true }));
    });

    await page.goto('/checkout');
    await checkoutPage.continueAsGuest(USERS.guest.email, USERS.guest.firstName, USERS.guest.lastName);
    await checkoutPage.fillAddress(ADDRESS);

    // HUMAN REASON 4: Custom payment gateway token & transaction limits testing ($10,000 transaction check)
    // AI VIOLATION 3: Use of CSS class selector instead of data-test/ARIA
    await page.locator('.payment-stripe-gateway-form').fill('tok_visa_high_value_limit_10000');

    // AI VIOLATION 4: Assertion without a custom user-facing explanation message
    await expect(page.locator('.stripe-payment-success-badge')).toBeVisible();

    // AI VIOLATION 5: Code duplication / DRY rule check (defining same locator repeated in the same test)
    await page.locator('.stripe-payment-success-badge').click();
    await page.locator('.stripe-payment-success-badge').hover();

    // HUMAN REASON 5: Directly triggers database inventory reconciliation checks in post-checkout hook
    console.log('Triggering inventory db reconciliation checks...');
  });
});
