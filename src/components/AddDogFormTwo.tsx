import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Keyboard } from 'react-native';
import Button from './Button';
import { firebase } from '../firebase/config';
import { DogFamilyMember, TypeDay, DogSchedule, DogObject, Route } from '../types';
import { useNavigation } from '@react-navigation/native';

// const defaultDay: TypeDay = {
//   walkDay: false,
//   restDay: false,
//   parkDay: false,
// }

const defaultDogSchedule: DogSchedule = {
  monday: {
    walkerName: "",
    time: "",
    dayType: "",
  },
  tuesday: {
    walkerName: "",
    time: "",
    dayType: "",
  },
  wednesday: {
    walkerName: "",
    time: "",
    dayType: "",
  },
  thursday: {
    walkerName: "",
    time: "",
    dayType: "",
  },
  friday: {
    walkerName: "",
    time: "",
    dayType: "",
  },
  saturday: {
    walkerName: "",
    time: "",
    dayType: "",
  },
  sunday: {
    walkerName: "",
    time: "",
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

            const thisMemberIndex = prevDogData.members.findIndex((member: DogFamilyMember) => member.dataKey === dataKey);
            prevDogData.members[thisMemberIndex].name = newFamilyMemberName;

            return {
              firstName: prevDogData.firstName,
              middleName: prevDogData.middleName,
              lastName: prevDogData.lastName,
              members: prevDogData.members,
              schedule: defaultDogSchedule,
              key: prevDogData.key,
            }
          })}
        />
        <TextInput
          style={styles.familyMemberInput}
          placeholder="2817366840"
          onChangeText={(newFamilyMemberNumber) => setDogData(prevDogData => {

            const thisMemberIndex = prevDogData.members.findIndex((member: DogFamilyMember) => member.dataKey === dataKey);
            prevDogData.members[thisMemberIndex].phoneNumber = newFamilyMemberNumber;

            return {
              firstName: prevDogData.firstName,
              middleName: prevDogData.middleName,
              lastName: prevDogData.lastName,
              members: prevDogData.members,
              schedule: defaultDogSchedule,
              key: prevDogData.key,
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
        firstName: prevDogData.firstName,
        middleName: prevDogData.middleName,
        lastName: prevDogData.lastName,
        members: prevDogData.members,
        schedule: defaultDogSchedule,
        key: prevDogData.key,
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
            firstName: newFirstName,
            middleName: prevDogData.middleName,
            lastName: prevDogData.lastName,
            members: prevDogData.members,
            schedule: defaultDogSchedule,
            key: prevDogData.key,
          }
        })}
      />
      <TextInput
        style={styles.nameInput}
        placeholder='Doggy Middle Name'
        onChangeText={(newMiddleName) => setDogData(prevDogData => {
          return {
            firstName: prevDogData.firstName,
            middleName: newMiddleName,
            lastName: prevDogData.lastName,
            members: prevDogData.members,
            schedule: defaultDogSchedule,
            key: prevDogData.key,
          }
        })}
      />
      <TextInput
        style={styles.nameInput}
        placeholder='Doggy Last Name'
        onChangeText={(newLastName) => setDogData(prevDogData => {
          return {
            firstName: prevDogData.firstName,
            middleName: prevDogData.middleName,
            lastName: newLastName,
            members: prevDogData.members,
            schedule: defaultDogSchedule,
            key: prevDogData.key,
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
