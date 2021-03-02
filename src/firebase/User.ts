import userConverter from './userConverter'
import { firebase } from '../firebase/config'
import { UserData } from '../types'

// Create
// Create Handled in Register Screen

// Read
export async function getUserAsync(userId: string): Promise<UserData> {
  if (!userId) {
    console.error("(getUser) Error: ids are needed to getUser")
    return {} as UserData
  }

  var userRef = firebase.firestore().collection('users').doc(userId).withConverter(userConverter)
  let emptyUser = {} as UserData

  return userRef.get().then(function(doc) {
    let user = doc.data()
    if (doc.exists && user !== undefined) {
      return user
    } else {
      console.error("(SettingsHelpers - getUser) Error: user with id: " + userId + " not found or undefined")
      return emptyUser
    }}).catch(function(error) {
      console.error("Error getting document:", error)
      return emptyUser
    })
}


export async function getAllUsersAsync(): Promise<UserData[]> {
  const users: UserData[] = []
  var userRef = firebase.firestore().collection("users").withConverter(userConverter)
  await userRef.get().then((docs) => {
    docs.forEach((doc) => {
      let user = doc.data()
      users.push(user)
    })
  }).catch(function(error) {
    console.error("Error getting document:", error)
    return []
  })

  return users

}


// Update

export async function updateUser(user: UserData) {
  if (!user.id) {
    console.error("(updateUser) Error: ids are needed to updateUser")
    return {} as UserData
  }

  var userRef = firebase.firestore().collection('users').doc(user.id).withConverter(userConverter)

  return userRef.update({
    id: user.id,
    email: user.email,
    name: user.name,
    phoneNumber: user.phoneNumber,
    dogIds: user.dogIds,
    push_token: user.push_token,
    notificationsOn: user.notificationsOn,
  }).then(() => {
    return user
  }).catch((error) => {
    throw error
  })
}


// Delete

export async function deleteUser(userId: string): Promise<boolean> {
  let currentUserFromAuth = firebase.auth().currentUser

  if (currentUserFromAuth) {
    return currentUserFromAuth.delete().then(async function() {

      let userRef = firebase.firestore().collection("users").doc(userId)
      return userRef.delete().then(() => {
        console.log("User successfully deleted from Firestore!")
        return true
      }).catch((error) => {
        console.error("(deleteUser) Error removing user from Firestore: ", error)
        return false
      })

    }).catch(function(error) {
      console.error("(deleteUser) Error deleting user from Auth: ", error)
      return false
    })

  } else {
    console.error("(deleteUser) Can't delete when userFromAuth undefined")
    return false
  }

}
