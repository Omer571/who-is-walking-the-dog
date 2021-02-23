import React, { memo } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
  ImageBackground,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'

type Props = {
  children: React.ReactNode;
}

type ScrollCoordinates = {
  x: number,
  y: number,
}

const SCROLL_COORDINATES: ScrollCoordinates = {
  x: 0,
  y: 0,
}

const IntroBackground = ({ children }: Props) => (
  <TouchableWithoutFeedback
    onPress={() => {
      console.log("Should be dismissing keyboad")
      Keyboard.dismiss()
  }}>
    <ImageBackground
      source={require('../assets/background.png')}
      resizeMode="repeat"
      style={styles.background}
    >
      <KeyboardAwareScrollView resetScrollToCoords={SCROLL_COORDINATES} contentContainerStyle={styles.container}>
        {children}
      </KeyboardAwareScrollView>
    </ImageBackground>
  </TouchableWithoutFeedback>
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
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
});

export default memo(IntroBackground);
