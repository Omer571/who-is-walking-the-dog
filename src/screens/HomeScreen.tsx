import React, { memo } from 'react';
import IntroBackground from '../components/IntroBackground';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import Paragraph from '../components/Paragraph';
import { Navigation } from '../types';

type Props = {
  navigation: Navigation;
};

const HomeScreen = ({ navigation }: Props) => (
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

export default memo(HomeScreen);
