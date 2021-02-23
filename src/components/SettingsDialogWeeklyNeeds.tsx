import React, { useState } from 'react'
import Dialog from "react-native-dialog"
import { DogObject, WeeklyNeeds } from '../types'

type Props = {
  dog: DogObject,
  showDialog: boolean,
  onSubmit: (dog: DogObject, newWeeklyNeeds: WeeklyNeeds) => void,
  closeAllDialogs: () => void,
}

const wait = (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

const SettingsDialogWeeklyNeeds = ({ dog, showDialog, onSubmit, closeAllDialogs }: Props) => {
  const [newWeeklyNeeds, setNewWeeklyNeeds] = useState(dog.weeklyNeeds)

  const INVALID_NUMBER_OF_DAYS_MESSAGE = newWeeklyNeeds.walks + " walks, " + newWeeklyNeeds.outings
  + " outings, and " + newWeeklyNeeds.rest
  + " rests are not equal to the 7 days of the week. Please Re-enter correct numbers."

  const _handleCloseDialog = () => {
    closeAllDialogs()
  }


  const _handleSubmit = () => {
    _handleCloseDialog()
    wait(1000).then(() => {
      onSubmit(dog, newWeeklyNeeds)
    })
  }

  return (
    <Dialog.Container visible={showDialog} onBackdropPress={closeAllDialogs}>
      <Dialog.Title>Change Weekly Needs</Dialog.Title>
      <Dialog.Input
        label="Walks"
        keyboardType="numeric"
        onChangeText={(number: string) => setNewWeeklyNeeds((prevValues) => {
          return {
            walks: parseInt(number, 10),
            outings: prevValues.outings,
            rest: prevValues.rest,
          }
        })}
        maxLength={1}
        value={(newWeeklyNeeds.walks || newWeeklyNeeds.walks == 0 ? newWeeklyNeeds.walks.toString(): "")}
      >
      </Dialog.Input>
      <Dialog.Input
        label="Outings"
        keyboardType="numeric"
        onChangeText={(number: string) => setNewWeeklyNeeds((prevValues) => {
          return {
            walks: prevValues.walks,
            outings: parseInt(number, 10),
            rest: prevValues.rest,
          }
        })}
        maxLength={1}
        value={(newWeeklyNeeds.outings || newWeeklyNeeds.outings == 0 ? newWeeklyNeeds.outings.toString(): "")}
      >
      </Dialog.Input>
      <Dialog.Input
        label="Rest"
        keyboardType="numeric"
        onChangeText={(number: string) => setNewWeeklyNeeds((prevValues) => {
          return {
            walks: prevValues.walks,
            outings: prevValues.outings,
            rest: parseInt(number, 10),
          }
        })}
        maxLength={1}
        value={(newWeeklyNeeds.rest || newWeeklyNeeds.rest == 0 ? newWeeklyNeeds.rest.toString(): "")}
      >
      </Dialog.Input>
      <Dialog.Button label="Cancel" onPress={_handleCloseDialog} />
      <Dialog.Button label="Submit" onPress={() => {
        if (newWeeklyNeeds.walks + newWeeklyNeeds.outings + newWeeklyNeeds.rest !== 7)
          alert(INVALID_NUMBER_OF_DAYS_MESSAGE)
        else {
          dog.weeklyNeeds = newWeeklyNeeds
          _handleSubmit()
        }
      }} />
    </Dialog.Container>
  )
}

export default SettingsDialogWeeklyNeeds
