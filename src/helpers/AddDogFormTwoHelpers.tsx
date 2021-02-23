import { DogObject, TempDogObject, DogFamilyMember, UserData } from '../types'
import { firebase } from '../firebase/config'
import * as SMS from 'expo-sms'
import userConverter from './userConverter'

export const addDogToUserCollectionAsync = async (currentUser: UserData, users: UserData[], dog: DogObject) => {
  // console.log("Before trying to update: " + JSON.stringify(user.dogs))
  if (!dog.firstName) {
    console.log("ERROR - Dog does not have first name in updateDogInCollection. \
    This should have been previously validated in input.")
    return
  }

  // Make empty dog doc and get
  const newDogDoc = firebase.firestore().collection('users').doc(currentUser.id).collection('dogs').doc()
  const newDogDocRef = await newDogDoc.get()
  // Now use that id to find and set dog empty doc, now we can set key attribute to it's id
  for (let user of users) {
    const dogRef = firebase.firestore().collection('users').doc(user.id).collection('dogs').doc(newDogDocRef.id)
    dogRef
      .set({
          firstName: dog.firstName,
          middleName: dog.middleName,
          lastName: dog.lastName,
          key: newDogDocRef.id,
          members: fromCustomTypeToPureJSObject(dog.members),
          schedule: dog.schedule,
          weeklyNeeds: dog.weeklyNeeds,
      })
      .then(() => {
        dog.key = newDogDocRef.id  // Update local dog copy
        console.log("User " + user.name + " should now have another dog w/ id/key:" + newDogDocRef.id)
      })
      .catch((error) => {
          alert(error)
      })
  }
}

export const getUnRegisteredMembers = (
  dog: TempDogObject,
  currentUser: UserData,
  users: UserData[],
) => {

  const nonRegisteredMembers: DogFamilyMember[] = []

  let petFamilyMembers = dog.members
  for (let member of petFamilyMembers) {

    const memberIsCurrentUser = (member.name === currentUser.name || member.phoneNumber === currentUser.phoneNumber)

    if (memberIsCurrentUser) {
      continue
    }

    if (isMemberInCollection(member, users)) {
      continue
    } else {
      nonRegisteredMembers.push(member)
    }
  }

  return nonRegisteredMembers

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

export const isMemberInCollection = (member: DogFamilyMember, users: UserData[]) => {

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
      // console.log("Pushed user: " + JSON.stringify(user))
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

export const getOtherRegisteredUsers = (
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

export const sendPushNotificationToUsers = (existingUsers: UserData[], dogName: string) => {
  for (let user of existingUsers) {
    let pushToken = user.push_token
    let pushNotificationMessage = "Hello " + user.name + ". You've been joined to" + dogName + "'s Family. Click to take a look!"
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
