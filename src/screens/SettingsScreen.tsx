import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import SettingsList from 'react-native-settings-list'
import { Fontisto, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons/'
import { Route, Navigation } from '../types'
import DogList from '../components/DogList'
import NavBar from '../components/NavBar'
import SettingsDialogEmail from '../components/SettingsDialogEmail'
import SettingsDialogPhoneNumber from '../components/SettingsDialogPhoneNumber'
import SettingsDialogName from '../components/SettingsDialogName'
import SettingsDialogDeleteAccount from '../components/SettingsDialogDeleteAccount'
import SettingsDialogPassword from '../components/SettingsDialogPassword'

import {
  saveEmailToUserCollection,
  savePhoneNumberToUserCollection,
  saveNameToUserCollection,
  deleteAccountFromUserCollection,
  reauthenticateUser,
} from '../helpers/SettingsHelpers'
import { firebase } from '../firebase/config'

type Props = {
	route: Route,
	navigation: Navigation,
}

const Settings = ({ route, navigation }: Props) => {

  const { user } = route.params

	const [emailDialog, setEmailDialog] = useState(false)
	const [nameDialog, setNameDialog] = useState(false)
	const [deleteAccountDialog, setDeleteAccountDialog] = useState(false)
	const [numberDialog, setNumberDialog] = useState(false)
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [userFromAuth, setUserFromAuth] = useState<firebase.User>()

  useEffect(() => {
    let currentUserFromAuth = firebase.auth().currentUser
    if (currentUserFromAuth)
      setUserFromAuth(currentUserFromAuth)
    else
      console.log("(SettingsScreen - useEffect) Couldn't get UserFromAuth in useEffect")
  }, [])

  const closeAllDialogs = () => {
		setEmailDialog(false)
		setNameDialog(false)
		setDeleteAccountDialog(false)
		setNumberDialog(false)
    setPasswordDialog(false)
  }

  const logout = () => {
    navigation.navigate('HomeScreen')
  }

  const handleReauthentication = (password: string) => {
    // Once password entered (aka password dialog closed)
    if (userFromAuth) {
      reauthenticateUser(userFromAuth, password).then((reauthenticated) => {
        if (reauthenticated) {
          // Then go through deleteAccount process after user authenticated
          setDeleteAccountDialog(true)
        }
        else {
          alert("Account could not be authenticated. If you are sure your password is right, talk to app maker.")
        }
      })
    } else {
      console.error("(SettingsScreen - handleReauthentication) Error w/userFromAuth: " + userFromAuth)
    }
  }


	return (
		<View style={{backgroundColor:'#EFEFF4',flex:1}}>
      <NavBar user={user} title={"Settings"} goBack={() => navigation.navigate('DashboardTwo')} />
      <View style={{backgroundColor:'#EFEFF4',flex:1,marginTop:25}}>
				<DogList navigation={navigation} user={user} />
        <SettingsList borderColor='#c8c7cc' defaultItemSize={50}>
					<SettingsList.Header headerText='User Settings' headerStyle={{marginTop:25}}/>
          <SettingsList.Item
            icon={
              <View style={styles.iconContainer}>
                <Fontisto style={styles.icon} name="person"/>
              </View>
            }
            title="Change Name"
            onPress={() => setNameDialog(true)}
          />
					<SettingsList.Item
            icon={
              <View style={styles.iconContainer}>
                <Fontisto style={styles.icon} name="phone"/>
              </View>
            }
						title="Change Phone Number"
						onPress={() => setNumberDialog(true)}
					/>
					<SettingsList.Item
						icon={
              <View style={styles.iconContainer}>
                <Fontisto style={styles.icon} name="email"/>
              </View>
            }
						title="Change Email"
						onPress={() => setEmailDialog(true)}
					/>
					<SettingsList.Header headerText='Dangerous Settings' headerStyle={{marginTop:25}}/>
					<SettingsList.Item
						icon={
							<View style={styles.iconContainer}>
	              <AntDesign style={styles.icon} name="delete"/>
	            </View>
						}
						title="Delete Account"
						onPress={() => {
              // Prompt and confirm password first
              setPasswordDialog(true)
            }}
					/>
          <SettingsList.Header headerText='Logout' headerStyle={{marginTop:40}}/>
          <SettingsList.Item
            icon={
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons style={styles.icon} name="logout"/>
              </View>
            }
            title="logout"
            onPress={() => logout()}
          />
        </SettingsList>
				<SettingsDialogEmail user={user} userFromAuth={userFromAuth} showDialog={emailDialog} onSubmit={saveEmailToUserCollection} closeAllDialogs={closeAllDialogs}/>
        <SettingsDialogPhoneNumber user={user} showDialog={numberDialog} onSubmit={savePhoneNumberToUserCollection} closeAllDialogs={closeAllDialogs}/>
        <SettingsDialogName user={user} showDialog={nameDialog} onSubmit={saveNameToUserCollection} closeAllDialogs={closeAllDialogs}/>
        <SettingsDialogPassword showDialog={passwordDialog} onPasswordSubmit={handleReauthentication} closeAllDialogs={closeAllDialogs}></SettingsDialogPassword>
        <SettingsDialogDeleteAccount user={user} userFromAuth={userFromAuth} showDialog={deleteAccountDialog} onDeleteConfirmed={deleteAccountFromUserCollection} closeAllDialogs={closeAllDialogs}/>
      </View>
    </View>
	)
}

const styles = StyleSheet.create({
  iconContainer: {
    height: 22,
    marginLeft: 10,
    alignSelf: 'center'
  },
	icon: {
		fontSize: 20,
	},
})

export default Settings
