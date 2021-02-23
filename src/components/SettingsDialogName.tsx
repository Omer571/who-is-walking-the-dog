import React, { useState } from 'react'
import Dialog from "react-native-dialog"
import { nameValidator } from '../core/utils'
import { UserData } from '../types'

type Props = {
  user: UserData,
  showDialog: boolean,
  onSubmit: (name: string, user: UserData) => void,
  closeAllDialogs: () => void,
}

const wait = (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

const SettingsDialogName = ({ user, showDialog, onSubmit, closeAllDialogs }: Props) => {
  const [newNameValue, setNewNameValue] = useState("")

  const handleCloseDialog = () => {
    closeAllDialogs()
  }


  const handleSubmit = () => {
    handleCloseDialog()
    wait(1000).then(() => {
      onSubmit(newNameValue, user) // alert in onSubmit function
    })
  }

  return (
    <Dialog.Container visible={showDialog} onBackdropPress={closeAllDialogs}>
      <Dialog.Title>Name Change</Dialog.Title>
      <Dialog.Input
         onChangeText={(name: string) => setNewNameValue(() => {

           return name
         })}
         value={newNameValue}
      >
      </Dialog.Input>
      <Dialog.Description>
        Enter Your New Name
      </Dialog.Description>
      <Dialog.Button label="Cancel" onPress={handleCloseDialog} />
      <Dialog.Button label="Submit" onPress={() => {
        const invalidNameMessage = nameValidator(newNameValue)
        if (invalidNameMessage)
          alert(invalidNameMessage)
        else
          handleSubmit()
      }} />
    </Dialog.Container>
  )
}

export default SettingsDialogName
