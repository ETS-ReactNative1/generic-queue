import React, { useMemo, useRef, useState } from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import MapView from "react-native-map-clustering";
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from './styles';
import { TouchableOpacity } from 'react-native-gesture-handler';
import mapStyle from '../../../assets/styles/map.style';
import throttle from 'lodash.throttle';
import { getStoreByRegion } from '../../services/MapService';

const HomeScreen = ({ navigation, route }) => {
  const { location } = route.params;
  const [region, setRegion] = useState(location);
  const [stores, setStores] = useState([]);
  const mapRef = useRef();

  const searchStoreByLocale = async (region) => {
    setRegion(region)
    try {
      const mapBoundaries = await mapRef.current.getMapBoundaries();
      const stores = await getStoreByRegion(mapBoundaries);
      setStores(stores.data);
    } catch (error) {
      console.error("error", error);
      setStores([]);
    }
  }

  const goToInitialPosition = () => {
    mapRef.current.animateToRegion(location);
    setRegion(location);
  }

  const throttledSearchStoreByName = useMemo(() => throttle(searchStoreByLocale, 2500), [region]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          customMapStyle={mapStyle}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          minZoomLevel={12}
          initialRegion={location}
          onRegionChangeComplete={throttledSearchStoreByName}
        >
          {location &&
            <Marker
              cluster={false}
              pinColor={"#3399ff"}
              coordinate={location}
            >
              <Callout tooltip >
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutText}>Posição Atual</Text>
                </View>
              </Callout>
            </Marker>}

          {stores.map((store, idx) => (
            <Marker
              key={idx}
              coordinate={{
                latitude: store.address.coords.coordinates[0],
                longitude: store.address.coords.coordinates[1],
              }}
            >
              <Callout tooltip onPress={() => navigation.navigate('StoreScreen', store)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.storeLinkText}>{store.name}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.8}
          onPress={goToInitialPosition}>
          <Icon name="location-arrow"
            color="#ffff" size={30} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
