import { Alert } from 'react-native'
import dogConverter from '../firebase/dogConverter'
import userConverter from '../firebase/userConverter'
import { firebase } from '../firebase/config'
import { deleteUser, getUserAsync } from '../firebase/User'
import { DogObject, UserData, UserMemberData, WeeklyNeeds } from '../types'
import { getUsersFromCollection, fromCustomTypeToPureJSObject } from './AddDogFormTwoHelpers'

export const wait = (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

export function handleDeleteAccount(userId: string) {
  deleteUser(userId).then(() => {
    getAllDogsAsync().then((dogs) => {
      dogs.map((dog) => {
        // delete user from dog keys
        updateDog(dog)
      })
    })
  })
}


export function setDogWeeklyNeedsAsync(dog: DogObject, weeklyNeeds: WeeklyNeeds) {
  getUsersFromCollection().then(users => {
    users.forEach(user => {

      getDogs(user.id).then((dogs) => {
        if (dogInDogs(dog.key, dogs)) {
          var dogRef = firebase.firestore().collection("users").doc(user.id).collection("dogs").doc(dog.key)
          dogRef.update({
            weeklyNeeds: weeklyNeeds,
          }).then(() => {
            console.log("Dog weeklyNeeds updated for user: " + user.name)
          }).catch((error) => {
            console.error("(SettingsHelpers - setDogWeeklyNeedsAsync) Error:" + error)
          })
        }
      })

    })
  })
}

function _getNames(fullName: string) {
  let nameArray = fullName.split(" ")
  let firstName = ""
  let middleName = ""
  let lastName = ""

  if (nameArray[0]) {
    firstName = nameArray[0]
  }
  if (nameArray[1] && nameArray[2]) {
    middleName = nameArray[1]
    lastName = nameArray[2]
  } else if (nameArray[1]) {
    lastName = nameArray[1]
  }

  console.log("firstName: " + firstName)
  console.log("middleName: " + middleName)
  console.log("lastName: " + lastName)

  return [firstName, middleName, lastName]
}


export const saveNewDogNameToUserCollectionAsync = (newDogName: string, dog: DogObject) => {

  const [firstName, middleName, lastName] = _getNames(newDogName)

  getUsersFromCollection().then(users => {
    users.forEach(user => {

      getDogs(user.id).then((dogs) => {
        if (dogInDogs(dog.key, dogs)) {
          var dogRef = firebase.firestore().collection("users").doc(user.id).collection("dogs").doc(dog.key)
          dogRef.update({
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
          }).then(() => {
            console.log("Dog name updated for user: " + user.name)
          }).catch((error) => {
            console.error("(SettingsHelpers - saveNewDogNameToUserCollectionAsync) Error:" + error)
          })
        }
      })

    })
  })

}

export const saveNewFamilyMemberToDogAsync = async (dog: DogObject, familyMember: UserMemberData, allUsers: UserData[]) => {

  // Push family member to dog
  dog.members.push(familyMember)

  for (let user of allUsers) {
    const dogRef = firebase.firestore().collection('users').doc(user.id).collection('dogs').doc(dog.key)
    dogRef.get().then((doc) => {
      if (doc.exists && user !== undefined) {
        dogRef.update({
          members: dog.members
        }).then(() => {
          console.log("User " + user.name + " members updated: ")
          dog.members.forEach((member) => {
            console.log(member.name)
          })
        })
      } else {
        console.log("User " + user.name + " does not contain dog " + dog.firstName + ". Moving to next user.")
      }}).catch(function(error) {
        console.error("Error getting document:", error)
      })
  }
}




export const addExistingDogToUserCollectionAsync = async (user: UserData, dog: DogObject) => {
  // console.log("Before trying to update: " + JSON.stringify(user.dogs))
  if (!dog.firstName) {
    console.log("ERROR - Dog does not have first name in updateDogInCollection. \
    This should have been previously validated in input.")
    return
  }

  const dogRef = firebase.firestore().collection('users').doc(user.id).collection('dogs').doc(dog.key)
  dogRef
    .set(fromCustomTypeToPureJSObject(dog))
    .then(() => {
      console.log("User " + user.name + " should now have another dog w/ id/key:" + dog.key)
    })
    .catch((error) => {
        alert(error)
    })
}

export const dogInDogs = (keyOfDogToFind: string, dogs: DogObject[]) => {
  let returnValue = false
  dogs.forEach(dog => {
    if (dog.key === keyOfDogToFind)
      returnValue = true
  })

  return returnValue
}


export const removeMemberFromDogFamily = (dog: DogObject, userToRemove: UserData) => {
  if (!dog.key || !userToRemove.id) {
    console.error("(removeMemberFromDogFamily) Error: ids are needed to remove member from dog family")
    return
  }

  console.log("\nMembers before removeMemberFromDogFamily: ")
  dog.members.forEach((member) => {
    console.log(member.name)
  })

  // do the removal
  dog.members = dog.members.filter((member) => {
    if (member.id !== userToRemove.id) {
      return member
    }
  })

  console.log("\nMembers after removeMemberFromDogFamily: ")
  dog.members.forEach((member) => {
    console.log(member.name)
  })

  getUsersFromCollection().then(users => {
    users.forEach(user => {
      getDogs(user.id).then((dogs) => {
        if (dogInDogs(dog.key, dogs)) {
          var dogRef = firebase.firestore().collection("users").doc(user.id).collection("dogs").doc(dog.key)
          dogRef.update({
            members: dog.members // update collection w/ removed members
          }).then(() => {
            console.log("User " + userToRemove.name + " removed from " + dog.firstName + " (" + user.name+ "'s dogs)")
          }).catch((error) => {
            console.error("(SettingsHelpers - removeMemberFromDogFamily) Error:" + error)
          })
        } else {
          console.log("\ndog: " + dog.firstName + " not included in ->")
          for (let d of dogs) {
            console.log(d.firstName)
          }
        }
      })
    })
  })
}


export const removeDogFromUser = (dogToRemove: DogObject, userToRemoveFrom: UserData) => {
  if (!dogToRemove.key || !userToRemoveFrom.id) {
    console.error("(removeDogFromUser) Error: ids are needed to remove dog from user")
    return
  }

  var dogRef = firebase.firestore().collection("users").doc(userToRemoveFrom.id).collection("dogs")
  dogRef.doc(dogToRemove.key).delete()
    .then(() => {
      console.log(dogToRemove.firstName + " deleted from " + userToRemoveFrom.name + "!")
    })
    .catch((error) => {
      console.log("(SettingsHelpers - removeDogFromUser) Error: " + error)
    })
}


export const saveEmailToUserCollection = (email: string, userFromAuth: firebase.User, user: UserData) => {
  console.log("(saveEmailToUserCollection) email: " + email)

  // Update Authentication Email
  if (userFromAuth) {
    userFromAuth.updateEmail(email).then(function() {

      // Update Firestore Email
      if (user) {
        let userRef = firebase.firestore().collection("users").doc(user.id)
          userRef.update({
            email: email,
          })
          .then(() => {
            alert("Sucessfully updated Email to: " + email)
          })
          .catch((error) => {
            alert("(SettingsHelpers - saveEmailToUserCollection) Error updating user's email in Firestore: " + error)
            console.error("(SettingsHelpers - saveEmailToUserCollection) Error updating user's email in Firestore: ", error)
          })
      }

    }).catch(function(error) {
      alert("(SettingsHelpers - saveEmailToUserCollection) Error updating user's email in Auth: " + error)
      console.error("(SettingsHelpers - saveEmailToUserCollection) Error updating user's email in Auth: ", error)
    })
  } else {
    throw "(SettingsHelpers - saveEmailToUserCollection) User Was Not Found in authentication."
  }
}


export const savePhoneNumberToUserCollection = (phoneNumber: string, user: UserData) => {
  console.log("(savePhoneNumberToUserCollection) number: " + phoneNumber)

  if (user) {
    let userRef = firebase.firestore().collection("users").doc(user.id)
      userRef.update({
        phoneNumber: phoneNumber,
      })
      .then(() => {
        alert("Sucessfully updated phone number to: " + phoneNumber)
      })
      .catch((error) => {
        alert("(SettingsHelpers - savePhoneNumberToUserCollection) Error updating user's phoneNumber in Firestore: " + error)
        console.error("(SettingsHelpers - savePhoneNumberToUserCollection) Error updating user's phoneNumber in Firestore: ", error)
      })
  }
  else {
    console.log("(SettingsHelpers - savePhoneNumberToUserCollection) Error: user is null")
  }
}

export const handleUserNameChange = (newName: string, user: UserData) => {
    _saveNameToUserCollection(newName, user)
    _getDogKeysFromUserData(user).then((currentUserDogKeys) => {
      _saveNewNameToOtherUserDogs(newName, user, currentUserDogKeys)
    })
}

const _getDogKeysFromUserData = async (user: UserData) => {
  // Get Keys of all dogs have by current User
  let currentUserDogKeys: string[] = []
  let dogRef = firebase.firestore().collection("users").doc(user.id).collection("dogs").withConverter(dogConverter)
  return dogRef.get().then((docs) => {
    docs.forEach((doc) => {
      let dog = doc.data()
      currentUserDogKeys.push(dog.key)
    })

    return currentUserDogKeys
  })
}

const _saveNewNameToOtherUserDogs = (name: string, user: UserData, currentUserDogKeys: string[]) => {
  // Save name for all dogs which have user
  // (this includes other user's dogs)
  let currentUser = user
  getUsersFromCollection().then((users) => {
    for (let thisUser of users) {
      for (let key of currentUserDogKeys) {
        let thisUserDogRef = firebase.firestore().collection("users").doc(thisUser.id).collection("dogs").doc(key).withConverter(dogConverter)
        thisUserDogRef.get().then(doc => {
          if (doc.exists) {

            // Change user's name for this dog
            let dog = doc.data()
            if (dog) {
              for (let member of dog.members) {
                if (member.id === currentUser.id) {
                  member.name = name
                }
              }

              // Update Dog to Collection
              let specificDogRef = firebase.firestore().collection("users").doc(thisUser.id).collection("dogs").doc(key).withConverter(dogConverter)
              specificDogRef.update({
                members: dog.members
              })
            }
          }
        })

      }
    }
  })
}

const _saveNameToUserCollection = (name: string, user: UserData) => {
  console.log("(saveNameToUserCollection) name: " + name)
  // Save name for users
  let userRef = firebase.firestore().collection("users").doc(user.id)
    userRef.update({
      name: name,
    })
    .then(() => {
      alert("Your New Name has been succesfully saved to: " + name)
    })
    .catch((error) => {
      alert("(SettingsHelpers - saveNameToUserCollection) Error updating user's Name in Firestore: " + error)
      console.error("(SettingsHelpers - saveNameToUserCollection) Error updating user's Name in Firestore: ", error)
    })

}

export const reauthenticateUser = async (userFromAuth: firebase.User, password: string) => {
  let email = userFromAuth.email
  let successStatus: boolean

  if (email) {
    let credentials = firebase.auth.EmailAuthProvider.credential(email, password)
    return userFromAuth.reauthenticateWithCredential(credentials).then(function() {
        console.log("User Reauthenticated!")
        successStatus = true
        return successStatus
      }).catch(function(error) {
        console.error("(SettingsHelpers - reauthenticateUser) Error w/reauthenticateWithCredential: ", error)
        successStatus = false
        return successStatus
      })
  }

  console.log("(SettingsHelpers - reauthenticateUser) Error w/email: userFromAuth doesn't seem to have email")
  successStatus = false
  return successStatus
}




export function getDogWithKeyFromArray(key: string, dogs: DogObject[]) {
  return dogs.find(dog => dog.key === key)
}


export async function getUser(userId: string) {
  if (!userId) {
    console.error("(getUser) Error: ids are needed to getUser")
    return {} as UserData
  }

  var userRef = firebase.firestore().collection('users').doc(userId).withConverter(userConverter)
  let emptyUser = {} as UserData

  return userRef.get().then(function(doc) {
    let user = doc.data()
    if (doc.exists && user !== undefined) {
      return doc.data()
    } else {
      console.log("(SettingsHelpers - getUser) Error: user with id: " + userId + " not found or undefined")
      return emptyUser
    }}).catch(function(error) {
      console.error("Error getting document:", error)
      return emptyUser
    })
}


export async function getDogs(userId: string) {
  if (!userId) {
    console.error("(getDogs) Error: ids are needed to getDogs")
    return []
  }

  var dogRef = firebase.firestore().collection('users').doc(userId).collection('dogs').withConverter(dogConverter)
  let dogs: DogObject[] = []
  let dogData: DogObject

  return dogRef.get().then((querySnapshot) => {
    querySnapshot.forEach(doc => {
      dogData = doc.data()
      dogs.push(dogData)
    })
    return dogs
  })

}

export async function getDog(userId: string, dogId: string) {
  if (!userId || !dogId) {
    console.error("(getDog) Error: ids are needed to getDog")
    return {} as DogObject
  }

  var dogRef = firebase.firestore().collection('users').doc(userId).collection('dogs').doc(dogId).withConverter(dogConverter)

  let emptyDog = {} as DogObject

  return dogRef.get().then(function(doc) {
    let dog = doc.data()
    if (doc.exists && dog !== undefined) {
      return dog
    } else {
      console.log("(SettingsHelpers - getDog) Error: dog with id: " + dogId + " not found or undefined")
      return emptyDog
    }}).catch(function(error) {
      console.error("Error getting document:", error)
      return emptyDog
    })
}


export const displayButtonAlert = (title: string, message: string, onPressFunction: () => void) => {
  return Alert.alert(
      title,
      message,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => onPressFunction() }
      ],
      { cancelable: true }
    )
}
