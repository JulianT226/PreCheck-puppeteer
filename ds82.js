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

  await page.goto('https://pptform.state.gov/PassportWizardMain.aspx'); 

  await page.waitForSelector('#PassportWizard_portalStep_ApplyButton');

  try {
    await page.click('#PassportWizard_portalStep_ApplyButton')

    const firstName = await askQuestion('First Name: ')
    const middleName = await askQuestion('Middle Name: ')
    const lastName = await askQuestion('Last Name: ')
    const nameSuffix = await askQuestion('Suffix: ')

    await page.type('#PassportWizard_aboutYouStep_firstNameTextBox', firstName)
    await page.type('#PassportWizard_aboutYouStep_middleNameTextBox', middleName)
    await page.type('#PassportWizard_aboutYouStep_lastNameTextBox', lastName)
    await page.type('#PassportWizard_aboutYouStep_suffixNameTextBox', nameSuffix)

    const dob = await askQuestion('Date of Birth (MM/DD/YYYY): ')
    const birthCity = await askQuestion('City of Birth: ')
    const birthCountry = await askQuestion('Country of Birth: ')
    if (birthCountry.toLowerCase() === 'united states') {
      const birthState = await askQuestion('State/Territory of Birth: ')
      await page.type('#PassportWizard_aboutYouStep_pobStateList', birthState)
    }

  let ssn;
  while (true) {
      ssn = await askQuestion('Social Security Number: ');
      if (ssn.length === 9 && /^\d{9}$/.test(ssn)) {
          break;
      } 
      else {
          console.log('Invalid SSN. Please enter a 9-digit Social Security Number.');
      }
  }

    await page.type('#PassportWizard_aboutYouStep_dobTextBox', dob)
    await page.type('#PassportWizard_aboutYouStep_pobCityTextBox', birthCity)
    await page.type('#PassportWizard_aboutYouStep_pobCountryList', birthCountry)
    await page.type('#PassportWizard_aboutYouStep_ssnTextBox', ssn)
    
    const gender = await askQuestion('Gender: ')
    await page.type('#PassportWizard_aboutYouStep_sexList', gender)

    console.log('Height: ')
    const heightFeet = await askQuestion('Feet: ')
    const heightInches = await askQuestion('Inches: ')
    await page.type('#PassportWizard_aboutYouStep_heightFootList', heightFeet)
    await page.type('#PassportWizard_aboutYouStep_heightInchList', heightInches)

    const hairColor = await askQuestion('Hair Color: ')
    const eyeColor = await askQuestion('Eye Color: ')
    await page.type('#PassportWizard_aboutYouStep_hairList', hairColor)
    await page.type('#PassportWizard_aboutYouStep_eyeList', eyeColor)

    const occupation = await askQuestion('Occupation: ')
    const employer = await askQuestion('Employer/School: ')
    await page.type('#PassportWizard_aboutYouStep_occupationTextBox', occupation)
    await page.type('#PassportWizard_aboutYouStep_employerTextBox', employer)

    await page.click('#PassportWizard_StepNavigationTemplateContainerID_StartNextPreviousButton')


    // PAGE 2

    await page.click('#PassportWizard_StepNavigationTemplateContainerID_StartNextPreviousButton')


    // PAGE 3

    console.log('Where should the passport be mailed?')

    const mailingAddress = await askQuestion('Mailing Address: ')
    const mailingCity = await askQuestion('City: ')
    const mailingCountry = await askQuestion('Country: ')
    await page.type('#PassportWizard_addressStep_mailStreetTextBox', mailingAddress)
    await page.type('#PassportWizard_addressStep_mailCityTextBox', mailingCity)
    await page.type('#PassportWizard_addressStep_mailCountryList', mailingCountry)

    if (mailingCountry.toLowerCase() === 'united states') {
      const mailingState = await askQuestion('State: ')
      await page.type('#PassportWizard_addressStep_mailStateList', mailingState)
    }

    let mailingZip;
    while (true) {
        mailingZip = await askQuestion('Zip Code: ');
        if (/^\d{5}(-\d{4})?$/.test(mailingZip)) {
            break;
        } else {
            console.log('Invalid Zip Code. Please enter a valid zip code (e.g., "12345" or "12345-6789").');
        }
    }

    await page.type('#PassportWizard_addressStep_mailZipTextBox', mailingZip);

    const permAddress = await askQuestion('Is this your permanent address? (yes/no): ')
    if (permAddress.toLowerCase() === 'no') {
      await page.click('#PassportWizard_addressStep_permanentAddressList_1')

      const permAddressStreet = await askQuestion('Permanent Address Street: ')
      const permAddressCity = await askQuestion('Permanent Address City: ')
      const permAddressCountry = await askQuestion('Permanent Address Country: ')
      const permAddressState = await askQuestion('Permanent Address State: ')
      const permAddressZip = await askQuestion('Permanent Address Zip: ')

      await page.type('#PassportWizard_addressStep_permanentStreetTextBox', permAddressStreet)
      await page.type('#PassportWizard_addressStep_permanentCityTextBox', permAddressCity)
      await page.type('#PassportWizard_addressStep_permanentCountryList', permAddressCountry)
      await page.type('#PassportWizard_addressStep_permanentStateList', permAddressState)
      await page.type('#PassportWizard_addressStep_permanentZipTextBox', permAddressZip)

    }
    else {
      await page.click('#PassportWizard_addressStep_permanentAddressList_0')
    }

    const prefComms = await askQuestion('Preferred Method of Communication (mail/email/both): ')
    if (prefComms.toLowerCase() === 'mail') {
      await page.click('#PassportWizard_addressStep_CommunicateMail')
    }
    else if (prefComms.toLowerCase() === 'email') {
      await page.click('#PassportWizard_addressStep_CommunicateEmail')
    }
    else {
      await page.click('#PassportWizard_addressStep_CommunicateBoth')
    }

    let email;
    while (true) {
        email = await askQuestion('Email: ');
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            break;
        } else {
            console.log('Invalid email address. Please enter a valid email address.');
        }
    }
    
    await page.type('#PassportWizard_addressStep_emailTextBox', email);
    await page.type('#PassportWizard_addressStep_confirmEmailTextBox', email)

    const phoneNum = await askQuestion('Phone Number: ')
    const numType = await askQuestion('Type (home/work/cell): ')
    await page.type('#PassportWizard_addressStep_addPhoneNumberTextBox', phoneNum)
    if (numType.toLowerCase() === 'home') {
      await page.click('#PassportWizard_addressStep_PhoneNumberType_0')
    }
    else if (numType.toLowerCase() === 'work') {
      await page.click('#PassportWizard_addressStep_PhoneNumberType_1')
    }
    else {
      await page.click('#PassportWizard_addressStep_PhoneNumberType_2')
    }

    const addNum = await askQuestion('Do you want to add another number? (yes/no): ')

    if (addNum.toLowerCase() === 'yes') {
      await page.click('#PassportWizard_addressStep_addPhoneNumberButton')

      const phoneNum2 = await askQuestion('Phone Number: ')
      const numType2 = await askQuestion('Type (home/work/cell): ')
      await page.type('#PassportWizard_addressStep_addPhoneNumberTextBox', phoneNum)
      if (numType.toLowerCase === 'home') {
        await page.click('#PassportWizard_addressStep_PhoneNumberType_0')
      }
      else if (numType.toLowerCase() === 'work') {
        await page.click('#PassportWizard_addressStep_PhoneNumberType_1')
      }
      else {
        await page.click('#PassportWizard_addressStep_PhoneNumberType_2')
      }
    }

    await page.click('#PassportWizard_StepNavigationTemplateContainerID_StartNextPreviousButton')


    // PAGE 4

    const deptDate = await askQuestion('Trip Departure Date (MM/DD/YYYY): ')
    const returnDate = await askQuestion('Trip Return Date (MM/DD/YYYY): ')
    await page.type('#PassportWizard_travelPlans_TripDateTextBox', deptDate)
    await page.type('#PassportWizard_travelPlans_TripDateReturnTextBox', returnDate)
    
    const countriesVisited = await askQuestion('Countries to be Visited: ')
    await page.type('#PassportWizard_travelPlans_CountriesTextBox', countriesVisited)

    await page.click('#PassportWizard_StepNavigationTemplateContainerID_StartNextPreviousButton')


    // PAGE 5

    console.log('Emergency Contact')

    const emergencyName = await askQuestion('Full Name: ')
    await page.type('#PassportWizard_emergencyContacts_ecNameTextBox', emergencyName)

    const emergencyAddress = await askQuestion('Street Address: ')
    const emergencyCity = await askQuestion('City: ')
    const emergencyState = await askQuestion('State: ')
    const emergencyZip = await askQuestion('Zip: ')

    await page.type('#PassportWizard_emergencyContacts_ecAddressTextBox', emergencyAddress)
    await page.type('#PassportWizard_emergencyContacts_ecCityTextBox', emergencyCity)
    await page.type('#PassportWizard_emergencyContacts_ecStateList', emergencyState)
    await page.type('#PassportWizard_emergencyContacts_ZipCodeTextBox', emergencyZip)

    const emergencyPhoneNum = await askQuestion('Phone Number: ')
    const emergencyRelationship = await askQuestion('Relationship to Applicant: ')
    await page.type('#PassportWizard_emergencyContacts_ecPhoneTextBox', emergencyPhoneNum)
    await page.type('#PassportWizard_emergencyContacts_ecRelationshipTextBox', emergencyRelationship)

    await page.click('#PassportWizard_StepNavigationTemplateContainerID_StartNextPreviousButton')


    // PAGE 6

    const issuedWhat = await askQuestion('In the past have you ever been issued a passport book, passport card, or both?: ')

    if (issuedWhat.toLowerCase() === 'book') {
      await page.click('#PassportWizard_mostRecentPassport_CurrentHaveBook')
      
      const inPossession = await askQuestion('Do you still have the book in your possesion? \n1. Yes \n2. Yes, but it was damaged or mutilated \n3. No, it was lost  \n4. No, it has been stolen \n')
      if (inPossession.toLowerCase() === '1') {
        await page.click('#PassportWizard_mostRecentPassport_BookYes')
        
        const passIssDate = await askQuestion('Most recent passport book issue date (MM/DD/YYYY): ')
        await page.type('#PassportWizard_mostRecentPassport_BookIssueDate', passIssDate)

        console.log('Your name as printed on your most recent book')
        const passNameFirst = await askQuestion('First and Middle Name: ')
        const passNameLast = await askQuestion('Last Name: ')
        await page.type('#PassportWizard_mostRecentPassport_firstNameOnBook', passNameFirst)
        await page.type('#PassportWizard_mostRecentPassport_lastNameOnBook', passNameLast)

        const passNum = await askQuestion('Passport Book Number: ')
        await page.type('#PassportWizard_mostRecentPassport_ExistingBookNumber', passNum)
      }
      else if (inPossession.toLowerCase() === '2') {
        await page.click('#PassportWizard_mostRecentPassport_BookDamaged')

        const passIssDate = await askQuestion('Most recent passport book issue date (MM/DD/YYYY): ')
        await page.type('#PassportWizard_mostRecentPassport_BookIssueDate', passIssDate)

        console.log('Your name as printed on your most recent book')
        const passNameFirst = await askQuestion('First and Middle Name: ')
        const passNameLast = await askQuestion('Last Name: ')
        await page.type('#PassportWizard_mostRecentPassport_firstNameOnBook', passNameFirst)
        await page.type('#PassportWizard_mostRecentPassport_lastNameOnBook', passNameLast)

        const passNum = await askQuestion('Passport Book Number: ')
        await page.type('#PassportWizard_mostRecentPassport_ExistingBookNumber', passNum)

      }
      else if (inPossession.toLowerCase() === '3') {
        await page.click('#PassportWizard_mostRecentPassport_BookLost')
        console.log('If your passport is lost, you will need to apply for a new passport.')

        const reportStolen = await askQuestion('Have you reported your book lost? (yes/no): ')
        if (reportStolen.toLowerCase() === 'yes') {
          await page.click('#PassportWizard_mostRecentPassport_ReportLostBookYesRadioButton')
        }
        else {
          await page.click('#PassportWizard_mostRecentPassport_ReportLostBookNoRadioButton')
        }

        const passIssDate = await askQuestion('Most recent passport book issue date (MM/DD/YYYY): ')
        await page.type('#PassportWizard_mostRecentPassport_BookIssueDate', passIssDate)

        console.log('Your name as printed on your most recent book')
        const passNameFirst = await askQuestion('First and Middle Name: ')
        const passNameLast = await askQuestion('Last Name: ')
        await page.type('#PassportWizard_mostRecentPassport_firstNameOnBook', passNameFirst)
        await page.type('#PassportWizard_mostRecentPassport_lastNameOnBook', passNameLast)

        const passNum = await askQuestion('Passport Book Number: ')
        await page.type('#PassportWizard_mostRecentPassport_ExistingBookNumber', passNum)
      }
      else if (inPossession.toLowerCase() === '4') {
        await page.click('#PassportWizard_mostRecentPassport_BookStolen')
        console.log('If your passport has been stolen, you will need to apply for a new passport.')

        const reportStolen = await askQuestion('Have you reported your book stolen? (yes/no): ')
        if (reportStolen.toLowerCase() === 'yes') {
          await page.click('#PassportWizard_mostRecentPassport_ReportLostBookYesRadioButton')
        }
        else {
          await page.click('#PassportWizard_mostRecentPassport_ReportLostBookNoRadioButton')
        }

        const passIssDate = await askQuestion('Most recent passport book issue date (MM/DD/YYYY): ')
        await page.type('#PassportWizard_mostRecentPassport_BookIssueDate', passIssDate)

        console.log('Your name as printed on your most recent book')
        const passNameFirst = await askQuestion('First and Middle Name: ')
        const passNameLast = await askQuestion('Last Name: ')
        await page.type('#PassportWizard_mostRecentPassport_firstNameOnBook', passNameFirst)
        await page.type('#PassportWizard_mostRecentPassport_lastNameOnBook', passNameLast)

        const passNum = await askQuestion('Passport Book Number: ')
        await page.type('#PassportWizard_mostRecentPassport_ExistingBookNumber', passNum)
      }
      else {
        console.error('Please type "1", "2", "3", or "4"')
      }
    }
    else if (issuedWhat.toLowerCase() === 'card') {
      await page.click('#PassportWizard_mostRecentPassport_CurrentHaveCard')

      const inPossession = await askQuestion('Do you still have the card in your possesion? \n1. Yes \n2. Yes, but it was damaged or mutilated \n3. No, it was lost \n4. No, it has been stolen \n')
      if (inPossession.toLowerCase() === '1') {
        await page.click('#PassportWizard_mostRecentPassport_CardYes')
        
        const passIssDate = await askQuestion('Most recent passport card issue date (MM/DD/YYYY): ')
        await page.type('#PassportWizard_mostRecentPassport_CardIssueDate', passIssDate)

        console.log('Your name as printed on your most recent card')
        const passNameFirst = await askQuestion('First and Middle Name: ')
        const passNameLast = await askQuestion('Last Name: ')
        await page.type('#PassportWizard_mostRecentPassport_firstNameOnCard', passNameFirst)
        await page.type('#PassportWizard_mostRecentPassport_lastNameOnCard', passNameLast)

        const passNum = await askQuestion('Passport Card Number: ')
        await page.type('#PassportWizard_mostRecentPassport_ExistingCardNumber', passNum)
      }
      else if (inPossession.toLowerCase() === '2') {
        await page.click('#PassportWizard_mostRecentPassport_CardDamaged')

        const passIssDate = await askQuestion('Most recent passport card issue date (MM/DD/YYYY): ')
        await page.type('#PassportWizard_mostRecentPassport_CardIssueDate', passIssDate)

        console.log('Your name as printed on your most recent card')
        const passNameFirst = await askQuestion('First and Middle Name: ')
        const passNameLast = await askQuestion('Last Name: ')
        await page.type('#PassportWizard_mostRecentPassport_firstNameOnCard', passNameFirst)
        await page.type('#PassportWizard_mostRecentPassport_lastNameOnCard', passNameLast)

        const passNum = await askQuestion('Passport Card Number: ')
        await page.type('#PassportWizard_mostRecentPassport_ExistingCardNumber', passNum)

      }
      else if (inPossession.toLowerCase() === '3') {
        await page.click('#PassportWizard_mostRecentPassport_CardLost')
        console.log('If your passport is lost, you will need to apply for a new passport.')

        const reportStolen = await askQuestion('Have you reported your card lost? (yes/no): ')
        if (reportStolen.toLowerCase() === 'yes') {
          await page.click('#PassportWizard_mostRecentPassport_ReportLostCardYesRadioButton')
        }
        else {
          await page.click('#PassportWizard_mostRecentPassport_ReportLostCardNoRadioButton')
        }

        const passIssDate = await askQuestion('Most recent passport card issue date (MM/DD/YYYY): ')
        await page.type('#PassportWizard_mostRecentPassport_CardIssueDate', passIssDate)

        console.log('Your name as printed on your most recent card')
        const passNameFirst = await askQuestion('First and Middle Name: ')
        const passNameLast = await askQuestion('Last Name: ')
        await page.type('#PassportWizard_mostRecentPassport_firstNameOnCard', passNameFirst)
        await page.type('#PassportWizard_mostRecentPassport_lastNameOnCard', passNameLast)

        const passNum = await askQuestion('Passport Card Number: ')
        await page.type('#PassportWizard_mostRecentPassport_ExistingCardNumber', passNum)
      }
      else if (inPossession.toLowerCase() === '4') {
        await page.click('#PassportWizard_mostRecentPassport_CardStolen')
        console.log('If your passport has been stolen, you will need to apply for a new passport.')

        const reportStolen = await askQuestion('Have you reported your book stolen? (yes/no): ')
        if (reportStolen.toLowerCase() === 'yes') {
          await page.click('#PassportWizard_mostRecentPassport_ReportLostCardYesRadioButton')
        }
        else {
          await page.click('#PassportWizard_mostRecentPassport_ReportLostCardNoRadioButton')
        }

        const passIssDate = await askQuestion('Most recent passport book issue date (MM/DD/YYYY): ')
        await page.type('#PassportWizard_mostRecentPassport_CardIssueDate', passIssDate)

        console.log('Your name as printed on your most recent book')
        const passNameFirst = await askQuestion('First and Middle Name: ')
        const passNameLast = await askQuestion('Last Name: ')
        await page.type('#PassportWizard_mostRecentPassport_firstNameOnCard', passNameFirst)
        await page.type('#PassportWizard_mostRecentPassport_lastNameOnCard', passNameLast)

        const validatePassportNumber = (passNum) => {
          const regex = /^[A-Z]\d{8}$|^\d{9}$/;
          return regex.test(passNum);
        };
        
        let passNum = await askQuestion('Passport Book Number: ');
        
        while (!validatePassportNumber(passNum)) {
            console.log('Invalid passport number. It must be a letter followed by 8 digits or 9 digits.');
            passNum = await askQuestion('Please enter a valid Passport Book Number: ');
        }
        
        await page.type('#PassportWizard_mostRecentPassport_ExistingCardNumber', passNum);
      }

    }
    else if (issuedWhat.toLowerCase() === 'both') {
      await page.type('#PassportWizard_mostRecentPassport_CurrentHaveBoth')
    }
    else {
      console.error('Please choose either "book", "card", or "both"')
    }

    await page.click('#PassportWizard_StepNavigationTemplateContainerID_StartNextPreviousButton')


    // PAGE 7

    if (issuedWhat.toLowerCase() === 'book') {
      const infoCorrect = await askQuestion('Was the data printed correctly on your most recent passport book?: ')

      if (infoCorrect.toLowerCase() === 'no') {
        await page.click('#PassportWizard_mostRecentPassportContinued_dataIncorrectBook')

        const itemsIncorrect = await askQuestion('Please select the item(s) that are printed incorrectly: \n1. Last Name \n2. First Name \n3. Middle Name \n4. Place of Birth \n5. Date of Birth \n6. Gender \n')
        if (itemsIncorrect.toLowerCase() === '1') {
          await page.click('#PassportWizard_mostRecentPassportContinued_IncorrectLastName')
        }
        else if (itemsIncorrect === '2') {
          await page.click('#PassportWizard_mostRecentPassportContinued_IncorrectFirstName')
        }
        else if (itemsIncorrect === '3') {
          await page.click('#PassportWizard_mostRecentPassportContinued_IncorrectMiddleName')
        }
        else if (itemsIncorrect === '4') {
          await page.click('#PassportWizard_mostRecentPassportContinued_IncorrectPlaceOfBirth')
        }
        else if (itemsIncorrect === '5') {
          await page.click('#PassportWizard_mostRecentPassportContinued_IncorrectDateOfBirth')
        }
        else if (itemsIncorrect === '6') {
          await page.click('#PassportWizard_mostRecentPassportContinued_IncorrectSex')
        }
      }
      else {
        await page.click('#PassportWizard_mostRecentPassportContinued_dataIncorrectNone')
      }

      const nameChange = await askQuestion('Has your name changed since your most recent document was issued?: ')
      if (nameChange.toLowerCase() === 'yes') {
        await page.click('#PassportWizard_mostRecentPassportContinued_nameChangeBook')
        const nameChangeReason = await askQuestion('Reason for the name change: ')
        if (nameChangeReason.toLowerCase() === 'marriage') {
          await page.click('#PassportWizard_mostRecentPassportContinued_NameChangeReason_0')
        }
        else {
          await page.click('#PassportWizard_mostRecentPassportContinued_NameChangeReason_1')
        }
        const nameChangeDate = await askQuestion('Date of name change (MM/DD/YYYY): ')
        await page.type('#PassportWizard_mostRecentPassportContinued_NameChangeDate', nameChangeDate)

        const nameChangePlace = await askQuestion('Place of name change (City/State): ')
        await page.type('#PassportWizard_mostRecentPassportContinued_NameChangePlace', nameChangePlace)
      }
      else {
        await page.click('#PassportWizard_mostRecentPassportContinued_nameChangeNone')
      }

      const passLimited = await askQuestion('Was your most recent passport book limited for two years or less?: ')
      if (passLimited.toLowerCase() === 'yes') {
        await page.click('#PassportWizard_mostRecentPassportContinued_LimitedIssueBook_0')
        
        const payForCard = await askQuestion('Did you pay for a card the last time you applied?: ')
        if (payForCard.toLowerCase() === 'yes') {
          await page.click('#PassportWizard_mostRecentPassportContinued_paidForCard_0')
        }
        else {
          await page.click('#PassportWizard_mostRecentPassportContinued_paidForCard_1')
        }
      }
      else {
        await page.click('#PassportWizard_mostRecentPassportContinued_LimitedIssueBook_1')
      }
    }


    // PAGE 8

    const motherNameFirst = await askQuestion("Mother's First Name: ")

    if (motherNameFirst.toLowerCase() === 'unknown') {
      await page.type('#PassportWizard_moreAboutYouStep_unknownParent1CheckBox')
    }
    else {
      const motherNameMiddle = await askQuestion("Mother's Middle Name: ")
      const motherNameLast = await askQuestion("Mother's Last Name: ")
      const motherNameFirstMiddle = motherNameFirst + " " + motherNameMiddle

      await page.type('#PassportWizard_moreAboutYouStep_parent1FirstNameTextBox', motherNameFirstMiddle)
      await page.type('#PassportWizard_moreAboutYouStep_parent1LastNameTextBox', motherNameLast)

      const motherDob = await askQuestion("Mother's Date of Birth (MM/DD/YYYY): ")
      const motherBirthPlace = await askQuestion("Mother's Place of Birth (City and State): ")
      await page.type('#PassportWizard_moreAboutYouStep_parent1BirthDateTextBox', motherDob)
      await page.type('#PassportWizard_moreAboutYouStep_parent1BirthPlaceTextBox', motherBirthPlace)

      await page.click('#PassportWizard_moreAboutYouStep_parent1SexList_0')

      const motherCitizen = await askQuestion("Is the applicant's mother a U.S. citizen?: ")
      if (motherCitizen.toLowerCase() === 'yes') {
        await page.click('#PassportWizard_moreAboutYouStep_parent1CitizenList_0')
      }
      else if (motherCitizen.toLowerCase() === 'no') {
        await page.click('#PassportWizard_moreAboutYouStep_parent1CitizenList_1')
      }
      else {
        console.error('Please select "yes" or "no"')
      }
    }

    const fatherNameFirst = await askQuestion("Father's First Name: ")
    if (fatherNameFirst.toLowerCase() === 'unknown') {
      await page.click('#PassportWizard_moreAboutYouStep_unknownParent2CheckBox')
    }
    else {
      const fatherNameMiddle = await askQuestion("Father's Middle Name: ")
      const fatherNameLast = await askQuestion("Fatjer's Last Name: ")
      const fatherNameFirstMiddle = fatherNameFirst + " " + fatherNameMiddle

      await page.type('#PassportWizard_moreAboutYouStep_parent2FirstNameTextBox', fatherNameFirstMiddle)
      await page.type('#PassportWizard_moreAboutYouStep_parent2LastNameTextBox', fatherNameLast)

      const fatherDob = await askQuestion("Mother's Date of Birth (MM/DD/YYYY): ")
      const fatherBirthPlace = await askQuestion("Mother's Place of Birth (City and State): ")
      await page.type('#PassportWizard_moreAboutYouStep_parent2BirthDateTextBox', fatherDob)
      await page.type('#PassportWizard_moreAboutYouStep_parent2BirthPlaceTextBox', fatherBirthPlace)

      await page.click('#PassportWizard_moreAboutYouStep_parent2SexList_0')

      const fatherCitizen = await askQuestion("Is the applicant's father a U.S. citizen?: ")
      if (fatherCitizen.toLowerCase() === 'yes') {
        await page.click('#PassportWizard_moreAboutYouStep_parent2CitizenList_0')
      }
      else if (fatherCitizen.toLowerCase() === 'no') {
        await page.click('#PassportWizard_moreAboutYouStep_parent2CitizenList_1')
      }
      else {
        console.error('Please select "yes" or "no"')
      }
    }

    const married = await askQuestion('Has the applicant ever been married?: ')

    if (married.toLowerCase() === 'yes') {
      await page.click('#PassportWizard_moreAboutYouStep_marriedList_0')
      console.log('Spouse: ')
      const spouseNameFirst = await askQuestion('First Name: ')
      const spouseNameMiddle = await askQuestion('Middle Name:')
      const spouseNameLast = await askQuestion('Last Name: ')
      const spouseNameFirstMiddle = spouseNameFirst + " " + spouseNameMiddle

      await page.type('#PassportWizard_moreAboutYouStep_spouseNameTextBox', spouseNameFirstMiddle)
      await page.type('#PassportWizard_moreAboutYouStep_spouseLastNameTextBox', spouseNameLast)
      
      const spouseDob = await askQuestion('Date of Birth (MM/DD/YYYY): ')
      const spouseBirthPlace = await askQuestion('Place of Birth: ')
      await page.type('#PassportWizard_moreAboutYouStep_spouseBirthDateTextBox', spouseDob)
      await page.type('#PassportWizard_moreAboutYouStep_spouseBirthplaceTextBox', spouseBirthPlace)

      const spouseCitizen = await askQuestion("Is the applicant's spouse a U.S. citizen?: ")
      if (spouseCitizen.toLowerCase() === 'yes') {
        await page.click('#PassportWizard_moreAboutYouStep_spouseCitizenList_0')
      }
      else if (spouseCitizen.toLowerCase() === 'no') {
        await page.click('#PassportWizard_moreAboutYouStep_spouseCitizenList_1')
      }
      else {
        console.error('Invalid choice.')
      }
      const marriageDate = await askQuestion('Date of Most Recent Marriage (MM/DD/YYYY): ')
      await page.type('#PassportWizard_moreAboutYouStep_marriedDateTextBox', marriageDate)

      const widowedDivorced = await askQuestion('Has the applicant ever been widowed or divorced?: ')
      if (widowedDivorced.toLowerCase() === 'yes') {
        await page.click('#PassportWizard_moreAboutYouStep_divorcedList_0')

        const widDivDate = await askQuestion('Date (MM/DD/YYYY): ')
        await page.type('#PassportWizard_moreAboutYouStep_divorcedDateTextBox', widDivDate)
      }
      else {
        await page.click('#PassportWizard_moreAboutYouStep_divorcedList_1')
      }
    }
    else {
      await page.click('#PassportWizard_moreAboutYouStep_marriedList_1')
    }


} 
catch (error) {
    console.error('Error:', error);
    
  }
})();
