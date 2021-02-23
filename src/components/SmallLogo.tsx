import React, { memo } from 'react';
import { Image, StyleSheet } from 'react-native';

const SmallLogo = () => (

  <Image source={require('../assets/icons8-dog-walking-50.png')} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    width: 32,
    height: 32,
    marginBottom: 2,
    position: "relative",
    marginRight: 15,
  },
});

export default memo(SmallLogo);
