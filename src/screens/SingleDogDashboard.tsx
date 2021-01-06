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
import { firebase } from '../firebase/config'
import moment from 'moment'
import { ensureTwelveHourFormat } from '../SingleDogDashboardHelpers'

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


/**
 * [convertStringTimeToDate description]
 * @param  {[type]} time [description]
 * @return {[type]}      [description]
 *
 * @example
 * time = "11:16:00 PM"
 * convertStringTimeToDate(time)
 *
 */
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
    monday: (dog.schedule.monday.walkerName ? dog.schedule.monday.walkerName : user.name),
    tuesday: (dog.schedule.tuesday.walkerName ? dog.schedule.tuesday.walkerName : user.name),
    wednesday: (dog.schedule.wednesday.walkerName ? dog.schedule.wednesday.walkerName : user.name),
    thursday: (dog.schedule.thursday.walkerName ? dog.schedule.thursday.walkerName : user.name),
    friday: (dog.schedule.friday.walkerName ? dog.schedule.friday.walkerName : user.name),
    saturday: (dog.schedule.saturday.walkerName ? dog.schedule.saturday.walkerName : user.name),
    sunday: (dog.schedule.sunday.walkerName ? dog.schedule.sunday.walkerName : user.name),
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

  useEffect( () => {
    console.log("UseEffect Mount")
  }, [] )


  const clearDogDaySchedule = (day: string) => {
    let dayData = getDayData(dog, day)
    const previousDayType = dayData.dayType

    dayData.walkerName = ""
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

  // BAD FUNCTION: Currently does two things (schedule and weeklyNeeds)
  const updateDogSchedule = (day: string, previousDayType: string) => {
    let dayType = ""
    let dayFound = true
    let previousDogBackup = makeDogObjectCopy(dog)

    switch (day.toUpperCase()) {
      case "MONDAY":
        dog.schedule.monday.dayType = dayTypeDropdown.monday
        dayType = dayTypeDropdown.monday
        dog.schedule.monday.time = timesDropdown.monday
        dog.schedule.monday.walkerName = nameDropdown.monday
        dog.schedule.monday.walkerName = dog.schedule.monday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break
      case "TUESDAY":
        dog.schedule.tuesday.dayType = dayTypeDropdown.tuesday
        dayType = dayTypeDropdown.tuesday
        dog.schedule.tuesday.time = timesDropdown.tuesday
        dog.schedule.tuesday.walkerName = nameDropdown.tuesday
        dog.schedule.tuesday.walkerName = dog.schedule.tuesday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break
      case "WEDNESDAY":
        dog.schedule.wednesday.dayType = dayTypeDropdown.wednesday
        dayType = dayTypeDropdown.wednesday
        dog.schedule.wednesday.time = timesDropdown.wednesday
        dog.schedule.wednesday.walkerName = nameDropdown.wednesday
        dog.schedule.wednesday.walkerName = dog.schedule.wednesday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break
      case "THURSDAY":
        dog.schedule.thursday.dayType = dayTypeDropdown.thursday
        dayType = dayTypeDropdown.thursday
        dog.schedule.thursday.time = timesDropdown.thursday
        dog.schedule.thursday.walkerName = nameDropdown.thursday
        dog.schedule.thursday.walkerName = dog.schedule.thursday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break
      case "FRIDAY":
        dog.schedule.friday.dayType = dayTypeDropdown.friday
        dayType = dayTypeDropdown.friday
        dog.schedule.friday.time = timesDropdown.friday
        dog.schedule.friday.walkerName = nameDropdown.friday
        dog.schedule.friday.walkerName = dog.schedule.friday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break
      case "SATURDAY":
        dog.schedule.saturday.dayType = dayTypeDropdown.saturday
        dayType = dayTypeDropdown.saturday
        dog.schedule.saturday.time = timesDropdown.saturday
        dog.schedule.saturday.walkerName = nameDropdown.saturday
        dog.schedule.saturday.walkerName = dog.schedule.saturday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break
      case "SUNDAY":
        dog.schedule.sunday.dayType = dayTypeDropdown.sunday
        dayType = dayTypeDropdown.sunday
        dog.schedule.sunday.time = timesDropdown.sunday
        dog.schedule.sunday.walkerName = nameDropdown.sunday
        dog.schedule.sunday.walkerName = dog.schedule.sunday.walkerName.replace(" (You)", "") // If someone has " (You)"  in their name and this removes it, thats bad practice
        break
      default:
        console.log("ERROR - Something has gone very wrong in updateDog. The day passed does not match a day Monday-Sunday.")
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


  const saveDogSchedule = () => {
    // If dog doesn't have a firstName it must be the example dog since firstName entry enforced
    if (!dog.firstName) {
      alert("Can't mess with the example dog silly! ")
    } else {
      const dogRef = firebase.firestore().collection('dogs').doc(dog.key)
      dogRef
        .update({
            schedule: dog.schedule,
            weeklyNeeds: dog.weeklyNeeds,
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


  const handleReserveClick = (day: string, previousReserveDay: string) => {
    let updateSuccess = updateDogSchedule(day, previousReserveDay)

    if (updateSuccess) {
      const dogDayData = getDayData(dog, day)
      displayButtonAlert(
        "Reserve Day",
        "You are reserving " + day + " as a " + dogDayData.dayType + " day for " + dogDayData.time,
        saveDogSchedule,
      )
    }
  }

  const handleUnreserveClick = (day: string) => {
    clearDogDaySchedule(day)
    displayButtonAlert(
      "Clearing this day",
      "You are un-reserving the day: " + day,
      saveDogSchedule,
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

  const WALKS_FULFILLED_MESSAGE = "WALKING DAYS FILLED :)"
  const OUTINGS_FULFILLED_MESSAGE = "OUTING DAYS FILLED :)"
  const RESTS_FULFILLED_MESSAGE = "REST DAYS FILLED :)"

  return (
    <SingleDogDashboardBackground>
      <BackButton goBack={() => navigation.navigate('Dashboard')} />
      <SmallLogo />
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
