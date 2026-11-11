const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
const out = path.resolve(__dirname, '../docs/verification');
const report = {date:new Date().toISOString(),checks:[],errors:[]};
const pass = name => { report.checks.push(name); console.log('PASS', name); };
let browser;
(async () => {
  const { menuItems, menuCategories, itemsInCategory, formatMoney } = await import(pathToFileURL(path.resolve(__dirname, '../js/menu-data.js')));
  browser = await chromium.launch({headless:true,args:['--disable-gpu','--disable-renderer-backgrounding','--disable-background-timer-throttling','--disable-features=CalculateNativeWinOcclusion'], ...(process.env.BROWSER_PATH ? {executablePath:process.env.BROWSER_PATH} : {})});
  const context = await browser.newContext({timezoneId:'Asia/Karachi',viewport:{width:1440,height:1000}});
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  await page.goto(base+'/index.html');
  await page.waitForSelector('[role="tab"]');
  assert.equal(await page.getByRole('tab').count(),5);
  for (const category of menuCategories) {
    await page.getByRole('tab',{name:category.name,exact:true}).click();
    assert.equal(await page.locator('[role="tabpanel"]:visible').count(),1);
    const rows = page.locator('[role="tabpanel"]:visible .menu-price-row');
    const expected = itemsInCategory(category.id);
    assert.equal(await rows.count(),expected.length);
    for (let index=0; index<expected.length; index++) {
      assert.equal(await rows.nth(index).locator('span').first().textContent(),expected[index].name);
      assert.equal(await rows.nth(index).locator('.menu-price').textContent(),formatMoney(expected[index].price));
      assert.equal(new URL(await rows.nth(index).getAttribute('href'),base).searchParams.get('item'),expected[index].id);
    }
  }
  await page.getByRole('tab',{name:'Cakes',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab',{name:'Cupcakes',exact:true}).getAttribute('aria-selected'),'true');
  await page.keyboard.press('End');
  assert.equal(await page.getByRole('tab',{name:'Donuts',exact:true}).getAttribute('aria-selected'),'true');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab',{name:'Cakes',exact:true}).getAttribute('aria-selected'),'true');
  await page.keyboard.press('Home');
  assert.equal(await page.getByRole('tab',{name:'Cakes',exact:true}).getAttribute('tabindex'),'0');
  pass('Homepage: all 23 approved names/prices, five compact categories, one visible panel and roving keyboard tabs');

  for (const category of menuCategories) {
    await page.goto(base+'/index.html');
    await page.getByRole('tab',{name:category.name,exact:true}).click();
    const items = itemsInCategory(category.id);
    await page.locator('[role="tabpanel"]:visible .menu-price-row').first().click();
    await page.waitForFunction(id=>document.querySelector('#menuItem').value===id,items[0].id);
    assert.equal(await page.locator('input[name="category"]:checked').inputValue(),category.id);
    assert.equal(await page.locator('#menuItem option').count(),items.length+1);
    const cake = category.id === 'cakes';
    assert.equal(await page.locator('#cakeWeightGroup').isVisible(),cake);
    assert.equal(await page.locator('#cakeCustomization').isVisible(),cake);
    assert.equal(await page.locator('#referenceSection').isVisible(),cake);
    assert.equal(await page.locator('#quantity').isEnabled(),!cake);
    if (cake) await page.locator('#weight-2').check();
    else await page.locator('#quantity').fill('6');
    for (const item of items) {
      await page.locator('#menuItem').selectOption(item.id);
      assert.equal(await page.locator('#selectedCakeTitle').textContent(),item.name);
      assert.equal(await page.locator('#summary-unitPrice').textContent(),`${formatMoney(item.price)} ${cake ? 'per pound' : 'per item'}`);
      assert.equal(await page.locator('#estimatedBaseAmount').textContent(),formatMoney(item.price*(cake?2:6)));
      if (!cake) assert.equal(await page.locator('#selectedCakeImage').isVisible(),false);
    }
  }
  pass('All 23 items preselect from menu links, filter by category, show correct units and calculate actual estimates');

  await page.goto(base+'/order.html?item=cake-chocolate-fudge&cake=6');
  await page.waitForFunction(()=>document.querySelector('#menuItem').value==='cake-chocolate-fudge');
  await page.locator('#weight-2').check();
  assert.equal(await page.locator('#selectedCakeDesign').textContent(),'Design: Blue daisy cake');
  assert.equal(await page.locator('#estimatedBaseAmount').textContent(),'Rs. 3,400');
  await page.locator('#occasion').selectOption('Birthday');
  await page.locator('#cakeMessage').fill('Happy Birthday & best wishes');
  await page.locator('#cakeDesign').selectOption('custom');
  await page.locator('#customDesign').fill('A blue cake with daisies');
  await page.locator('#referenceImage').setInputFiles(path.resolve(__dirname,'../assets/logo/favicon-32.png'));
  await page.waitForFunction(()=>document.querySelector('#imagePreview').naturalWidth>0);
  const today = await page.locator('#deliveryDate').getAttribute('min');
  await page.locator('#deliveryDate').fill(today);
  await page.locator('#delivery-home').check();
  await page.locator('#deliveryAddress').fill('House 12, B-17, Islamabad');
  await page.locator('#notes').fill('Please discuss the design first.');
  await page.locator('#category-donuts').check();
  await page.locator('#menuItem').selectOption('donut-chocolate-filled');
  await page.locator('#quantity').fill('6');
  assert.equal(await page.locator('#estimatedBaseAmount').textContent(),'Rs. 1,500');
  await page.locator('#category-brownies').check();
  await page.locator('#menuItem').selectOption('brownie-fudge-3x3');
  await page.locator('#quantity').fill('4');
  assert.equal(await page.locator('#estimatedBaseAmount').textContent(),'Rs. 800');
  await page.locator('#category-donuts').check();
  assert.equal(await page.locator('#menuItem').inputValue(),'donut-chocolate-filled');
  assert.equal(await page.locator('#quantity').inputValue(),'6');
  await page.locator('#category-cakes').check();
  assert.equal(await page.locator('#menuItem').inputValue(),'cake-chocolate-fudge');
  assert(await page.locator('#weight-2').isChecked());
  assert.equal(await page.locator('#cakeMessage').inputValue(),'Happy Birthday & best wishes');
  assert.equal(await page.locator('#customDesign').inputValue(),'A blue cake with daisies');
  assert.equal(await page.locator('#deliveryAddress').inputValue(),'House 12, B-17, Islamabad');
  assert(await page.locator('#referencePreview').isVisible());
  assert.equal(await page.locator('#estimatedBaseAmount').textContent(),'Rs. 3,400');
  assert(!page.url().includes('House') && !page.url().includes('Birthday'));
  assert.deepEqual(await page.evaluate(()=>[localStorage.length,sessionStorage.length]),[0,0]);
  pass('Category switching preserves each item/quantity, cake design, message, weight, reference, date, delivery and notes without personal-data storage');

  const requests=[];
  await page.route('https://wa.me/**',async route=>{
    requests.push(route.request().url());
    await route.fulfill({status:200,contentType:'text/html',body:'<title>Intercepted quotation</title>'});
  });
  await page.locator('#whatsappOrder').click();
  await page.waitForURL('https://wa.me/**');
  const cakeMessage = new URL(requests[0]).searchParams.get('text');
  for (const text of ['Item: Chocolate Fudge','Weight: 2 Pounds','Price Per Pound: Rs. 1,700','Estimated Base Amount: Rs. 3,400','Special Design Requests: A blue cake with daisies','Delivery Address: House 12, B-17, Islamabad','attach my reference image']) assert(cakeMessage.includes(text),text);
  pass('Cake WhatsApp quotation includes the corrected variety, independent design, estimate, reference reminder and delivery address');

  await page.goto(base+'/order.html?item=donut-chocolate-filled');
  await page.waitForFunction(()=>document.querySelector('#menuItem').value==='donut-chocolate-filled');
  await page.locator('#quantity').fill('0');
  await page.locator('#whatsappOrder').click();
  assert.equal(requests.length,1);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'quantity');
  await page.locator('#quantity').fill('1.5');
  await page.locator('#whatsappOrder').click();
  assert.equal(requests.length,1);
  await page.locator('#quantity').fill('6');
  await page.locator('#deliveryDate').fill('2020-01-01');
  await page.locator('#delivery-pickup').check();
  await page.locator('#whatsappOrder').click();
  assert.equal(requests.length,1);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'deliveryDate');
  await page.locator('#deliveryDate').fill(today);
  await page.locator('#delivery-home').check();
  await page.locator('#whatsappOrder').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'deliveryAddress');
  await page.locator('#deliveryAddress').fill('   ');
  await page.locator('#whatsappOrder').click();
  assert.equal(requests.length,1);
  await page.locator('#deliveryAddress').fill('B-17, Islamabad');
  await page.locator('#notes').fill('Six donuts for a family gathering.');
  await page.locator('#whatsappOrder').click();
  await page.waitForURL('https://wa.me/**');
  const donutMessage = new URL(requests[1]).searchParams.get('text');
  for (const text of ['Category: Donuts','Item: Chocolate Filled Donut','Quantity: 6','Unit Price: Rs. 250','Estimated Base Amount: Rs. 1,500','Delivery Address: B-17, Islamabad','Six donuts']) assert(donutMessage.includes(text),text);
  for (const text of ['Weight:','Pound','Occasion:','Cake Message:','Cake Design:','Reference Design:']) assert(!donutMessage.includes(text),text);
  pass('Non-cake quantity/date/address validation and complete quotation omit every irrelevant cake-only field');

  await page.goto(base+'/catalog.html');
  await page.waitForSelector('.filter-button');
  await page.locator('.cake-copy a').first().click();
  await page.waitForFunction(()=>document.querySelector('#cakeDesign').value==='1');
  assert.equal(await page.locator('#menuItem').inputValue(),'');
  assert.equal(await page.locator('#selectedCakeDesign').textContent(),'Design: Butterfly fairy cake');
  assert(await page.locator('#selectedCakeImage').isVisible());
  await page.goto(base+'/order.html?item=unknown&cake=unknown');
  await page.waitForSelector('#itemNotice:not([hidden])');
  assert(await page.locator('#designNotice').isVisible());
  pass('Gallery identities carry through without guessing the cake variety; invalid links have useful fallbacks');

  for (const width of [320,375,390,430,768,1024,1440]) {
    await page.setViewportSize({width,height:950});
    await page.goto(base+'/index.html');
    await page.getByRole('tab',{name:'Brownies',exact:true}).click();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
    if ([390,1440].includes(width)) {
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.locator('#menu').screenshot({path:path.join(out,`menu-${width}.png`)});
    }
    await page.goto(base+'/order.html?item=donut-chocolate-filled');
    await page.waitForFunction(()=>document.querySelector('#menuItem').value==='donut-chocolate-filled');
    await page.locator('#quantity').fill('6');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
    if ([390,1440].includes(width)) await page.screenshot({path:path.join(out,`quantity-order-${width}.png`),fullPage:true});
  }
  pass('Homepage menu and quantity order form fit all seven requested widths; desktop/mobile screenshots saved');
  const plain = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
  const fallback = await plain.newPage();
  await fallback.goto(base+'/index.html');
  assert.equal(await fallback.locator('#kitchenMenu details').count(),5);
  await fallback.locator('#kitchenMenu details').nth(1).locator('summary').click();
  assert.equal(await fallback.locator('#kitchenMenu details[open]').count(),1);
  assert.equal(await fallback.locator('#kitchenMenu details[open] .menu-price-row').count(),3);
  assert.equal(await fallback.locator('#kitchenMenu .menu-price-row').count(),23);
  await plain.close();
  pass('No-JavaScript native disclosures retain the complete 23-item menu and order links');
  assert.equal(report.errors.length,0,report.errors.join('; '));
  pass('No JavaScript or browser-console errors in the tested menu/order flows');
  report.result='PASS';
  await context.close();
})().catch(error=>{report.result='FAIL';report.failure=error.stack;console.error(error);process.exitCode=1;}).finally(async()=>{
  if(browser) await browser.close();
  fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'menu-browser-report.json'),JSON.stringify(report,null,2)+'\n');
});
