# Contact Page — Test Cases

> Scope: UI validation only. No form submissions.  
> URL: https://practicesoftwaretesting.com/contact

---

## C01 — Contact page renders all form fields on load

**Scenario:** Contact page loads with all 6 form fields (First name, Last name, Email, Subject, Message, Attachment) and a Send button visible.

**Steps:**
1. Go to the Contact page.
2. Verify the page heading "Contact" is displayed.
3. Verify the following fields are visible: First name, Last name, Email address, Subject (dropdown), Message (textarea), Attachment (file input).
4. Verify the Send button is visible and enabled.

---

## C02 — Submitting an empty form shows validation errors on all required fields

**Scenario:** Clicking Send with all fields empty shows inline validation errors on every required field without submitting the form.

**Steps:**
1. Go to the Contact page.
2. Leave all fields blank.
3. Click the Send button.
4. Verify a validation error appears under each of: First name, Last name, Email address, Subject, Message.
5. Verify the page remains on `/contact` and no success message is shown.

---

## C03 — Invalid email format shows a format validation error

**Scenario:** Entering a non-email string in the Email field shows a format validation error on send attempt.

**Steps:**
1. Go to the Contact page.
2. Type `notanemail` into the Email address field.
3. Click the Send button.
4. Verify an error appears near the Email field indicating the format is invalid.
5. Verify the error is about format, not about the field being empty.

---

## C04 — Subject dropdown contains exactly the expected options in order

**Scenario:** Subject dropdown lists exactly 6 options: Customer service, Webmaster, Return, Payments, Warranty, Status of my order — in that order.

**Steps:**
1. Go to the Contact page.
2. Click the Subject dropdown to open it.
3. Verify exactly 6 options are listed (excluding any blank/placeholder entry).
4. Verify the options appear in this order: Customer service, Webmaster, Return, Payments, Warranty, Status of my order.

---

## C05 — Attachment field shows .txt-only constraint hint before a file is chosen

**Scenario:** The attachment field shows the file type constraint before the user interacts with it.

**Steps:**
1. Go to the Contact page.
2. Without touching the file input, verify the hint text "Only files with the txt extension are allowed" is visible below the Attachment field.
3. Verify the attachment field shows "No file chosen" (i.e. no file has been pre-selected).
