import { DogObject, UserMemberData, DogSchedule, WeeklyNeeds } from './types'

class Dog {
  firstName: string
  middleName: string
  lastName: string
  members: Array<UserMemberData>
  schedule: DogSchedule
  key: string
  weeklyNeeds: WeeklyNeeds

    constructor (
      firstName: string,
      middleName: string,
      lastName: string,
      members: Array<UserMemberData>,
      schedule: DogSchedule,
      key: string,
      weeklyNeeds: WeeklyNeeds
    ) {
        this.firstName = firstName
        this.middleName = middleName
        this.lastName = lastName
        this.members = members
        this.schedule = schedule
        this.key = key
        this.weeklyNeeds = weeklyNeeds
    }
    toString() {
        return this.firstName + ', ' + this.middleName + ', ' + this.lastName + ', ' + this.key
    }
}

// Firestore data converter
export var dogConverter = {
    toFirestore: function(dog: DogObject) {
        return {
          firstName: dog.firstName,
          middleName: dog.middleName,
          lastName: dog.lastName,
          members: dog.members,
          schedule: dog.schedule,
          key: dog.key,
          weeklyNeeds: dog.weeklyNeeds
            }
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options)
        return new Dog(
          data.firstName,
          data.middleName,
          data.lastName,
          data.members,
          data.schedule,
          data.key,
          data.weeklyNeeds,
        )
    }
}
