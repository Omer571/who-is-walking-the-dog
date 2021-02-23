import React, { useState } from 'react'
import Dialog from "react-native-dialog"
import { nameValidator } from '../core/utils'
import { DogObject } from '../types'

type Props = {
  dog: DogObject,
  showDialog: boolean,
  onSubmit: (name: string, dog: DogObject) => void,
  closeAllDialogs: () => void,
}

const wait = (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

const SettingsDialogDogName = ({ dog, showDialog, onSubmit, closeAllDialogs }: Props) => {
  const [newNameValue, setNewNameValue] = useState("")

  const _handleCloseDialog = () => {
    closeAllDialogs()
  }


  const _handleSubmit = () => {
    _handleCloseDialog()
    wait(1000).then(() => {
      onSubmit(newNameValue, dog)
    })
  }

  return (
    <Dialog.Container visible={showDialog} onBackdropPress={closeAllDialogs}>
      <Dialog.Title>Dog Name Change</Dialog.Title>
      <Dialog.Input
         onChangeText={(name: string) => setNewNameValue(() => {

           return name
         })}
         value={newNameValue}
      >
      </Dialog.Input>
      <Dialog.Description>
        Enter New Dog Full Name
      </Dialog.Description>
      <Dialog.Button label="Cancel" onPress={_handleCloseDialog} />
      <Dialog.Button label="Submit" onPress={() => {
        const invalidNameMessage = nameValidator(newNameValue)
        if (invalidNameMessage)
          alert(invalidNameMessage)
        else
          _handleSubmit()
      }} />
    </Dialog.Container>
  )
}

export default SettingsDialogDogName
