import React, { useState, useEffect, memo } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import UnderlinedHeader from '../components/UnderlinedHeader'
import Button from '../components/Button'
import DogCard from '../components/DogCard'
import { Route, DogObject, UserData, Navigation, DayInfo } from '../types'
import emptyDogObject from '../helpers/emptyDogObject'
import { firebase } from '../firebase/config'
import dogConverter from '../helpers/dogConverter'
import { useNavigation } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import {
  scheduleWeeklyPushNotification,
  registerForPushNotificationsAsync,
  scheduleTodayReminder,
  sendPushNotification,
  scheduleTomorrowReminder,
  scheduleTodayFinalReminder,
  cancelPushNotification,
  cancelAllPushNotifications,
} from '../helpers/PushNotificationHelpers'
 import * as TaskManager from 'expo-task-manager'
 import * as BackgroundFetch from 'expo-background-fetch'


 const TASK_NAME = "BACKGROUND_TASK"
 const INTERVAL = 5

 // console.log("Unregistering all current tasks: " + TaskManager.unregisterAllTasksAsync())
 TaskManager.defineTask(TASK_NAME, () => {
   try {
     // fetch data here...
     const receivedNewData = "Simulated fetch " + Math.random()
     console.log("My task ", receivedNewData)
     console.log("Attempting to re-register background task:", RegisterBackgroundTask())
     return receivedNewData
       ? BackgroundFetch.Result.NewData
       : BackgroundFetch.Result.NoData
   } catch (err) {
     return BackgroundFetch.Result.Failed
   }
 })

// behind the scenes and the default value is the smallest fetch interval supported by the system (10-15 minutes).
// aka this will run every 10-15 minutes test twice with app running and twice without (1 hour)
const RegisterBackgroundTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(TASK_NAME)
    await BackgroundFetch.setMinimumIntervalAsync(INTERVAL)
    console.log("Task registered w/ Interval:" + INTERVAL)
  } catch (err) {
    console.log("Task Register failed:", err)
  }
}

RegisterBackgroundTask()


const MAX_CARDS = 10
const LOADING_TIME_MS = 2000

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

function getMemberNames(dog: DogObject) {
  const memberNames = dog.members.map((member: any) => {
    return member.name
  })

  return memberNames
}
function createDogCard(dog: DogObject, user: UserData) {
  const theseMemberNames = getMemberNames(dog)
  return <DogCard dog={dog} user={user} cardKey={dog.key} key={dog.key} dogName={dog.firstName} members={theseMemberNames} />;
}

function createDefaultDogCard(user: UserData) {
  const defaultDog = emptyDogObject
  const defaultDogCard = <DogCard dog={defaultDog} user={user} cardKey='1' key='1' dogName="Example" members={["mom", "dad"]} />
  return defaultDogCard
}

const wait = (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

type Props = {
  route: Route,
  navigation: Navigation,
  refreshValue: boolean,
};

const DashboardContent = ({ route, refreshValue }: Props) => {

  const [loadingDogData, setLoadingDogData] = useState(false)
  const [loadingDailyNotifications, setLoadingDailyNotifications] = useState(false)
  const [loading, setLoading] = useState(false)
  const [todayPushNotificationIdentifier, setTodayPushNotificationIdentifier] = useState<string>("")
  const [tomorrowPushNotificationIdentifier, setTomorrowPushNotificationIdentifier] = useState<string>("")
  const [todayFinalPushNotificationIdentifier, setTodayFinalPushNotificationIdentifier] = useState<string>("")

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  })

  const navigation = useNavigation()
  const { user } = route.params
  // console.log("route.params in Dashboard: " + JSON.stringify(route.params))
  // console.log("User in Dashboard: " + JSON.stringify(user))
  const [dogs, setDogs] = useState<DogObject[]>([])

  function updateUserToken(token: string) {
    var userRef = firebase.firestore().collection("users").doc(user.id)
      userRef.update({
        push_token: token,
      })
      .then(() => {
        console.log("push_token for current user updated: " + token)
        user.push_token = token // local copy over user passed between screens
        // sendTestPushNotificationAndSMS(token)
      })
      .catch((error) => {
        console.error("Error updating user's push_token: ", error)
      })
  }


  function getDogData() {
    if (!loadingDogData) {
      setLoadingDogData(true)

      var dogRef = firebase.firestore().collection('users').doc(user.id).collection('dogs').withConverter(dogConverter)
      dogRef.get().then((querySnapshot) => {
        let dogs: DogObject[] = []
        let dogData: DogObject
        querySnapshot.forEach(doc => {
          dogData = doc.data()
          dogs.push(dogData)
        })

        setDogs(dogs)
        wait(LOADING_TIME_MS).then(() => {
          setLoadingDogData(false)
        })
      })
    }
  }

  // Needs to be global helper
  function getDayData(dog: DogObject, day: number) {
    let dayData = {} as DayInfo
    switch (day) {
      case 2:
        dayData = dog.schedule.monday
        break
      case 3:
        dayData = dog.schedule.tuesday
        break
      case 4:
        dayData = dog.schedule.wednesday
        break
      case 5:
        dayData = dog.schedule.thursday
        break
      case 6:
        dayData = dog.schedule.friday
        break
      case 7:
        dayData = dog.schedule.saturday
        break
      case 1:
        dayData = dog.schedule.sunday
        break
      default:
        throw Error("getDayData: day passed was not a day of the week\ndayData.time ")
    }
    return dayData
  }


  useEffect(() => {
    getDogData()
    registerForPushNotificationsAsync().then((token) => {
      if (token)
        updateUserToken(token)
      else
        throw "ERROR - Error updating user push_token"
    })

    // scheduleDailyReminders(dogs)
    dogs.forEach((dog) => scheduleTodayReminder(dog.firstName))
    scheduleWeeklyPushNotification()
    TaskManager.isTaskRegisteredAsync(TASK_NAME).then((status) => {
      console.log("Is " + TASK_NAME + " registered: " + status)
    })


    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data
      const user = data.user
      let dog: any

      if (data.dog) {
        dog = JSON.parse(JSON.stringify(data.dog)) // a trick to get type from unknown to any
      }
      if (user && dog) {
        navigation.navigate('SingleDogDashboard', {
          user: user,
          dogName: dog.firstName,
          dog: dog,
        })
      }
    })

    return () => console.log("addNotificationResponse Subscripton Removed" + subscription.remove())
  }, [refreshValue])

  const renderDogCards = () => {
    if (dogs.length === 0) {
      return createDefaultDogCard(user)
    }
    return dogs.map((dog, index) => {
      if (index <= MAX_CARDS)
        return createDogCard(dog, user)
      else if (index - 1 == MAX_CARDS) {
        return <Button>See All Dogs</Button>;
      }
    })
  }

  return (
    <View>
      <UnderlinedHeader>My Dogs</UnderlinedHeader>
      <View style={styles.cardView}>
        {(!loadingDogData && !loadingDailyNotifications) ? (
          renderDogCards()
      ) : <Text>Loading Dogs</Text>}

      </View>
      <Button
        mode="contained"
        onPress={() => {
          navigation.navigate('AddDogScreen', {
            user: user,
          })}
        }
      >
        Add Dog
      </Button>
      <Button mode="outlined" onPress={() => {
        navigation.navigate('HomeScreen')}
      }>
        Logout
      </Button>
    </View>
  );
}


const styles = StyleSheet.create({
  cardView: {
    alignItems: "flex-start",
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: "space-between",
  },
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    // alignSelf: 'center',
    // justifyContent: 'center'
  },
});

export default memo(DashboardContent)
