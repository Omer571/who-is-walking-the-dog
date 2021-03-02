import React, { useState, useEffect, memo } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import UnderlinedHeader from '../components/UnderlinedHeader'
import Button from '../components/Button'
import { Route, DogObject, Navigation } from '../types'
import { createDogCard, createDefaultDogCard, wait } from '../helpers/DashboardHelpers'
import { firebase } from '../firebase/config'
import dogConverter from '../helpers/dogConverter'
import { useNavigation } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import { registerForPushNotificationsAsync, cancelAllPushNotifications } from '../helpers/PushNotificationHelpers'
// import * as TaskManager from 'expo-task-manager'
// import * as BackgroundFetch from 'expo-background-fetch'


const MAX_CARDS = 10
const LOADING_TIME_MS = 2000

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})



type Props = {
  route: Route,
  navigation: Navigation,
  refreshValue: boolean,
};

const DashboardContent = ({ route, refreshValue }: Props) => {

  const [loadingDogData, setLoadingDogData] = useState(false)

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  })

  const navigation = useNavigation()
  const { user } = route.params
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

  useEffect(() => {
    getDogData()
    registerForPushNotificationsAsync().then((token) => {
      if (token)
        updateUserToken(token)
      else
        throw "ERROR - Error updating user push_token"
    })

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data
      const user = data.user
      let dog: any

      if (data.dog) {
        dog = JSON.parse(JSON.stringify(data.dog)) // a trick to transform a type from unknown to any
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
        {(!loadingDogData) ? (
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
  },
});

export default memo(DashboardContent)
