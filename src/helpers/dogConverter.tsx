import { DogObject, UserMemberData, DogSchedule, WeeklyNeeds } from '../types'

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
var dogConverter = {
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
        let dog: any
        if (data.dog)
          dog = data.dog
        else
          dog = data

        // console.log("data: " + JSON.stringify(data))
        // console.log(dog.firstName + " " + dog.middleName + " " + dog.lastName + " " + dog.members + " " + dog.schedule+ " " + dog.key + " " + dog.weeklyNeeds)
        return new Dog(
          dog.firstName,
          dog.middleName,
          dog.lastName,
          dog.members,
          dog.schedule,
          dog.key,
          dog.weeklyNeeds,
        )
    }
}

export default dogConverter
