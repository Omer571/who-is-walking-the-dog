import React, { useState, useEffect, memo } from 'react'
import {
  ImageBackground,
  RefreshControl,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native'
import { Text, View, StyleSheet } from 'react-native'
// import DashboardBackground from '../components/DashboardBackground'
import SmallLogo from '../components/SmallLogo'
import UnderlinedHeader from '../components/UnderlinedHeader'
import Button from '../components/Button'
import DogCard from '../components/DogCard'
import { Route, DogObject, UserData, Navigation, DayInfo } from '../types'
import emptyDogObject from '../emptyDogObject'
import { firebase } from '../firebase/config'
import { dogConverter } from '../dogConverter'
import { useNavigation } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import {
  scheduleWeeklyPushNotification,
  registerForPushNotificationsAsync,
  scheduleTodayReminder,
  scheduleTomorrowReminder,
  scheduleTodayFinalReminder,
  cancelPushNotification,
  cancelAllPushNotifications,
 } from '../PushNotificationHelpers'


const MAX_CARDS = 10;
const LOADING_TIME_MS = 1000

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

function getMemberNames(dog: DogObject) {
  console.log("Dog Members: " + JSON.stringify(dog.members))
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
    setTimeout(resolve, timeout);
  });
}

type Props = {
  route: Route,
  navigation: Navigation,
};

const Dashboard = ({ route }: Props) => {

  const [refreshing, setRefreshing] = React.useState(false)
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
  }, [refreshing])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(LOADING_TIME_MS).then(() => setRefreshing(false))
  }, [])

  const renderDogCards = () => {
    if (dogs.length === 0) {
      return createDefaultDogCard(user)
    }
    return dogs.map((dog, index) => {
      console.log("Dogs: " + JSON.stringify(dog))
      if (index <= MAX_CARDS)
        return createDogCard(dog, user)
      else if (index - 1 == MAX_CARDS) {
        return <Button>See All Dogs</Button>;
      }
    })
  }

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      resizeMode="repeat"
      style={styles.background}
    >
      <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      >
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          <SmallLogo />
          {user ? <Text>Welcome {user.name}</Text> : <Text>Welcome User</Text>}
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
        </KeyboardAvoidingView>
      </ScrollView>
    </ImageBackground>
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

export default memo(Dashboard)
