import React, { useEffect, useState, FunctionComponent } from 'react'
import { View, Alert, StyleSheet } from 'react-native'
import SettingsList from 'react-native-settings-list'
import SettingsDialogAddFamilyMember from '../components/SettingsDialogAddFamilyMember'
import SettingsDialogDogName from '../components/SettingsDialogDogName'
import SettingsDialogWeeklyNeeds from '../components/SettingsDialogWeeklyNeeds'
import NavBar from '../components/NavBar'
import { Route, Navigation, UserData, DogObject, DogFamilyMember, UserMemberData } from '../types'
import { phoneNumberValidator } from '../core/utils'
import { isMemberInCollection, getUsersFromCollection } from '../helpers/AddDogFormTwoHelpers'
import {
  displayButtonAlert,
  removeMemberFromDogFamily,
  removeDogFromUser,
  getUser,
  getDog,
  addExistingDogToUserCollectionAsync,
  saveNewFamilyMemberToDogAsync,
  saveNewDogNameToUserCollectionAsync,
  setDogWeeklyNeedsAsync,
} from '../helpers/SettingsHelpers'
import { AntDesign } from '@expo/vector-icons/'

type Props = {
	navigation: Navigation,
	route: Route,
}

const NOTIFICATIONS_ON = "Notifications are on"
const NOTIFICATIONS_OFF = "Notifications are off"



const IndividualDogSettingScreen: FunctionComponent<Props> = ({ route, navigation }: Props) => {

  const { dog, user } = route.params

  const [showAddFamilyMemberDialog, setShowAddFamilyMemberDialog] = useState(false)
  const [showDogNameChangeDialog, setShowDogNameChangeDialog] = useState(false)
  const [showDogWeeklyNeedsDialog, setShowDogWeeklyNeedsDialog] = useState(false)
  const [notificationsSwitch, setNotificationsSwitch] = useState(true)
  const [switchTitle, setSwitchTitle] = useState("")
  const [dogHook, setDogHook] = useState<DogObject>(dog)
  const [userHook, setUserHook] = useState<UserData>(user)

  const _closeAllDialogs = () => {
    setShowAddFamilyMemberDialog(false)
    setShowDogNameChangeDialog(false)
    setShowDogWeeklyNeedsDialog(false)
  }

  useEffect(() => {
    // Get notifications value from DB
    console.log("useEffect called in IndividualDogSettingScreen")
    let switchValue = true

    if (switchValue) {
      setNotificationsSwitch(true)
      setSwitchTitle(NOTIFICATIONS_ON)
    } else {
      setNotificationsSwitch(false)
      setSwitchTitle(NOTIFICATIONS_OFF)
    }

    getDog(user.id, dog.key).then((foundDog) => {
      setDogHook(foundDog)
    })

    getUser(user.id).then((foundUser) => {
      if (foundUser)
        setUserHook(foundUser)
      else {
        console.error("Error: getUser() returned undefined")
      }
    })

  }, [])

  const handleDogNameChange = (newDogName: string, dog: DogObject) => {
    saveNewDogNameToUserCollectionAsync(newDogName, dog)
  }

  const handleLeaveDogFamily = () => {
    removeDogFromUser(dogHook, userHook)
    removeMemberFromDogFamily(dogHook, userHook)
    navigation.navigate("DashboardTwo")
  }

  const handleAddFamilyMember = (member: DogFamilyMember) => {
    if (!member.phoneNumber) {
      console.error("(IndividualDogSettingScreen - handleAddFamilyMember) Error: member.phoneNumber doesn't exist or null")
      return
    }

    let phoneNumberInvalidMessage = phoneNumberValidator(member.phoneNumber)

    if (phoneNumberInvalidMessage) {
      alert(phoneNumberInvalidMessage)
      return
    }

    getUsersFromCollection().then((allAppUsers) => {

      let userToAdd = isMemberInCollection(member, allAppUsers)
      if (!userToAdd) {
        alert("Member with phone number: " + member.phoneNumber + " is not registered")
        return
      }

      // user to add converted to dog family member
      let familyMember = {} as UserMemberData
      familyMember.todayFinalPushNotificationIdentifier = ""
      familyMember.todayPushNotificationIdentifier = ""
      familyMember.tomorrowPushNotificationIdentifier = ""
      familyMember.id = userToAdd.id
      familyMember.name = userToAdd.name
      familyMember.email = userToAdd.email
      familyMember.phoneNumber = userToAdd.phoneNumber
      familyMember.push_token = userToAdd.push_token

      // Save new family member to dog (both local dog and collection updated)
      saveNewFamilyMemberToDogAsync(dog, familyMember, allAppUsers).then(() => navigation.navigate("DashboardTwo"))

      addExistingDogToUserCollectionAsync(userToAdd, dog)
    })

  }

  return (
    <View style={{backgroundColor:'#EFEFF4',flex:1}}>
      <NavBar user={user} title={dog.firstName + " Settings"} goBack={() => navigation.navigate('SettingsScreen')} />
      <View style={{backgroundColor:'#EFEFF4',flex:1,marginTop:25}}>
        <SettingsList borderColor='#c8c7cc' defaultItemSize={50}>
					<SettingsList.Header headerText='Dogs Family Settings' headerStyle={{marginTop:25}}/>
          <SettingsList.Item
            // icon={<Image style={styles.imageStyle} source={require('./images/cellular.png')}/>}
            title="Leave Dog's family"
            onPress={() => {
              displayButtonAlert(
                "Confirm Leaving of Family",
                "Do you want to leave " + dog.firstName + "'s family?",
                () => { handleLeaveDogFamily() },
              )
            }}
          />
					<SettingsList.Item
						// icon={<Image style={styles.imageStyle} source={require('./images/cellular.png')}/>}
						title="Add Dog Family Member"
						onPress={() => setShowAddFamilyMemberDialog(true)}
					/>
					<SettingsList.Item
						// icon={<Image style={styles.imageStyle} source={require('./images/cellular.png')}/>}
						title="Delete Dog Family Member"
						onPress={() => Alert.alert('Functionality under development')}
					/>
					<SettingsList.Header headerText='Dog Settings' headerStyle={{marginTop:25}}/>
					<SettingsList.Item
						// icon={<Image style={styles.imageStyle} source={require('./images/cellular.png')}/>}
						title="Edit Dog's Name"
						onPress={() => setShowDogNameChangeDialog(true)}
					/>
          <SettingsList.Item
            // icon={<Image style={styles.imageStyle} source={require('./images/hotspot.png')}/>}
            title='Change dogs weekly needs'
            // titleInfoStyle={styles.titleInfoStyle}
            onPress={() => setShowDogWeeklyNeedsDialog(true)}
          />
					<SettingsList.Header headerText='My Preferences and Info' headerStyle={{marginTop:25}}/>
					<SettingsList.Item
						title={switchTitle}
						icon={
              <View style={styles.iconContainer}>
                <AntDesign style={styles.icon} name='notification'/>
              </View>
            }
            hasSwitch={true}
            switchState={notificationsSwitch}
            switchOnValueChange={() => {
              if (!notificationsSwitch)
                setSwitchTitle(NOTIFICATIONS_ON)
              else
                setSwitchTitle(NOTIFICATIONS_OFF)

              setNotificationsSwitch(!notificationsSwitch)
            }}
            hasNavArrow={false}
					/>
        </SettingsList>
        <SettingsDialogAddFamilyMember showDialog={showAddFamilyMemberDialog} onSubmit={handleAddFamilyMember} closeAllDialogs={_closeAllDialogs}/>
        <SettingsDialogDogName dog={dog} showDialog={showDogNameChangeDialog} onSubmit={handleDogNameChange} closeAllDialogs={_closeAllDialogs}/>
        <SettingsDialogWeeklyNeeds dog={dog} showDialog={showDogWeeklyNeedsDialog} onSubmit={setDogWeeklyNeedsAsync} closeAllDialogs={_closeAllDialogs}/>
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


export default IndividualDogSettingScreen
