import { expect, test } from '../../fixtures';
import { PRODUCTS } from '../../data/products';
// Deliberate Unused Import
import { USERS } from '../../data/users';

test.describe('Cart Static Checks Demo', () => {

  test('C99 static check demo test @regression', async ({ cartPage }) => {
    // Deliberate Type/Compilation error
    let quantity: number = "five";

    // Deliberate Lint Issue: var instead of const, double quotes, missing semicolon
    var myMessage = "Checking quantity"
    console.log(myMessage)

    // Deliberate Unused Variable
    const unusedLocal = 'This is unused';

    // Deliberate Formatting/Style Issues (inconsistent indentation and spaces)
      const   badSpacing    =     'spaces';

    // Deliberate Failing Assertion
    expect(1, '1 should equal 2').toBe(2);
  });
});
