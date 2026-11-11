const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
const out = path.resolve(__dirname, '../docs/verification');
fs.mkdirSync(out, { recursive:true });
const report = { date:new Date().toISOString(),checks:[],errors:[],screenshots:[],accessibility:[] };
const check = (name) => { report.checks.push(name); console.log('PASS',name); };
let browser;

(async () => {
  browser = await chromium.launch({headless:true, ...(process.env.BROWSER_PATH ? {executablePath:process.env.BROWSER_PATH} : {})});
  const context = await browser.newContext({timezoneId:'Asia/Karachi', viewport:{width:1440,height:1000}});
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  page.on('response', response => {
    if (response.status() >= 400 && !response.url().includes('missing-page')) report.errors.push(`${response.status()} ${response.url()}`);
  });

  for (const width of [320,375,390,430,768,1024,1440]) {
    await page.setViewportSize({width,height:950});
    for (const name of ['index','catalog','order','about','contact','404']) {
      await page.goto(`${base}/${name}.html`);
      await page.evaluate(() => document.fonts.ready);
      if (name === 'catalog') await page.waitForSelector('.filter-button');
      if (name === 'order') await page.waitForFunction(() => document.querySelector('#cakeDesign').options.length === 9);
      const metrics = await page.evaluate(() => ({
        width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
        h1:document.querySelectorAll('h1').length,
        duplicateIds:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,all)=>all.indexOf(id)!==i),
        header:document.querySelector('.site-header').getBoundingClientRect().height,
        badImages:[...document.images].filter(img=>img.hasAttribute('src') && img.complete && !img.naturalWidth).map(img=>img.src),
        font:document.fonts.check('500 20px Fraunces') && document.fonts.check('400 16px Outfit')
      }));
      assert(metrics.scroll <= metrics.width, `${name} overflow at ${width}: ${JSON.stringify(metrics)}`);
      assert.equal(metrics.h1,1); assert.equal(metrics.duplicateIds.length,0); assert.equal(metrics.badImages.length,0);
      assert(metrics.font, 'Local fonts load');
      // Larger logo was explicitly requested; the desktop shell is now 108px.
      if (width>=1024) assert(metrics.header<=113, `Header too tall: ${metrics.header}`);
      if (width===390 && ['index','order','catalog'].includes(name) || width===1440 && ['index','order','catalog','about','contact'].includes(name)) {
        // Exercise below-fold lazy loading before capturing the entire page.
        for (const img of await page.locator('img[loading="lazy"]').all()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(element => element.decode());
        }
        // Settle decoded images before Chrome rasterizes a full-page capture.
        await page.evaluate(async () => {
          const images = [...document.images].filter(image => image.hasAttribute('src'));
          images.forEach(image => { image.loading = 'eager'; });
          await Promise.all(images.map(image => image.decode()));
        });
        await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
        await page.waitForTimeout(200);
        await page.screenshot({path:path.join(out,`${name}-${width}.png`),fullPage:true});
        report.screenshots.push(`${name}-${width}.png`);
      }
      // Keyboard and accessibility semantics at one phone and one desktop width.
      if (process.env.AXE_MODULE && [390,1440].includes(width)) {
        await page.addScriptTag({path:process.env.AXE_MODULE});
        const results = await page.evaluate(async () => axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}));
        report.accessibility.push({page:name,width,violations:results.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:results.incomplete.length});
        assert.equal(results.violations.length,0,`${name} accessibility at ${width}: ${JSON.stringify(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))}`);
      }
    }
    check(`All six pages: ${width}px, no overflow, one H1, unique IDs, loaded fonts/assets`);
  }

  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/index.html');
  await page.waitForSelector('html.js');
  const toggle = page.locator('#menuToggle');
  assert.equal(await page.locator('#siteNav').isVisible(),false);
  await toggle.click(); assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Tab'); assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Home');
  await page.keyboard.press('Escape'); assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'menuToggle');
  await toggle.click(); await page.getByRole('heading',{name:'Made for your special moments.'}).click();
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  check('Mobile navigation: hidden state, toggle, Tab, Escape focus return, outside click');

  await page.goto(base+'/catalog.html'); await page.waitForSelector('.filter-button');
  assert.equal(await page.locator('.cake-card').count(),7);
  await page.getByRole('button',{name:'Character cakes',exact:true}).click(); assert.equal(await page.locator('.cake-card').count(),3);
  await page.getByRole('button',{name:'Floral & butterfly cakes',exact:true}).click(); assert.equal(await page.locator('.cake-card').count(),2);
  await page.getByRole('button',{name:'Celebration cakes',exact:true}).click(); assert.equal(await page.locator('.cake-card').count(),2);
  await page.getByRole('button',{name:'All cakes',exact:true}).click();
  await page.locator('#searchInput').fill('lavender'); assert.equal(await page.locator('.cake-card').count(),1);
  await page.locator('#searchInput').fill('no-such-cake'); assert(await page.locator('#emptyState').isVisible());
  await page.locator('#resetFilters').click(); assert.equal(await page.locator('.cake-card').count(),7);
  await page.locator('#sortSelect').selectOption('name');
  const names = await page.locator('.cake-copy h3').allTextContents();
  assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b)));
  await page.locator('.cake-copy a').first().click();
  await page.waitForFunction(()=>document.querySelector('#cakeDesign').value==='6');
  assert.equal(await page.locator('#selectedCakeTitle').textContent(),'Blue daisy cake');
  assert(await page.locator('#selectedCakeImage').isVisible());
  check('Gallery categories, search, empty/reset, valid name sorting, selected design-to-order flow');

  // Intercept actual navigation; no message is sent and no external account opens.
  const requests=[];
  await page.route('https://wa.me/**', async route => {
    requests.push(route.request().url());
    await route.fulfill({status:200,contentType:'text/html',body:'<title>Intercepted WhatsApp navigation</title>'});
  });
  await page.locator('#whatsappOrder').click();
  assert.equal(requests.length,0); assert.equal(await page.evaluate(()=>document.activeElement.id),'weight-1');
  assert(await page.locator('#weight-1-error').isVisible());
  await page.locator('#weight-2').check();
  await page.locator('#flavor').selectOption('Chocolate');
  await page.locator('#occasion').selectOption('Birthday');
  await page.locator('#cakeMessage').fill('Happy birthday, Amna & Ali!');
  await page.locator('#notes').fill('Blue & white <script>test</script>');
  await page.locator('#delivery-pickup').check();
  const today = await page.locator('#deliveryDate').getAttribute('min');
  await page.locator('#deliveryDate').fill('2020-01-01'); await page.locator('#whatsappOrder').click();
  assert.equal(requests.length,0); assert.equal(await page.evaluate(()=>document.activeElement.id),'deliveryDate');
  await page.locator('#deliveryDate').fill(today);
  assert.equal(await page.locator('#summary-weight').textContent(),'2 pounds');
  assert.equal(await page.locator('#summary-notes').textContent(),'Blue & white <script>test</script>');
  await page.locator('#delivery-home').check(); await page.locator('#whatsappOrder').click();
  assert.equal(requests.length,0); assert.equal(await page.evaluate(()=>document.activeElement.id),'deliveryAddress');
  await page.locator('#deliveryAddress').fill('House 12, Street 3, B-17, Islamabad');
  assert.equal(await page.locator('#summary-address').textContent(),'House 12, Street 3, B-17, Islamabad');
  check('Required validation, first-error focus, weight/flavor/occasion, past-date block, local today allowed, live address/notes summary');

  await page.locator('#referenceImage').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('not an image')});
  assert.match(await page.locator('#referenceError').textContent(),/JPG, PNG or WebP/);
  await page.locator('#referenceImage').setInputFiles({name:'large.png',mimeType:'image/png',buffer:Buffer.alloc(8*1024*1024+1)});
  assert.match(await page.locator('#referenceError').textContent(),/8 MB/);
  await page.locator('#referenceImage').setInputFiles(path.resolve(__dirname,'../assets/logo/favicon-32.png'));
  assert(await page.locator('#referencePreview').isVisible());
  assert.equal(await page.locator('#fileName').textContent(),'favicon-32.png');
  await page.waitForFunction(()=>document.querySelector('#imagePreview').naturalWidth>0);
  await page.locator('#removeImage').click(); assert.equal(await page.locator('#referencePreview').isVisible(),false);
  await page.locator('#referenceImage').setInputFiles(path.resolve(__dirname,'../assets/logo/favicon-32.png'));
  await page.locator('#whatsappOrder').click();
  await page.waitForURL('https://wa.me/**');
  assert.equal(requests.length,1);
  const deliveryMessage = new URL(requests[0]).searchParams.get('text');
  assert.match(deliveryMessage,/Hello Dream Bakerz/); assert.match(deliveryMessage,/Cake Design: Blue daisy cake/);
  assert.match(deliveryMessage,/Delivery Address: House 12, Street 3, B-17, Islamabad/);
  assert.match(deliveryMessage,/Cake Message: Happy birthday, Amna & Ali!/);
  assert.match(deliveryMessage,/attach my reference image/); assert.match(deliveryMessage,/confirmation of availability/);
  assert.match(requests[0],/^https:\/\/wa.me\/923477268670\?text=/);
  check('Reference file type/8 MB checks, preview, removal, and complete encoded WhatsApp delivery quotation');

  await page.goto(base+'/order.html?cake=custom'); await page.waitForFunction(()=>document.querySelector('#customDesign').required);
  await page.locator('#customDesign').fill('A green cake for graduation'); await page.locator('#weight-1').check();
  await page.locator('#flavor').selectOption('Vanilla'); await page.locator('#occasion').selectOption('Graduation');
  await page.locator('#deliveryDate').fill(today); await page.locator('#delivery-pickup').check();
  await page.locator('#whatsappOrder').click(); await page.waitForURL('https://wa.me/**');
  const pickupMessage = new URL(requests[1]).searchParams.get('text');
  assert.match(pickupMessage,/Cake Design: A green cake for graduation/); assert.match(pickupMessage,/Delivery Method: Pickup/);
  assert(!pickupMessage.includes('Delivery Address')); assert(!pickupMessage.includes('Cake Message:')); assert(!pickupMessage.includes('Reference Design:'));
  check('Custom design request and pickup message omit irrelevant/empty fields');

  await page.goto(base+'/order.html?cake=unknown'); await page.waitForSelector('#designNotice:not([hidden])');
  assert.equal(await page.locator('#cakeDesign').inputValue(),'');
  await page.goto(base+'/contact.html'); await page.waitForFunction(()=>document.querySelector('#contactForm').noValidate);
  await page.locator('#contactWhatsappButton').click(); assert.equal(await page.evaluate(()=>document.activeElement.id),'contactName');
  await page.locator('#contactName').fill('Test customer'); await page.locator('#contactEmail').fill('invalid-email');
  await page.locator('#contactSubject').selectOption('Custom cake'); await page.locator('#contactMessage').fill('Could we discuss a butterfly cake?');
  await page.locator('#contactWhatsappButton').click(); assert.equal(await page.evaluate(()=>document.activeElement.id),'contactEmail');
  await page.locator('#contactEmail').fill(''); await page.locator('#contactWhatsappButton').click(); await page.waitForURL('https://wa.me/**');
  const contactMessage = new URL(requests[2]).searchParams.get('text');
  assert.match(contactMessage,/Hello Dream Bakerz/); assert.match(contactMessage,/Test customer/);
  assert(!contactMessage.includes('Email:')); assert(!contactMessage.includes('Phone:'));
  check('Unknown cake fallback; contact required/email validation and WhatsApp enquiry');

  await page.goto(base+'/index.html');
  const links = await page.locator('a[href^="/"]').evaluateAll(elements=>[...new Set(elements.map(e=>new URL(e.href).pathname))]);
  for (const link of links) assert.equal((await context.request.get(base+link)).status(),200,link);
  const missing=await context.request.get(base+'/missing-page/nested'); assert.equal(missing.status(),404); assert.match(await missing.text(),/This page is missing/);
  check('Homepage/navigation/footer internal links and genuine local 404 status');

  const nojs = await browser.newContext({javaScriptEnabled:false, viewport:{width:320,height:850}});
  const plain = await nojs.newPage(); await plain.goto(base+'/catalog.html');
  assert.equal(await plain.locator('.cake-card').count(),7); assert(await plain.locator('#siteNav').isVisible());
  assert(await plain.locator('noscript').isVisible()); await nojs.close();
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto(base+'/index.html');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
  check('No-JavaScript static navigation/gallery/fallback and reduced-motion preference');
  assert.equal(report.errors.length,0,`Unexpected console or asset errors: ${report.errors.join('; ')}`);
  check('No unexpected JavaScript, font or asset errors during tested flows');
  report.result='PASS'; await browser.close();
})().catch(error=>{report.result='FAIL';report.failure=error.stack;console.error(error);process.exitCode=1;}).finally(async()=>{
  if (browser) await browser.close();
  fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2)+'\n');
});
