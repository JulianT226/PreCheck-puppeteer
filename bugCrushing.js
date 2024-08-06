const puppeteer = require('puppeteer');
const readline = require('readline');

// Function to prompt user for input
const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
};

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--window-size=1280,720']
  });
  const page = await browser.newPage();

  // Add event listener to handle dialogs
  page.on('dialog', async dialog => {
    console.log('Dialog detected:', dialog.message());
    await dialog.dismiss();
  });

  // Navigate to the visa form website
  await page.goto('https://cova.mfa.gov.cn/qzCoCommonController.do?show&pageId=278VYrHVPr1VbVbVaVnVSVaVnVbVYr1VSVcrHVcriVSVKrirIrHVSV8VcVlVarIV8rjrir1VPVYVbVaVY&locale=en_US');

  const locationCity = await askQuestion('City: ')
  await page.type('#StayCity1', locationCity)

  const clickAdd = await askQuestion('Enter: ')
  if (clickAdd === 'yes') {
    await page.evaluate(() => {document.querySelector('#addStayInfo').click()});
  }
  
})();