import React, { useState } from 'react'
import Dialog from "react-native-dialog"
import { doesPhoneNumberAlreadyExistAsync, isPhoneNumberValid, convertToInternationalNumber } from '../helpers/phoneNumberValidatorHelpers'
import { wait } from '../helpers/SettingsHelpers'
import { DogFamilyMember } from '../types'

type Props = {
  showDialog: boolean,
  onSubmit: (familyMemberToAdd: DogFamilyMember) => void,
  closeAllDialogs: () => void,
}

const SettingsDialogAddFamilyMember = ({ showDialog, onSubmit, closeAllDialogs }: Props) => {

  const initialFamilyMember = {} as DogFamilyMember
  const [newFamilyMember, setNewFamilyMember] = useState(initialFamilyMember)

  const _handleCloseDialog = () => {
    closeAllDialogs()
  }

  const _handleSubmit = () => {

    _handleCloseDialog()

    wait(1500).then(() => {
      onSubmit(newFamilyMember)
    })

  }

  return (
    <Dialog.Container visible={showDialog} onBackdropPress={_handleCloseDialog}>
      <Dialog.Title>Family Member Info</Dialog.Title>
      <Dialog.Input
         onChangeText={(name: string) => setNewFamilyMember((prevValue) => {
           return {
             ...prevValue,
             name: name,
           }
         })}
         value={newFamilyMember.name}
         label="Name"
      >
      </Dialog.Input>
      <Dialog.Input
         onChangeText={(phoneNumber: string) => setNewFamilyMember((prevValue) => {
           return {
             ...prevValue,
             phoneNumber: phoneNumber,
           }
         })}
         value={newFamilyMember.phoneNumber}
         label="Mobile Phone Number"
      >
      </Dialog.Input>
      <Dialog.Description>
        Enter the family member name and phone number
      </Dialog.Description>
      <Dialog.Button label="Cancel" onPress={_handleCloseDialog} />
      <Dialog.Button label="Submit" onPress={() => {
        // Validate phone numbers
        if (!isPhoneNumberValid(newFamilyMember.phoneNumber)) {
          alert("Not all numbers are valid. Please recheck values")
          return
        }

        // Change number to international format
        let internationalPhoneNumberValue = convertToInternationalNumber(newFamilyMember.phoneNumber)
        setNewFamilyMember((prevValue) => {
          return {
            ...prevValue,
            phoneNumber: convertToInternationalNumber(prevValue.phoneNumber),
          }
        })

        // Check if number is already somebody elses
        doesPhoneNumberAlreadyExistAsync(internationalPhoneNumberValue).then((doesPhoneNumberAlreadyExist) => {
          if (doesPhoneNumberAlreadyExist) {
            _handleSubmit()
          } else {
            alert("There is no user with this number. They must create an account under this number first.")
          }
        })
      }} />
    </Dialog.Container>
  )
}

export default SettingsDialogAddFamilyMember
