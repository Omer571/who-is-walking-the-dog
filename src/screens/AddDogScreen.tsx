import React, { useEffect, memo, useState } from 'react';
import CircleButton from '../components/CircleButton';
import UnderlinedHeader from '../components/UnderlinedHeader';
import Header from '../components/Header';
import Paragraph from '../components/Paragraph';
import AddDogBackground from '../components/AddDogBackground';
import BackButton from '../components/BackButton';
import AddDogFormTwo from '../components/AddDogFormTwo';

import { useNavigation } from '@react-navigation/native';
import { Route } from '../types';


type Props = {
  route: Route,
};

const AddDogScreen = ({ route }: Props) => {
  useEffect( () => console.log("mount SingleDogDashboard"), [] );
  useEffect( () => () => console.log("unmount SingleDogDashboard"), [] );

  const navigation = useNavigation()
  const { user } = route.params
  // console.log("User in AddDog Screen: " + JSON.stringify(user))
  let [numberOfBoxes, setNumberOfBoxes] = useState<number>(0)

  return (
    <AddDogBackground>
      <BackButton goBack={() => navigation.navigate('Dashboard')} />
      <UnderlinedHeader>Dog Information</UnderlinedHeader>
      <AddDogFormTwo numberOfFamilyBoxes={numberOfBoxes} user={user}/>
      <Header>Share Pet w/ These Members {numberOfBoxes}</Header>
      <Paragraph>NOTE: You do not need to add yourself to members :)</Paragraph>
      {numberOfBoxes < 5 ?
        <CircleButton onPress={() => setNumberOfBoxes(prevNumberOfBoxes => prevNumberOfBoxes + 1)}>+</CircleButton>
      :
        <CircleButton onPress={() => { alert("No more than 5 people per dog") }}>+</CircleButton>
      }
      {numberOfBoxes > 0 ?
        <CircleButton onPress={() => setNumberOfBoxes(prevNumberOfBoxes => prevNumberOfBoxes - 1)}>-</CircleButton>
        : null
      }
    </AddDogBackground>
  );
};

export default memo(AddDogScreen);
