import AsyncStorage from '@react-native-async-storage/async-storage';


export const rememberUser = async (userId: string) => {
  try {
    await AsyncStorage.setItem('userId', userId)
  } catch (error) {
    console.error(error)
  }
}

export const getRememberedUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    console.log("userId in getRememberedUserId: " + userId)
    if (userId !== null) {
      // We have username!!
      return userId;
    }
  } catch (error) {
    console.error(error)
  }
}

export const forgetUser = async () => {
  try {
    await AsyncStorage.removeItem('userId');
  }
  catch (error) {
    console.error(error)
  }
};
