import { TypeDay, DogSchedule, DogObject } from './types'

const defaultDay: TypeDay = {
  walkDay: false,
  restDay: false,
  parkDay: false,
}

const defaultDogSchedule: DogSchedule = {
  monday: {
    walkerName: "",
    time: "",
    dayType: defaultDay,
  },
  tuesday: {
    walkerName: "",
    time: "",
    dayType: defaultDay,
  },
  wednesday: {
    walkerName: "",
    time: "",
    dayType: defaultDay,
  },
  thursday: {
    walkerName: "",
    time: "",
    dayType: defaultDay,
  },
  friday: {
    walkerName: "",
    time: "",
    dayType: defaultDay,
  },
  saturday: {
    walkerName: "",
    time: "",
    dayType: defaultDay,
  },
  sunday: {
    walkerName: "",
    time: "",
    dayType: defaultDay,
  },
}

const emptyDogObject: DogObject = {
  firstName: "",
  middleName: "",
  lastName: "",
  members: [{dataKey: '-1', phoneNumber: "", name: ""}],
  schedule: defaultDogSchedule,
  key: '-9999',
}

export default emptyDogObject
