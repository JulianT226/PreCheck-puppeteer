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
  await page.goto('https://cova.mfa.gov.cn/qzCoCommonController.do?show&pageId=278VKVKrjVKVlrHVcVnVSVnririVYVbVSVcrHVaVmVSVPrkVYrHVSVYVPVPV8rHrIrkrIrkVarjV8VbVa&DataSource=2&locale=en_US'); 

  // Wait for the region selection buttons to be present
  await page.waitForSelector('#NA');

  try {

    await page.click('#NA')

    const washingtonDCStates = [
      'Washington D.C.', 'Maryland', 'Virginia', 'West Virginia', 'North Carolina', 'South Carolina',
      'Kentucky', 'Tennessee', 'Delaware', 'Alabama', 'Arkansas', 'Florida', 'Georgia', 'Louisiana',
      'Mississippi', 'Oklahoma', 'Texas', 'Puerto Rico'
    ];
    
    const newYorkStates = [
      'Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'New Jersey', 'New York', 'Ohio',
      'Pennsylvania', 'Vermont', 'Rhode Island'
    ];
    
    const chicagoStates = [
      'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Minnesota', 'Missouri', 'Wisconsin',
      'Nebraska', 'North Dakota', 'South Dakota'
    ];
    
    const losAngelesStates = [
      'California', 'Arizona', 'New Mexico', 'Utah', 'Colorado', 'Alaska', 'Nevada', 'Oregon',
      'Washington', 'Idaho', 'Montana', 'Wyoming', 'Hawaii',
      'U.S. Pacific islands including Guam', 'Northern Mariana Islands', 'American Samoa'
    ];
    
    function getJurisdiction(state) {
      if (washingtonDCStates.includes(state)) {
        return 'Washington D.C.';
      } else if (newYorkStates.includes(state)) {
        return 'New York';
      } else if (chicagoStates.includes(state)) {
        return 'Chicago';
      } else if (losAngelesStates.includes(state)) {
        return 'Los Angeles';
      } else {
        throw new Error('State not recognized. Please check the input.');
      }
    }
    
    let state = await askQuestion('Which state do you live in: ');
    
    // Normalize the state input
    state = state.trim();
    
    let jurisdiction = getJurisdiction(state);
    
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


    await page.waitForNavigation({ waitUntil: 'networkidle2' }); // Wait for the page to navigate

    // Ensure the button is fully visible and scroll into view
    await page.evaluate(() => {
        document.querySelector('.btn.btn-large.btn-primary').scrollIntoView();
    });
  
    // Click the Start Application button and ensure it triggers the function
    await page.waitForSelector('.btn.btn-large.btn-primary');
    await page.click('.btn.btn-large.btn-primary');

    // Prompt for and fill last name
    const lastName = await askQuestion('Enter your last name as it appears on your passport: ')
    await page.type('#PassportFamilyName', lastName)

    // Prompt for and fill in the first and middle name
    const firstName = await askQuestion('Enter your first and middle name: ');
    await page.type('#PassportFirstName', firstName);

    await page.click('#upApplyPersonalPhoto')

    // Function to remove leading zeros from month and day
    const removeLeadingZero = (value) => {
      return value.replace(/^0+/, '');
    };

    // Prompt for and select the date of birth
    let dobMonth = await askQuestion('Enter the month you were born (MM): ');
    let dobDay = await askQuestion('Enter the day you were born (DD): ');
    const dobYear = await askQuestion('Enter the year you were born (YYYY): ');

    // Remove leading zeros if present
    dobMonth = removeLeadingZero(dobMonth);
    dobDay = removeLeadingZero(dobDay);

    // Type the year in the input field
    await page.type('#Birthday-year', dobYear);

    // Select the month from the dropdown
    await page.type('#Birthday-month', dobMonth);

    // Select the day from the dropdown
    await page.type('#Birthday-day', dobDay);

    // Prompt for and select the gender
    const gender = await askQuestion('Enter your gender (m/f): ');

    // Select the appropriate gender checkbox
    if (gender.toLowerCase() === 'male') {
      await page.click('input[name="sex"][value="M"]');
  } else if (gender.toLowerCase() === 'female') {
      await page.click('input[name="sex"][value="F"]');
  } else {
      console.error('Invalid gender specified.');
  }

    // Prompt for birth place (country, state, city)
    console.log('Enter your place of birth as shown on your passport')
    const countryBorn = await askQuestion('Country: ')
    const stateBorn = await askQuestion('State/Province: ')
    const cityBorn = await askQuestion('City: ')

    await page.type('#BirthPlaceCountry', countryBorn);
    await page.type('#foreign_birthplaceprovince', stateBorn);
    await page.type('#foreign_birthplacecity', cityBorn);

    // Prompt for marital status
    const maritalstatus = await askQuestion('Enter your marital status: ')

    // Select the marital status
    if (maritalstatus.toLowerCase() === 'married') {
      await page.click('input[name="maritalstatus"][value="706001"]');

  } else if (maritalstatus.toLowerCase() === 'single') {
      await page.click('input[name="maritalstatus"][value="706003"]');

  } else if (maritalstatus.toLowerCase() === 'divorced') {
      await page.click('input[name="maritalstatus"][value="706002"]');

  } else if (maritalstatus.toLowerCase() === 'widowed') {
      await page.click('input[name="maritalstatus"][value="706004"]');

  } else if (maritalstatus.toLowerCase() === 'other') {
      await page.click('input[name="maritalstatus"][value="706005"]');
  } else {
      console.error('Invalid marital status specified')
  }

    const govID = await askQuestion("Enter your government ID (Driver's License #): ")
    const nationality = await askQuestion('Enter your nationality: ')
    const otherNationality = await askQuestion('Do you hold any other nationality: ')
    
    await page.type('#NationalityIdCard', govID)
    await page.type('#NationalityCountry', nationality)

    if (otherNationality.toLowerCase() === 'yes') {
      await page.click('input[name="isHaveOtherNationality"][value="1"]');

      const otherNationalityEnter = await askQuestion('Enter your other nationality: ')
      await page.type('#OtherNationality1', otherNationalityEnter)

      const nationalityID = await askQuestion('Enter your ID number of your other nationality: ')
      await page.type('#IdNumberOfOtherNationality1', nationalityID)

      const nationalityPassNum = await askQuestion('Enter your passport number of your other nationality: ')
      await page.type('#PassportNoOfOtherNationality1', nationalityPassNum)

      if (nationalityID === "" && nationalityPassNum === "") {
        const noIDorPass = await askQuestion('Please specify why you do not have an ID number nor a passport number for your other nationality: ')
        await page.type('#JustifyOfOtherNationality1', noIDorPass)
      }

  } else {
      await page.click('input[name="isHaveOtherNationality"][value="0"]')
  }

    const permanentResidence = await askQuestion('Do you have permanent residence in any other country/region: ')

    if (permanentResidence.toLowerCase() === 'yes') {
      await page.click('input[name="IsHavePermanent"][value="1"]')

      const listPermanentResidence = await askQuestion('List all countries where you have permanent residence: ')
      await page.type('#PermanentCountries', listPermanentResidence)
    
  }  else {
      await page.click('input[name="IsHavePermanent"][value="0"]')
  }

    const formerNationality = await askQuestion('Have you ever held a different nationality: ')

    if (formerNationality.toLowerCase() === 'yes') {
      await page.click('input[name="isHaveFormerNationality"][value="1"]')

      const listFormerNationality = await askQuestion('List all countries where you held any former nationality: ')
      await page.type('#FormerNationality1', listFormerNationality)
    
  }  else {
      await page.click('input[name="isHaveFormerNationality"][value="0"]')
  }

    // Prompt for marital status
    const passportType = await askQuestion('Enter the type of US passport you have: ')

    // Select the marital status
    if (passportType.toLowerCase() === 'diplomatic') {
      await page.click('input[name="typeOfPassport"][value="707003"]');

  } else if (passportType.toLowerCase() === 'service') {
      await page.click('input[name="typeOfPassport"][value="707002"]');

  } else if (passportType.toLowerCase() === 'official') {
      await page.click('input[name="typeOfPassport"][value="707004"]');

  } else if (passportType.toLowerCase() === 'special') {
      await page.click('input[name="typeOfPassport"][value="707005"]');

  } else if (passportType.toLowerCase() === 'ordinary') {
      await page.click('input[name="typeOfPassport"][value="707001"]');
  
  } else if (passportType.toLowerCase() === 'other') {
      await page.click('input[name="typeOfPassport"][value="707006"]')

      const otherPassInfo = await askQuestion('Please specify what type of passport you have: ')
      await page.type('#OtherPassportInfo', otherPassInfo)
    
  } else {
      console.error('Invalid passport type.')
  }

    const passportNum = await askQuestion('Enter your passport number: ')
    await page.type('#PassportNo', passportNum)

    await page.type('#IssueCountry', 'United States of America')

    const passportPlaceOfIssue = await askQuestion('Enter the state where your passport was issued: ')
    await page.type('#IssuePlace', passportPlaceOfIssue)


    let passExpMonth = await askQuestion('Enter the month your passport expires (MM): ');
    let passExpDay = await askQuestion('Enter the day your passport expires (DD): ');
    const passExpYear = await askQuestion('Enter the year your passport expires (YYYY): ');

    passExpMonth = removeLeadingZero(passExpMonth);
    passExpDay = removeLeadingZero(passExpDay);

    await page.type('#Expirationdate-year', passExpYear);
    await page.type('#Expirationdate-month', passExpMonth);
    await page.type('#Expirationdate-day', passExpDay);

    await page.click('.btn.btn-success');


    // PAGE 2

    // Prompt for the type of visa
    const visaType = await askQuestion('Enter the type of visa (L/M/F/Q1/Q2/S1/S2/Z/X1/X2/J1/J2/C/G/D/R/Diplomatic/Official/Other): ');

    // Map user input to the corresponding value in the dropdown
    const visaTypeMap = {
      'l': '709001',
      'm': '709002',
      'f': '709003',
      'q1': '709004',
      'q2': '709005',
      's1': '709006',
      's2': '709007',
      'z': '709008',
      'x1': '709009',
      'x2': '709010',
      'j1': '709011',
      'j2': '709012',
      'c': '709013',
      'g': '709014',
      'd': '709015',
      'r': '709016',
      'diplomatic': '709017',
      'official': '709018',
      'member': '709019',
      'other': '709020'
  };

    // Select the visa type from the dropdown
    const visaTypeValue = visaTypeMap[visaType.toLowerCase()];
    if (visaTypeValue) {
      await page.select('#VisaType', visaTypeValue);
      if (visaType === 'l') {
        touristType = await askQuestion('Are you an independent or group tourist?')
        if (touristType.toLowerCase() === 'independent') {
          await page.click('input[name="VisaPurpose"][value="710001"]')
      } else if (touristType.toLowerCase() === 'group') {
          await page.click('input[name="VisaPurpose"][value="710002"]')
          travelAgency = await askQuestion('Enter the Travel Agency in China:' )
          await page.type('#TravelAgencyInChina', travelAgency)
          travelAgencyNum = await askQuestion('Enter the Travel Agency License No.: ')
          await page.type('#TravelAgencyLicenseNo', travelAgencyNum)
      }
    } else if (visaTypeValue === 'z') {
        workType = await askQuestion('Please select which of the following best describes your intended work in China: \n1. Foreign expert working in China \n 2. For commercial performance \n 3. Chief representative or representative of a foreign company \n 4. Offshore oil operations \n 5. Volunteering (more than 90 days) \n 6. Foreigner working in China with a Work Permit issued by the Chinese government')
        if (workType === '1') {
          await page.click('input[name="VisaPurpose"][value="710024"]')
      } else if (workType === '2') {
          await page.click('input[name="VisaPurpose"][value="710025"')
      } else if (workType === '3') {
          await page.click('input[name="VisaPurpose"][value="710026"')
      } else if (workType === '4') {
          await page.click('input[name="VisaPurpose"][value="710027"')
      } else if (workType === '5') {
          await page.click('input[name="VisaPurpose"][value="710028"')
      } else if (workType === '6') {
          await page.click('input[name="VisaPurpose"][value="710029"')
      }
    } else if (visaTypeValue === 'c') {
        workType = await askQuestion ('Please select which of the following best describes your situation: \n1. Crew member performing duties on board an international train \n2. Crew member performing duties on board an international aircraft \n3. Crew member performing duties on board an international vessel or accompanying family member \n4. Vehicle driver engaged in international transportation services')
        if (workType === '1') {
          await page.click('input[name="VisaPurpose"][value="710032"]')
      } else if (workType === '2') {
          await page.click('input[name="VisaPurpose"][value="710033"')
      } else if (workType === '3') {
          await page.click('input[name="VisaPurpose"][value="710034"')
      } else if (workType === '4') {
          await page.click('input[name="VisaPurpose"][value="710035"')
    } 
  }
      else {
      console.error('Invalid visa type specified.');
    }
  }
    const processingTime = await askQuestion('Which processing option do you want: ');

    if (processingTime.toLowerCase() === 'normal') {
      await page.click('input[name="serviceType"][value="701001"]');
  } else if (processingTime.toLowerCase() === 'express') {
      await page.click('input[name="serviceType"][value="701002"]');
  } else {
      console.error('Invalid processing option chosen.');
  }

    const entries = await askQuestion('How many times will you be visiting China? ')
    if (entries === '1') {
      await page.click('input[name="applyVisaTimes"][value="703001"]')
  } else if (entries === '2') {
      await page.click('input[name="applyVisaTimes"][value="703002"]')
  } else if (entries === '3') {
      await page.click('input[name="applyVisaTimes"][value="703003"]')
  }

    const duration = await askQuestion('Enter the maximum duration of your longest stay (days): ')
      await page.type('#ApplyMaxStayDays', duration)
    
    const visaValidity = await askQuestion('Enter the validity of your Visa (months): ')
      await page.type('#ApplyVisaValidity', visaValidity)
    

    // Ensure the button is fully visible and scroll into view
    await page.evaluate(() => {
      document.querySelectorAll('.btn.btn-success').forEach(button => {
          if (button.textContent.includes('Save and Next')) {
              button.scrollIntoView();
          }
      });
  });

  // Click the "Save and Next" button
  await page.evaluate(() => {
      document.querySelectorAll('.btn.btn-success').forEach(button => {
          if (button.textContent.includes('Save and Next')) {
              button.click();
          }
      });
  });


    // PAGE 3

    
    console.log('Please provide 5 years of work history')
    console.log('Employment 1')



      

  } catch (error) {
    console.error('Error:', error);
    
  }
})();