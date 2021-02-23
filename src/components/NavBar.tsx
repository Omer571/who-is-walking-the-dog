import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { Appbar } from 'react-native-paper'
import SmallLogo from './SmallLogo'
import { useNavigation } from '@react-navigation/native'
import { UserData } from '../types'

const APP_BAR_HEIGHT = 10

type Props = {
  goBack: () => void,
  title: string,
  user: UserData,
}

const NavBar = ({ goBack, title, user }: Props) => {
  const _goBack = () => goBack()
  let navigation = useNavigation()

  // console.log("User in NavBar: " + JSON.stringify(user))

  return (
    <View>
      <View style={styles.appBarBox}>
        <Appbar.Header statusBarHeight={APP_BAR_HEIGHT} style={styles.appBar}>
          <Appbar.BackAction onPress={_goBack} />
          <Appbar.Content color="white" title={title}/>
          <Appbar.Action icon="cog" onPress={() => { navigation.navigate("SettingsScreen", {
            user,
          }) }} />
          <SmallLogo />
        </Appbar.Header>
      </View>
      <View style={styles.spacer}></View>
    </View>
  )
}

const styles = StyleSheet.create({
  appBarBox: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    marginBottom: 30,
    opacity: .5,
  },
  appBar: {
    // backgroundColor: "#ed3454",
    // backgroundColor: "#e84f69",
    backgroundColor: "#f03756",
  },
  spacer: {
    marginBottom: 50,
  },
})

export default NavBar
