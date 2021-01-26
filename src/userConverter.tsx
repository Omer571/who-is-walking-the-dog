import { UserData, DogObject } from './types'

class User {
  id: string
  email: string
  name: string
  phoneNumber: string
  dogs: DogObject[]
  push_token: string

    constructor (id: string, email: string, name: string, phoneNumber: string, dogs: DogObject[], token: string) {
        this.id = id
        this.email = email
        this.name = name
        this.phoneNumber = phoneNumber
        this.dogs = dogs
        this.push_token = token
    }
    toString() {
        return this.name + ', ' + this.id
    }
}

// Firestore data converter
export var userConverter = {
    toFirestore: function(user: UserData) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phoneNumber: user.phoneNumber,
            dogs: user.dogs,
            push_token: user.push_token,
            }
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options)
        return new User(data.id, data.email, data.name, data.phoneNumber, data.dogs, data.push_token)
    }
}
