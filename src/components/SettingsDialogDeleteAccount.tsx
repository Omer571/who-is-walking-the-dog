import React from 'react'
import { Alert } from 'react-native'
import Dialog from "react-native-dialog"
import { useNavigation } from '@react-navigation/native'
import { UserData } from '../types'

const displayButtonAlert = (title: string, message: string, onPressFunction: () => void) => {
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

type Props = {
  user: UserData,
  userFromAuth: firebase.User | undefined,
  showDialog: boolean,
  onDeleteConfirmed: (userFromAuth: firebase.User, user: UserData) => void,
  closeAllDialogs: () => void
}

const wait = (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

export const SettingsDialogDeleteAccount = ({ userFromAuth, user, showDialog, onDeleteConfirmed, closeAllDialogs }: Props) => {

  const navigation = useNavigation()

  const handleCloseDialog = () => {
    closeAllDialogs()
  }

  const logout = () => {
    navigation.navigate('HomeScreen')
  }

  const handleAccountDelete = () => {
    if (userFromAuth) {
      handleCloseDialog()
      wait(1000).then(() => {
        console.log("DELETING USER: " + JSON.stringify(userFromAuth))
        onDeleteConfirmed(userFromAuth, user)
      })
      wait(2000).then(() => {
        logout()
      })
    } else {
      console.log("(SettingsDialogDeleteAccount - handleAccountDelete) Can't delete account if userFromAuth undefined")
    }

  }

  return (
    <Dialog.Container visible={showDialog} onBackdropPress={closeAllDialogs}>
      <Dialog.Title>Delete Account Confirmation</Dialog.Title>
      <Dialog.Description>
        You are about to delete your account. This action is NON-REVERSABLE.
      </Dialog.Description>
      <Dialog.Button label="Cancel" onPress={handleCloseDialog} />
      <Dialog.Button label="DELETE" onPress={() => {
        displayButtonAlert(
          "CONFIRM DELETE",
          "You are about to delete your whole account\n" + userFromAuth?.email,
          () => { handleAccountDelete() }
        )
      }} />
    </Dialog.Container>
  )
}

export default SettingsDialogDeleteAccount
