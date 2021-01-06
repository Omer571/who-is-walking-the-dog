import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Keyboard } from 'react-native';
import Button from './Button';
import { firebase } from '../firebase/config';
import { DogFamilyMember, DogSchedule, DogObject, Route } from '../types';
import { useNavigation } from '@react-navigation/native';

// const defaultDay: TypeDay = {
//   walkDay: false,
//   restDay: false,
//   parkDay: false,
// }

const WALKING_DAYS_PER_WEEK = 4
const OUTING_DAYS_PER_WEEK = 2
const REST_DAYS_PER_WEEK = 1

const defaultDogSchedule: DogSchedule = {
  monday: {
    walkerName: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  tuesday: {
    walkerName: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  wednesday: {
    walkerName: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  thursday: {
    walkerName: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  friday: {
    walkerName: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  saturday: {
    walkerName: "",
    time: "06:15:00 PM",
    dayType: "",
  },
  sunday: {
    walkerName: "",
    time: "06:15:00 PM",
    dayType: "",
  },
}

type Props = {
  numberOfFamilyBoxes: Number,
  user: Route["params"]["user"],
};

const AddDogFormTwo = (props: Props ) => {

  const dogRef = firebase.firestore().collection('dogs')
  const navigation = useNavigation();

  const saveDog = (dog: DogObject) => {
    if (dog.firstName) {
      dogRef
        .add(dog)
        .then(_doc => {
            alert("Dog Added!")
            Keyboard.dismiss()
            navigation.goBack()
            //navigation.navigate('Dashboard')
        })
        .catch((error) => {
            alert(error)
        });
    } else {
      alert("Must add the dogs first name!")
    }
  }

  const { user } = props

  const MemberInputBox = (props: { dataKey: string }) => {
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
            // Needs to be separate function
            const thisMemberIndex = prevDogData.members.findIndex((member: DogFamilyMember) => member.dataKey === dataKey);
            prevDogData.members[thisMemberIndex].name = newFamilyMemberName;
            return {
              ...prevDogData,
              schedule: defaultDogSchedule,
            }
          })}
        />
        <TextInput
          style={styles.familyMemberInput}
          placeholder="2817366840"
          onChangeText={(newFamilyMemberNumber) => setDogData(prevDogData => {
            // Needs to be separate function?
            const thisMemberIndex = prevDogData.members.findIndex((member: DogFamilyMember) => member.dataKey === dataKey);
            prevDogData.members[thisMemberIndex].phoneNumber = newFamilyMemberNumber;

            return {
              ...prevDogData,
              schedule: defaultDogSchedule,
            }
          })}
        />
      </View>
    );
  }

  const initialDogObject: DogObject = {
    firstName: "",
    middleName: "",
    lastName: "",
    members: [{dataKey: '0', phoneNumber: "", name: user.name}], // need user object to have phoneNumber later (or not? user doesn't need to send phone number to self)
    schedule: defaultDogSchedule,
    key: '',
    weeklyNeeds: {
      walks: WALKING_DAYS_PER_WEEK,
      outings: OUTING_DAYS_PER_WEEK,
      rest: REST_DAYS_PER_WEEK,
    }
  }

  const [dogData, setDogData] = useState<DogObject>(initialDogObject)

  let [memberInputs, setMemberInputs] = useState<JSX.Element[]>([])

  const addOneMemberInput = (key: number) => {
    // THIS SHOULD BE TWO SEPARATE FUNCTIONS
    // Add input to array of inputs to be rendered to screen
    let tempMemberInputs = memberInputs;
    tempMemberInputs.push(<MemberInputBox key={key.toString()} dataKey={key.toString()}/>);
    setMemberInputs(tempMemberInputs)

    // Add member to dogData.members array
    setDogData(prevDogData => {
      const newMember: DogFamilyMember = {dataKey: key.toString(), phoneNumber: "", name: ""}
      prevDogData.members.push(newMember)
      return {
        ...prevDogData,
        schedule: defaultDogSchedule,
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
            schedule: defaultDogSchedule,
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
            schedule: defaultDogSchedule,
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
            schedule: defaultDogSchedule,
          }
        })}
      />
      {memberInputs.map((element) => { return element})}
      <Button mode={'contained'} onPress={() => { saveDog(dogData) }}>Submit</Button>
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

export default AddDogFormTwo;
