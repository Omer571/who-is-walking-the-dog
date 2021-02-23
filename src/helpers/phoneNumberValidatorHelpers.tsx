import parsePhoneNumber from 'libphonenumber-js'
import { firebase } from '../firebase/config'

// isPhoneNumberValid
// doesPhoneNumberAlreadyExistAsync
// areValidPhoneNumbers

export const isPhoneNumberValid = (phoneNumber: string): boolean => {
  console.log("(isPhoneNumberValid) Parsing Phone Number: " + phoneNumber)
  const phoneNumberToValidate = parsePhoneNumber(phoneNumber, 'US')
  if (!phoneNumberToValidate || !phoneNumberToValidate.isValid()) {
    console.log("(isPhoneNumberValid) phoneNumber invalid: " + phoneNumber)
    return false
  }
  console.log("(isPhoneNumberValid) returning true ")
  return true

}



export const getPhoneNumbers = async () => {
  let numbers: string[] = []

  let userRef = firebase.firestore().collection("users")
  return userRef.get().then((docs) => {
    docs.forEach((user) => {
      numbers.push(user.data().phoneNumber)
    })
    return numbers
  })
}



export const doesPhoneNumberAlreadyExistAsync = async (phoneNumber: string): Promise<boolean> => {
  return getPhoneNumbers().then((existingPhoneNumbers) => {
    console.log("(doesPhoneNumberAlreadyExistAsync) Checking: " + existingPhoneNumbers + " vs " + phoneNumber)
    if (existingPhoneNumbers.includes(phoneNumber)) {
      return true
    } else {
      return false
    }
  })
}



export const areValidPhoneNumbers = (phoneNumbers: string[]): boolean | string => {
  for (let i = 0;i < phoneNumbers.length; i++) {

    // format international and remove spaces
    const internationalPhoneNumber = convertToInternationalNumber(phoneNumbers[i])
    console.log("Checking: " + internationalPhoneNumber)
    if (!isPhoneNumberValid(internationalPhoneNumber)) {
      console.log(internationalPhoneNumber + " invalid")
      return false
    }

  }
  console.log("areValidPhoneNumbers returning true")
  return true
}

export const areDuplicateNumbersPresent = (numbers: string[]) => {
  return new Set(numbers).size !== numbers.length
}


export const convertToInternationalNumber = (phoneNumber: string) => {
  let phoneNumberInternational: string
  let phoneNumberParser = parsePhoneNumber(phoneNumber, "US")
  if (phoneNumberParser) {
    phoneNumberInternational = phoneNumberParser.formatInternational().replace(/\s/g, '')
    console.log("phoneNumber.formatInternational(): " + phoneNumberInternational)
    return phoneNumberInternational
  } else {
    console.error("(SettingsHelpers - convertToInternationalNumber) phoneNumberParser undefined: " + phoneNumberParser)
    phoneNumberInternational = "-99999999999"
  }
  return phoneNumberInternational
}
