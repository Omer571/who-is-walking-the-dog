import React, { memo } from 'react';
import IntroBackground from '../components/IntroBackground';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import Paragraph from '../components/Paragraph';
import { getRememberedUserId } from '../helpers/credentialStorage'
import { getUser } from '../helpers/SettingsHelpers'
import { Navigation } from '../types';
import { useNavigation } from '@react-navigation/native'

type Props = {
  navigation: Navigation;
};

const HomeScreen = ({}: Props) => {

  const navigation = useNavigation()

  getRememberedUserId().then((userId) => {
    console.log("getRememberedUser: " + userId)
    if (userId) {
      getUser(userId).then((user) => {
        if (user) {
          navigation.navigate('Dashboard', {
            user: user,
          })
        }
      })
    } else {
      console.log("Couldn't getRememberedUser")
    }
  })

  return (
    <IntroBackground>
      <Logo />
      <Header>Who's Walking the Dog?</Header>
      <Paragraph>
        App inspired by
      </Paragraph>
      <Paragraph>
        Ginger Elizabeth Qureshi
      </Paragraph>
      <Button mode="contained" onPress={() => navigation.navigate('LoginScreen')}>
        Login
      </Button>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('RegisterScreen')}
      >
        Sign Up
      </Button>
    </IntroBackground>
  );

}



export default memo(HomeScreen);
