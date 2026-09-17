import {
  test,
  expect,
  chromium,
} from '@playwright/test';

import { sites } from '../../config/sites';

test.describe(
  'CBI Mobile Payment Check',
  () => {
    test.describe.configure({
      mode: 'serial',
    });

    for (
      const site of Object.values(
        sites
      )
    ) {
      test(
        `${site.name} reach and verify payment section`,
        async () => {
          test.setTimeout(120000);

          console.log(
            `\n===== ${site.name} Payment Check =====`
          );

          const browser =
            await chromium.connectOverCDP(
              'http://127.0.0.1:9222',
              {
                timeout: 60000,
              }
            );

          const contexts =
            browser.contexts();

          expect(
            contexts.length,
            'A real Android Chrome context is required'
          ).toBeGreaterThan(0);

          const context =
            contexts[0];

          const pages =
            context.pages();

          const page =
            pages.length > 0
              ? pages[0]
              : await context.newPage();

          console.log(
            `Current URL: ${page.url()}`
          );

          /*
           * This payment test assumes the
           * checkout session already reached
           * Delivery Method.
           */
          await test.step(
            `Verify ${site.name} delivery checkpoint`,
            async () => {
              const deliverySection =
                page
                  .getByText(
                    /delivery method & gift options|delivery method|shipping method/i
                  )
                  .first();

              await expect(
                deliverySection,
                `${site.name}: Delivery Method should be visible`
              ).toBeVisible({
                timeout: 10000,
              });

              console.log(
                `${site.name}: Delivery Method checkpoint confirmed`
              );
            }
          );

          await test.step(
            `Continue ${site.name} to Payment`,
            async () => {
              const continueToPayment =
                page
                  .getByRole(
                    'button',
                    {
                      name:
                        /continue to payment|continue to payment method|continue to payment information/i,
                    }
                  )
                  .first();

              const visible =
                await continueToPayment
                  .isVisible()
                  .catch(
                    () => false
                  );

              if (!visible) {
                console.log(
                  `${site.name}: Continue To Payment button is not currently visible`
                );

                return;
              }

              const buttonText =
                (
                  await continueToPayment
                    .innerText()
                    .catch(
                      () => ''
                    )
                )
                  .replace(
                    /\s+/g,
                    ' '
                  )
                  .trim();

              console.log(
                `${site.name}: Payment continuation control found: "${buttonText}"`
              );

              const clicked =
                await continueToPayment
                  .click({
                    timeout: 7000,
                  })
                  .then(
                    () => true
                  )
                  .catch(
                    () => false
                  );

              if (!clicked) {
                console.log(
                  `${site.name}: normal click failed, using DOM fallback`
                );

                await continueToPayment.evaluate(
                  (
                    element: HTMLElement
                  ) => {
                    element.click();
                  }
                );
              }

              await page.waitForTimeout(
                2000
              );
            }
          );

          await test.step(
            `Verify ${site.name} Payment section`,
            async () => {
              console.log(
                `${site.name}: checking Payment section`
              );

              const paymentText =
                page
                  .getByText(
                    /payment|credit card|billing/i
                  )
                  .first();

              const paymentHeading =
                page
                  .getByRole(
                    'heading',
                    {
                      name:
                        /payment|credit card|billing/i,
                    }
                  )
                  .first();

              const paymentButton =
                page
                  .getByRole(
                    'button'
                  )
                  .filter({
                    hasText:
                      /payment/i,
                  })
                  .first();

              const paymentVisible =
                (await paymentText
                  .isVisible()
                  .catch(
                    () => false
                  )) ||
                (await paymentHeading
                  .isVisible()
                  .catch(
                    () => false
                  )) ||
                (await paymentButton
                  .isVisible()
                  .catch(
                    () => false
                  ));

              if (!paymentVisible) {
                console.log(
                  `${site.name}: Payment section not immediately detected`
                );

                const controls =
                  page.locator(
                    [
                      'button:visible',
                      'a:visible',
                      '[role="button"]:visible',
                      'input:visible',
                      'iframe:visible',
                    ].join(',')
                  );

                const count =
                  Math.min(
                    await controls.count(),
                    100
                  );

                for (
                  let i = 0;
                  i < count;
                  i++
                ) {
                  const control =
                    controls.nth(i);

                  const text =
                    (
                      await control
                        .innerText()
                        .catch(
                          () => ''
                        )
                    )
                      .replace(
                        /\s+/g,
                        ' '
                      )
                      .trim();

                  const aria =
                    (await control.getAttribute(
                      'aria-label'
                    )) ?? '';

                  const id =
                    (await control.getAttribute(
                      'id'
                    )) ?? '';

                  const name =
                    (await control.getAttribute(
                      'name'
                    )) ?? '';

                  const src =
                    (await control.getAttribute(
                      'src'
                    )) ?? '';

                  const combined =
                    `${text} ${aria} ${id} ${name} ${src}`
                      .replace(
                        /\s+/g,
                        ' '
                      )
                      .trim();

                  if (
                    /payment|card|billing|paypal|credit/i.test(
                      combined
                    )
                  ) {
                    console.log(
                      `${site.name} PAYMENT CONTROL ${i}: ${combined}`
                    );
                  }
                }

                throw new Error(
                  `${site.name}: Payment section was not detected`
                );
              }

              console.log(
                `${site.name}: Payment section detected`
              );
            }
          );

          console.log(
            `===== ${site.name} Payment Check Completed =====`
          );
        }
      );
    }
  }
);