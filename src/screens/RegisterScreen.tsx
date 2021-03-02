import React, { memo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import IntroBackground from '../components/IntroBackground'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import { firebase } from '../firebase/config'
import { useNavigation } from '@react-navigation/native'
import PhoneInput from "react-native-phone-number-input"
import { doesPhoneNumberAlreadyExistAsync } from '../helpers/phoneNumberValidatorHelpers'
import {
  emailValidator,
  passwordValidator,
  nameValidator,
  phoneNumberValidator,
} from '../core/utils'

// type Props = {
//   navigation: Navigation;
// };

const RegisterScreen = () => {

  const navigation = useNavigation()

  const [name, setName] = useState({ value: '', error: '' })
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [phoneNumber, setPhoneNumber] = useState({ value: '', error: ''})
  const [confirmPassword, setConfirmPassword] = useState({ value: '', error: '' })

  const _onSignUpPressed = () => {
    const nameError = nameValidator(name.value)
    const emailError = emailValidator(email.value)
    const phoneNumberError = phoneNumberValidator(phoneNumber.value)
    const passwordError = passwordValidator(password.value)
    let phoneNumberDuplicateError: string

    doesPhoneNumberAlreadyExistAsync(phoneNumber.value).then((returnValue) => {
      if (returnValue == true) {
        phoneNumberDuplicateError = "This number already exists for another user"
      } else {
        phoneNumberDuplicateError = ""
      }

      if (phoneNumberError) {
        setPhoneNumber({ ...phoneNumber, error: phoneNumberError})
        alert(phoneNumberError)
        return
      }

      if (phoneNumberDuplicateError) {
        setPhoneNumber({ ...phoneNumber, error: phoneNumberDuplicateError})
        alert(phoneNumberDuplicateError)
        return
      }

      if (emailError || passwordError || nameError) {
        setName({ ...name, error: nameError })
        setEmail({ ...email, error: emailError })
        setPassword({ ...password, error: passwordError })
        return
      }

      if (password.value !== confirmPassword.value) {
          alert("Passwords don't match.")
          return
      }

      firebase
          .auth()
          .createUserWithEmailAndPassword(email.value, password.value)
          .then((response) => {
            if (response.user) {
              const uid = response.user.uid
              const emailValue = email.value
              const phoneNumberValue = phoneNumber.value
              const nameValue = name.value
              const userData = {
                  id: uid,
                  email: emailValue,
                  phoneNumber: phoneNumberValue,
                  name: nameValue,
                  push_token: "",
              }
              const usersRef = firebase.firestore().collection('users')
              usersRef
                  .doc(uid)
                  .set(userData)
                  .then(() => {
                      navigation.navigate('Dashboard', userData ) // PASSUSERHERE
                  })
                  .catch((error) => {
                      alert(error)
                  })
            }
          })
          .catch((error) => {
              alert(error)
          })
    })
  }

  return (
    <IntroBackground>
      <BackButton goBack={() => navigation.navigate('HomeScreen')} />
      <Logo />
      <Header>Create Account</Header>
      <TextInput
        label="First Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={text => setName({ value: text, error: '' })}
        error={!!name.error}
        errorText={name.error}
      />

      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={text => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />

      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={text => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

      <TextInput
        label="ConfirmPassword"
        returnKeyType="done"
        value={confirmPassword.value}
        onChangeText={text => setConfirmPassword({ value: text, error: '' })}
        error={!!confirmPassword.error}
        errorText={confirmPassword.error}
        secureTextEntry
      />

      <PhoneInput
          defaultValue=""
          containerStyle={styles.phoneNumberInput}
          placeholder="2817787989"
          defaultCode="US"
          layout="first"
          onChangeFormattedText={text => setPhoneNumber({ value: text, error: '' })}
          withDarkTheme
          withShadow
      />
      <Button mode="contained" onPress={_onSignUpPressed} style={styles.button}>
        Sign Up
      </Button>

      <View style={styles.row}>
        <Text style={styles.label}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </IntroBackground>
  )
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.secondary,
  },
  phoneNumberInput: {
    marginVertical: 15,
    width: 300,
  },
  button: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
})

export default memo(RegisterScreen)
