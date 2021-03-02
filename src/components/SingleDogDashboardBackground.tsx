import React, { memo } from 'react'
import NavBar from '../components/NavBar'
import { useNavigation } from '@react-navigation/native'
import { UserData } from '../types'

import {
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native'

type Props = {
  user: UserData
  title: string,
  children: React.ReactNode,
}



const SingleDogDashboardBackground = ({ user, title, children }: Props) => {
  let navigation = useNavigation()
  return (
    <ImageBackground
      source={require('../assets/background.png')}
      resizeMode="repeat"
      style={styles.background}
    >
      <NavBar user={user} title={title} goBack={ () => navigation.navigate('Dashboard') } />
      <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView>
        {children}
      </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',        // horizonal
    // justifyContent: 'center' // vertical
  },
});

export default memo(SingleDogDashboardBackground);
