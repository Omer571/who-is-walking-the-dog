import React, { useState, useRef } from 'react'
import { StyleSheet, TextInput, View, Keyboard  } from 'react-native'
import Button from './Button'
import { PotentialDogFamilyMember, DogSchedule, TempDogObject, Route, UserData, UserMemberData } from '../types'
import { useNavigation } from '@react-navigation/native'
import PhoneInput from "react-native-phone-number-input"
import { areValidPhoneNumbers, areDuplicateNumbersPresent } from "../helpers/phoneNumberValidatorHelpers"
import { getAllUsersAsync } from '../firebase/User'

import {
  displayButtonAlert,
  convertTempDogObjectToDogObject,
  getUnRegisteredMembers,
  getOtherRegisteredUsers,
  sendPushNotificationToUsers,
  sendSMS,
  getPhoneNumbersFromMembers,
  // fromCustomTypeToPureJSObject,
  addDogToUserCollectionAsync,
} from "../helpers/AddDogFormTwoHelpers"


const WALKING_DAYS_PER_WEEK = 4
const OUTING_DAYS_PER_WEEK = 2
const REST_DAYS_PER_WEEK = 1
const EMPTY_FAMILY_MEMBER = {} as UserData

const defaultDogSchedule: DogSchedule = {
  monday: {
    walkerId: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  tuesday: {
    walkerId: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  wednesday: {
    walkerId: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  thursday: {
    walkerId: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  friday: {
    walkerId: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  saturday: {
    walkerId: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  sunday: {
    walkerId: "",
    time: "06:15:00 PM",
    dayType: "",
  },
}

type Props = {
  numberOfFamilyBoxes: Number,
  user: Route["params"]["user"],
}


const AddDogFormTwo = (props: Props) => {
  const navigation = useNavigation()
  const { user } = props
  const currentUser = user

  const handleSubmit = async (tempDog: TempDogObject) => {

    // console.log("(handleSubmit) tempDog members length: " + tempDog.members.length)

    // Make sure the phone number fields are filled
    const petFamilyMembers = tempDog.members
    const petFamilyMemberNumbers: string[] = []
    for (let member of petFamilyMembers) {
      if (member.phoneNumber)
        petFamilyMemberNumbers.push(member.phoneNumber)
      else {
        alert("A phone number is missing from member " + member.name)
        return
      }
    }

    // Validate phone numbers
    if (!areValidPhoneNumbers(petFamilyMemberNumbers)) {
      alert("Not all numbers are valid. Please recheck values")
      return
    }

    // Check for duplicates of current user number
    if (areDuplicateNumbersPresent(petFamilyMemberNumbers)) {
      alert("Either you have added yourself or duplicate numbers are present. Please remove duplicates. ")
      return
    }


    const users = await getAllUsersAsync()

    let otherRegisteredUsers = getOtherRegisteredUsers(tempDog, currentUser, users) // all users other than current
    let allRegisteredUsers = otherRegisteredUsers.concat([currentUser])
    let unRegisteredMembers = getUnRegisteredMembers(tempDog, currentUser, users)

    console.log("Existing Users: " + JSON.stringify(allRegisteredUsers))
    console.log("NonExisting Users: " + JSON.stringify(unRegisteredMembers))

    sendPushNotificationToUsers(otherRegisteredUsers, tempDog.firstName)

    // Prompt to send all SMS to missing members at once
    if (unRegisteredMembers.length > 0) {
      displayButtonAlert(
        "Some Members aren't on the App",
        "The following family member's phone numbers aren't registered with the app. Would you like to send a text?",
        () => {
          const smsMessage = "Hello! You've been invited to be " + tempDog.firstName + "'s Family Member but your phone number isn't registered with us. Try signing up first and ask for another invite!"
          sendSMS(smsMessage, getPhoneNumbersFromMembers(unRegisteredMembers))
        }
      )
    }

    let allRegisteredUserIds: string[] = []

    for (let registeredUser of allRegisteredUsers) {
      allRegisteredUserIds.push(registeredUser.id)
    }

    let dogToAddToCollection = convertTempDogObjectToDogObject(tempDog)


    // Dog needs userIds
    dogToAddToCollection.userIds = allRegisteredUserIds

    // Dog needs id (handle after creating dog, but need way to get id)

    // Users needs dogIds

    // function deleted, need new one the add dog and return dog id
    // After, as stated above, users need dogs id as well and dog needs dog id
    addDogToUserCollectionAsync(user, allRegisteredUsers, dogToAddToCollection)

    // Navigate Back
    Keyboard.dismiss()
    navigation.goBack()

  }


  const MemberInputBox = (props: { dataKey: string }) => {
    const phoneInput = useRef<PhoneInput>(null)
    const { dataKey } = props
    if (memberInputs.length === 1) {
      alert("Make sure NOT to add your own name, you will be automatically included as Family Member! :)")
    }
    return (
      <View>
        <TextInput
          style={styles.familyMemberInput}
          placeholder="Family Member Name"
          onChangeText={(newFamilyMemberName) => setDogData(prevDogData => {
            const thisMemberIndex = prevDogData.members.findIndex((member: DogFamilyMember) => member.dataKey === dataKey);
            prevDogData.members[thisMemberIndex].name = newFamilyMemberName
            return {
              ...prevDogData,
            }
          })}
        />
        <PhoneInput
            ref={phoneInput}
            placeholder="Mobile Phone Number Here such as --> 2817787989"
            defaultCode="US"
            layout="first"
            onChangeFormattedText={(newFamilyMemberNumber: string) => setDogData(prevDogData => {
              const thisMemberIndex = prevDogData.members.findIndex((member: DogFamilyMember) => member.dataKey === dataKey)
              prevDogData.members[thisMemberIndex].phoneNumber = newFamilyMemberNumber
              return {
                ...prevDogData,
              }
            })}
            withDarkTheme
            withShadow
            autoFocus
        />
      </View>
    );
  }

  const initialTempDogObject: TempDogObject = {
    firstName: "",
    middleName: "",
    lastName: "",
    members: [{dataKey: '0', phoneNumber: user.phoneNumber, name: user.name}], // need user object to have phoneNumber later (or not? user doesn't need to send phone number to self)
    schedule: defaultDogSchedule,
    key: "",
    weeklyNeeds: {
      walks: WALKING_DAYS_PER_WEEK,
      outings: OUTING_DAYS_PER_WEEK,
      rest: REST_DAYS_PER_WEEK,
    }
  }

  const [dogData, setDogData] = useState<TempDogObject>(initialTempDogObject)

  let [memberInputs, setMemberInputs] = useState<JSX.Element[]>([])

  const addOneMemberInput = (key: number) => {

    // THIS SHOULD BE TWO SEPARATE FUNCTIONS
    // Add input to array of inputs to be rendered to screen
    let tempMemberInputs = memberInputs
    tempMemberInputs.push(<MemberInputBox key={key.toString()} dataKey={key.toString()}/>)
    setMemberInputs(tempMemberInputs)

    // Add member to dogData.members array
    setDogData(prevDogData => {
      const newMember: DogFamilyMember = {dataKey: key.toString(), phoneNumber: "", name: ""}
      prevDogData.members.push(newMember)
      return {
        ...prevDogData,
      }
    })
  };

  const removeOneMemberInput = () => {
    let tempMemberInputs = memberInputs.slice(0, -1);
    setMemberInputs(tempMemberInputs)
    popDogFamilyMember()
  }

  const popDogFamilyMember = () => {
    setDogData(prevDogData => {
      const poppedMember = prevDogData.members.pop()
      console.log("Member input removed --> popped family member: " + poppedMember)
      return {
        ...prevDogData,
      }
    })
  }

  const { numberOfFamilyBoxes } = props

  if (memberInputs.length < numberOfFamilyBoxes) {
    addOneMemberInput(memberInputs.length + 1);
  } else if (memberInputs.length > numberOfFamilyBoxes) {
    removeOneMemberInput();
  }

  return (
    <View>
      <TextInput
        style={styles.nameInput}
        placeholder='Doggy First Name'
        onChangeText={(newFirstName) => setDogData(prevDogData => {
          return {
            ...prevDogData,
            firstName: newFirstName,
          }
        })}
      />
      <TextInput
        style={styles.nameInput}
        placeholder='Doggy Middle Name'
        onChangeText={(newMiddleName) => setDogData(prevDogData => {
          return {
            ...prevDogData,
            middleName: newMiddleName,
          }
        })}
      />
      <TextInput
        style={styles.nameInput}
        placeholder='Doggy Last Name'
        onChangeText={(newLastName) => setDogData(prevDogData => {
          return {
            ...prevDogData,
            lastName: newLastName,
          }
        })}
      />
      {memberInputs.map((element) => { return element})}
      <Button mode={'contained'} onPress={() => { handleSubmit(dogData) }}>Submit</Button>
    </View>
  )
}


const styles = StyleSheet.create({
  nameInput: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 18,
    borderRadius: 6,
  },
  familyMemberInput: {
    marginVertical: 5,
    height: 60,
  },
});

export default AddDogFormTwo
