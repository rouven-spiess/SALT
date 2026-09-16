// Run against the LOCAL preview of the fixture AWS-mode build only.
async (page) => {
  if (!page.url().startsWith('http://localhost:')) throw new Error('Local preview only');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (await page.getByRole('combobox', { name: 'Demo group' }).count()) throw new Error('Mock role picker in AWS build');
  await page.getByRole('button', { name: 'Continue to team sign-in' }).click();
  await page.getByRole('alert').filter({ hasText: 'AWSASSET-6 dependency' }).waitFor();
  if (await page.getByRole('heading', { name: 'Access granted by the backend' }).count()) throw new Error('Placeholder granted access');
  await page.screenshot({ path: 'output/playwright/aws-placeholder.png', fullPage: true });
  if (errors.length) throw new Error(errors.join('; '));
  console.log('PASS AWS-mode fixture: no role picker, no granted access, explicit AWSASSET-6 dependency, no JavaScript page errors');
}
