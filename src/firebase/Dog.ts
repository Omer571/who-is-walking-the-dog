import dogConverter from './dogConverter'
import { firebase } from '../firebase/config'
import { DogData } from '../types'

// Create

export async function createDogAsync(dog: DogData): Promise<boolean> {
  if (!dog.firstName) {
    console.error("(createDog) Error: Dog does not have firstName")
    return false
  }

  const dogRef = firebase.firestore().collection('dogs')

  return dogRef.add({
      firstName: dog.firstName,
      middleName: dog.middleName,
      lastName: dog.lastName,
      id: dog.id,
      userIds: dog.userIds,
      schedule: dog.schedule,
      weeklyNeeds: dog.weeklyNeeds,
      thisWeeksNeeds: dog.thisWeeksNeeds
    })
    .then(() => {
      return true
    })
    .catch((error) => {
      alert("Couldn't create Dog -> " + error)
      console.error(error)
      return false
    })
}

// Read

export async function getDogAsync(dogId: string): Promise<DogData> {
  if (!dogId) {
    console.error("(getDog) Error: ids are needed to getDog")
    return {} as DogData
  }

  var dogRef = firebase.firestore().collection('dogs').doc(dogId).withConverter(dogConverter)
  let emptyDog = {} as DogData

  return dogRef.get().then(function(doc) {
    let dog = doc.data()
    if (doc.exists && dog !== undefined) {
      return dog
    } else {
      console.error("(getDog) Error: Dog with id: " + dogId + " not found or undefined")
      return emptyDog
    }}).catch(function(error) {
      console.error("Error getting document -> ", error)
      return emptyDog
    })
}

export async function getAllDogsAsync(): Promise<DogData[]> {
  const dogs: DogData[] = []
  var dogRef = firebase.firestore().collection("dogs").withConverter(dogConverter)
  return dogRef.get().then((docs) => {
    docs.forEach((doc) => {
      let dog = doc.data()
      dogs.push(dog)
    })
    return dogs
  }).catch(function(error) {
    console.error("Error getting document -> ", error)
    return []
  })
}

// Update

export async function updateDog(dog: DogData): Promise<DogData> {
  if (!dog.id) {
    console.error("(updateDog) Error: ids are needed to updateDog")
    return {} as DogData
  }

  var dogRef = firebase.firestore().collection('dogs').doc(dog.id).withConverter(dogConverter)

  return dogRef.update({
    firstName: dog.firstName,
    middleName: dog.middleName,
    lastName: dog.lastName,
    id: dog.id,
    userIds: dog.userIds,
    schedule: dog.schedule,
    weeklyNeeds: dog.weeklyNeeds,
    thisWeeksNeeds: dog.thisWeeksNeeds
  }).then(() => {
    return dog
  }).catch((error) => {
    throw error
  })
}

// Delete

export async function deleteDog(dogId: string): Promise<boolean> {

  let dogRef = firebase.firestore().collection("dogs").doc(dogId)
  return dogRef.delete().then(() => {
    console.log("Dog successfully deleted from Firestore!")
    return true
  }).catch((error) => {
    console.error("(deleteDog) Error removing user from Firestore: ", error)
    return false
  })

}
