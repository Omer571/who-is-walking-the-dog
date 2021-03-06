import React, { useEffect, useState, memo } from 'react'
import { View, StyleSheet, Text, Alert } from 'react-native'
import { TextInput } from 'react-native-paper'
import SingleDogDashboardBackground from '../components/SingleDogDashboardBackground'
import UnderlinedHeader from '../components/UnderlinedHeader'
import Button from '../components/Button'
import SmallButton from '../components/SmallButton'
import Dropdown from '../components/Dropdown'
import TimePicker from '../components/TimePicker'
import { getUser, getDog } from '../helpers/SettingsHelpers'
import { Navigation, Route, DogObject, UserData, DropdownStateType } from '../types'
import { firebase } from '../firebase/config'
import {
  convertTwelveHourStringTimeToDate,
  getDayData,
  setStringDayData,
  makeDogObjectCopy,
  clearDogScheduleInCollection,
 } from '../helpers/SingleDogDashboardHelpers'

import { sendPushNotification } from '../helpers/PushNotificationHelpers'

type Props = {
  navigation: Navigation,
  route: Route,
}

const DAY_TYPES = ["Walk", "Outing", "Rest"]



const SingleDogDashboard = ({ navigation, route }: Props) => {

  let { user, dogName, dog } = route.params

  let [currentUser, setCurrentUser] = useState(user)
  let [refresh, setRefresh] = useState(false)
  const [dogHook, setDogHook] = useState<DogObject>(makeDogObjectCopy(dog))

  console.log("dog.weeklyNeeds from route.params: " + JSON.stringify(dog.weeklyNeeds))
  console.log("dogHook.weeklyNeeds: " + JSON.stringify(dogHook.weeklyNeeds))

  const handleClearDogSchedule = (dog: DogObject) => {
    for (let member of dog.members) {

      getUser(member.id).then((user) => {
        if (!user) {
          console.error("Error: calling getUser() in handleClearSchedule - no user returned")
          return
        }

        clearDogScheduleInCollection(dog, user.id)?.then(dogWithClearedSchedule => {
          if (dogWithClearedSchedule) {
            console.log("dogWithClearedSchedule.weeklyNeeds.walks: " + dogWithClearedSchedule.weeklyNeeds.walks)
            setDogHook(dogWithClearedSchedule)

            sendPushNotification(
              user.push_token,
              "It's a new week!",
              "You can now sign up to walk Ginger for the next week!",
              dogWithClearedSchedule,
              user,
            )

            console.log("Cleared Dog Schedule for: " + user.name + " and sent notification")
          }
          else {
            console.error("(SingleDogDashboard - clearDogScheduleInCollection) Error: dogWithClearedSchedule: " + dogWithClearedSchedule)
          }

          setRefresh(!refresh)
        })
      })


    }
  }

  const [nameDropdown, setNameDropdown] = useState<DropdownStateType>({
    // If the dog doesn't already have walker for given day, user is default option
    monday: (dogHook.schedule.monday.walker.name ? dogHook.schedule.monday.walker.name : currentUser.name),
    tuesday: (dogHook.schedule.tuesday.walker.name ? dogHook.schedule.tuesday.walker.name : currentUser.name),
    wednesday: (dogHook.schedule.wednesday.walker.name ? dogHook.schedule.wednesday.walker.name : currentUser.name),
    thursday: (dogHook.schedule.thursday.walker.name ? dogHook.schedule.thursday.walker.name : currentUser.name),
    friday: (dogHook.schedule.friday.walker.name ? dogHook.schedule.friday.walker.name : currentUser.name),
    saturday: (dogHook.schedule.saturday.walker.name ? dogHook.schedule.saturday.walker.name : currentUser.name),
    sunday: (dogHook.schedule.sunday.walker.name ? dogHook.schedule.sunday.walker.name : currentUser.name),
  })

  const [dayTypeDropdown, setDayTypeDropdown] = useState<DropdownStateType>({
    monday: (dogHook.schedule.monday.dayType ? dogHook.schedule.monday.dayType : "Walk"),
    tuesday: (dogHook.schedule.tuesday.dayType ? dogHook.schedule.tuesday.dayType : "Walk"),
    wednesday: (dogHook.schedule.wednesday.dayType ? dogHook.schedule.wednesday.dayType : "Walk"),
    thursday: (dogHook.schedule.thursday.dayType ? dogHook.schedule.thursday.dayType : "Walk"),
    friday: (dogHook.schedule.friday.dayType ? dogHook.schedule.friday.dayType : "Walk"),
    saturday: (dogHook.schedule.saturday.dayType ? dogHook.schedule.saturday.dayType : "Walk"),
    sunday: (dogHook.schedule.sunday.dayType ? dogHook.schedule.sunday.dayType : "Walk"),
  })

  const [timesDropdown, setTimesDropdown] = useState<DropdownStateType>({
    monday: (dogHook.schedule.monday.time ? dogHook.schedule.monday.time : "6:15:00 PM"),
    tuesday: (dogHook.schedule.tuesday.time ? dogHook.schedule.tuesday.time : "6:15:00 PM"),
    wednesday: (dogHook.schedule.wednesday.time ? dogHook.schedule.wednesday.time : "6:15:00 PM"),
    thursday: (dogHook.schedule.thursday.time ? dogHook.schedule.thursday.time : "6:15:00 PM"),
    friday: (dogHook.schedule.friday.time ? dogHook.schedule.friday.time : "6:15:00 PM"),
    saturday: (dogHook.schedule.saturday.time ? dogHook.schedule.saturday.time : "6:15:00 PM"),
    sunday: (dogHook.schedule.sunday.time ? dogHook.schedule.sunday.time : "6:15:00 PM"),
  })


  useEffect(() => {
    let mounted = true
    console.log("Use Effect Called")
    // Get Current Updated User with id
    getUser(user.id).then(updatedUser => {
      if (updatedUser)
        setCurrentUser(updatedUser)

      console.log("\nUpdated user, now with name: " + user.name)
    })

    // Get Updated Dog with id
    getDog(user.id, dogHook.key).then(updatedDog => {
      if (updatedDog) {
        setDogHook(updatedDog)
        console.log("dog.weeklyNeeds.walks: " + dog.weeklyNeeds.walks)
      } else {
        console.log("Didn't get dog")
      }

      // console.log("Updated dog")
      // for (let member of dog.members) {
      //   console.log(member.name)
      // }
    })

    mounted = false
  }, [refresh] )


  const clearDogDaySchedule = (day: string) => {
    let dayData = getDayData(dogHook, day)
    const previousDayType = dayData.dayType

    dayData.walker.name = ""
    dayData.dayType = ""

    // Update Weekly Needs back
    switch (previousDayType) {
      case "Walk":
        setDogHook(prevValue => {
          prevValue.weeklyNeeds.walks = prevValue.weeklyNeeds.walks + 1
          return prevValue
        })
        dogHook.weeklyNeeds.walks = dog.weeklyNeeds.walks + 1
        break
      case "Outing":
        setDogHook(prevValue => {
          prevValue.weeklyNeeds.outings = prevValue.weeklyNeeds.outings + 1
          return prevValue
        })
        break
      case "Rest":
        setDogHook(prevValue => {
          prevValue.weeklyNeeds.rest = prevValue.weeklyNeeds.rest + 1
          return prevValue
        })
        break
    }
  }

  const findMemberByName = (name: string) => {
    let dogMemberNames: string[] = []
    for (let member of dogHook.members) {
      dogMemberNames.push(member.name)
      if (member.name === name) {
        return member
      }
    }

    console.log("No Match found between " + name + " and " + dogMemberNames)
    throw "ERROR - Name: " + name + " in dropdown does not match any existing dog.member name. \Something went very wrong internally."

  }

  // BAD FUNCTION: Currently does two things (schedule and weeklyNeeds)
  const updateDogSchedule = (day: string, previousDayType: string) => {
    let dayType = ""
    let nameToSearchFor = ""
    let dayFound = true
    let previousDogBackup = makeDogObjectCopy(dog)


    switch (day.toUpperCase()) {
      case "MONDAY":
        setDogHook(prevValue => {
          prevValue.schedule.monday.dayType = dayTypeDropdown.monday
          prevValue.schedule.monday.time = timesDropdown.monday
          nameToSearchFor = nameDropdown.monday.replace(" (You)", "")
          prevValue.schedule.monday.walker = findMemberByName(nameToSearchFor)
          return prevValue
        })

        dayType = dayTypeDropdown.monday
        console.log("nameDropdown.monday (updateDogSchedule): " + nameDropdown.monday)
        break
      case "TUESDAY":
        setDogHook(prevValue => {
          prevValue.schedule.tuesday.dayType = dayTypeDropdown.tuesday
          prevValue.schedule.tuesday.time = timesDropdown.tuesday
          nameToSearchFor = nameDropdown.tuesday.replace(" (You)", "")
          prevValue.schedule.tuesday.walker = findMemberByName(nameToSearchFor)
          return prevValue
        })

        dayType = dayTypeDropdown.tuesday
        break
      case "WEDNESDAY":
        setDogHook(prevValue => {
          prevValue.schedule.wednesday.dayType = dayTypeDropdown.wednesday
          prevValue.schedule.wednesday.time = timesDropdown.wednesday
          nameToSearchFor = nameDropdown.wednesday.replace(" (You)", "")
          prevValue.schedule.wednesday.walker = findMemberByName(nameToSearchFor)
          return prevValue
        })

        dayType = dayTypeDropdown.wednesday
        break
      case "THURSDAY":
        setDogHook(prevValue => {
          prevValue.schedule.thursday.dayType = dayTypeDropdown.thursday
          prevValue.schedule.thursday.time = timesDropdown.thursday
          nameToSearchFor = nameDropdown.thursday.replace(" (You)", "")
          prevValue.schedule.thursday.walker = findMemberByName(nameToSearchFor)
          return prevValue
        })

        dayType = dayTypeDropdown.thursday
        break
      case "FRIDAY":
        setDogHook(prevValue => {
          prevValue.schedule.friday.dayType = dayTypeDropdown.friday
          prevValue.schedule.friday.time = timesDropdown.friday
          nameToSearchFor = nameDropdown.friday.replace(" (You)", "")
          prevValue.schedule.friday.walker = findMemberByName(nameToSearchFor)
          return prevValue
        })

        dayType = dayTypeDropdown.friday
        break
      case "SATURDAY":
        setDogHook(prevValue => {
          prevValue.schedule.saturday.dayType = dayTypeDropdown.saturday
          prevValue.schedule.saturday.time = timesDropdown.saturday
          nameToSearchFor = nameDropdown.saturday.replace(" (You)", "")
          prevValue.schedule.saturday.walker = findMemberByName(nameToSearchFor)
          return prevValue
        })

        dayType = dayTypeDropdown.saturday
        break
      case "SUNDAY":
        setDogHook(prevValue => {
          prevValue.schedule.sunday.dayType = dayTypeDropdown.sunday
          prevValue.schedule.sunday.time = timesDropdown.sunday
          nameToSearchFor = nameDropdown.sunday.replace(" (You)", "")
          prevValue.schedule.sunday.walker = findMemberByName(nameToSearchFor)
          return prevValue
        })

        dayType = dayTypeDropdown.sunday
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
            setDogHook(prevValue => {
              prevValue.weeklyNeeds.walks = prevValue.weeklyNeeds.walks - 1
              return prevValue
            })
            break
          case "Outing":
            setDogHook(prevValue => {
              prevValue.weeklyNeeds.outings = prevValue.weeklyNeeds.outings - 1
              return prevValue
            })
            break
          case "Rest":
            setDogHook(prevValue => {
              prevValue.weeklyNeeds.rest = prevValue.weeklyNeeds.rest - 1
              return prevValue
            })
            break
        }
      }

      // If the dayTypes were different, then we need to add back to previousDayTypes weeklyNeeds
      if (isNewDayType) {
        switch (previousDayType) {
          case "Walk":
            setDogHook(prevValue => {
              prevValue.weeklyNeeds.walks = prevValue.weeklyNeeds.walks + 1
              return prevValue
            })
            break
          case "Outing":
            setDogHook(prevValue => {
              prevValue.weeklyNeeds.outings = prevValue.weeklyNeeds.outings + 1
              return prevValue
            })
            break
          case "Rest":
            setDogHook(prevValue => {
              prevValue.weeklyNeeds.rest = prevValue.weeklyNeeds.rest + 1
              return prevValue
            })
            break
        }
      }
    }

    // Check if day reserved messed things up
    if (dogHook.weeklyNeeds.walks < 0 || dogHook.weeklyNeeds.outings < 0 || dogHook.weeklyNeeds.rest < 0) {

      console.log("(updateDogSchedule) dog.weeklyNeeds.walks: " + dogHook.weeklyNeeds.walks)
      displayButtonAlert(
        "Hold Up",
        dayType + " days for this week have already been fulfilled. Please choose different type of day.",
        () => {},
      )

      // Restore previous dog
      setDogHook(prevValue => {
        prevValue.schedule = previousDogBackup.schedule
        prevValue.weeklyNeeds = previousDogBackup.weeklyNeeds
        return prevValue
      })

      return false
    }

    return true
  }


  const updateDogInUserCollections = () => {
    // If dog doesn't have a firstName it must be the example dog since firstName entry enforced
    if (!dogHook.firstName) {
      alert("Can't mess with the example dog silly! ")
    } else {
      for (let user of dogHook.members) {
        console.log("Updating dog's schedule with key of: " + dogHook.key + " for user: " + user.name)
        const dogRef = firebase.firestore().collection('users').doc(user.id).collection('dogs').doc(dogHook.key)
        dogRef
          .update({
              schedule: dogHook.schedule,
              weeklyNeeds: dogHook.weeklyNeeds,
          })
          .then(_doc => {
              console.log("Updated Dogs schedule and weeklyNeeds successfully")
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
      const dogDayData = getDayData(dogHook, day)
      displayButtonAlert(
        "Reserve Day",
        "You are reserving " + day + " as a " + dogDayData.dayType + " day for " + dogDayData.time,
        updateDogInUserCollections,
      )
    }

    setRefresh(!refresh)
  }

  const handleUnreserveClick = (day: string) => {
    clearDogDaySchedule(day)
    displayButtonAlert(
      "Clearing this day",
      "You are un-reserving the day: " + day,
      updateDogInUserCollections,
    )

    setRefresh(!refresh)
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
    let [defaultOption, setDefaultOption] = useState(currentUser.name + " (You)")
    const dayData = getDayData(dogHook, day)

    useEffect(() => {
      setDefaultOption(currentUser.name + " (You)")
    }, [currentUser, dogHook])

    for (let member of dog.members) {
      if (member.name === currentUser.name) {
        memberNames.push(member.name + " (You)")
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

    console.log("defaultOption: " + defaultOption)
    console.log("memberNames: " + memberNames)
    // console.log("defaultOption in SDD: " + defaultOption)
    return memberNames.includes(defaultOption) && (
      <View>
        <Dropdown refreshProp={refresh} options={memberNames} defaultOption={defaultOption} priority={2000} onChange={(newName) => { onNameChange(newName, day) }} />
        <Dropdown refreshProp={refresh} options={DAY_TYPES} defaultOption={dayData.dayType ? dayData.dayType : "Walk"} priority={1000} onChange={(newDayType) => { onDayTypeChange(newDayType, day) }} />
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
      <UnderlinedHeader>{dogName} Schedule</UnderlinedHeader>
      <Button mode={"outlined"} onPress={() => {
        displayButtonAlert(
          "Resetting Week",
          "Are you sure you want to reset the week? This will clear out the current schedule.",
          () => { handleClearDogSchedule(dogHook) },
        )
      }}>
        Reset The Week
      </Button>
      <Button mode={"contained"} onPress={() => alert("This will send out notification to other members for someone to walk dog today")}>
        Send out notification
      </Button>
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
