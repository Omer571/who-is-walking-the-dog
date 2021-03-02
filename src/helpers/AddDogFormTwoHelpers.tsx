import { Alert } from 'react-native'
import { DogData, TempDogObject, PotentialDogFamilyMember, UserData } from '../types'
import emptyDogObject from './emptyDogObject'

import {  } from '../firebase/Dog'
import * as SMS from 'expo-sms'


export const displayButtonAlert = (title: string, message: string, onPressFunction: () => void) => {
  return Alert.alert(
      title,
      message,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => onPressFunction() }
      ],
      { cancelable: true }
    )
}

export const getUnRegisteredMembers = (
  dog: TempDogObject,
  currentUser: UserData,
  users: UserData[],
) => {

  const nonRegisteredMembers: PotentialDogFamilyMember[] = []

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

export const isMemberInCollection = (member: PotentialDogFamilyMember, users: UserData[]) => {

  if (!users) {
    throw "ERROR - No Users in Collection (even current user)"
  }

  for (let user of users) {
    if (user.phoneNumber === member.phoneNumber)
      return user
  }

  return false

}


export const getPhoneNumbersFromMembers = (members: PotentialDogFamilyMember[]) => {
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
  let dogObject = {} as DogData
  dogObject.firstName = tempDog.firstName
  dogObject.middleName = tempDog.middleName
  dogObject.lastName = tempDog.lastName
  dogObject.id = ""
  dogObject.userIds = []
  dogObject.schedule = emptyDogObject.schedule
  dogObject.weeklyNeeds = tempDog.weeklyNeeds
  dogObject.weeklyNeeds = tempDog.weeklyNeeds

  return dogObject
}

export const fromCustomTypeToPureJSObject = (customObject: any) => {
  return JSON.parse(JSON.stringify(customObject))
}
