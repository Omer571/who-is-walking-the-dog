import React from 'react'
import { DogObject, UserData, DayInfo } from '../types'
import DogCard from '../components/DogCard'
import emptyDogObject from '../helpers/emptyDogObject'

function _getMemberNames(dog: DogObject) {
  const memberNames = dog.members.map((member: any) => {
    return member.name
  })

  return memberNames
}

export function createDogCard(dog: DogObject, user: UserData) {
  const theseMemberNames = _getMemberNames(dog)
  return <DogCard dog={dog} user={user} cardKey={dog.key} key={dog.key} dogName={dog.firstName} members={theseMemberNames} />;
}

export function createDefaultDogCard(user: UserData) {
  const defaultDog = emptyDogObject
  const defaultDogCard = <DogCard dog={defaultDog} user={user} cardKey='1' key='1' dogName="Example" members={["mom", "dad"]} />
  return defaultDogCard
}

export const wait = (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}


export function getDayData(dog: DogObject, day: number) {
  let dayData = {} as DayInfo
  switch (day) {
    case 2:
      dayData = dog.schedule.monday
      break
    case 3:
      dayData = dog.schedule.tuesday
      break
    case 4:
      dayData = dog.schedule.wednesday
      break
    case 5:
      dayData = dog.schedule.thursday
      break
    case 6:
      dayData = dog.schedule.friday
      break
    case 7:
      dayData = dog.schedule.saturday
      break
    case 1:
      dayData = dog.schedule.sunday
      break
    default:
      throw Error("getDayData: day passed was not a day of the week\ndayData.time ")
  }
  return dayData
}
