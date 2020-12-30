import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { DogObject, UserData } from '../types';

type Props = {
  user: UserData,
  dogName: String,
  members: Array<String>,
  cardKey: string,
  dog: DogObject,
}

const DogCard = ({ user, cardKey, dogName, members, dog }: Props) => {
  const navigation = useNavigation();
  return (
    <Card key={cardKey} style={styles.card} onPress={() => navigation.navigate('SingleDogDashboard', {
      user: user,
      dogName: dogName,
      dog: dog,
    })}>
      <Card.Cover style={styles.dogAvatar} source={require('../assets/icons8-dog-64.png')} />
      <Card.Title title={dogName} />
      <Card.Content>
        {members.map((member) => { return <Text>{member}</Text> })}
      </Card.Content>
    </Card>
  );
}


const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 160,
    margin: 5,
    paddingBottom: 20,
  },
  dogAvatar: {
    width: 50,
    height: 50,
  },
});

export default DogCard;
