import React, {useState} from 'react'
import Dialog from "react-native-dialog"
import { UserData } from '../types'
import { doesPhoneNumberAlreadyExistAsync, isPhoneNumberValid, convertToInternationalNumber } from '../helpers/phoneNumberValidatorHelpers'
import { wait } from '../helpers/SettingsHelpers'

type Props = {
  user: UserData,
  showDialog: boolean,
  onSubmit: (phoneNumber: string, user: UserData) => void,
  closeAllDialogs: () => void,
}

const SettingsDialogPhoneNumber = ({ user, showDialog, onSubmit, closeAllDialogs }: Props) => {

	const [newPhoneNumberValue, setNewPhoneNumberValue] = useState("")

  const handleCloseDialog = () => {
    closeAllDialogs()
  }

  const handleSubmit = () => {
    handleCloseDialog()
    wait(1000).then(() => {
      let newPhoneNumberValueInternational = convertToInternationalNumber(newPhoneNumberValue)
      onSubmit(newPhoneNumberValueInternational, user)
    })
  }

  return (
    <Dialog.Container visible={showDialog} onBackdropPress={closeAllDialogs}>
      <Dialog.Title>Phone Number Change</Dialog.Title>
      <Dialog.Input
         onChangeText={(phoneNumber: string) => setNewPhoneNumberValue(() => {

           return phoneNumber
         })}
         value={newPhoneNumberValue}
      >
      </Dialog.Input>
      <Dialog.Description>
        Enter Your New Phone Number
      </Dialog.Description>
      <Dialog.Button label="Cancel" onPress={handleCloseDialog} />
      <Dialog.Button label="Submit" onPress={() => {
        // Validate phone numbers
        if (!isPhoneNumberValid(newPhoneNumberValue)) {
          alert("Not all numbers are valid. Please recheck values")
          return
        }

         let internationalPhoneNumberValue = convertToInternationalNumber(newPhoneNumberValue)
        // Check if number is already somebody elses
        doesPhoneNumberAlreadyExistAsync(internationalPhoneNumberValue).then((doesPhoneNumberAlreadyExist) => {
          if (!doesPhoneNumberAlreadyExist) {
            handleSubmit()
          } else {
            alert("Number Already Exists for another user. Please enter another number.")
          }
        })
      }} />
    </Dialog.Container>
  )
}

export default SettingsDialogPhoneNumber
