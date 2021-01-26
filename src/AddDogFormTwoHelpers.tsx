import { DogObject, TempDogObject, DogFamilyMember, UserData } from './types'
import { firebase } from './firebase/config'
import * as SMS from 'expo-sms'
import { userConverter } from './userConverter'


export const getNonExistingMembers = (
  dog: TempDogObject,
  currentUser: UserData,
  users: UserData[],
) => {

  const nonExistingMembers: DogFamilyMember[] = []

  let petFamilyMembers = dog.members
  for (let member of petFamilyMembers) {

    const memberIsCurrentUser = (member.name === currentUser.name || member.phoneNumber === currentUser.phoneNumber)

    if (memberIsCurrentUser) {
      continue
    }

    if (isMemberInCollection(member, users)) {
      continue
    } else {
      nonExistingMembers.push(member)
    }
  }

  return nonExistingMembers

}

export const sendSMS = async (message: string, toPhoneNumbers: string[]) => {
  const isAvailable = await SMS.isAvailableAsync();
  if (!isAvailable) {
    console.log("misfortune... there's no SMS available on this device")
    return
  }

  const { result } = await SMS.sendSMSAsync(toPhoneNumbers, message)

  console.log("Message Status: " + result)
}

export const sendPushNotification = (receiverToken: string ,title: string, message: string) => {
  fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: receiverToken,
      sound: 'default',
      title: title,
      body: message,
    })
  })
}

const isMemberInCollection = (member: DogFamilyMember, users: UserData[]) => {

  if (!users) {
    throw "ERROR - No Users in Collection (even current user)"
  }

  for (let user of users) {
    if (user.phoneNumber === member.phoneNumber)
      return user
  }

  return false

}

export const getUsersFromCollection = async () => {
  const users: UserData[] = []
  var userRef = firebase.firestore().collection("users").withConverter(userConverter)
  await userRef.get().then((docs) => {
    docs.forEach((doc) => {
      let user = doc.data()
      users.push(user)
      // console.log("Pushed user: " + user.name)
    })
  })

  return users

}

export const getPhoneNumbersFromMembers = (members: DogFamilyMember[]) => {
  const phoneNumbers: string[] = []
  for (let member of members) {
    phoneNumbers.push(member.phoneNumber)
  }
  return phoneNumbers
}

export const getOtherExistingUsers = (
  dog: TempDogObject,
  currentUser: UserData,
  users: UserData[]
) => {
  let existingUser: any
  const existingUsers: UserData[] = []

  let petFamilyMembers = dog.members
  for (let member of petFamilyMembers) {

    const memberIsCurrentUser = (member.name === currentUser.name || member.phoneNumber === currentUser.phoneNumber)

    if (memberIsCurrentUser) {
      continue
    }

    existingUser = isMemberInCollection(member, users)

    if (existingUser) {
      existingUsers.push(existingUser)
    }

  }

  return existingUsers
}

export const sendPushNotificationToExistingUsers = (existingUsers: UserData[]) => {
  for (let user of existingUsers) {
    let pushToken = user.push_token
    let pushNotificationMessage = "Hello " + user.name + ". You've been joined to Ginger's Family. Click to take a look!"
    let pushNotificationTitle = "Welcome to the Family!"
    sendPushNotification(pushToken, pushNotificationTitle, pushNotificationMessage)
    console.log("\nNotification sent to " + user.name + "\n")
  }
}

export const convertTempDogObjectToDogObject = (tempDog: TempDogObject) => {
  let dogObject = {} as DogObject
  dogObject.firstName = tempDog.firstName
  dogObject.middleName = tempDog.middleName
  dogObject.lastName = tempDog.lastName
  dogObject.key = ""
  dogObject.members = []
  dogObject.schedule = tempDog.schedule
  dogObject.weeklyNeeds = tempDog.weeklyNeeds

  return dogObject
}

export const fromCustomTypeToPureJSObject = (customObject: any) => {
  return JSON.parse(JSON.stringify(customObject))
}
