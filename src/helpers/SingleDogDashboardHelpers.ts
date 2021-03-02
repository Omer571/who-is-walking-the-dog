import moment from 'moment'
import emptyDogObject from './emptyDogObject'
import { firebase } from '../firebase/config'
import { DogObject, DayInfo, DropdownStateType, WeeklyNeeds } from '../types'
import { setDogWeeklyNeedsAsync } from '../helpers/SettingsHelpers'


export function clearDogScheduleInCollection(dog: DogObject, userId: string) {
  if (dog.schedule) {
    dog.schedule = {...emptyDogObject.schedule} // change local copy

    const dogRef = firebase.firestore().collection('users').doc(userId).collection('dogs').doc(dog.key)
    return dogRef
      .update({
          schedule: dog.schedule, // change collection copy
      })
      .then(_doc => {
          // return makeDogObjectCopy(dog)
          _resetWeeklyNeeds(dog)
          return dog
      })
      .catch((error) => {
          throw "error in updateDogInUserCollections: " + error
      })

  }
}

const _resetWeeklyNeeds = async (dog: DogObject) => {
  // Default, the original weeklyNeeds need to be saved later and referenced here
  // For now we will just set it to this
  let defaultWeeklyNeeds = {} as WeeklyNeeds
  defaultWeeklyNeeds.outings = 2
  defaultWeeklyNeeds.rest = 2
  defaultWeeklyNeeds.walks = 3

  // local dog
  dog.weeklyNeeds = defaultWeeklyNeeds

  // collection dog
  setDogWeeklyNeedsAsync(dog, defaultWeeklyNeeds)
}


export const makeDogObjectCopy = (objectToCopy: DogObject) => ({ ...objectToCopy })

export function setStringDayData(object: DropdownStateType, day: string, newValue: string) {
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

export function getDayData(dog: DogObject, day: string) {
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

const _convertTime12to24 = (time12: string) => {
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


export const convertTwelveHourStringTimeToDate = (time12: string) => {
  // Ensure Format
  if (!ensureTwelveHourFormat(time12))
    throw "Error: Format for 12 Hour time is wrong in convertTwelveHourStringTimeToDate: " + time12

  const time24 = _convertTime12to24(time12)
  const defaultDay = "2020-01-01"

  // console.log(defaultDay + " " + time24)
  const momentDate = moment(defaultDay + " " + time24)
  return momentDate.toDate()
}

function ensureTwelveHourFormat(time: string): boolean  {
  let validTimeFormat = true
  let charPlace = 0
  let numberPlaces = [0, 1, 3, 4, 6, 7]
  let colonPlaces = [2, 5]

  for (let i = 0; i < time.length; i++) {

    let char = time.charAt(charPlace)

    if (numberPlaces.includes(charPlace)) {
      // console.log(char + " @" + charPlace)
      if (!_isDigit(char)) {
        validTimeFormat = false
        break
      }
    } else if (colonPlaces.includes(charPlace)) {
      // console.log(char + " @" + charPlace)
      if (char !== ":") {
        validTimeFormat = false
        break
      }
    }

    charPlace++
  }

  if (validTimeFormat) {
    let timeEnding = time.slice(-2)
    // console.log(timeEnding)
    if (timeEnding !== "PM" && timeEnding !== "AM") {
      validTimeFormat = false
    }
  }

  return validTimeFormat
}

const _isDigit = (char: string) => {
  if (char >= '0' && char <= '9')
    return true

  return false
}

// console.log("Test 1 should be true: " + ensureTwelveHourFormat("11:16:00 PM"))
// console.log("Test 2 should be true: " + ensureTwelveHourFormat("11:16:00 AM"))
// console.log("Test 3 should be false: " + ensureTwelveHourFormat("1:16:00 AM")) // false case
