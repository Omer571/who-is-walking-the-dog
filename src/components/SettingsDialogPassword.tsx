import React, { useState } from 'react'
import Dialog from "react-native-dialog"

type Props = {
  showDialog: boolean,
  onPasswordSubmit: (password: string) => void,
  closeAllDialogs: () => void
}

const wait = (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

export const SettingsDialogPassword = ({ showDialog, onPasswordSubmit, closeAllDialogs }: Props) => {

  const [password, setPassword] = useState<string>("")

  const handleCloseDialog = () => {
    closeAllDialogs()
  }


  const handleSubmit = () => {
    handleCloseDialog()
    wait(1000).then(() => {
      console.log("password: " + password)
      onPasswordSubmit(password)
    })
  }

  return (
    <Dialog.Container visible={showDialog} onBackdropPress={closeAllDialogs}>
      <Dialog.Title>Password Confirmation</Dialog.Title>
      <Dialog.Input
         onChangeText={(password: string) => setPassword(password)}
         value={password}
      >
      </Dialog.Input>
      <Dialog.Button label="Cancel" onPress={handleCloseDialog} />
      <Dialog.Button label="Submit" onPress={() => {
        // Password Validation handled by Firebase in SettingsHelpers - deleteAccountFromUserCollection()
        handleSubmit()
      }} />
    </Dialog.Container>
  )
}

export default SettingsDialogPassword
