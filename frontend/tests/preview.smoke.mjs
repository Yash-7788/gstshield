import { test, expect } from "@playwright/test";
test("built website signs in, uploads and confirms through configured local API under CSP", async ({
  page,
}) => {
  test.setTimeout(60000);
  const cspErrors = [];
  page.on("console", (m) => {
    if (/Content Security Policy|violates.*directive/i.test(m.text()))
      cspErrors.push(m.text());
  });
  const response = await page.goto("/");
  expect(response.headers()["content-security-policy"]).toContain(
    "http://127.0.0.1:8027",
  );
  await page.getByLabel("Username", { exact: true }).fill("alice");
  await page
    .getByLabel("Password", { exact: true })
    .fill("synthetic-passphrase-only");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Workspace", exact: true })
    .selectOption({ label: "Synthetic demonstration · owner" });
  await page
    .getByRole("combobox", { name: "Registration", exact: true })
    .selectOption({ label: "Synthetic company · 27ABCDE1234F1Z5" });
  await page.getByLabel("Accounting month", { exact: true }).fill("2024-05");
  await page.getByLabel("Source file").setInputFiles({
    name: "preview.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "voucher_id,recipient_gstin,supplier_gstin,invoice_number,invoice_date,document_type,taxable_value,cgst,sgst,igst,cess,other_charges,round_off,gross_total\nV1,27ABCDE1234F1Z5,27PQRSX5678L1Z2,BUILT-001,2024-04-10,INVOICE,1000.00,90.00,90.00,0.00,0.00,0.00,0.00,1180.00",
    ),
  });
  await page
    .getByRole("button", { name: "Upload source", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Confirm source", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await page
    .getByRole("button", { name: "Confirm source", exact: true })
    .click();
  await expect(page.getByText("Ready", { exact: true }).first()).toBeVisible();
  expect(cspErrors).toEqual([]);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
});
