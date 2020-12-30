import React, { memo } from 'react';
import { Image, StyleSheet } from 'react-native';

const SmallLogo = () => (

  <Image source={require('../assets/icons8-dog-walking-50.png')} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    width: 32,
    height: 32,
    marginBottom: 4,
    position: "absolute",
    // left: "60%",
    // bottom: "35%"
    top: 10,
    right: -10,
  },
});

export default memo(SmallLogo);
