import AsyncStorage from '@react-native-async-storage/async-storage';


export const isSignedIn = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(USER_TOKEN)
      .then((res) => {
        if (res !== null) {
          resolve(res);
        } else {
          resolve(false);
        }
      })
      .catch((err) => reject(err));
  });
};
