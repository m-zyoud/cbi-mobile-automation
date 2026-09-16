import {
  test,
  expect,
  chromium,
} from '@playwright/test';

test.describe(
  'Frontgate Payment Step',
  () => {
    test(
      'reach and verify Frontgate payment section',
      async () => {
        test.setTimeout(120000);

        console.log(
          '\n===== Frontgate Payment Check ====='
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

        expect(
          page.url(),
          'Browser should already be on Frontgate checkout'
        ).toContain(
          'SinglePageCheckoutView'
        );

        await test.step(
          'Verify Delivery Method checkpoint',
          async () => {
            const deliverySection =
              page
                .getByText(
                  /delivery method & gift options|delivery method/i
                )
                .first();

            await expect(
              deliverySection,
              'Delivery Method should already be visible'
            ).toBeVisible({
              timeout: 10000,
            });

            console.log(
              'Delivery Method checkpoint confirmed'
            );
          }
        );

        await test.step(
          'Continue to Payment',
          async () => {
            const continueToPayment =
              page
                .getByRole(
                  'button',
                  {
                    name:
                      /continue to payment/i,
                  }
                )
                .first();

            await expect(
              continueToPayment,
              'Continue To Payment button should be visible'
            ).toBeVisible({
              timeout: 10000,
            });

            console.log(
              'Continue To Payment found'
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
                'Normal click failed; using DOM click fallback'
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
          'Verify Payment section',
          async () => {
            console.log(
              'Checking Payment section'
            );

            const paymentText =
              page
                .getByText(
                  /payment|credit card|billing/i
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
              (await paymentButton
                .isVisible()
                .catch(
                  () => false
                ));

            if (!paymentVisible) {
              console.log(
                'Payment section text was not detected'
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

                const text = (
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
                    `PAYMENT CONTROL ${i}: ${combined}`
                  );
                }
              }

              throw new Error(
                'Payment section was not detected after Continue To Payment'
              );
            }

            console.log(
              'Payment section detected'
            );
          }
        );

        console.log(
          '===== Frontgate Payment Check Completed ====='
        );
      }
    );
  }
);