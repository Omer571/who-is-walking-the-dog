import { UserData } from '../types'

class User {
  id: string
  email: string
  name: string
  phoneNumber: string
  dogIds: string[]
  push_token: string
  notificationsOn: boolean

    constructor (
      id: string,
      email: string,
      name: string,
      phoneNumber: string,
      dogIds: string[],
      push_token: string,
      notificationsOn: boolean,
    ) {
        this.id = id
        this.email = email
        this.name = name
        this.phoneNumber = phoneNumber
        this.dogIds = dogIds
        this.push_token = push_token
        this.notificationsOn = notificationsOn
    }
    toString() {
        return this.name + ', ' + this.id
    }
}

// Firestore data converter
var userConverter = {
    toFirestore: function(user: UserData) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phoneNumber: user.phoneNumber,
            dogIds: user.dogIds,
            push_token: user.push_token,
            notificationsOn: user.notificationsOn,
            }
    },
    fromFirestore: function(snapshot: any, options: any){
        const data = snapshot.data(options)
        return new User(
          data.id,
          data.email,
          data.name,
          data.phoneNumber,
          data.dogIds,
          data.push_token,
          data.notificationsOn
        )
    }
}

export default userConverter
