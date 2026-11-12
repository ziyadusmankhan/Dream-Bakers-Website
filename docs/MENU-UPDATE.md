# Menu, pricing and category-based quotation update

## Source and decisions

The supplied written brief on 12 November 2026 is the authoritative price list. It explicitly corrects the older poster: **Chocolate Fudge is Rs. 1,700 per pound**, and **3 Milk Cake is Rs. 1,500 per pound**. There are exactly 23 menu items: 10 cakes, 3 cupcakes, 2 brownies, 6 tea cakes and 2 donuts. No products, sizes, flavours, prices, delivery charges or decoration fees were invented. Brownie 2×2 and 3×3 are size variants, independent of quantity. The older poster is reference material and was not published as an up-to-date price image.

Retain the established ivory/cocoa/berry palette, local Fraunces/Outfit fonts, shared branding, WhatsApp controls and the previously requested effects. The new menu uses compact price rows and quiet category tabs, with no product-card imagery or gradients. The original seven gallery records and photographs remain unchanged. A visual decoration design never implies a cake variety, flavour or fixed decoration price.

## Implemented

- `js/menu-data.js` is the single production data source for all official names, categories, PKR prices, units, size variations and customization eligibility. It also owns supported cake weights, safe base-estimate calculations and money formatting. Optional item images are unset because no verified image-to-variety mappings were supplied.
- The homepage “From Our Kitchen” section displays one of five compact categories at a time. It supports mouse, touch, arrow keys, Home/End and roving keyboard focus. Each price row links to an item-preselected request. Native, one-at-a-time disclosures expose all 23 entries when JavaScript is disabled.
- The request form selects category, item and weight/quantity. Cakes show all ten varieties with per-pound base prices and existing 1, 2, 3 and 5-pound choices. Cupcakes, brownies, tea cakes and donuts show their own items, a positive whole-number quantity, special notes and delivery fields. Cake-only controls are both hidden and disabled for non-cake requests.
- Item and quantity preferences are remembered separately for each category in memory. Cake design, message, occasion, weight and reference preview remain intact when switching away and back. Date, delivery, address and special instructions are retained. No personal information is written into URLs, local storage or session storage.
- Cake variety and decoration are separate controls. Existing `?cake=<gallery ID>` links preserve the design and its thumbnail without guessing the variety. `?item=<menu ID>` preselects the category and item; the parameters can be combined. Invalid IDs have explicit fallback messages. Only public category, item and design identifiers are updated in the URL.
- The live summary shows category, chosen item, unit price, weight/quantity, relevant customization details, date, delivery method, conditional address and notes. The **Estimated Base Amount** equals the actual listed price multiplied by weight or quantity. Unsupported weights, invalid/fractional quantities and unsafe numerical totals do not produce an estimate. Optional empty cake details are omitted from the summary.
- WhatsApp messages include the actual category, official item name, unit price, amount and calculated base estimate. Cake requests include relevant decoration/occasion/message/reference details; non-cake messages omit them. Pickup messages omit the delivery address. Both the UI and message explain that customization and delivery charges are excluded and that the bakery confirms final price and availability. The number remains **+92 347 7268670**. Reference files stay local and must be attached manually in WhatsApp.
- No checkout, cart, payment processing, accounts, backend or external upload service was introduced. No push or deployment is included in this update.

## Changed files

| Files | Purpose |
| --- | --- |
| `js/menu-data.js` | Shared menu data, units and safe pricing calculation. |
| `js/menu.js`, `css/menu.css`, `index.html` | Compact, responsive and accessible homepage menu. |
| `order.html`, `js/order.js`, `js/whatsapp.js` | Category-aware form, retained preferences, live estimate and accurate quotation messages. |
| `css/forms.css`, `css/site.css` | Quantity input, category controls and estimate presentation using the existing design tokens. |
| `scripts/build.mjs` | Generate static menu prices, item/category choices and weights from the shared data. |
| `components/header.html` and six generated pages | Add the Menu & prices shortcut to the existing dropdown. |
| `tests/menu-data.test.mjs`, `tests/menu-browser.cjs` | Independent official-price checks and full menu/order browser coverage. |
| Existing browser/accessibility/interaction tests, `package.json` | Update regression expectations and add menu test commands and category states. |
| `README.md`, this document and verification JSON | Maintenance notes and actual test evidence. |

## Verification

Results are recorded below after the final checks. Browser automation intercepts outbound WhatsApp navigation; it never sends a customer message. Screenshots are local QA artifacts under `docs/verification/` and are ignored by Git.

| Check | Actual result |
| --- | --- |
| `node --test tests/menu-data.test.mjs` | 6 tests passed. Independently checked all 23 official names/prices, unique IDs, category counts, brownie sizes, valid/invalid estimates and category-specific messages. |
| `node tests/menu-browser.cjs` | 9 groups passed. Checked all 23 item links/options and prices, correct estimates, category-specific fields, preserved preferences, validation, gallery independence, encoded WhatsApp messages and native no-JavaScript menu behavior. |
| `node tests/browser.cjs` | 16 groups passed. All six pages fit 320, 375, 390, 430, 768, 1024 and 1440px; existing navigation, gallery, image preview, local-date validation, delivery address, contact form and WhatsApp flows passed. No unexpected browser errors. |
| `node tests/accessibility.cjs` | 41 scans passed with zero reported WCAG A/AA violations, including all menu categories, all quantity-order categories, open dropdown, validation and social-hover states at phone/desktop widths. 55 incomplete check instances remain in the reports for manual assessment; this is not a complete accessibility certification. |
| `node tests/interactions.cjs` | 13 checks passed, retaining the enlarged logos, WhatsApp controls, dropdown, requested effects, keyboard behavior and reduced-motion support. |
| `python tests/static.py` | Passed: 252 internal references, unique metadata, factual schema, JavaScript syntax, shared-build idempotence and isolated SEO-helper checks. |
| Manual screenshot review | Reviewed the full cake menu, mobile brownie menu, and desktop/mobile quantity order form. Corrected unit labels and estimated amounts are readable; no overflow or unrelated product photography appears. |

Verified examples: **2 pounds of Chocolate Fudge = Rs. 3,400 base**, **6 Chocolate Filled Donuts = Rs. 1,500 base**, and **3 pounds of 3 Milk Cake = Rs. 4,500 base**. Base estimates exclude design/customization and delivery charges. No new Lighthouse score is claimed for this update. Existing production-domain verification and hosting checks remain as documented in `IMPLEMENTATION.md`.

Windows Chrome headless rendering required disabling GPU/background rendering throttling in the test launch options. This adjusts only the test browser, leaving the website’s animations and normal motion behavior intact. A targeted normal-motion screenshot and tab interaction were inspected before continuing with the regression tests.
