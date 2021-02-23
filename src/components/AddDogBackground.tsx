import React, { memo } from 'react'
import NavBar from '../components/NavBar'
import { UserData, Navigation } from '../types'
import {
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native'

type Props = {
  children: React.ReactNode,
  user: UserData,
  navigation: Navigation,
}

const AddDogBackground = ({ children, user, navigation }: Props) => (
  <ImageBackground
    source={require('../assets/background.png')}
    resizeMode="repeat"
    style={styles.background}
  >
    <NavBar user={user} title={"Add Dog Form"} goBack={() => navigation.navigate('DashboardTwo')} />
    <ScrollView>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
          {children}
      </KeyboardAvoidingView>
    </ScrollView>
  </ImageBackground>
);

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
    // alignItems: "center",
    // flexWrap: 'wrap',
    // flexDirection: 'row',
    justifyContent: "center",
  },
});

export default memo(AddDogBackground);
