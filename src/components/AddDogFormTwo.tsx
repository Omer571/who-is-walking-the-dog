import React, { useState, useRef } from 'react'
import { StyleSheet, TextInput, View, Keyboard, Alert } from 'react-native'
import Button from './Button'
import { firebase } from '../firebase/config'
import { DogFamilyMember, DogSchedule, DogObject, TempDogObject, Route, UserData, UserMemberData } from '../types'
import { useNavigation } from '@react-navigation/native'
import parsePhoneNumber from 'libphonenumber-js'
import PhoneInput from "react-native-phone-number-input"
import {
  convertTempDogObjectToDogObject,
  getNonExistingMembers,
  getOtherExistingUsers,
  sendPushNotificationToExistingUsers,
  sendSMS,
  getPhoneNumbersFromMembers,
  getUsersFromCollection,
  fromCustomTypeToPureJSObject,
} from "../AddDogFormTwoHelpers"

const WALKING_DAYS_PER_WEEK = 4
const OUTING_DAYS_PER_WEEK = 2
const REST_DAYS_PER_WEEK = 1

const EMPTY_FAMILY_MEMBER = {} as UserData
const defaultDogSchedule: DogSchedule = {
  monday: {
    walker: EMPTY_FAMILY_MEMBER,
    time: "06:15:00 PM",
    dayType: "",
  },
  tuesday: {
    walker: EMPTY_FAMILY_MEMBER,
    time: "06:15:00 PM",
    dayType: "",
  },
  wednesday: {
    walker: EMPTY_FAMILY_MEMBER,
    time: "06:15:00 PM",
    dayType: "",
  },
  thursday: {
    walker: EMPTY_FAMILY_MEMBER,
    time: "06:15:00 PM",
    dayType: "",
  },
  friday: {
    walker: EMPTY_FAMILY_MEMBER,
    time: "06:15:00 PM",
    dayType: "",
  },
  saturday: {
    walker: EMPTY_FAMILY_MEMBER,
    time: "06:15:00 PM",
    dayType: "",
  },
  sunday: {
    walker: EMPTY_FAMILY_MEMBER,
    time: "06:15:00 PM",
    dayType: "",
  },
}

type Props = {
  numberOfFamilyBoxes: Number,
  user: Route["params"]["user"],
}

const displayButtonAlert = (title: string, message: string, onPressFunction: () => void) => {
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



const AddDogFormTwo = (props: Props) => {
  const navigation = useNavigation()
  const { user } = props
  const currentUser = user

  const handleSubmit = async (tempDog: TempDogObject) => {
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
    if (areValidPhoneNumbers(petFamilyMemberNumbers)) {

      await getUsersFromCollection().then((users) => {

        let otherUsers = getOtherExistingUsers(tempDog, currentUser, users)
        let allExistingUsers = otherUsers.concat([currentUser])
        let nonExistingMembers = getNonExistingMembers(tempDog, currentUser, users)

        console.log("Existing Users: " + JSON.stringify(allExistingUsers))
        console.log("NonExisting Users: " + JSON.stringify(nonExistingMembers))

        sendPushNotificationToExistingUsers(otherUsers)

        // Prompt to send all SMS to missing members at once
        if (nonExistingMembers.length > 0) {
          displayButtonAlert(
            "Some Members aren't on the App",
            "The following family member's phone numbers aren't registered with the app. Would you like to send a text?",
            () => {
              const smsMessage = "Hello! You've been invited to be " + tempDog.firstName + "'s Family Member but your phone number isn't registered with us. Try signing up first and ask for another invite!"
              sendSMS(smsMessage, getPhoneNumbersFromMembers(nonExistingMembers))
            }
          )
        }

        let allExistingUsersAsUserMemberData: UserMemberData[] = []
        let userMemberData = {} as UserMemberData
        for (let existingUser of allExistingUsers) {
          userMemberData.todayFinalPushNotificationIdentifier = ""
          userMemberData.todayPushNotificationIdentifier = ""
          userMemberData.tomorrowPushNotificationIdentifier = ""
          userMemberData.id = existingUser.id
          userMemberData.name = existingUser.name
          userMemberData.email = existingUser.email
          userMemberData.phoneNumber = existingUser.phoneNumber
          userMemberData.push_token = existingUser.push_token
          allExistingUsersAsUserMemberData.push(userMemberData)
        }
        let dogToAddToCollection = convertTempDogObjectToDogObject(tempDog)
        dogToAddToCollection.members = allExistingUsersAsUserMemberData
        addDogToUserCollection(allExistingUsers, dogToAddToCollection)

      })
    } else {
      displayButtonAlert(
        "Invalid Phone Number",
        "Please make sure all phone numbers are correctly entered.",
        () => {},
      )
    }
  }

  const areValidPhoneNumbers = (numbers: string[]) => {
    let phoneNumber: any
    console.log("Processing the numbers: " + numbers)
    for (let number of numbers) {
      phoneNumber = parsePhoneNumber(number, 'US')
      if (!phoneNumber || !phoneNumber.isValid()) {
        console.log(number + " is not valid")
        return false
      }
      console.log(number + " is valid")
    }
    return true
  }

  const addDogToUserCollection = async (users: UserData[], dog: DogObject) => {
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
            prevDogData.members[thisMemberIndex].name = newFamilyMemberName;
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
  };


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
