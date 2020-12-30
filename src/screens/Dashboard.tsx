import React, { memo, useState, useEffect } from 'react';
import {
  ImageBackground,
  RefreshControl,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Text, View, StyleSheet } from 'react-native';
// import DashboardBackground from '../components/DashboardBackground';
import SmallLogo from '../components/SmallLogo';
import UnderlinedHeader from '../components/UnderlinedHeader';
import Button from '../components/Button';
import DogCard from '../components/DogCard';
import { useNavigation } from '@react-navigation/native';
import { Route, DogObject, UserData, DogSchedule } from '../types';
import emptyDogObject from '../emptyDogObject';
import { firebase } from '../firebase/config'

const MAX_CARDS = 10;
const LOADING_TIME_MS = 1000

function getMemberNames(dog: DogObject) {
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
};

const Dashboard = ({ route }: Props) => {

  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { user } = route.params
  const [dogs, setDogs] = useState<DogObject[]>([])

  async function extractDog(dogDoc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>) {

    const schedule = {} as DogSchedule
    let newDog: DogObject = {
      firstName: "",
      middleName: "",
      lastName: "",
      members: [],
      schedule: schedule,
      key: "",
    }

    newDog.firstName = await dogDoc.data().firstName
    newDog.middleName = await dogDoc.data().middleName
    newDog.lastName = await dogDoc.data().lastName
    newDog.members = await dogDoc.data().members
    newDog.schedule = await dogDoc.data().schedule
    newDog.key = dogDoc.id

    return newDog
  }

  function getData() {
    if (!loading) {
      setLoading(true)

      let tempDogs: DogObject[] = []

      var dogRef = firebase.firestore().collection("dogs")
      dogRef.get().then((docs) => {
        docs.forEach((doc) => {
          extractDog(doc).then((dog) => {
            tempDogs.push(dog)
          })
        })
        setDogs(tempDogs)
        wait(LOADING_TIME_MS).then(() => {
          setLoading(false)
        })
      })
    }
  }

  useEffect(() => getData(), [refreshing]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(1000).then(() => setRefreshing(false));
  }, []);

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
            {!loading ? (
            renderDogCards()
          ) : <Text>Loading Dogs</Text>}

          </View>
          <Button
            mode="contained"
            onPress={() => {
              navigation.navigate('AddDogScreen', { user: user })}
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

export default memo(Dashboard);
