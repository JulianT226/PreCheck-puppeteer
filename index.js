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

  // Navigate to the visa form website
  await page.goto('https://cova.mfa.gov.cn/qzCoCommonController.do?show&pageId=278VKVKrjVKVlrHVcVnVSVnririVYVbVSVcrHVaVmVSVPrkVYrHVSVYVPVPV8rHrIrkrIrkVarjV8VbVa&DataSource=2&locale=en_US'); 

  // Wait for the region selection buttons to be present
  await page.waitForSelector('#NA'); // Adjust this selector based on the actual region selection element

  try {
    // Prompt for the region
    const region = await askQuestion('Where are you applying from (Asia, Africa, Europe, North America, South America, Oceania): ');

    // Click the respective button based on the region
    switch(region.toLowerCase()) {
      case 'asia':
        await page.click('#AS'); // Replace with the actual selector for the Asia button
        break;
      case 'africa':
        await page.click('#AF'); // Replace with the actual selector for the Africa button
        break;
      case 'europe':
        await page.click('#EU'); // Replace with the actual selector for the Europe button
        break;
      case 'north america':
        await page.click('#NA'); // Replace with the actual selector for the North America button
        
        // Ask for jurisdiction
        const jurisdiction = await askQuestion('Which jurisdiction are you applying to (Chicago, Los Angeles, New York, Washington DC): ');
        
        // Click the respective button based on the jurisdiction
        await page.evaluate((jurisdiction) => {
            const cityElements = document.querySelectorAll('#USA .city');
            for (const cityElement of cityElements) {
                if (cityElement.textContent.trim().toLowerCase() === jurisdiction.toLowerCase()) {
                cityElement.click();
                break;
             }
            }
        }, jurisdiction);
        console.log('Jurisdiction selected.');
        

        // Ensure the button is fully visible and scroll into view
        await page.evaluate(() => {
            document.querySelector('.btn.btn-large.btn-primary').scrollIntoView();
        });
  
        // Click the Start Application button and ensure it triggers the function
        await page.waitForSelector('.btn.btn-large.btn-primary');
        await page.click('.btn.btn-large.btn-primary');
        console.log('Start Application button clicked.');
  
        // Wait for navigation or some indication that the page has changed
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('Navigated to the application form.');
        break;

      case 'south america':
        await page.click('#SA'); // Replace with the actual selector for the South America button
        break;
      case 'oceania':
        await page.click('#OC'); // Replace with the actual selector for the Oceania button
        break;
      default:
        console.error('Invalid region specified.');
        await browser.close();
        return;
    }
    console.log('Region selected.');

    // Wait for the form to be present in the DOM
    await page.waitForSelector('#visaForm'); // Adjust this selector based on the actual form

    // Prompt for and fill in the first name
    const firstName = await askQuestion('Enter your first name: ');
    await page.type('#firstName', firstName); // Replace with actual form selector for first name
    console.log('First name filled in.');

    // Prompt for and fill in the last name
    const lastName = await askQuestion('Enter your last name: ');
    await page.type('#lastName', lastName); // Replace with actual form selector for last name
    console.log('Last name filled in.');

    // Prompt for and fill in the passport number
    const passportNumber = await askQuestion('Enter your passport number: ');
    await page.type('#passportNumber', passportNumber); // Replace with actual form selector for passport number
    console.log('Passport number filled in.');

    // Prompt for and fill in the birth date
    const birthDate = await askQuestion('Enter your birth date (YYYY-MM-DD): ');
    await page.type('#birthDate', birthDate); // Replace with actual form selector for birth date
    console.log('Birth date filled in.');

    // Prompt for and fill in the nationality
    const nationality = await askQuestion('Enter your nationality: ');
    await page.select('#nationality', nationality); // Replace with actual form selector for nationality
    console.log('Nationality filled in.');

    // Wait for the submit button to be present before clicking
    await page.waitForSelector('#submitButton'); // Replace with the actual form submit button selector
    await page.click('#submitButton');
    await page.waitForNavigation(); // Wait for the next page to load

    console.log('Form submitted.');

    await browser.close();
    console.log('Browser closed.');
  } catch (error) {
    console.error('Error:', error);
    await browser.close();
  }
})();