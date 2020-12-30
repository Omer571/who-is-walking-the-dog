import React, { useEffect, useState, memo } from 'react'
import { View, StyleSheet, Text, Alert } from 'react-native'
import { TextInput } from 'react-native-paper'
import SingleDogDashboardBackground from '../components/SingleDogDashboardBackground';
import SmallLogo from '../components/SmallLogo'
import UnderlinedHeader from '../components/UnderlinedHeader'
import Button from '../components/Button'
import SmallButton from '../components/SmallButton'
import BackButton from '../components/BackButton'
import Dropdown from '../components/Dropdown'
import TimePicker from '../components/TimePicker'
import { Navigation, Route, DogObject, DayInfo } from '../types'
import { dayTypes, walks, outings, rest} from '../dogNeeds'
import { firebase } from '../firebase/config'

type Props = {
  navigation: Navigation,
  route: Route,
};


const SingleDogDashboard = ({ navigation, route }: Props) => {

  const { user, dogName, dog } = route.params

  type DropdownStateType = {
    monday: string,
    tuesday: string,
    wednesday: string,
    thursday: string,
    friday: string,
    saturday: string,
    sunday: string,
  }

  function setStringDayData(object: DropdownStateType, day: string, newValue: string) {
    switch (day.toUpperCase()) {
      case "MONDAY":
        object.monday = newValue
        break
      case "TUESDAY":
        object.tuesday = newValue
        break
      case "WEDNESDAY":
        object.wednesday = newValue
        break
      case "THURSDAY":
        object.thursday = newValue
        break
      case "FRIDAY":
        object.friday = newValue
        break
      case "SATURDAY":
        object.saturday = newValue
        break
      case "SUNDAY":
        object.sunday = newValue
        break
      default:
        throw Error("onNameChange: day passed was not a day of the week")
    }
  }

  function getDayData(dog: DogObject, day: string) {
    let dayData = {} as DayInfo
    switch (day.toUpperCase()) {
      case "MONDAY":
        dayData = dog.schedule.monday
        break
      case "TUESDAY":
        dayData = dog.schedule.tuesday
        break
      case "WEDNESDAY":
        dayData = dog.schedule.wednesday
        break
      case "THURSDAY":
        dayData = dog.schedule.thursday
        break
      case "FRIDAY":
        dayData = dog.schedule.friday
        break
      case "SATURDAY":
        dayData = dog.schedule.saturday
        break
      case "SUNDAY":
        dayData = dog.schedule.sunday
        break
      default:
        throw Error("getDayData: day passed was not a day of the week")
    }
    return dayData
  }

  const [nameDropdown, setNameDropdown] = useState<DropdownStateType>({
    // If the dog doesn't already have walker for given day, user is default option
    monday: (dog.schedule.monday.walkerName ? dog.schedule.monday.walkerName : user.name),
    tuesday: (dog.schedule.tuesday.walkerName ? dog.schedule.tuesday.walkerName : user.name),
    wednesday: (dog.schedule.wednesday.walkerName ? dog.schedule.wednesday.walkerName : user.name),
    thursday: (dog.schedule.thursday.walkerName ? dog.schedule.thursday.walkerName : user.name),
    friday: (dog.schedule.friday.walkerName ? dog.schedule.friday.walkerName : user.name),
    saturday: (dog.schedule.saturday.walkerName ? dog.schedule.saturday.walkerName : user.name),
    sunday: (dog.schedule.sunday.walkerName ? dog.schedule.sunday.walkerName : user.name),
  })

  const [dayTypeDropdown, setDayTypeDropdown] = useState<DropdownStateType>({
    monday: dayTypes[0],
    tuesday: dayTypes[0],
    wednesday: dayTypes[0],
    thursday: dayTypes[0],
    friday: dayTypes[0],
    saturday: dayTypes[0],
    sunday: dayTypes[0],
  })

  const makeDogObjectCopy = (objectToCopy: DogObject) => ({ ...objectToCopy })

  const [dogHook, setDogHook] = useState<DogObject>(makeDogObjectCopy(dog))

  useEffect( () => {
    console.log("UseEffect Mount")
  }, [] )


  const clearDogDaySchedule = (day: string) => {
    let dayData = getDayData(dog, day)
    dayData.walkerName = ""
    dayData.dayType = ""
  }

  // Note: updateDog functionality could be apart of onNameChange and onDayTypeChange
  const updateDogSchedule = (day: string) => {
    switch (day.toUpperCase()) {
      case "MONDAY":
        dog.schedule.monday.dayType = dayTypeDropdown.monday
        dog.schedule.monday.time = "Default 7:30"
        dog.schedule.monday.walkerName = nameDropdown.monday
        dog.schedule.monday.walkerName = dog.schedule.monday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break;
      case "TUESDAY":
        dog.schedule.tuesday.dayType = dayTypeDropdown.tuesday
        dog.schedule.tuesday.time = "Default 7:30"
        dog.schedule.tuesday.walkerName = nameDropdown.tuesday
        dog.schedule.tuesday.walkerName = dog.schedule.tuesday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break;
      case "WEDNESDAY":
        dog.schedule.wednesday.dayType = dayTypeDropdown.wednesday
        dog.schedule.wednesday.time = "Default 7:30"
        dog.schedule.wednesday.walkerName = nameDropdown.wednesday
        dog.schedule.wednesday.walkerName = dog.schedule.wednesday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break;
      case "THURSDAY":
        dog.schedule.thursday.dayType = dayTypeDropdown.thursday
        dog.schedule.thursday.time = "Default 7:30"
        dog.schedule.thursday.walkerName = nameDropdown.thursday
        dog.schedule.thursday.walkerName = dog.schedule.thursday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break;
      case "FRIDAY":
        dog.schedule.friday.dayType = dayTypeDropdown.friday
        dog.schedule.friday.time = "Default 7:30"
        dog.schedule.friday.walkerName = nameDropdown.friday
        dog.schedule.friday.walkerName = dog.schedule.friday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break;
      case "SATURDAY":
        dog.schedule.saturday.dayType = dayTypeDropdown.saturday
        dog.schedule.saturday.time = "Default 7:30"
        dog.schedule.saturday.walkerName = nameDropdown.saturday
        dog.schedule.saturday.walkerName = dog.schedule.saturday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break;
      case "SUNDAY":
        dog.schedule.sunday.dayType = dayTypeDropdown.sunday
        dog.schedule.sunday.time = "Default 7:30"
        dog.schedule.sunday.walkerName = nameDropdown.sunday
        dog.schedule.sunday.walkerName = dog.schedule.sunday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break;
      default:
        break;
    }
  }



  const saveDogSchedule = () => {
    // If dog doesn't have a firstName it must be the example dog since firstName entry enforced
    if (!dog.firstName) {
      alert("Can't mess with the example dog silly! ")
    } else {
      const dogRef = firebase.firestore().collection('dogs').doc(dog.key)
      dogRef
        .update({
            schedule: dog.schedule,
        })
        .then(_doc => {
            // console.log("dog.schedule.monday BEFORE setDogHook called: " + JSON.stringify(dog.schedule.monday))
            // console.log("dog === dogHook?: " + (dogHook === dog))
            // console.log("dog === initialDog?: " + (dog === initialDog))
            // console.log("dogHook.schedule.monday BEFORE setDogHook called: " + JSON.stringify(dogHook.schedule.monday))

            setDogHook(makeDogObjectCopy(dog))
            // setTimeout(() => console.log("dogHook.schedule.monday AFTER setDogHook called: " + JSON.stringify(dogHook.schedule.monday)) , 1000)
            // console.log("\nDog Schedule should be updated and dog hook refreshed!\n")
        })
        .catch((error) => {
            alert(error)
        });
    }
  }


  const handleReserveClick = (day: string) => {
    updateDogSchedule(day)
    const dogDayData = getDayData(dog, day)
    displaySaveButtonAlert(
      "Reserve Day",
      "You are reserving " + day + " as a " + dogDayData.dayType + " day for " + dogDayData.time
    )
  }

  const handleUnreserveClick = (day: string) => {
    clearDogDaySchedule(day)
    displaySaveButtonAlert(
      "Clearing this day",
      "You are un-reserving the day: " + day
    )
  }

  const displaySaveButtonAlert = (title: string, message: string) => {
    return Alert.alert(
        title,
        message,
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "OK", onPress: () => saveDogSchedule() }
        ],
        { cancelable: true }
      );
  }


  const EditableDayInput = (day: string) => {

    let memberNames: string[] = []
    let defaultOption = ""
    const dayData = getDayData(dogHook, day)

    for (let member of dog.members) {
      if (member.name === user.name) {
        memberNames.push(member.name + " (You)")
        defaultOption = member.name + " (You)" // removing this line causes error (why?)
      }
      else {
        memberNames.push(member.name)
      }
    }

    const onNameChange = (newName: string, day: string) => {
      setNameDropdown((names) => {
        setStringDayData(names, day, newName)
        return names
      })
      console.log("name selected for " + day + ": ", newName)
    }

    const onDayTypeChange = (newDayType: string, day: string) => {
      setDayTypeDropdown((prevDayTypes) => {
        setStringDayData(prevDayTypes, day, newDayType)
        return prevDayTypes
      })
    }

    return (
      <View>
        <Dropdown options={memberNames} defaultOption={defaultOption} priority={2000} onChange={(newName) => { onNameChange(newName, day) }} />
        <Dropdown options={dayTypes} defaultOption={dayTypes[0]} priority={1000} onChange={(newDayType) => { onDayTypeChange(newDayType, day) }} />
        <TimePicker />
        <Button style={styles.editableTextInput} mode="outlined" onPress={() => handleReserveClick(day)}>
          {(dayData.walkerName === user.name) ? "Save Changes": "Reserve Day"}
        </Button>
        {(dayData.walkerName === user.name) ?
          <Button style={[styles.editableTextInput, styles.unreserveButton]} mode="contained" onPress={() => handleUnreserveClick(day)}>
            Unreserve Day
          </Button>: null
        }
      </View>
    )
  }

  const UnEditableDayInput = (day: string) => {
    let dayData = getDayData(dogHook, day)
    return (
      <View>
        <TextInput label={dayData.walkerName} style={styles.unEditableTextInput} disabled={true} mode="outlined"/>
        <TextInput label={dayData.time} style={styles.unEditableTextInput} disabled={true} mode="outlined"/>
        <TextInput label={dayData.dayType} style={styles.unEditableTextInput} disabled={true} mode="outlined"/>
        <SmallButton mode="contained">Request Schedule Change w/ {dayData.walkerName}</SmallButton>
      </View>
    )
  }

  return (
    <SingleDogDashboardBackground>
      <BackButton goBack={() => navigation.navigate('Dashboard')} />
      <SmallLogo />
      <UnderlinedHeader>{dogName} Schedule</UnderlinedHeader>
      <View style={styles.scheduleView}>
        <UnderlinedHeader>Weekly Needs</UnderlinedHeader>
        <Text style={styles.weeklyNeeds}>Walks Needed: {walks}</Text>
        <Text style={styles.weeklyNeeds}>Outings Needed: {outings}</Text>
        <Text style={styles.weeklyNeeds}>Rest Needed: {rest}</Text>

        <UnderlinedHeader>Monday
          {(dogHook.schedule.monday.walkerName === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.monday.walkerName || "" === dogHook.schedule.monday.walkerName) ? EditableDayInput("Monday"): UnEditableDayInput("Monday")}

        <UnderlinedHeader>Tuesday
          {(dogHook.schedule.tuesday.walkerName === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.tuesday.walkerName || "" === dogHook.schedule.tuesday.walkerName) ? EditableDayInput("Tuesday"): UnEditableDayInput("Tuesday")}

        <UnderlinedHeader>Wednesday
          {(dogHook.schedule.wednesday.walkerName === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.wednesday.walkerName || "" === dogHook.schedule.wednesday.walkerName) ? EditableDayInput("Wednesday"): UnEditableDayInput("Wednesday")}

        <UnderlinedHeader>Thursday
          {(dogHook.schedule.thursday.walkerName === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.thursday.walkerName || "" === dogHook.schedule.thursday.walkerName) ? EditableDayInput("Thursday"): UnEditableDayInput("Thursday")}

        <UnderlinedHeader>Friday
          {(dogHook.schedule.friday.walkerName === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.friday.walkerName || "" === dogHook.schedule.friday.walkerName) ? EditableDayInput("Friday"): UnEditableDayInput("Friday")}

        <UnderlinedHeader>Saturday
          {(dogHook.schedule.saturday.walkerName === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.saturday.walkerName || "" === dogHook.schedule.saturday.walkerName) ? EditableDayInput("Saturday"): UnEditableDayInput("Saturday")}

        <UnderlinedHeader>Sunday
          {(dogHook.schedule.sunday.walkerName === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.sunday.walkerName || "" === dogHook.schedule.sunday.walkerName) ? EditableDayInput("Sunday"): UnEditableDayInput("Sunday")}

      </View>
      <Button mode="outlined" onPress={() => navigation.navigate('HomeScreen')}>
        Logout
      </Button>
    </SingleDogDashboardBackground>
  );
}


const styles = StyleSheet.create({
  scheduleView: {
    flexDirection: 'column',
    justifyContent: "space-between",
  },
  userDay: {
    fontStyle: "italic",
  },
  editableTextInput: {
    width: "70%",
  },
  unreserveButton: {
    marginTop: 0,
  },
  unEditableTextInput: {
    width: "70%",
    // color: "yellow",
    backgroundColor: "grey",
  },
  weeklyNeeds: {
    color: "black",
    fontSize: 20,
  }
})

export default memo(SingleDogDashboard)
