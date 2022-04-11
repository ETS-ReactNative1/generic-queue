import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';

const getPermission = async () => {
  let granted;
  try {
    if(Platform.OS === 'ios') {
      const { status } = await Geolocation.requestAuthorization();
      granted = status === "granted";
    }
    else {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      granted = status === PermissionsAndroid.RESULTS.GRANTED;
    }
    if(!granted) {
      Alert.alert("Ops!", "Permissão de acesso a localização negada.");
      return;
    } 
  } catch (error) {
    Alert.alert("Ops!", "Permissão de acesso a localização negada.");
    return;
  }
}

const getCurrentPosition = () => {
  return new Promise((res, rej) => {
    Geolocation.getCurrentPosition(res, rej, {
      timeout: 10000,
      maximumAge: 60 * 60 * 1000,
      enableHighAccuracy: true,
    })
  });
};

const getLocation = async () => {
  try {
    await getPermission();
    const location = await getCurrentPosition(location);
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05
    };
  } catch (error) {
    return null;
  }
}

export default getLocation;