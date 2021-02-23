import React, {useState} from 'react'
import Dialog from "react-native-dialog"
import userConverter from '../helpers/userConverter'
import { emailValidator } from '../core/utils'
import { firebase } from '../firebase/config'
import { UserData } from '../types'

const wait = (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

type Props = {
  user: UserData,
  userFromAuth: firebase.User | undefined,
  showDialog: boolean,
  onSubmit: (email: string, userFromAuth: firebase.User, user: UserData) => void,
  closeAllDialogs: () => void,
}

const getAllUserEmailsAsync = async () => {
  let emails: string[] = []
  let userData: UserData
  let userRef = firebase.firestore().collection("users").withConverter(userConverter)

  return userRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      userData = doc.data()
      emails.push(userData.email)
    })

    return emails
  })

}

export const SettingsDialogEmail = ({ userFromAuth, user, showDialog, onSubmit, closeAllDialogs }: Props) => {

	const [newEmailValue, setNewEmailValue] = useState("")

  const handleCloseDialog = () => {
    closeAllDialogs()
  }

  const isEmailDuplicate = async (email: string) => {

    let allUserEmails = await getAllUserEmailsAsync()

    if (allUserEmails.includes(email))
      return true
    else
      return false
  }

  const handleSubmit = () => {
    handleCloseDialog()
    if (userFromAuth) {
      wait(1000).then(() => {
        onSubmit(newEmailValue, userFromAuth, user)
      })
    }
    else {
      wait(1000).then(() => {
        alert("(SettingsDialogEmail - handleSubmit)Can't update email if userFromAuth doesn't exist!")
      })
    }

  }

  return (
    <Dialog.Container visible={showDialog} onBackdropPress={closeAllDialogs}>
      <Dialog.Title>Email Change</Dialog.Title>
      <Dialog.Input
         onChangeText={(email: string) => setNewEmailValue(email)}
         value={newEmailValue}
      >
      </Dialog.Input>
      <Dialog.Description>
        Enter Your New Email
      </Dialog.Description>
      <Dialog.Button label="Cancel" onPress={handleCloseDialog} />
      <Dialog.Button label="Submit" onPress={() => {
        const emailValidatorMessage = emailValidator(newEmailValue)

        isEmailDuplicate(newEmailValue).then((isEmailAlreadyTaken) => {
          if (emailValidatorMessage) {
            alert("Problem with Email: " + emailValidatorMessage)
          } else if (isEmailAlreadyTaken) {
            alert("Problem with Email: " + "Email Already in Use")
          } else {
            handleSubmit()
          }
        })


      }} />
    </Dialog.Container>
  )
}

export default SettingsDialogEmail
