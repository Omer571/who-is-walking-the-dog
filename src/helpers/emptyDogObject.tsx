import { DogSchedule, DogObject } from '../types'

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

const emptyDogObject: DogObject = {
  firstName: "",
  middleName: "",
  lastName: "",
  members: [{dataKey: '-1', phoneNumber: "", name: "Jimmy"}, {dataKey: '-2', phoneNumber: "", name: "Leeah"}],
  schedule: defaultDogSchedule,
  key: '-9999',
  weeklyNeeds: {
    walks: 3,
    outings: 3,
    rest: 1,
  }
}

export default emptyDogObject
