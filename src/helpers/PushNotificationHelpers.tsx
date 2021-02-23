import * as Notifications from 'expo-notifications';
import { DogObject, UserData } from '../types'

export const sendPushNotification = (receiverToken: string ,title: string, message: string, dog: DogObject, user: UserData) => {
  fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: receiverToken,
      sound: 'default',
      title: title,
      body: message,
      data: {
        dog: dog,
        user: user,
      },
    })
  })
}

type NotificationAction = {
  identifier: string,
  buttonTitle: string,
  textInput?: {
    submitButtonTitle: string;
    placeholder: string;
  },
  options: {
    isDestructive?: boolean;
    isAuthenticationRequired?: boolean;
    opensAppToForeground?: boolean;
  },
}

export const makeInteractive = async (identifier: string, buttonTitle: string) => {
  let notificationActions = [] as NotificationAction[]
  let notificationAction = {
    identifier: identifier,
    buttonTitle: buttonTitle,
  }
  return await Notifications.setNotificationCategoryAsync(identifier, notificationActions)
}



type WeeklyTriggerInput = {
  channelId?: string,
  weekday: number,
  hour: number,
  minute: number,
  repeats: boolean,
}

type DailyTriggerInput = {
  channelId?: string,
  hour: number,
  minute: number,
  repeats: boolean,
}

const weelkyTrigger: WeeklyTriggerInput = {
  weekday: 1,
  hour: 20,
  minute: 0,
  repeats: true,
}

const tomorrowReminderTrigger: DailyTriggerInput = {
  hour: 10,
  minute: 8,
  repeats: false,
}

const todayReminderTrigger: DailyTriggerInput = {
  hour: 10,
  minute: 9,
  repeats: false,
}

const todayFinalReminderTrigger: DailyTriggerInput = {
  hour: 10,
  minute: 10,
  repeats: false,
}


export async function scheduleWeeklyPushNotification() {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: "The New Week is Here!",
      body: 'Schedule your days to walk your dog!',
      data: { data: 'No data for now' },
    },
    trigger: weelkyTrigger,
  })
}

export async function scheduleTodayReminder(dogName: string) {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: "Click me to be taken to scheduling page!",
      body: dogName + " wants to go out today! Make sure to have someone take her out",
      data: { data: 'No data for now' },
    },
    trigger: todayReminderTrigger,
  })
}

export async function scheduleTodayFinalReminder(dogName: string) {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: dogName + " is sad :(",
      body: dogName + " didn't get to go out today.",
      data: { data: 'No data for now' },
    },
    trigger: todayFinalReminderTrigger,
  })
}

export async function scheduleTomorrowReminder(dogName: string) {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: "Click me to be taken to scheduling page!",
      body: dogName + " wants to go out today! Make sure to have someone take her out",
      data: { data: 'No data for now' },
    },
    trigger: tomorrowReminderTrigger,
  })
}

export async function cancelPushNotification(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier)
}

export async function cancelAllPushNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync()
}
export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') {
    return
  }

  return (await Notifications.getExpoPushTokenAsync()).data // token

}

// function scheduleDailyReminders(dogs: DogObject[]) {
//   cancelAllPushNotifications().then(() => {
//     Notifications.getAllScheduledNotificationsAsync().then((notifications) => {
//       console.log("All user current notification: " + notifications.length)
//     })
//   })
//   if (!loadingDailyNotifications) {
//     setLoadingDailyNotifications(true)
//     Notifications.getAllScheduledNotificationsAsync().then((notifications) => {
//       console.log("All user current notification: " + notifications.length)
//     })
//     for (let dog of dogs) {
//
//       // Assign Push Notification Identifier to hooks
//       for (let member of dog.members) {
//         if (member.email === user.email) {
//           if (member.todayPushNotificationIdentifier)
//             setTodayPushNotificationIdentifier(member.todayPushNotificationIdentifier)
//           if (member.todayFinalPushNotificationIdentifier)
//             setTodayFinalPushNotificationIdentifier(member.todayPushNotificationIdentifier)
//           if (member.tomorrowPushNotificationIdentifier)
//             setTomorrowPushNotificationIdentifier(member.tomorrowPushNotificationIdentifier)
//           break
//         }
//       }
//
//       let thisMoment = new Date()
//       let todaysDay = thisMoment.getDay()
//
//       // Today Morning Reminder and last minute reminder
//       let dayData = getDayData(dog, todaysDay)
//       let isTodayRegisteredFor = (dayData.dayType ? true : false)
//       if (!isTodayRegisteredFor && !todayPushNotificationIdentifier) {
//         scheduleTodayReminder(dog.firstName).then((identifier) => {
//           setTodayPushNotificationIdentifier(identifier)
//           console.log("Todays Reminders set: " + identifier)
//         })
//         scheduleTodayFinalReminder(dog.firstName).then((identifier) => {
//           setTodayFinalPushNotificationIdentifier(identifier)
//         })
//       } else {
//         if (todayPushNotificationIdentifier) {
//           cancelPushNotification(todayPushNotificationIdentifier)
//           cancelPushNotification(todayFinalPushNotificationIdentifier)
//           setTodayPushNotificationIdentifier("")
//           setTodayFinalPushNotificationIdentifier("")
//           console.log("Todays Reminders cancelled: Someone registered for these day")
//         }
//       }
//
//       // Today Reminder for Tomorrow
//       let tomorrowDayData = getDayData(dog, (todaysDay + 1) % 8)
//       let isTomorrowRegisteredFor = (tomorrowDayData.dayType ? true : false)
//       if (!isTomorrowRegisteredFor && !tomorrowPushNotificationIdentifier) {
//         scheduleTomorrowReminder(dog.firstName).then((identifier) => {
//           setTomorrowPushNotificationIdentifier(identifier)
//           console.log("Tomorrows Reminders set: " + identifier)
//         })
//       } else {
//         if (tomorrowPushNotificationIdentifier) {
//           cancelPushNotification(tomorrowPushNotificationIdentifier)
//           setTomorrowPushNotificationIdentifier("")
//           console.log("Tomorrows Reminders cancelled: Someone registered for these day")
//         }
//       }
//
//       // update this dog member user before setting it to collection dog
//       for (let member of dog.members) {
//         if (member.email === user.email) {
//           member.todayPushNotificationIdentifier = todayPushNotificationIdentifier
//           member.todayFinalPushNotificationIdentifier = todayFinalPushNotificationIdentifier
//           member.tomorrowPushNotificationIdentifier = tomorrowPushNotificationIdentifier
//           break
//         }
//       }
//
//       console.log("dog.members in scheduleDailyReminders():" + JSON.stringify(dog.members))
//
//       // set dog in collection to this dog with edited member
//       var dogRef = firebase.firestore().collection('users').doc(user.id).collection('dogs').doc(dog.key)
//       dogRef.set({
//         dog
//       }).then(() => {
//         console.log("Finished setting the document")
//         console.log(loadingDailyNotifications + " " + loadingDogData)
//       })
//     }
//     wait(LOADING_TIME_MS).then(() => {
//       setLoadingDailyNotifications(false)
//     })
//   }
//
// }
