import { DogSchedule, DogData, DayInfo, UserData } from '../types'

const defaultDayInfo: DayInfo = {
  walkerId: "",
  time: "06:15:00 PM",
  dayType: "",
}

const defaultDogSchedule: DogSchedule = {
  monday: defaultDayInfo,
  tuesday: defaultDayInfo,
  wednesday: defaultDayInfo,
  thursday: defaultDayInfo,
  friday: defaultDayInfo,
  saturday: defaultDayInfo,
  sunday: defaultDayInfo,
}

const emptyDogObject: DogData = {
  firstName: "",
  middleName: "",
  lastName: "",
  userIds: ["-1", "-2"],
  schedule: defaultDogSchedule,
  id: '-9999',
  weeklyNeeds: {
    walks: 3,
    outings: 3,
    rest: 1,
  },
  thisWeeksNeeds: {
    walks: 3,
    outings: 3,
    rest: 1,
  }
}

export default emptyDogObject
