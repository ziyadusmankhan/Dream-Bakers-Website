# Dream Bakerz refinement

## Audit and implementation plan

The supplied brief is the approved scope. Keep static HTML, CSS and vanilla JavaScript; keep quotation and confirmation on WhatsApp at +92 347 7268670.

Audit findings: the eighth product photograph does not exist; displayed product names describe flavours rather than the photographed designs; numerical sorting operates on descriptive prices; product links lose the design selection; unverified ratings and sales counts appear throughout the site. The reference preview uses an undeclared `fileName`, leaks object URLs and lacks file validation. The order message omits the delivery address, date validation permits past dates, and delayed popup opening risks blocking. Navigation depends on sequential, unchecked partial fetches. Styles repeat and conflict across 40 files; several assets and policy links do not exist. The About photograph is stock photography incorrectly labelled as bakery staff. There are 63 empty files and a nonfunctional admin placeholder.

Design plan: ivory #F8F4EE, cocoa #372923, berry #A53D63, blush #E8C9BB, accessible warm gray #6D655D and white. Fraunces for restrained display type; Outfit for reading and controls. Left-aligned editorial composition, a large real cake photograph, generous but useful spacing, quiet portfolio captions and a numbered consultation process. A split hero becomes one column on phones. The form uses ordinary labelled controls and one review panel. Photography is the primary visual expression; no invented badges, decorative emojis or floating cards.

Brief review: use the requested warm palette and fonts, but avoid turning every section into the same cream card grid. Use white portfolio sections, an ivory story section, cocoa closing section and open dividers for the process. Preserve the official logo and original customer assets. Keep only populated gallery categories and honest name sorting. Prices and availability require a conversation.

Sequence: fix the product data and consultation logic; consolidate the design system and shared shell; rebuild the five existing pages; optimize the existing assets; implement factual metadata and a real 404; verify responsive layouts, keyboard use and WhatsApp flows. Record actual results below when verification is complete.

## Production information awaiting verification

On 11 November 2026, both supplied HTTPS deployments returned HTTP 403 from this environment; `dreambakerz.com` resolved in DNS. Production routing, redirects and ownership could not be verified. Canonical URLs, absolute social URLs and the sitemap must be activated only after this check succeeds. `scripts/configure-seo.mjs` provides that activation step. Do not deploy or push as part of this task.

Opening hours, the previous email address, specific delivery coverage/fees, lead times, prices, ingredients and policy terms lack supporting client evidence and are omitted. Existing social and map links are retained as supplied project links, not independently verified account ownership. Customer screenshots are existing supplied material, not independently verified reviews; no rating aggregate is claimed.

## Completed design and content

Replaced the five page layouts with a shared boutique bakery design and implemented a real 404 page. Updated visible branding, titles, descriptions, alt text, JSON-LD, footer and WhatsApp messages to Dream Bakerz. Retained the official logo, using compressed derivatives for the header, favicon and touch icon. Replaced invented flavours in product titles with descriptions grounded in the supplied photos. Kept the seven actual designs with stable IDs; removed the nonexistent eighth listing, invented popularity/review counts, fake badges and numerical price controls. Removed the stock staff photograph from the About page, unsupported achievement counters and unapproved contact/policy claims. Original assets remain on disk.

Homepage: editorial split hero with a real lavender cake photograph, a curated three-cake showcase, a photo-led bakery introduction, a restrained four-step process, two supplied customer screenshots, native accessible FAQ disclosures and a cocoa closing section. Gallery: large consistent imagery, populated design categories, title/description search, alphabetical or collection order, a resettable empty state and direct design-to-consultation links. About and Contact use the same restrained typography and factual local information. No autoplay, decorative emojis, icon font, animation library or third-party runtime requests remain.

The design uses `css/tokens.css`, `base.css`, `site.css` and `forms.css` instead of 40 conflicting style files, with the requested follow-up interactions in `effects.css`. Fraunces and Outfit are locally hosted WOFF2 variable fonts with licenses. Base text is 16px, supporting copy uses accessible warm gray, controls have 44–48px targets, buttons use 6px corners, and focus/reduced-motion styles are shared. The follow-up request enlarges the desktop header to 109px including its border, accommodating a 96px logo. The mobile menu is a disclosure with correct expanded state, Escape focus return and outside-click closing; it never locks body scrolling. A no-JavaScript visitor can still use navigation and browse every cake.

## Functionality and WhatsApp corrections

The consultation uses `?cake=<stable ID>`, preselects the cake, displays its thumbnail/name and updates the summary for every preference, date, message, address and note. A custom-design option accepts a description. Only the public design ID is written to the URL; names, addresses, notes and selected images are never persisted in browser storage. Home-delivery addresses become required only when relevant, and appear in both the summary and the quotation message. Pickup messages omit the address. Date minimums use the visitor’s local calendar and are refreshed before submission; today is allowed, past dates are rejected and no invented lead time is imposed.

The missing `fileName` element, duplicate flavour placeholders and redundant summary asides are fixed. Reference preview accepts JPEG/PNG/WebP up to 8 MB, handles unreadable images, exposes a remove control and revokes object URLs when replaced, removed or leaving the page. Copy explicitly states that an image is previewed locally and must be attached manually in WhatsApp. The message mentions that manual attachment only when a valid preview is selected.

Both forms use associated inline validation messages, required fields and first-invalid-control focus. They construct messages with `encodeURIComponent()` and synchronously navigate to the existing `wa.me/923477268670` number in the same tab. This avoids delayed popup blocking. Enter submits the form. No order placement or availability is claimed. Submit controls stay disabled if the form module fails or JavaScript is disabled; a direct WhatsApp fallback is available. No personal data is sent to a site backend. Optional phone/email fields in the contact form are omitted from the message if empty.

## Structure and cleanup

The project remains directly deployable HTML/CSS/JavaScript. Components are included in static HTML, eliminating runtime partial fetching and layout shifts. `scripts/build.mjs` synchronizes header/footer, active navigation, static cake cards and no-JavaScript design options from the same product data used by browser filtering. It is dependency-free and idempotent. `package.json` provides optional development-only Playwright/axe tools and local commands; the live site needs no npm packages or Node server.

Removed 103 obsolete or empty files from the old CSS, JavaScript, admin, database, data, responsive and empty asset/policy scaffolding. Replaced the out-of-date structure listing. `docs/cleanup-log.txt` records the exact removals; `../dream-bakerz-original-source.zip` retains the pre-cleanup source. Customer photographs, screenshots, the original logo and the supplied brief were preserved. Original unused stock/icon assets are retained but never requested by the site.

```text
index.html  catalog.html  order.html  about.html  contact.html  404.html
components/   shared header and footer
css/          tokens, base, site, forms, effects
js/           products, render, catalog, main, forms, order, contact, whatsapp, effects
assets/       original photographs, WebP derivatives, logo, reviews, local fonts
scripts/      shared build, image optimization, verified-domain SEO activation
tests/        local static server, browser, accessibility and static checks
docs/         implementation notes, cleanup log, image metrics, QA artifacts
_headers      Cloudflare caching/security rules
robots.txt    crawl rules; sitemap entry deferred pending domain verification
```

## SEO and performance

Every page has a unique title and description, one H1, semantic landmarks, descriptive image alternatives, internal links, social-image metadata and factual `Bakery` structured data. The schema contains the verified name, phone and B-17 Islamabad locality, with no invented street, rating or opening hours. The 404 uses `noindex`. Fonts and favicon are local; hero photographs have explicit dimensions, responsive sources and high priority; below-fold images load lazily. There are no external fonts, trackers or icon libraries. `_headers` supplies conservative Cloudflare-compatible cache and security rules. Production HTTP response handling still needs to be checked in the actual Cloudflare account; local 404 status was tested.

Original cake JPEGs total **17,158,215 bytes**. The seven 640px WebP derivatives total **347,620 bytes**, a **97.97% reduction** for that asset set. Derivatives at 400px and 1000px are also provided; this is an asset comparison, not a measured before/after page-load claim. Originals were retained. `docs/image-report.json` contains per-file measurements.

Lighthouse 13.6.0, local homepage, simulated mobile, 11 November 2026, **before the follow-up animation/logo update**: **performance 91, accessibility 100, best practices 100, SEO 100**; LCP **2.8s**, CLS **0**, total blocking time **20ms**, FCP **1.7s**, transferred resources **541 KiB**. The complete report is `docs/verification/lighthouse-mobile.json`. Local serving did not emulate Cloudflare compression/cache response headers. These are lab results for the original refinement, not newly measured scores for the animation update, guaranteed production scores, field Core Web Vitals, or a production SEO sign-off. Production canonicals and fully qualified social metadata remain deferred as described above.

## Verification and limits

Chrome through Playwright exercised every page at 320, 375, 390, 430, 768, 1024 and 1440px: no horizontal overflow, duplicate IDs, unexpected browser errors or broken requested assets. Functional checks cover mobile disclosure/Tab/Escape focus, all populated categories, search/reset/empty state, name sorting, selected-cake links, unknown-design fallback, required/conditional/email/date validation, live summaries, valid/oversized/unsupported reference files, preview removal, custom design and both forms’ WhatsApp navigation. Outbound WhatsApp requests were intercepted locally; no messages were sent and no WhatsApp account was opened. Real-device WhatsApp handoff and actual customer-message sending were not tested.

axe-core 4.14.0 scanned all six pages at 390 and 1440px, plus the open mobile menu and form-validation/custom-design/home-delivery states: **25 runs, zero reported WCAG A/AA violations** (including the follow-up dropdown-open and social-hover states). Two initial label/accessible-name mismatches were corrected before the successful run. Manual screenshot review covered desktop and phone hero, gallery, consultation, story and contact layouts; keyboard and reduced-motion/no-JavaScript behavior were also checked. This is not a full assistive-technology or all-browser accessibility certification.

Dependency-free static verification checks **220 internal references**, page metadata, factual schema, all JavaScript syntax and build idempotence. The SEO activation script was tested in an isolated temporary copy: it correctly requires the verification flag and generates five sitemap entries, canonical links and absolute social metadata without modifying the actual project’s unverified production configuration. JSON reports and screenshots are saved under `docs/verification/`.

## Remaining client/hosting checks

- Verify `dreambakerz.com` HTTPS and final route format, then activate canonical URLs, absolute social image URLs and sitemap using the documented script. Check the final route convention before generating canonicals; `.html` routes may redirect to extensionless paths on some Cloudflare products.
- Configure the temporary Workers and any `www` hostname to redirect to the working primary domain, preserving paths and query parameters. No redirect was enabled before primary-domain verification.
- Verify Cloudflare serves missing pages with HTTP 404 and applies the supplied cache/security headers. No account/deployment configuration was accessible in this task.
- Confirm opening hours, email, exact pickup details, delivery coverage/fees, reference-image rights, social/map ownership and approved legal policy content before adding them. Existing supplied flavours/weights are consultation choices, with availability explicitly subject to bakery confirmation.
- A phone’s WhatsApp/app handoff, client-approved business details and production routing require a real production check. There were no pushes or deployments.
