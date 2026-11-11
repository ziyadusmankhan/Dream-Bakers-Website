const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const axePath = process.env.AXE_MODULE || require.resolve('axe-core/axe.min.js');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
const report = {date:new Date().toISOString(),runs:[]};
let browser;
(async()=>{
  browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH ? {executablePath:process.env.BROWSER_PATH}: {})});
  const page=await browser.newPage();
  for(const width of [390,1440]){
    await page.setViewportSize({width,height:950});
    for(const name of ['index','catalog','order','about','contact','404']){
      await page.goto(`${base}/${name}.html`);
      await page.evaluate(()=>document.fonts.ready);
      if(name==='order') await page.waitForFunction(()=>document.querySelector('#cakeDesign').options.length===9);
      await page.addScriptTag({path:axePath});
      const audit=async(state)=>{
        const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}));
        const run={page:name,width,state,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>n.target)})),incomplete:result.incomplete.length};
        report.runs.push(run);
        assert.equal(run.violations.length,0,JSON.stringify(run));
        console.log('PASS axe',name,width,state);
      };
      await audit('initial');
      if(name==='index'){
        if(width===390) await page.locator('#menuToggle').click();
        await page.locator('#cakeDropdown summary').click();
        await page.waitForTimeout(250);
        await audit('cake-dropdown-open');
        await page.locator('#cakeDropdown summary').click();
        if(width===390) await page.locator('#menuToggle').click();
        if(width===1440){
          await page.locator('.social-links').scrollIntoViewIfNeeded();
          await page.waitForTimeout(700);
          await page.locator('.social-instagram').hover();
          await page.waitForTimeout(300);
          await page.screenshot({path:path.resolve(__dirname,'../docs/verification/social-hover-update.png'),clip:await page.locator('.social-links').boundingBox()});
          await audit('social-gradient-hover');
        }
      }
      if(name==='order'){
        await page.locator('#cakeDesign').selectOption('custom');
        await page.locator('#delivery-home').check();
        await page.locator('#whatsappOrder').click();
        await audit('custom-design/home-delivery/validation-errors');
      }
      if(name==='contact'){
        await page.locator('#contactWhatsappButton').click();
        await audit('validation-errors');
      }
      if(width===390){
        await page.locator('#menuToggle').click();
        await audit('mobile-menu-open');
      }
    }
  }
  report.result='PASS';
})().catch(error=>{report.result='FAIL';report.failure=error.stack;process.exitCode=1;console.error(error);}).finally(async()=>{
  if(browser) await browser.close();
  fs.writeFileSync(path.resolve(__dirname,'../docs/verification/accessibility-report.json'),JSON.stringify(report,null,2)+'\n');
});
