import React, { memo } from 'react';
import {
  ImageBackground,
  StyleSheet,
  RefreshControl,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import DashboardContent from '../components/DashboardContent'
import NavBar from '../components/NavBar'
import { Route, Navigation } from '../types'

type Props = {
  route: Route,
  navigation: Navigation,
};

const wait = (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}


const Dashboard = ({ route, navigation }: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { user } = route.params
  const pageHeaderTitle = "Welcome " + user.name

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    wait(1000).then(() => setRefreshing(false))
  }, [])

  // console.log("User in Dashboard: " + JSON.stringify(user))

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
        <NavBar user={user} title={pageHeaderTitle} goBack={() => navigation.navigate('HomeScreen')} />
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          <DashboardContent route={route} navigation={navigation} refreshValue={refreshing}/>
        </KeyboardAvoidingView>
      </ScrollView>
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
  },
});

export default memo(Dashboard);
