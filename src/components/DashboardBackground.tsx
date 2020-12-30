import React, { memo } from 'react';
import {
  ImageBackground,
  StyleSheet,
  RefreshControl,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

type Props = {
  children: React.ReactNode;
};

const wait = (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

const DashboardBackground = ({ children }: Props) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(1000).then(() => setRefreshing(false));
  }, []);

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
          {children}
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
    // alignSelf: 'center',
    // justifyContent: 'center'
  },
});

export default memo(DashboardBackground);
