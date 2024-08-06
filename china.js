const puppeteer = require('puppeteer');
const readline = require('readline');

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

  page.on('dialog', async dialog => {
    console.log('Dialog detected:', dialog.message());
    await dialog.dismiss();
  });

  await page.goto('https://cova.mfa.gov.cn/qzCoCommonController.do?show&pageId=278VKVKrjVKVlrHVcVnVSVnririVYVbVSVcrHVaVmVSVPrkVYrHVSVYVPVPV8rHrIrkrIrkVarjV8VbVa&DataSource=2&locale=en_US'); 

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
        }
      else if (newYorkStates.includes(state)) {
        return 'New York';
        }
      else if (chicagoStates.includes(state)) {
        return 'Chicago';
        }
      else if (losAngelesStates.includes(state)) {
        return 'Los Angeles';
        }
      else {
        throw new Error('State not recognized. Please check the input.');
      }
    }
    
    let state = await askQuestion('Which state do you live in: ');
    
    state = state.trim();
    
    let jurisdiction = getJurisdiction(state);
    
    await page.evaluate((jurisdiction) => {
      const cityElements = document.querySelectorAll('#USA .city');
      for (const cityElement of cityElements) {
        if (cityElement.textContent.trim().toLowerCase() === jurisdiction.toLowerCase()) {
          cityElement.click();
          break;
        }
      }
    }, jurisdiction);


    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.evaluate(() => {
        document.querySelector('.btn.btn-large.btn-primary').scrollIntoView();
    });
  
    await page.waitForSelector('.btn.btn-large.btn-primary');
    await page.click('.btn.btn-large.btn-primary');


    // PAGE 1

    console.log('Enter your name as it appears on your passport:')
    const firstName = await askQuestion('First name: ');
    const middleName = await askQuestion('Middle name: ')
    const firstMiddleName = firstName + " " + middleName

    await page.type('#PassportFirstName', firstMiddleName);

    const lastName = await askQuestion('Last name: ')
    await page.type('#PassportFamilyName', lastName)

    await page.click('#upApplyPersonalPhoto')

    const removeLeadingZero = (value) => {
      return value.replace(/^0+/, '');
    };

    console.log('Please enter your date of birth:')
    let dobMonth = await askQuestion('(MM): ');
    let dobDay = await askQuestion('(DD): ');
    const dobYear = await askQuestion('(YYYY): ');

    dobMonth = removeLeadingZero(dobMonth);
    dobDay = removeLeadingZero(dobDay);


    await page.type('#Birthday-year', dobYear);
    await page.type('#Birthday-month', dobMonth);
    await page.type('#Birthday-day', dobDay);

    const gender = await askQuestion('Enter your gender (male/female): ');

    if (gender.toLowerCase() === 'male') {
      await page.click('input[name="sex"][value="M"]');
    }
    else if (gender.toLowerCase() === 'female') {
      await page.click('input[name="sex"][value="F"]');
    }
    else {
      console.error('Invalid gender specified.');
    }

    console.log('Enter your place of birth as shown on your passport')
    const countryBorn = await askQuestion('Country: ')
    const stateBorn = await askQuestion('State/Province: ')
    const cityBorn = await askQuestion('City: ')

    await page.type('#BirthPlaceCountry', countryBorn);
    await page.type('#foreign_birthplaceprovince', stateBorn);
    await page.type('#foreign_birthplacecity', cityBorn);

    const maritalstatus = await askQuestion('Enter your marital status: ')

    if (maritalstatus.toLowerCase() === 'married') {
      await page.click('input[name="maritalstatus"][value="706001"]');
    }
    else if (maritalstatus.toLowerCase() === 'single') {
      await page.click('input[name="maritalstatus"][value="706003"]');
    }
    else if (maritalstatus.toLowerCase() === 'divorced') {
      await page.click('input[name="maritalstatus"][value="706002"]');
    }
    else if (maritalstatus.toLowerCase() === 'widowed') {
      await page.click('input[name="maritalstatus"][value="706004"]');
    }
    else if (maritalstatus.toLowerCase() === 'other') {
      await page.click('input[name="maritalstatus"][value="706005"]');
    }
    else {
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

    }
    else {
      await page.click('input[name="isHaveOtherNationality"][value="0"]')
    }

    const permanentResidence = await askQuestion('Do you have permanent residence in any other country/region: ')

    if (permanentResidence.toLowerCase() === 'yes') {
      await page.click('input[name="IsHavePermanent"][value="1"]')

      const listPermanentResidence = await askQuestion('List all countries where you have permanent residence: ')
      await page.type('#PermanentCountries', listPermanentResidence)  
    }
    else {
      await page.click('input[name="IsHavePermanent"][value="0"]')
    }

    const formerNationality = await askQuestion('Have you ever held a different nationality: ')

    if (formerNationality.toLowerCase() === 'yes') {
      await page.click('input[name="isHaveFormerNationality"][value="1"]')

      const listFormerNationality = await askQuestion('List all countries where you held any former nationality: ')
      await page.type('#FormerNationality1', listFormerNationality)
    } 
    else {
      await page.click('input[name="isHaveFormerNationality"][value="0"]')
    }


    const passportType = await askQuestion('Enter the type of US passport you have: ')

    if (passportType.toLowerCase() === 'diplomatic') {
      await page.click('input[name="typeOfPassport"][value="707003"]');

    }
    else if (passportType.toLowerCase() === 'service') {
      await page.click('input[name="typeOfPassport"][value="707002"]');

    }
    else if (passportType.toLowerCase() === 'official') {
      await page.click('input[name="typeOfPassport"][value="707004"]');

    }
    else if (passportType.toLowerCase() === 'special') {
      await page.click('input[name="typeOfPassport"][value="707005"]');
    }
    else if (passportType.toLowerCase() === 'ordinary') {
      await page.click('input[name="typeOfPassport"][value="707001"]');
    }
    else if (passportType.toLowerCase() === 'other') {
      await page.click('input[name="typeOfPassport"][value="707006"]')

      const otherPassInfo = await askQuestion('Please specify what type of passport you have: ')
      await page.type('#OtherPassportInfo', otherPassInfo)
    
    }
    else {
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

    const passExpDate = new Date(`${passExpYear}-${removeLeadingZero(passExpMonth)}-${removeLeadingZero(passExpDay)}`);
    const currentDate = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);
    
    if (passExpDate < currentDate) {
        console.log('Your passport is expired. In order to receive a visa, you will first need to renew your passport.');
    } 
    else if (passExpDate < sixMonthsFromNow) {
        console.log('Your passport expires in less than 6 months. In order to receive a visa, you will first need to renew your passport.');
    } 

    passExpMonth = removeLeadingZero(passExpMonth);
    passExpDay = removeLeadingZero(passExpDay);

    await page.type('#Expirationdate-year', passExpYear);
    await page.type('#Expirationdate-month', passExpMonth);
    await page.type('#Expirationdate-day', passExpDay);

    await page.click('.btn.btn-success');


    // PAGE 2

    const visaType = await askQuestion('Enter the type of visa (L/M/F/Q1/Q2/S1/S2/Z/X1/X2/J1/J2/C/G/D/R/Diplomatic/Official/Other): ');

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

    const visaTypeValue = visaTypeMap[visaType.toLowerCase()];
    if (visaTypeValue) {
      await page.select('#VisaType', visaTypeValue);
      if (visaType.toLowerCase() === 'l') {
        touristType = await askQuestion('Are you an independent or group tourist? ')
        if (touristType.toLowerCase() === 'independent') {
          await page.click('input[name="VisaPurpose"][value="710001"]')
        }
        else if (touristType.toLowerCase() === 'group') {
          await page.click('input[name="VisaPurpose"][value="710002"]')
          travelAgency = await askQuestion('Enter the Travel Agency in China:' )
          await page.type('#TravelAgencyInChina', travelAgency)
          travelAgencyNum = await askQuestion('Enter the Travel Agency License No.: ')
          await page.type('#TravelAgencyLicenseNo', travelAgencyNum)
        }
      }
      else if (visaType.toLowerCase() === 'z') {
        workType = await askQuestion('Please select which of the following best describes your intended work in China: \n1. Foreign expert working in China \n 2. For commercial performance \n 3. Chief representative or representative of a foreign company \n 4. Offshore oil operations \n 5. Volunteering (more than 90 days) \n 6. Foreigner working in China with a Work Permit issued by the Chinese government \n')
        if (workType === '1') {
          await page.click('input[name="VisaPurpose"][value="710024"]')
        }
        else if (workType === '2') {
          await page.click('input[name="VisaPurpose"][value="710025"]')
        }
        else if (workType === '3') {
          await page.click('input[name="VisaPurpose"][value="710026"]')
        }
        else if (workType === '4') {
          await page.click('input[name="VisaPurpose"][value="710027"]')
        }
        else if (workType === '5') {
          await page.click('input[name="VisaPurpose"][value="710028"]')
        }
        else if (workType === '6') {
          await page.click('input[name="VisaPurpose"][value="710029"]')
        }
      }
      else if (visaType.toLowerCase() === 'c') {
        workType = await askQuestion ('Please select which of the following best describes your situation: \n1. Crew member performing duties on board an international train \n2. Crew member performing duties on board an international aircraft \n3. Crew member performing duties on board an international vessel or accompanying family member \n4. Vehicle driver engaged in international transportation services \n')
        if (workType === '1') {
          await page.click('input[name="VisaPurpose"][value="710032"]')
        }
        else if (workType === '2') {
          await page.click('input[name="VisaPurpose"][value="710033"]')
        }
        else if (workType === '3') {
          await page.click('input[name="VisaPurpose"][value="710034"]')
        }
        else if (workType === '4') {
          await page.click('input[name="VisaPurpose"][value="710035"]')
        }
      }
      else {
      console.error('Invalid visa type specified.');
      }
    }

    const processingTime = await askQuestion('Which processing option do you want: ');

    if (processingTime.toLowerCase() === 'normal') {
      await page.click('input[name="serviceType"][value="701001"]');
    } 
    else if (processingTime.toLowerCase() === 'express') {
      await page.click('input[name="serviceType"][value="701002"]');
    } 
    else {
      console.error('Invalid processing option chosen.');
    }

    const entries = await askQuestion('How many times will you be visiting China? ')
    if (entries === '1') {
      await page.click('input[name="applyVisaTimes"][value="703001"]')
    } 
    else if (entries === '2') {
      await page.click('input[name="applyVisaTimes"][value="703002"]')
    } 
    else if (entries === '3') {
      await page.click('input[name="applyVisaTimes"][value="703003"]')
    }
    else {
      console.error('Invalid number of visits chosen.')
    }

    const duration = await askQuestion('Enter the maximum duration of your longest stay (days): ')
      await page.type('#ApplyMaxStayDays', duration)
    
    const visaValidity = await askQuestion('Enter the validity of your Visa (months): ')
      await page.type('#ApplyVisaValidity', visaValidity)
    

    await page.evaluate(() => {
      document.querySelectorAll('.btn.btn-success').forEach(button => {
        if (button.textContent.includes('Save and Next')) {
          button.scrollIntoView();
        }
      });
    });

    await page.evaluate(() => {
      document.querySelectorAll('.btn.btn-success').forEach(button => {
        if (button.textContent.includes('Save and Next')) {
          button.click();
        }
      });
    });


    // PAGE 3

    const occupation = await askQuestion('Enter your current occupation: ')
    await page.type('#JobType', occupation)


    console.log('Please provide 5 years of work history');

    let jobIndex = 1;
    let addMoreJobs = true;
  
    while (addMoreJobs && jobIndex <= 5) {
      console.log(`Employment ${jobIndex}`);
  
      const employmentFromYear = await askQuestion(`Enter the year you began job ${jobIndex}: `);
      let employmentFromMonth = await askQuestion(`Enter the month you began job ${jobIndex}: `);
      const employmentToYear = await askQuestion(`Enter the year you ended job ${jobIndex}: `);
      let employmentToMonth = await askQuestion(`Enter the month you ended job ${jobIndex}: `);
  
      employmentFromMonth = removeLeadingZero(employmentFromMonth)
      employmentToMonth = removeLeadingZero(employmentToMonth)

      await page.type(`#Begin-year${jobIndex}`, employmentFromYear);
      await page.type(`#Begin-month${jobIndex}`, employmentFromMonth);
      await page.type(`#End-year${jobIndex}`, employmentToYear);
      await page.type(`#End-month${jobIndex}`, employmentToMonth);

      const employerName = await askQuestion('Enter the name of your employer: ');
      const employerAddress = await askQuestion('Enter the address of your employer: ');
      const employerNum = await askQuestion('Enter the phone number of your employer: ');
      const employerNumCode = await askQuestion('Enter the country code of your employer\'s phone number: ');
      const jobPosition = await askQuestion('Enter your job position: ');
      const jobDuties = await askQuestion('Enter your job duties: ');
      const supervisorName = await askQuestion('Enter your supervisor\'s name: ');
      const supervisorNum = await askQuestion('Enter your supervisor\'s phone number: ');
      const supervisorNumCode = await askQuestion('Enter the country code of your supervisor\'s phone number: ');
  
      await page.type(`#JobName${jobIndex}`, employerName);
      await page.type(`#JobAddr${jobIndex}`, employerAddress);
      await page.type(`#Jobtelbody${jobIndex}`, employerNum);
      await page.type(`#Jobtelpre${jobIndex}`, employerNumCode);
      await page.type(`#JobPosition${jobIndex}`, jobPosition);
      await page.type(`#JobDuty${jobIndex}`, jobDuties);
      await page.type(`#SupervisorName${jobIndex}`, supervisorName);
      await page.type(`#Supervisortelbody${jobIndex}`, supervisorNum);
      await page.type(`#Supervisortelpre${jobIndex}`, supervisorNumCode);
  
      if (jobIndex < 5) {
        const addAnotherJob = await askQuestion('Do you want to add another job position? (yes/no): ');
        if (addAnotherJob.toLowerCase() === 'yes') {
          await page.click('#Add_WorkExperience');
          jobIndex++;
        } 
        else {
          addMoreJobs = false;
        }
      } 
      else {
        addMoreJobs = false;
      }
    }
    
    await page.evaluate(() => {
      document.querySelectorAll('.btn.btn-success').forEach(button => {
        if (button.textContent.includes('Save and Next')) {
          button.click();
        }
      });
    });


    // PAGE 4

    const schoolName = await askQuestion('Enter the school name of the highest level of education you have completed. If this is not applicable, please put "N/A": ')
    
    if (schoolName.toLowerCase() === "n/a") {
      await page.click('#bsy_Educational_College')
      const noEducationSpecify = await askQuestion('Please specify why this is not applicable: ')
      await page.type('#desc_Educational_College', noEducationSpecify)
  } else {
      const degree = await askQuestion('Enter the degree you recieved from this institution: ')
      const major = await askQuestion('Enter your major at this institution: ')

      await page.type('#SchoolName1', schoolName)
      await page.type('#HighestDegree1', degree)
      await page.type('#TheSpecialty1', major)
    }    

    await page.evaluate(() => {
      document.querySelectorAll('.btn.btn-success').forEach(button => {
        if (button.textContent.includes('Save and Next')) {
          button.click();
        }
      });
    });


    // PAGE 5

    const currentAddress = await askQuestion('Enter your current street address: ')
    const phoneNumber = await askQuestion('Enter your phone number: ')
    const phoneNumberCode = await askQuestion('Enter the country code of your phone number: ')
    const email = await askQuestion('Enter your email address: ')
    
    await page.type('#StreetAddr', currentAddress)
    await page.type('#FamilyPhone', phoneNumber)
    await page.type('#MobilePhone', phoneNumber)
    await page.type('#AreaCode', phoneNumberCode)
    await page.type('#Email', email)

    if (maritalstatus.toLowerCase() == 'married') {
      console.log('Please provide the following information about your spouse: ')

      let spouseNameFirst = await askQuestion('First name: ')
      let spouseNameMiddle = await askQuestion('Middle name: ')
      const spouseNameLast = await askQuestion('Last name: ')
      const spouseNationality = await askQuestion('Nationality: ')
      const spouseOccuptation = await askQuestion('Current occuptation: ')
      const spouseNameFirstMiddle = spouseNameFirst + " " + spouseNameMiddle

      await page.type('#SpouseFirstName1', spouseNameFirstMiddle)
      await page.type('#SpouseFamilyName1', spouseNameLast)
      await page.type('#SpouseNationalityCountry1', spouseNationality)
      await page.type('#Spouse_Profession1', spouseOccuptation)

      console.log('Date of Birth:')
      let spouseDobMonth = await askQuestion('(MM): ')
      let spouseDobDay = await askQuestion('(DD): ')
      const spouseDobYear = await askQuestion('(YYYY): ')

      spouseDobMonth = removeLeadingZero(spouseDobMonth)
      spouseDobDay = removeLeadingZero(spouseDobDay)

      await page.type('#Spousebirthdayyear1', spouseDobYear)
      await page.type('#Spousebirthdaymonth1', spouseDobMonth)
      await page.type('#Spousebirthdayday1', spouseDobDay)

      const spouseBirthCountry = await askQuestion('Country of Birth: ')
      const spouseBirthCity = await askQuestion('City of Birth: ')
      const spouseAddress = await askQuestion('Current address: ')

      await page.type('#SpouseCountryOfBirth1', spouseBirthCountry)
      await page.type('#SpouseForeignCityOfBirth1', spouseBirthCity)
      await page.type('#SpouseAddress1', spouseAddress)
    }
    
    console.log('Please provide the following information about your father')

    let fatherFirst = await askQuestion('First name: ')

    if (fatherFirst.toLowerCase() === "n/a") {
      await page.click('#bsy_Father')
      
      const noFatherSpecify = await askQuestion('Please specify why this is not applicable: ')
      await page.type('#desc_Father', noFatherSpecify)
    }
    else {
      let fatherMiddle = await askQuestion('Middle name: ')
      const fatherLast = await askQuestion('Last name: ')
      const fatherNationality = await askQuestion('Nationality: ')
      const fatherFirstMiddle = fatherFirst + " " + fatherMiddle

      await page.type('#FatherFirstName1', fatherFirstMiddle)
      await page.type('#FatherFamilyName1', fatherLast)
      await page.type('#FatherNationalityCountry1', fatherNationality)

      console.log('Date of Birth:')
      let fatherDobMonth = await askQuestion('(MM): ')
      let fatherDobDay = await askQuestion('(DD): ')
      const fatherDobYear = await askQuestion('(YYYY): ')

      fatherDobMonth = removeLeadingZero(fatherDobMonth);
      fatherDobDay = removeLeadingZero(fatherDobDay);

      await page.type('#Fatherbirthdayyear1', fatherDobYear)
      await page.type('#Fatherbirthdaymonth1', fatherDobMonth)
      await page.type('#Fatherbirthdayday1', fatherDobDay)
      
      const fatherInChina = await askQuestion('Is your father currently in China: ')

      if (fatherInChina.toLowerCase() === 'yes') {
        await page.click('input[name="FatherIsInChina1"][value="1"]')
        const fatherChinaStatus = await askQuestion('Enter your father\'s status in China: ')

        if (fatherChinaStatus.toLowerCase() === 'citizen') {
          await page.click(`input[name="FatherStatusInChina1"][value="702001"]`)
        } 
        else if (fatherChinaStatus.toLowerCase() === 'permanent resident') {
          await page.click(`input[name="FatherStatusInChina1"][value="702002"]`)
        } 
        else if (fatherChinaStatus.toLowerCase() === 'resident') {
          await page.click(`input[name="FatherStatusInChina1"][value="702003"]`)
          const fatherResidentType = await askQuestion('What best describes your father\'s position: \n1. Work-type resident valid for 90 days to five years \n2. Non work-type resident valid for 180 days to five years \n')
          if (fatherResidentType === "1") {
            await page.click('input[name="FatherStatusInChinaDetail1"][value="704001"]')
          }
          else if (fatherResidentType === "2") {
            await page.click('input[name="FatherStatusInChinaDetail1"][value="704002"]')
          }
          else {
            console.error('Invalid choice')
          }
        }  
        else if (fatherChinaStatus.toLowerCase() === 'stay') {
          await page.click(`input[name="FatherStatusInChina1"][value="702004"]`)
          const fatherStayType = await askQuestion('What best describes your father\'s position: \n1. Z visa valid for less than 90 days \n2. Visas other than Z valid for less than 180 days \n')
          if (fatherStayType === "1") {
            await page.click('input[name="FatherStatusInChinaDetail1"][value="704003"]')
          }
          else if (fatherStayType === "2") {
            await page.click('input[name="FatherStatusInChinaDetail1"][value="704004"]')
          }
          else {
            console.error('Invalid choice')
          }
        }
        else {
          console.error('Invalid status chosen.')
        }
      }
      else {
        await page.click('input[name="FatherIsInChina1"][value="0"]')
      }
    }


    console.log('Please provide the following information about your mother')

    let motherFirst = await askQuestion('First name: ')

    if (motherFirst.toLowerCase() === "n/a") {
      await page.click('#bsy_Mother')

      const noMotherSpecify = await askQuestion('Please specify why this is not applicable: ')
      await page.type('#desc_Mother', noMotherSpecify)
    }
    else {
      let motherMiddle = await askQuestion('Middle name: ')
      const motherLast = await askQuestion('Last name: ')
      const motherNationality = await askQuestion('Nationality: ')
      const motherFirstMiddle = motherFirst + " " + motherMiddle

      await page.type('#MotherFirstName1', motherFirstMiddle)
      await page.type('#MotherFamilyName1', motherLast)
      await page.type('#MotherNationalityCountry1', motherNationality)

      console.log('Date of Birth:')
      let motherDobMonth = await askQuestion('(MM): ')
      let motherDobDay = await askQuestion('(DD): ')
      const motherDobYear = await askQuestion('(YYYY): ')

      motherDobMonth = removeLeadingZero(motherDobMonth);
      motherDobDay = removeLeadingZero(motherDobDay);

      await page.type('#Motherbirthdayyear1', motherDobYear)
      await page.type('#Motherbirthdaymonth1', motherDobMonth)
      await page.type('#Motherbirthdayday1', motherDobDay)
      
      const motherInChina = await askQuestion('Is your mother currently in China: ')

      if (motherInChina.toLowerCase() === 'yes') {
        await page.click('input[name="MotherIsInChina1"][value="1"]')
        const motherChinaStatus = await askQuestion('Enter your mother\'s status in China: ')

        if (motherChinaStatus.toLowerCase() === 'citizen') {
          await page.click(`input[name="MotherStatusInChina1"][value="702001"]`)
        } 
        else if (motherChinaStatus.toLowerCase() === 'permanent resident') {
          await page.click(`input[name="MotherStatusInChina1"][value="702002"]`)
        } 
        else if (motherChinaStatus.toLowerCase() === 'resident') {
          await page.click(`input[name="StatusInChina1"][value="702003"]`)
          const motherResidentType = await askQuestion('What best describes your mother\'s position: \n1. Work-type resident valid for 90 days to five years \n2. Non work-type resident valid for 180 days to five years \n')
          if (motherResidentType === "1") {
            await page.click('input[name="MotherStatusInChinaDetail1"][value="704001"]')
          }
          else if (motherResidentType === "2") {
            await page.click('input[name="MotherStatusInChinaDetail1"][value="704002"]')
          }
          else {
            console.error('Invalid choice')
          }
        }  
        else if (motherChinaStatus.toLowerCase() === 'stay') {
          await page.click(`input[name="MotherStatusInChina1"][value="702004"]`)
          const motherStayType = await askQuestion('What best describes your mother\'s position: \n1. Z visa valid for less than 90 days \n2. Visas other than Z valid for less than 180 days \n')
          if (motherStayType === "1") {
            await page.click('input[name="MotherStatusInChinaDetail1"][value="704003"]')
          }
          else if (motherStayType === "2") {
            await page.click('input[name="MotherStatusInChinaDetail1"][value="704004"]')
          }
          else {
            console.error('Invalid choice')
          }
        }
        else {
          console.error('Invalid status chosen.')
        }
      }
      else {
        await page.click('input[name="MotherIsInChina1"][value="0"]')
      }
    }
    const haveChildren = await askQuestion('Do you have any children: ')

    if (haveChildren.toLowerCase() === 'yes') {
      
      console.log('Please provide the following information about your child/children');

      let childIndex = 1;
      let addMoreChildren = true;
    
      while (addMoreChildren && childIndex <= 5) {
        console.log(`Child ${childIndex}`);
        
        let childFirst = await askQuestion('First Name: ')
        let childMiddle = await askQuestion('Middle Name: ')
        const childLast = await askQuestion('Last name: ')
        const childFirstMiddle = childFirst + " " + childMiddle

        await page.type(`#ChildrenFirstName${childIndex}`, childFirstMiddle)
        await page.type(`#ChildrenFamilyName${childIndex}`, childLast)

        const childNationality = await askQuestion('Nationality: ')

        await page.type(`#ChildrenNationalityCountry${childIndex}`, childNationality)

        console.log('Date of Birth:')
        let childDobMonth = await askQuestion('(MM): ')
        let childDobDay = await askQuestion('(DD): ')
        const childDobYear = await askQuestion('(YYYY): ')

        childDobMonth = removeLeadingZero(childDobMonth);
        childDobDay = removeLeadingZero(childDobDay);

        await page.type(`#Childrenbirthdayyear${childIndex}`, childDobYear)
        await page.type(`#Childrenbirthdaymonth${childIndex}`, childDobMonth)
        await page.type(`#Childrenbirthdayday${childIndex}`, childDobDay)

        if (childIndex < 5) {
          const addAnotherChild = await askQuestion('Do you have another child?: ');
          if (addAnotherChild.toLowerCase() === 'yes') {
            await page.click('#Add_Children');
            childIndex++;
          } 
          else {
            addMoreChildren = false;
          }
        } 
        else {
          addMoreChildren = false;
        }
      }
    }
    else {
      await page.click('#bsy_Children')
    }

    // Relatives in China
    const relativesInChina = await askQuestion('Do you have any immediate relatives (excluding parents) currently in China?: ')

      if (relativesInChina.trim().toLowerCase() === 'yes') {

        await page.click('input[name="AnyImmediateRelative"][value="1"]')

        console.log('Please provide the following information about your relative/relatives: ')

        let relativeIndex = 1;
        let addMoreRelatives = true;
      
        while (addMoreRelatives && relativeIndex <= 5) {
          console.log(`Relative ${relativeIndex}`);

          const fullName = await askQuestion('Full name: ')
          await page.type(`#ImmediateFamilyName${relativeIndex}`, fullName)

          const relationship = await askQuestion('Enter their relationship to you: ')
          await page.type(`#ImmediateRelationshipToYou${relativeIndex}`, relationship)

          const statusInChina = await askQuestion('Enter their status in China: ')
          
          if (statusInChina.toLowerCase() === 'citizen') {
            await page.click(`input[name="ImmediateStatusInChina${relativeIndex}"][value="702001"]`)
          } 
          else if (statusInChina.toLowerCase() === 'permanent resident') {
            await page.click(`input[name="ImmediateStatusInChina${relativeIndex}"][value="702002"]`)
          } 
          else if (statusInChina.toLowerCase() === 'resident') {
            await page.click(`input[name="ImmediateStatusInChina${relativeIndex}"][value="702003"]`)
            const relResidentType = await askQuestion('What best describes your relative\'s position: \n1. Work-type resident valid for 90 days to five years \n2. Non work-type resident valid for 180 days to five years \n')
            if (relResidentType === "1") {
              await page.click('input[name="ImmediateStatusInChinaDetail1"][value="704001"]')
            }
            else if (relResidentType === "2") {
              await page.click('input[name="ImmediateStatusInChinaDetail1"][value="704002"]')
            }
            else {
              console.error('Invalid choice')
            }
          }
          else if (statusInChina.toLowerCase() === 'stay') {
            await page.click(`input[name="ImmediateStatusInChina${relativeIndex}"][value="702004"]`)
            const relStayType = await askQuestion('What best describes your relative\'s position: \n1. Z visa valid for less than 90 days \n2. Visas other than Z valid for less than 180 days \n')
            if (relStayType === "1") {
              await page.click('input[name="ImmediateStatusInChinaDetail1"][value="704003"]')
            }
            else if (relStayType === "2") {
              await page.click('input[name="ImmediateStatusInChinaDetail1"][value="704004"]')
            }
            else {
              console.error('Invalid choice')
            }
          }
          else {
            console.error('Invalid status chosen.')
          }

          if (relativeIndex < 5) {
            const addAnotherRelative = await askQuestion('Do you have another relative in China?: ');
            if (addAnotherRelative.toLowerCase() === 'yes') {
              await page.click('#Add_Immediate');
              relativeIndex++;
            } 
            else {
              addMoreRelatives = false;
            }
          } 
          else {
            addMoreRelatives = false;
          }
        }
      }
      else {
        await page.click('input[name="AnyImmediateRelative"][value="0"]')
      }
    
    await page.evaluate(() => {
      document.querySelectorAll('.btn.btn-success').forEach(button => {
        if (button.textContent.includes('Save and Next')) {
          button.click();
        }
      });
    });


    // PAGE 6

    // Arrival
    console.log('Enter your intended date of arrival:')

    let arrivalMonth = await askQuestion('(MM): ')
    let arrivalDay = await askQuestion('(DD): ')
    const arrivalYear = await askQuestion('(YYYY): ')

    arrivalMonth = removeLeadingZero(arrivalMonth);
    arrivalDay = removeLeadingZero(arrivalDay);

    await page.type('#arrivalcityyear', arrivalYear)
    await page.type('#arrivalcitymonth', arrivalMonth)
    await page.type('#arrivalcityday', arrivalDay)

    const arrivalNum = await askQuestion('Enter your arriving flight/train/ship number: ')
    await page.type('#ArrivalVehicleType', arrivalNum)

    const arrivalCity = await askQuestion('Enter your city of arrival: ')
    const arrivalDistrict = await askQuestion('Enter the district/county (if applicable): ')

    await page.type('#ArrivalCity', arrivalCity)
    await page.type('#ArrivalCounty', arrivalDistrict)

    // Itinerary
    console.log('Please provide the following information regarding every location you will be visiting: ');

    let locationIndex = 1;
    let addMoreLocations = true;
  
    while (addMoreLocations && locationIndex <= 5) {
      console.log(`Location ${locationIndex}`);
      
      const locationCity = await askQuestion ('City: ')
      const locationDistrict = await askQuestion('District/County (if applicable): ')
      const locationAddress = await askQuestion('Address: ')
      
      await page.type(`#StayCity${locationIndex}`, locationCity)
      await page.type(`#StayCounty${locationIndex}`, locationDistrict)
      await page.type(`#TravelAddr${locationIndex}`, locationAddress)

      console.log('Date of Arrival:')
      let locationArrivalMonth = await askQuestion('(MM): ')
      let locationArrivalDay = await askQuestion('(DD): ')
      const locationArrivalYear = await askQuestion('(YYYY): ')

      locationArrivalMonth = removeLeadingZero(locationArrivalMonth);
      locationArrivalDay = removeLeadingZero(locationArrivalDay);

      await page.type(`#arrivalyear${locationIndex}`, locationArrivalYear)
      await page.type(`#arrivalmonth${locationIndex}`, locationArrivalMonth)
      await page.type(`#arrivalday${locationIndex}`, locationArrivalDay)

      console.log('Date of Departure:')
      let locationDeptMonth = await askQuestion('(MM): ')
      let locationDeptDay = await askQuestion('(DD): ')
      const locationDeptYear = await askQuestion('(YYYY): ')

      locationDeptMonth = removeLeadingZero(locationDeptMonth)
      locationDeptDay = removeLeadingZero(locationArrivalDay)

      await page.type(`#leaveyear${locationIndex}`, locationDeptYear)
      await page.type(`#leavemonth${locationIndex}`, locationDeptMonth)
      await page.type(`#leaveday${locationIndex}`, locationDeptDay)

      if (locationIndex < 5) {
        const addAnotherLocation = await askQuestion('Do you want to add another location? (yes/no): ');
        if (addAnotherLocation.toLowerCase() === 'yes') {
          await page.evaluate(() => {document.querySelector('#addStayInfo').click()});
          locationIndex++;
        } 
        else {
          addMoreLocations = false;
        }
      } 
      else {
        addMoreLocations = false;
      }
    }

    // Departure
    console.log('Enter your intended date of departure:')

    let deptMonth = await askQuestion('(MM): ')
    let deptDay = await askQuestion('(DD): ')
    const deptYear = await askQuestion('(YYYY): ')

    deptMonth = removeLeadingZero(deptMonth)
    deptDay = removeLeadingZero(deptDay)

    await page.type('#leavecityyear', deptYear)
    await page.type('#leavecitymonth', deptMonth)
    await page.type('#leavecityday', deptDay)

    const deptNum = await askQuestion('Enter your departing flight/train/ship number: ')
    await page.type('#LeaveVehicleType', deptNum)

    const deptCity = await askQuestion('Enter your city of departure: ')
    const deptDistrict = await askQuestion('Enter your district/county of departure (if applicable): ')
    await page.type('#LeaveCity', deptCity)
    await page.type('#LeaveCounty', deptDistrict)

    // Inviting Person/Org
    console.log('Enter the following information about the inviting person/organization in China: ')
    const invitingName = await askQuestion('Name of person/organization: ')
    if (invitingName.toLowerCase() === 'n/a') {
      await page.click('#bsy_Organization_InChina')
    }
    else {
      const invitingRelationship = await askQuestion('Relationship to you (if applicable): ')
      if (invitingRelationship.toLowerCase() === 'n/a') {
        await page.click('#bsy_InvitingRelationshipToYou')
      }
      const invitingPhoneNum = await askQuestion('Phone number: ')
      const invitingPhoneNumCode = await askQuestion('Phone number country code: ')
      const invitingEmail = await askQuestion('Email: ')

      await page.type('#InvitingName', invitingName)
      await page.type('#InvitingRelationshipToYou', invitingRelationship)
      await page.type('#telbody', invitingPhoneNum)
      await page.type('#telpre', invitingPhoneNumCode)
      await page.type('#InvitingEmailAddress', invitingEmail)

      console.log('Address:')
      const invitingState = await askQuestion('State/Province: ')
      const invitingCity = await askQuestion('City: ')
      const invitingDistrict = await askQuestion('District/County (if applicable): ')
      const invitingPostCode = await askQuestion('Postal Code: ')

      await page.type('#InvitingProvince', invitingState)
      await page.type('#InvitingCity', invitingCity)
      await page.type('#InvitingCounty', invitingDistrict)
      await page.type('#InvitingPostalCode', invitingPostCode)
    }


    // Emergency Contact
    console.log('Enter the following information regarding your emergency contact: ')
    let emergencyNameFirst = await askQuestion('First name: ')
    let emergencyNameMiddle = await askQuestion('Middle name: ')
    const emergencyNameLast = await askQuestion('Last name: ')
    const emergencyRelationship = await askQuestion('Relationship to you: ')
    const emergencyPhoneNum = await askQuestion('Phone number: ')
    const emergencyPhoneNumCode = await askQuestion('Phone number country code: ')
    const emergencyEmail = await askQuestion('Email: ')
    const emergencyNameFirstMiddle = emergencyNameFirst + " " + emergencyNameMiddle

    await page.type('#EmergencyContactFirstName', emergencyNameFirstMiddle)
    await page.type('#EmergencyContactFamilyName', emergencyNameLast)
    await page.type('#EmergencyRealationshipToYou', emergencyRelationship)
    await page.type('#Emergencytelbody', emergencyPhoneNum)
    await page.type('#Emergencytelpre', emergencyPhoneNumCode)
    await page.type('#EmergencyEmailAddress', emergencyEmail)

    // Who is paying
    const payForTravel = await askQuestion('Who will pay for this trip?: ')
    if (payForTravel.toLowerCase() === "myself") {
      await page.click('input[name="PayForTravel"][value="708001"')
    }
    else if (payForTravel.toLowerCase() === "other") {
      await page.click('input[name="PayForTravel"][value="708002"]')

      console.log('Enter the following information about the person who will be paying for your trip:')
      const payName = await askQuestion('Full name: ')
      const payPhoneNum = await askQuestion('Phone number: ')
      const payPhoneNumCode = await askQuestion('Phone number country code: ')
      const payEmail = await askQuestion('Email: ')

      await page.type('#PayForTravelName', payName)
      await page.type('#PayForTraveltelbody', payPhoneNum)
      await page.type('#PayForTraveltelpre', payPhoneNumCode)
      await page.type('#PayForTravelEmailAddress', payEmail)
    }
    else if (payForTravel.toLowerCase() === "organization") {
      await page.click('input[name="PayForTravel"][value="708003"]')

      console.log('Enter the following information about the orginization who will be paying for your trip:')
      const payName = await askQuestion('Full name: ')
      const payRelationship = await askQuestion('Relationship to you: ')
      const payAddress = await askQuestion('Street Address: ')
      const payCountry = await askQuestion('Country: ')

      await page.type('#PayForTravelOrganizationName', payName)
      await page.type('#PayForTravelRelationshipToYou', payRelationship)
      await page.type('#PayForTravelAddress', payAddress)
      await page.type('#PayForTravelCountry', payCountry)
    }
    else {
      console.error('Invalid choice')
    }

    // Accompanying Persons
    const accompanyingPeople = await askQuestion('Do you have any accompanying person(s) (using the same passport as you): ')

    if (accompanyingPeople.toLowerCase() === 'yes') {
      await page.click('input[name="IsHavePeersPerson"][value="1"]')

      let accIndex = 1;
      let addMoreAcc = true;
    
      while (addMoreAcc && accIndex <= 5) {
        console.log(`Accompanying Person ${accIndex}`);
        
        let accNameFirst = await askQuestion('First name: ')
        let accNameMiddle = await askQuestion('Middle name: ')
        const accNameLast = await askQuestion('Last name: ')
        const accNameFirstMiddle = accNameFirst + " " + accNameMiddle

        await page.type('#PeerFirstName1', accNameFirstMiddle)
        await page.type('#PeerFamilyName1', accNameLast)

        const accGender = await askQuestion('Gender (male/female): ')
        if (accGender.toLowerCase() === 'male') {
          await page.click('input[name="Sex1"][value="M"]');
        }
        else if (accGender.toLowerCase() === 'female') {
          await page.click('input[name="Sex1"][value="F"]');
        }
        else {
          console.error('Invalid gender specified.');
        }

        console.log('Date of Birth:')
        let accDobMonth = await askQuestion('(MM): ')
        let accDobDay = await askQuestion('(DD): ')
        const accDobYear = await askQuestion('(YYYY): ')

        accDobMonth = removeLeadingZero(accDobMonth)
        accDobDay = removeLeadingZero(accDobDay)

        await page.type('#birthdayyear1', accDobYear)
        await page.type('#birthdaymonth1', accDobMonth)
        await page.type('#birthdayday1', accDobDay)

        await page.click('#shearphoto1')

        if (accIndex < 5) {
          const addAnotherAcc = await askQuestion('Do you want to add another accompanying person? (yes/no): ');
          if (addAnotherAcc.toLowerCase() === 'yes') {
            await page.evaluate(() => {document.querySelector('#addFriend').click()});
            accIndex++;
          } 
          else {
            addMoreAcc = false;
          }
        } 
        else {
          addMoreAcc = false;
        }
      }
    }
    else {
      await page.click('input[name="IsHavePeersPerson"][value="0"]')
    }

    await page.evaluate(() => {
      document.querySelectorAll('.btn.btn-success').forEach(button => {
        if (button.textContent.includes('Save and Next')) {
          button.click();
        }
      });
    });


    // PAGE 7

    const beenToChina = await askQuestion('Have you ever visited China?: ')
    if (beenToChina.toLowerCase() === 'yes') {
      await page.click('input[name="IsArrivedChina"][value="1"]')
    }
    else {
      await page.click('input[name="IsArrivedChina"][value="0"]')
    }

    const previousChinaVisa = await askQuestion('Have you ever been issued a Chinese visa?: ')
    if (previousChinaVisa.toLowerCase() === 'yes') {
      await page.click('input[name="IsHaveChinaVisa"][value="1"]')
      const previousVisaType = await askQuestion('Enter the type of visa you held: ')
      const visaNum = await askQuestion('Enter the visa number: ')
      const visaPlaceOfIssue = await askQuestion('Enter the place of issue: ')

      await page.type('#VisaType', previousVisaType)
      await page.type('#VisaNo', visaNum)
      await page.type('#IssueOrg', visaPlaceOfIssue)

      console.log('Issue Date: ')
      const visaIssueYear = await askQuestion('(YYYY): ')
      let visaIssueMonth = await askQuestion('(MM): ')

      visaIssueMonth = removeLeadingZero(visaIssueMonth)

      await page.type('#issuedate-year', visaIssueYear)
      await page.type('#issuedate-month', visaIssueMonth)

      const fingerprinted = await askQuestion('Have you ever been fingerprinted when applying for a Chinese visa?: ')
        if (fingerprinted.toLowerCase() === 'yes') {
          await page.click('input[name="IsHaveFingerPrinteger"][value="1"]')

          console.log('Where were you finger printed?')
          const fingerCountry = await askQuestion('Country/Region: ')
          const fingerCity = await askQuestion('City: ')
          await page.type('#FingerPrintCollectionCountry', fingerCountry)
          await page.type('#FingerPrintCollectionPlace', fingerCity)

          console.log('When were you fingerprinted?')
          let fingerMonth = await askQuestion('(MM): ')
          let fingerDay = await askQuestion('(DD): ')
          const fingerYear = await askQuestion('(YYYY): ')

          fingerMonth = removeLeadingZero(fingerMonth)
          fingerDay = removeLeadingZero(fingerDay)

          await page.type('#collection_year', fingerYear)
          await page.type('#collection_month', fingerMonth)
          await page.type('#collection_day', fingerDay)
        }
        else {
          await page.click('input[name="IsHaveFingerPrinteger"][value="0"]')
        }

      const residencePermit = await askQuestion('Have you ever been issued a Chinese residence permit?: ')
        if (residencePermit.toLowerCase() === 'yes') {
          await page.click('input[name="IsHaveResidenceLicense"][value="1"]')

          const resPermitNum = await askQuestion('Enter your residence permit number: ')
          await page.type('#ResidenceLicenseNo', resPermitNum)
        }
        else {
          await page.click('input[name="IsHaveResidenceLicense"][value="0"]')
        }
    }
    else {
      await page.click('input[name="IsHaveChinaVisa"][value="0"]')
    }

    const currentVisas = await askQuestion('Do you currently hold any valid visas issued by other countries?: ')
    if (currentVisas.toLowerCase() === 'yes') {
      await page.click('input[name="IsHaveChinaVisa"][value="1"]')

      const currentVisasList = await askQuestion('Enter the countries in which you currently hold valid visas: ')
      await page.type('#OtherVisaInfo', currentVisasList)
    }
    else {
      await page.click('input[name="IsHaveChinaVisa"][value="0"]')
    }

    const countriesVisited = await askQuestion('Have you visited other countries/regions in the last 12 months?: ')
    if (countriesVisited.toLowerCase() === 'yes') {
      await page.click('input[name="IsHaveOtherVisa"][value="1"]')

      const countriesVisitedList = await askQuestion('Enter the countries/regions you have visited: ')
      await page.type('#OtherCountryInfo', countriesVisitedList)
    }
    else {
      await page.click('input[name="IsToOtherCountry"][value="0"]')
    }

    await page.evaluate(() => {
      document.querySelectorAll('.btn.btn-success').forEach(button => {
        if (button.textContent.includes('Save and Next')) {
          button.click();
        }
      });
    });


    // PAGE 8

    const refusedVisa = await askQuestion('Have you ever been refused a visa for China, or been refused entry into China?: ')
    if (refusedVisa.toLowerCase() === 'yes') {
      await page.click('input[name="ItemValue1"][value="1"]')
      const refusedSpecify = await askQuestion('Please specify: ')
      await page.type('#ItemNote1', refusedSpecify)
    }
    else {
      await page.click('input[name="ItemValue1"][value="0"]')
    }

    const canceledVisa = await askQuestion('Has your Chinese visa ever been canceled: ')
    if (canceledVisa.toLowerCase() === 'yes') {
      await page.click('input[name="ItemValue2"][value="1"]')
      const canceledSpecify = await askQuestion('Please specify: ')
      await page.type('#ItemNote2', canceledSpecify)
    }
    else {
      await page.click('input[name="ItemValue2"][value="1"]')
    }

    const enteredIllegally = await askQuestion('Have you ever entered China illegally, overstayed, or worked illegally?: ');
    if (enteredIllegally.toLowerCase() === 'yes') {
        await page.click('input[name="ItemValue3"][value="1"]');
        const enteredSpecify = await askQuestion('Please specify: ');
        await page.type('#ItemNote3', enteredSpecify);
    }
    else {
        await page.click('input[name="ItemValue3"][value="0"]');
    }

    const criminalRecord = await askQuestion('Do you have any criminal record in China or any other country?: ');
    if (criminalRecord.toLowerCase() === 'yes') {
        await page.click('input[name="ItemValue4"][value="1"]');
        const criminalSpecify = await askQuestion('Please specify: ');
        await page.type('#ItemNote4', criminalSpecify);
    }
    else {
        await page.click('input[name="ItemValue4"][value="0"]');
    }

    const mentalDisorder = await askQuestion('Do you have any serious mental disorder or infectious disease?: ');
    if (mentalDisorder.toLowerCase() === 'yes') {
        await page.click('input[name="ItemValue5"][value="1"]');
        const mentalSpecify = await askQuestion('Please specify: ');
        await page.type('#ItemNote5', mentalSpecify);
    }
    else {
        await page.click('input[name="ItemValue5"][value="0"]');
    }

    const epidemicVisit = await askQuestion('Have you ever visited countries or territories where there is an epidemic in the last 30 days?: ');
    if (epidemicVisit.toLowerCase() === 'yes') {
        await page.click('input[name="ItemValue6"][value="1"]');
        const epidemicSpecify = await askQuestion('Please specify: ');
        await page.type('#ItemNote6', epidemicSpecify);
    }
    else {
        await page.click('input[name="ItemValue6"][value="0"]');
    }

    const specialSkills = await askQuestion('Have you ever been trained or do you have any special skills in the field of firearms, explosives, nuclear devices, biological or chemical products?: ');
    if (specialSkills.toLowerCase() === 'yes') {
        await page.click('input[name="ItemValue7"][value="1"]');
        const skillsSpecify = await askQuestion('Please specify: ');
        await page.type('#ItemNote7', skillsSpecify);
    }
    else {
        await page.click('input[name="ItemValue7"][value="0"]');
    }

    const servedMilitary = await askQuestion('Are you actively serving or have you ever served in the military?: ')
    if (servedMilitary.toLowerCase() === 'yes') {

      let militaryIndex = 1;
      let addMoreMilitary = true;
    
      while (addMoreMilitary && militaryIndex <= 5) {
        console.log(`Military History ${militaryIndex}`);

        await page.click('input[name="ItemValue8"][value="1"]')

        const serviceCountry = await askQuestion('Country/Region of service: ')
        const serviceBranch = await askQuestion('Branch of Service: ')
        const militaryRank = await askQuestion('Rank in military: ')
        const militarySpeciality = await askQuestion('Military speciality: ')

        await page.type(`#ArmedType${militaryIndex}`, serviceBranch)
        await page.type(`#SerivceCountry${militaryIndex}`, serviceCountry)
        await page.type(`#MilitaryRank${militaryIndex}`, militaryRank)
        await page.type(`#MilitarySpecialty${militaryIndex}`, militarySpeciality)

        console.log('Service from:')
        let serviceFromMonth = await askQuestion('(MM): ')
        const serviceFromYear = await askQuestion('(YYYY): ')

        serviceFromMonth = removeLeadingZero(serviceFromMonth)

        await page.type(`#begindate-year${militaryIndex}`, serviceFromYear)
        await page.type(`#begindate-month${militaryIndex}`, serviceFromMonth)

        console.log('Service to:')
        let serviceToMonth = await askQuestion('(MM): ')
        const serviceToYear = await askQuestion('(YYYY): ')

        serviceToMonth = removeLeadingZero(serviceToMonth)

        await page.type(`#enddate-year${militaryIndex}`, serviceToYear)
        await page.type(`#enddate-month${militaryIndex}`, serviceToMonth)

        if (militaryIndex < 5) {
          const addAnotherMilitary = await askQuestion('Do you want to add another military service? (yes/no): ');
          if (addAnotherMilitary.toLowerCase() === 'yes') {
            await page.evaluate(() => {document.querySelector('#addCommission').click()});
            militaryIndex++;
          } 
          else {
            addMoreMilitary = false;
          }
        } 
        else {
          addMoreMilitary = false;
        }
      }
    }
    else {
      await page.click('input[name="ItemValue8"][value="0"]')
    }

    const paramilitaryService = await askQuestion('Have you served or participated in any paramilitary organization, civil armed units, guerrilla forces or armed organizations, or been its member?: ');
    if (paramilitaryService.toLowerCase() === 'yes') {
        await page.click('input[name="ItemValue9"][value="1"]');
        const paramilitarySpecify = await askQuestion('Please specify: ');
        await page.type('#ItemNote9', paramilitarySpecify);
    }
    else {
        await page.click('input[name="ItemValue9"][value="0"]');
    }

    const professionalOrg = await askQuestion('Do you work for any professional, social or charitable organization?: ');
    if (professionalOrg.toLowerCase() === 'yes') {
        await page.click('input[name="ItemValue10"][value="1"]');
        const orgSpecify = await askQuestion('Please specify: ');
        await page.type('#ItemNote10', orgSpecify);
    }
    else {
        await page.click('input[name="ItemValue10"][value="0"]');
    }

    const anythingElse = await askQuestion('Is there anything else you want to mention?: ');
    if (anythingElse.toLowerCase() === 'yes') {
        await page.click('input[name="ItemValue11"][value="1"]');
        const elseSpecify = await askQuestion('Please specify: ');
        await page.type('#ItemNote11', elseSpecify);
    }
    else {
        await page.click('input[name="ItemValue11"][value="0"]');
    }

    await page.evaluate(() => {
      document.querySelectorAll('.btn.btn-success').forEach(button => {
        if (button.textContent.includes('Save and Next')) {
          button.click();
        }
      });
    });


    // PAGE 9

    await page.waitForSelector('#isToAgent');
    
    await page.click('input[name="isAgent"][value="0"]')

    await page.evaluate(() => {
      document.querySelectorAll('.btn.btn-success').forEach(button => {
        if (button.textContent.includes('Save and Next')) {
          button.click();
        }
      });
    });




} 
catch (error) {
  console.error('Error:', error);
    
}
})();
