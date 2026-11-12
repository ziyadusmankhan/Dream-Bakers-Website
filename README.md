# Dream Bakerz

A static HTML, CSS and vanilla JavaScript website for the custom cake bakery in B-17, Islamabad. All quotations and order confirmation happen on WhatsApp at **+92 347 7268670**. No backend, checkout, customer accounts, tracking or personal-data storage is used.

Preview from this directory with `node tests/server.cjs`, then open <http://127.0.0.1:4173>. Do not open the HTML directly through `file://`; browser ES modules require HTTP. Node is a local development tool, not a hosting requirement.

## Editing

- Edit page content directly in the five HTML files.
- Edit shared navigation/footer in `components/`, then run `node scripts/build.mjs`.
- Gallery design names, categories, descriptions, images and stable IDs live in `js/products.js`. They describe decoration, independently of cake variety. Run the same build command to refresh the static gallery, featured cards and design options.
- The 23 official menu items, PKR prices, units and variations live only in `js/menu-data.js`. Both the homepage menu and the order form import it. Run `node scripts/build.mjs` after editing it to refresh the static, no-JavaScript menu and form fallback. Do not edit generated price rows or copy prices into another production file.
- `js/menu.js` implements accessible homepage category tabs. `js/order.js` switches between cake weight/customization and non-cake quantities, remembers in-page selections and updates the base estimate. Menu item links use `?item=...`; gallery links use `?cake=...`; the two can be combined without guessing the cake variety.
- `css/tokens.css` contains the palette, local fonts, typography, spacing and focus tokens. `base.css` defines primitives, `site.css` defines layouts and `forms.css` defines consultation controls.
- `css/effects.css` and `js/effects.js` implement the requested photo sheen, dropdown, social/icon/menu hovers, typewriter and scroll reveals. The larger shared logos and fixed/header WhatsApp actions are documented in `docs/INTERACTIONS.md`. Run `npm run test:interactions` to verify them.
- `js/order.js` and `js/contact.js` manage their forms; `forms.js` provides validation; `whatsapp.js` provides the phone number, message generation and navigation.
- Original photos remain untouched. `scripts/optimize-images.py` regenerates WebP derivatives using Pillow. Local Fraunces and Outfit Latin variable fonts include their OFL licenses.
- The gallery includes 22 designs. Additional original JPEGs are grouped under `assets/cakes/birthday/`, `themes/` and `occasions/`, with matching collection folders in `assets/cakes/optimized/`. Run `python scripts/optimize-images.py --only-missing` to add 400, 640 and 1000 pixel WebP derivatives at the existing quality setting (86) without replacing existing assets, then run `npm run build` to refresh gallery cards and order options. Keep original photo files intact.

## Verification

Optional development dependencies only: run `npm install`, then `npx playwright install chromium`. Start the preview server in another terminal, then run `npm run test:browser` and `npm run test:accessibility`. To use an existing Chrome installation, set `BROWSER_PATH` to its executable. The tests intercept outbound WhatsApp URLs and do not send messages. `PLAYWRIGHT_MODULE` and `AXE_MODULE` optionally select preinstalled tools.

Reports and desktop/phone screenshots are in `docs/verification/`. The browser suite covers all six pages at seven widths. Automated accessibility checks supplement manual keyboard and screenshot review; they do not certify complete WCAG conformance.

For menu changes, also run `npm run test:menu` and `npm run test:menu-browser`. The unit tests independently check every approved price, both corrected cake prices, quantities, weights and WhatsApp message contents. The menu browser tests cover all 23 preselected items, five categories, retained preferences, validation and no-JavaScript menu disclosures. See `docs/MENU-UPDATE.md` for this change’s source, implementation and actual verification results.

Generated QA screenshots and the local client prompt are excluded from Git. JSON verification reports and the test sources are included; run the tests to regenerate screenshots locally.

## Cloudflare and production SEO

Keep the existing static Cloudflare deployment. No framework adapter or server is required. The page and asset URLs assume the site is hosted at the domain root. `_headers` supplies conservative caching/security headers where supported by the current Cloudflare static asset product. Serve `404.html` with a 404 status; for Workers Static Assets, verify the existing deployment uses `assets.not_found_handling = "404-page"`. The local test server already uses real 404 responses. Do not configure a single-page-app fallback.

The supplied production domain could not be verified from this environment (HTTP 403). After independently verifying HTTPS, routing and redirects, run:

```sh
node scripts/configure-seo.mjs --origin=https://dreambakerz.com --routing-verified
```

This adds page canonicals, absolute Open Graph URLs, `sitemap.xml` and its robots entry. Before deployment, check Cloudflare's final canonical path convention: if the host redirects `.html` to extensionless URLs, change the URL generation in this script to those final paths. Redirect `www` and the temporary Workers hostname to the verified production domain, preserving paths and queries. Never enable a Workers redirect before the primary domain works. These hosting changes have not been deployed by this task.

The shared social image is generated, but its metadata URL stays relative until domain verification; some social crawlers require the absolute URL generated by the activation script. Confirm social account/map ownership, opening hours, email, delivery terms, pricing and approved legal policy text with the client before publishing those details.

See `docs/IMPLEMENTATION.md` for the audit, implementation decisions, completed verification and outstanding production checks. Original source was backed up in `../dream-bakerz-original-source.zip` before cleanup; original customer images were retained.
