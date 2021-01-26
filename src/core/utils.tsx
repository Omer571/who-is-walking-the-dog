import parsePhoneNumber from 'libphonenumber-js'
import { firebase } from '../firebase/config'

export const emailValidator = (email: string) => {
  const re = /\S+@\S+\.\S+/

  if (!email || email.length <= 0) return 'Email cannot be empty.'
  if (!re.test(email)) return 'Ooops! We need a valid email address.'

  return ''
}

export const passwordValidator = (password: string) => {
  if (!password || password.length <= 0) return 'Password cannot be empty.'

  return ''
}

export const nameValidator = (name: string) => {
  if (!name || name.length <= 0) return 'Name cannot be empty.'

  return ''
}

const getPhoneNumbers = () => {
  let numbers: string[] = []

  let userRef = firebase.firestore().collection("users")
  userRef.get().then((docs) => {
    docs.forEach((user) => {
      numbers.push(user.data().phoneNumber)
    })
  })

  return numbers
}

export const phoneNumberValidator = (phoneNumber: string) => {

  const phoneNumberToValidate = parsePhoneNumber(phoneNumber, 'US')
  if (!phoneNumberToValidate || !phoneNumberToValidate.isValid()) {
    return 'Phone Number cannot be empty or invalid.'
  }

  const existingPhoneNumbers = getPhoneNumbers()
  if (existingPhoneNumbers.includes(phoneNumber)) {
    return 'Phone Number already exists for another user'
  }

  return ''
}
