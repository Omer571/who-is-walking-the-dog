import React, { useEffect, useState, memo } from 'react'
import { View, StyleSheet, Text, Alert } from 'react-native'
import { TextInput } from 'react-native-paper'
import SingleDogDashboardBackground from '../components/SingleDogDashboardBackground'
import UnderlinedHeader from '../components/UnderlinedHeader'
import Button from '../components/Button'
import SmallButton from '../components/SmallButton'
import BackButton from '../components/BackButton'
import Dropdown from '../components/Dropdown'
import TimePicker from '../components/TimePicker'
import { Navigation, Route, DogObject, DayInfo, UserData } from '../types'
import { firebase } from '../firebase/config'
import moment from 'moment'
import { ensureTwelveHourFormat } from '../helpers/SingleDogDashboardHelpers'
import { sendPushNotification, makeInteractive } from '../helpers/PushNotificationHelpers'

type Props = {
  navigation: Navigation,
  route: Route,
}

const DAY_TYPES = ["Walk", "Outing", "Rest"]

const convertTime12to24 = (time12: string) => {
  const [_, modifierPart] = time12.split(' ');
  let [hours, minutes] = time12.split(':');

  if (hours === '12') {
    hours = '00';
  }
  if (modifierPart === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString()
  }

  // console.log(`${hours}:${minutes}`)
  return `${hours}:${minutes}:00`
}


const convertTwelveHourStringTimeToDate = (time12: string) => {
  // Ensure Format
  if (!ensureTwelveHourFormat(time12))
    throw "Error: Format for 12 Hour time is wrong in convertTwelveHourStringTimeToDate: " + time12

  const time24 = convertTime12to24(time12)
  const defaultDay = "2020-01-01"

  // console.log(defaultDay + " " + time24)
  const momentDate = moment(defaultDay + " " + time24)
  return momentDate.toDate()
}

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
        throw Error("getDayData: day passed was not a day of the week\ndayData.time ")
    }
    return dayData
  }

  const [nameDropdown, setNameDropdown] = useState<DropdownStateType>({
    // If the dog doesn't already have walker for given day, user is default option
    monday: (dog.schedule.monday.walker.name ? dog.schedule.monday.walker.name : user.name),
    tuesday: (dog.schedule.tuesday.walker.name ? dog.schedule.tuesday.walker.name : user.name),
    wednesday: (dog.schedule.wednesday.walker.name ? dog.schedule.wednesday.walker.name : user.name),
    thursday: (dog.schedule.thursday.walker.name ? dog.schedule.thursday.walker.name : user.name),
    friday: (dog.schedule.friday.walker.name ? dog.schedule.friday.walker.name : user.name),
    saturday: (dog.schedule.saturday.walker.name ? dog.schedule.saturday.walker.name : user.name),
    sunday: (dog.schedule.sunday.walker.name ? dog.schedule.sunday.walker.name : user.name),
  })

  const [dayTypeDropdown, setDayTypeDropdown] = useState<DropdownStateType>({
    monday: (dog.schedule.monday.dayType ? dog.schedule.monday.dayType : "Walk"),
    tuesday: (dog.schedule.tuesday.dayType ? dog.schedule.tuesday.dayType : "Walk"),
    wednesday: (dog.schedule.wednesday.dayType ? dog.schedule.wednesday.dayType : "Walk"),
    thursday: (dog.schedule.thursday.dayType ? dog.schedule.thursday.dayType : "Walk"),
    friday: (dog.schedule.friday.dayType ? dog.schedule.friday.dayType : "Walk"),
    saturday: (dog.schedule.saturday.dayType ? dog.schedule.saturday.dayType : "Walk"),
    sunday: (dog.schedule.sunday.dayType ? dog.schedule.sunday.dayType : "Walk"),
  })

  const [timesDropdown, setTimesDropdown] = useState<DropdownStateType>({
    monday: (dog.schedule.monday.time ? dog.schedule.monday.time : "6:15:00 PM"),
    tuesday: (dog.schedule.tuesday.time ? dog.schedule.tuesday.time : "6:15:00 PM"),
    wednesday: (dog.schedule.wednesday.time ? dog.schedule.wednesday.time : "6:15:00 PM"),
    thursday: (dog.schedule.thursday.time ? dog.schedule.thursday.time : "6:15:00 PM"),
    friday: (dog.schedule.friday.time ? dog.schedule.friday.time : "6:15:00 PM"),
    saturday: (dog.schedule.saturday.time ? dog.schedule.saturday.time : "6:15:00 PM"),
    sunday: (dog.schedule.sunday.time ? dog.schedule.sunday.time : "6:15:00 PM"),
  })


  const makeDogObjectCopy = (objectToCopy: DogObject) => ({ ...objectToCopy })

  const [dogHook, setDogHook] = useState<DogObject>(makeDogObjectCopy(dog))

  function clearDogScheduleInCollection(dog: DogObject) {
    if (dog.schedule) {
      for (let day in dog.schedule) {
        console.log("empty schedule")
      }
      const dogRef = firebase.firestore().collection('users').doc(user.id).collection('dogs').doc(dog.key)
      dogRef
        .update({
            schedule: dog.schedule,
        })
        .then(_doc => {
            setDogHook(makeDogObjectCopy(dog))
        })
        .catch((error) => {
            throw "error in updateDogInUserCollections: " + error
        })
    }
  }

  useEffect( () => {
    // Reset schedule oncee it is 9 pm Sunday
    let thisMoment = new Date()
    if (thisMoment.getDay() === 7 && thisMoment.getHours() >= 21 && thisMoment.getHours() < 22) {
      console.log("It is Sunday 9 PM... Resetting Week")

    }
  }, [] )


  const clearDogDaySchedule = (day: string) => {
    let dayData = getDayData(dog, day)
    const previousDayType = dayData.dayType

    dayData.walker.name = ""
    dayData.dayType = ""

    // Update Weekly Needs back
    switch (previousDayType) {
      case "Walk":
        dog.weeklyNeeds.walks = dog.weeklyNeeds.walks + 1
        break
      case "Outing":
        dog.weeklyNeeds.outings = dog.weeklyNeeds.outings + 1
        break
      case "Rest":
        dog.weeklyNeeds.rest = dog.weeklyNeeds.rest + 1
        break
    }
  }

  const findMemberByName = (name: string) => {
    for (let member of dog.members) {
      if (member.name === name) {
        return member
      }
    }

    throw "ERROR - Name in dropdown does not match any existing dog.member name. \Something went very wrong internally."

  }

  // BAD FUNCTION: Currently does two things (schedule and weeklyNeeds)
  const updateDogSchedule = (day: string, previousDayType: string) => {
    let dayType = ""
    let nameToSearchFor = ""
    let dayFound = true
    let previousDogBackup = makeDogObjectCopy(dog)

    switch (day.toUpperCase()) {
      case "MONDAY":
        dog.schedule.monday.dayType = dayTypeDropdown.monday
        dayType = dayTypeDropdown.monday
        dog.schedule.monday.time = timesDropdown.monday
        nameToSearchFor = nameDropdown.monday.replace(" (You)", "")
        dog.schedule.monday.walker = findMemberByName(nameToSearchFor)
        break
      case "TUESDAY":
        dog.schedule.tuesday.dayType = dayTypeDropdown.tuesday
        dayType = dayTypeDropdown.tuesday
        dog.schedule.tuesday.time = timesDropdown.tuesday
        nameToSearchFor = nameDropdown.tuesday.replace(" (You)", "")
        dog.schedule.tuesday.walker = findMemberByName(nameToSearchFor)
        break
      case "WEDNESDAY":
        dog.schedule.wednesday.dayType = dayTypeDropdown.wednesday
        dayType = dayTypeDropdown.wednesday
        dog.schedule.wednesday.time = timesDropdown.wednesday
        nameToSearchFor = nameDropdown.wednesday.replace(" (You)", "")
        dog.schedule.wednesday.walker = findMemberByName(nameToSearchFor)
        break
      case "THURSDAY":
        dog.schedule.thursday.dayType = dayTypeDropdown.thursday
        dayType = dayTypeDropdown.thursday
        dog.schedule.thursday.time = timesDropdown.thursday
        nameToSearchFor = nameDropdown.thursday.replace(" (You)", "")
        dog.schedule.thursday.walker = findMemberByName(nameToSearchFor)
        break
      case "FRIDAY":
        dog.schedule.friday.dayType = dayTypeDropdown.friday
        dayType = dayTypeDropdown.friday
        dog.schedule.friday.time = timesDropdown.friday
        nameToSearchFor = nameDropdown.friday.replace(" (You)", "")
        dog.schedule.friday.walker = findMemberByName(nameToSearchFor)
        break
      case "SATURDAY":
        dog.schedule.saturday.dayType = dayTypeDropdown.saturday
        dayType = dayTypeDropdown.saturday
        dog.schedule.saturday.time = timesDropdown.saturday
        nameToSearchFor = nameDropdown.saturday.replace(" (You)", "")
        dog.schedule.saturday.walker = findMemberByName(nameToSearchFor)
        break
      case "SUNDAY":
        dog.schedule.sunday.dayType = dayTypeDropdown.sunday
        dayType = dayTypeDropdown.sunday
        dog.schedule.sunday.time = timesDropdown.sunday
        nameToSearchFor = nameDropdown.sunday.replace(" (You)", "")
        dog.schedule.sunday.walker = findMemberByName(nameToSearchFor)
        break
      default:
        console.log("SingleDogDashboard ERROR - Something has gone very wrong in updateDog. The day passed does not match a day Monday-Sunday.")
        dayFound = false
        break
    }

    if (dayFound) {
      const isNewDayType = (previousDayType && dayType !== previousDayType)
      const isSameDayType = (previousDayType && !isNewDayType)

      // If the days are not the same dayType, then we need to update weeklyNeeds
      if (!isSameDayType) {
        switch (dayType) {
          case "Walk":
            dog.weeklyNeeds.walks = dog.weeklyNeeds.walks - 1
            break
          case "Outing":
            dog.weeklyNeeds.outings = dog.weeklyNeeds.outings - 1
            break
          case "Rest":
            dog.weeklyNeeds.rest = dog.weeklyNeeds.rest - 1
            break
        }
      }
      // If the dayTypes were different, then we need to add back to previousDayTypes weeklyNeeds
      if (isNewDayType) {
        switch (previousDayType) {
          case "Walk":
            dog.weeklyNeeds.walks = dog.weeklyNeeds.walks + 1
            break
          case "Outing":
            dog.weeklyNeeds.outings = dog.weeklyNeeds.outings + 1
            break
          case "Rest":
            dog.weeklyNeeds.rest = dog.weeklyNeeds.rest + 1
            break
        }
      }
    }

    // Check if day reserved messed things up
    if (dog.weeklyNeeds.walks < 0 || dog.weeklyNeeds.outings < 0 || dog.weeklyNeeds.rest < 0) {

      displayButtonAlert(
        "Hold Up",
        dayType + " days for this week have already been fulfilled. Please choose different type of day.",
        () => {},
      )

      // Restore previous dog
      dog.schedule = previousDogBackup.schedule
      dog.weeklyNeeds = previousDogBackup.weeklyNeeds

      return false
    }

    return true
  }


  const updateDogInUserCollections = () => {
    // If dog doesn't have a firstName it must be the example dog since firstName entry enforced
    if (!dog.firstName) {
      alert("Can't mess with the example dog silly! ")
    } else {
      for (let user of dog.members) {
        console.log("Updating dog's schedule with key of: " + dog.key + " for user: " + user.name)
        const dogRef = firebase.firestore().collection('users').doc(user.id).collection('dogs').doc(dog.key)
        dogRef
          .update({
              schedule: dog.schedule,
              weeklyNeeds: dog.weeklyNeeds,
          })
          .then(_doc => {
              setDogHook(makeDogObjectCopy(dog))
          })
          .catch((error) => {
              throw "error in updateDogInUserCollections: " + error
          })
      }
    }
  }


  const handleReserveClick = (day: string, previousReserveDay: string) => {
    let updateSuccess = updateDogSchedule(day, previousReserveDay)

    if (updateSuccess) {
      const dogDayData = getDayData(dog, day)
      displayButtonAlert(
        "Reserve Day",
        "You are reserving " + day + " as a " + dogDayData.dayType + " day for " + dogDayData.time,
        updateDogInUserCollections,
      )
    }
  }

  const handleUnreserveClick = (day: string) => {
    clearDogDaySchedule(day)
    displayButtonAlert(
      "Clearing this day",
      "You are un-reserving the day: " + day,
      updateDogInUserCollections,
    )
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
      );
  }

  const handleScheduleChangeRequest = (walker: UserData, day: string) => {
    const push_token = walker.push_token
    const title = "Schedule Change Request"
    const message = user.name + " would like to take your day: " + day
    sendPushNotification(
      push_token,
      title,
      message,
      dogHook,
      walker
    )
    // Give option to clear given day at button click (may need screen - look all this up)

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
    }

    const onDayTypeChange = (newDayType: string, day: string) => {
      setDayTypeDropdown((dayTypes) => {
        setStringDayData(dayTypes, day, newDayType)
        return dayTypes
      })
    }

    const onTimeChange = (newTime: Date, day: string) => {
      let newTimeString = newTime.toLocaleTimeString()
      if (newTimeString[1] === ":") {
        newTimeString = '0' + newTimeString
      }
      setTimesDropdown((times) => {
        setStringDayData(times, day, newTimeString)
        return times
      })
    }


    let initialTimePickerDate : Date
    // if Dog is missing firstName, it is an example dog (THIS SHOULD BE GLOBAL CHECK LATER)
    if (!dog.firstName) {
      initialTimePickerDate = convertTwelveHourStringTimeToDate("06:15:00 PM")
    } else {
      initialTimePickerDate = convertTwelveHourStringTimeToDate(dayData.time)
    }

    let previousDayType = dayData.dayType

    return (
      <View>
        <Dropdown options={memberNames} defaultOption={defaultOption} priority={2000} onChange={(newName) => { onNameChange(newName, day) }} />
        <Dropdown options={DAY_TYPES} defaultOption={dayData.dayType ? dayData.dayType : "Walk"} priority={1000} onChange={(newDayType) => { onDayTypeChange(newDayType, day) }} />
        <TimePicker value={initialTimePickerDate} onChange={(newTime) => { onTimeChange(newTime, day) }}/>
        <Button style={styles.editableTextInput} mode="outlined" onPress={() => handleReserveClick(day, previousDayType)}>
          {(dayData.walker.name === user.name) ? "Save Changes": "Reserve Day"}
        </Button>
        {(dayData.walker.name === user.name) ?
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
        <TextInput label={dayData.walker.name} style={styles.unEditableTextInput} disabled={true} mode="outlined"/>
        <TextInput label={dayData.time} style={styles.unEditableTextInput} disabled={true} mode="outlined"/>
        <TextInput label={dayData.dayType} style={styles.unEditableTextInput} disabled={true} mode="outlined"/>
        <SmallButton onPress={() => { handleScheduleChangeRequest(dayData.walker, day) }} mode="contained">Request Schedule Change w/ {dayData.walker.name}</SmallButton>
      </View>
    )
  }

  const WALKS_FULFILLED_MESSAGE = "WALKING DAYS FILLED :)"
  const OUTINGS_FULFILLED_MESSAGE = "OUTING DAYS FILLED :)"
  const RESTS_FULFILLED_MESSAGE = "REST DAYS FILLED :)"
  const SINGLE_DOG_DASHBOARD_NAVBAR_TITLE = dog.firstName + "'s Week"
  return (
    <SingleDogDashboardBackground user={user} title={SINGLE_DOG_DASHBOARD_NAVBAR_TITLE}>
      <BackButton goBack={() => navigation.navigate('Dashboard')} />
      <UnderlinedHeader>{dogName} Schedule</UnderlinedHeader>
      <View style={styles.scheduleView}>
        <UnderlinedHeader>This Weeks Needs</UnderlinedHeader>
        {dogHook.weeklyNeeds.walks
          ? <Text style={styles.weeklyNeeds}>Walks Needed: {dogHook.weeklyNeeds.walks}</Text>
          : <Text style={styles.weeklyNeeds}>{WALKS_FULFILLED_MESSAGE}</Text>
        }
        {dogHook.weeklyNeeds.outings
          ? <Text style={styles.weeklyNeeds}>Outings Needed: {dogHook.weeklyNeeds.outings}</Text>
          : <Text style={styles.weeklyNeeds}>{OUTINGS_FULFILLED_MESSAGE}</Text>
        }
        {dogHook.weeklyNeeds.rest
          ? <Text style={styles.weeklyNeeds}>Rest Needed: {dogHook.weeklyNeeds.rest}</Text>
          : <Text style={styles.weeklyNeeds}>{RESTS_FULFILLED_MESSAGE}</Text>
        }
        <UnderlinedHeader>Monday
          {(dogHook.schedule.monday.walker.name === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.monday.walker.name || !dogHook.schedule.monday.walker.name) ? EditableDayInput("Monday"): UnEditableDayInput("Monday")}

        <UnderlinedHeader>Tuesday
          {(dogHook.schedule.tuesday.walker.name === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.tuesday.walker.name || !dogHook.schedule.tuesday.walker.name) ? EditableDayInput("Tuesday"): UnEditableDayInput("Tuesday")}

        <UnderlinedHeader>Wednesday
          {(dogHook.schedule.wednesday.walker.name === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.wednesday.walker.name || !dogHook.schedule.wednesday.walker.name) ? EditableDayInput("Wednesday"): UnEditableDayInput("Wednesday")}

        <UnderlinedHeader>Thursday
          {(dogHook.schedule.thursday.walker.name === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.thursday.walker.name || !dogHook.schedule.thursday.walker.name) ? EditableDayInput("Thursday"): UnEditableDayInput("Thursday")}

        <UnderlinedHeader>Friday
          {(dogHook.schedule.friday.walker.name === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.friday.walker.name || !dogHook.schedule.friday.walker.name) ? EditableDayInput("Friday"): UnEditableDayInput("Friday")}

        <UnderlinedHeader>Saturday
          {(dogHook.schedule.saturday.walker.name === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.saturday.walker.name || !dogHook.schedule.saturday.walker.name) ? EditableDayInput("Saturday"): UnEditableDayInput("Saturday")}

        <UnderlinedHeader>Sunday
          {(dogHook.schedule.sunday.walker.name === user.name) ? <Text style={styles.userDay}> (Your Day)</Text>: ""}
        </UnderlinedHeader>
        {(user.name === dogHook.schedule.sunday.walker.name || !dogHook.schedule.sunday.walker.name) ? EditableDayInput("Sunday"): UnEditableDayInput("Sunday")}
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
