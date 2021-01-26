import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { decode, encode } from 'base-64'
import { firebase } from './firebase/config'
import { UserData } from './types'

if (!global.btoa) {  global.btoa = encode }
if (!global.atob) { global.atob = decode }

import {
  HomeScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  Dashboard,
  SingleDogDashboard,
  AddDogScreen,
} from './screens';

const Stack = createStackNavigator();


function App() {

  const [user, setUser] = useState<UserData | undefined>(undefined)
  const [initialRouteName, setInitialRouteName] = useState("")

  // Test if this works in actual app (login persistence)
  useEffect(() => {
    const usersRef = firebase.firestore().collection('users');
    let userDataObject: UserData = {name: "", email: "", id: "", phoneNumber: "", dogs: [], push_token: ""};
    // put this into separate function later (or find cleaner way to do this)

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        usersRef
          .doc(user.uid)
          .get()
          .then((document) => {
            const userData = document.data()
            if (userData) {
              // console.log(JSON.stringify(userData))
              userDataObject.name = userData.name;
              userDataObject.email = userData.email;
              userDataObject.id = userData.id;
              userDataObject.phoneNumber = userData.phoneNumber
              userDataObject.dogs = userData.dogs
              userDataObject.push_token = ""

              setUser(userDataObject)
              setInitialRouteName("Dashboard")
            } else {
              setUser(undefined)
              setInitialRouteName("HomeScreen")
            }

          })
          .catch((error) => {
            alert(error)
          });
      }
    });
  });

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} initialParams={{ user: user }}/>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="ForgetPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="SingleDogDashboard" component={SingleDogDashboard} />
        <Stack.Screen name="AddDogScreen" component={AddDogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
