import { DogData, DogSchedule, WeeklyNeeds } from '../types'


class Dog {
  firstName: string
  middleName: string
  lastName: string
  userIds: string[]
  schedule: DogSchedule
  id: string
  weeklyNeeds: WeeklyNeeds
  thisWeeksNeeds: WeeklyNeeds

    constructor (
      firstName: string,
      middleName: string,
      lastName: string,
      usersIds: string[],
      schedule: DogSchedule,
      id: string,
      weeklyNeeds: WeeklyNeeds,
      thisWeeksNeeds: WeeklyNeeds
    ) {
        this.firstName = firstName
        this.middleName = middleName
        this.lastName = lastName
        this.userIds = usersIds
        this.schedule = schedule
        this.id = id
        this.weeklyNeeds = weeklyNeeds
        this.thisWeeksNeeds = thisWeeksNeeds
    }
    toString() {
        return this.firstName + ', ' + this.middleName + ', ' + this.lastName + ', ' + this.id
    }
}

// Firestore data converter
var dogConverter = {
    toFirestore: function(dog: DogData) {
        return {
          firstName: dog.firstName,
          middleName: dog.middleName,
          lastName: dog.lastName,
          userIds: dog.userIds,
          schedule: dog.schedule,
          id: dog.id,
          weeklyNeeds: dog.weeklyNeeds,
          thisWeeksNeeds: dog.thisWeeksNeeds
            }
    },
    fromFirestore: function(snapshot: any, options: any){
        const data = snapshot.data(options)
        let dog: any
        if (data.dog)
          dog = data.dog
        else
          dog = data

        return new Dog(
          dog.firstName,
          dog.middleName,
          dog.lastName,
          dog.userIds,
          dog.schedule,
          dog.id,
          dog.weeklyNeeds,
          dog.thisWeeksNeeds,
        )
    }
}

export default dogConverter
