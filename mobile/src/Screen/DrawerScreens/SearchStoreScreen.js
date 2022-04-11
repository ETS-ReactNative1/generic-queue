import { useIsFocused } from '@react-navigation/core';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, Image, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { FlatList, RectButton, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { searchStore } from '../../services/StoreService';
import useDebounce from '../../utils/useDebounce';
import Icon from 'react-native-vector-icons/FontAwesome';
import throttle from 'lodash.throttle';
import styles from './styles';
import Loader from '../../Components/Loader';
import storeImgOrDefault from '../../utils/storeImgOrDefault';

const SearchStoreScreen = ({ navigation, route }) => {
  const { location } = route.params;
  const searchInputRef = useRef();
  const initialText = "Busque por Lojas cadastradas no sistema";
  const noStoreFoundText = "Infelizmente nenhuma loja foi encontrada";
  const [noStoreMessage, setNoStoreMessage] = useState(initialText);
  const initialFormState = {
    loading: false,
    onEnd: false,
    perPage: 20,
    total: 0,
    page: 1,
  }
  const [formState, setFormState] = useState(initialFormState);
  const [stores, setStores] = useState([]);
  const [storeName, setStoreName] = useState("");
  const debouncedStoreName = useDebounce(storeName, 2000);
  const isFocused = useIsFocused();

  const calculateDistance = (storeCoords) => {
    const pi180 = Math.PI / 180;
    const lat1 = storeCoords[0] * pi180;
    const lon1 = storeCoords[1] * pi180;
    const lat2 = location.latitude * pi180;
    const lon2 = location.longitude * pi180;

    const dlon = lon2 - lon1;
    const dlat = lat2 - lat1;
    const a = Math.pow(Math.sin(dlat / 2), 2)
      + Math.cos(lat1) * Math.cos(lat2)
      * Math.pow(Math.sin(dlon / 2), 2);

    const c = 2 * Math.asin(Math.sqrt(a));

    const earthRadius = 6371;

    return (c * earthRadius).toFixed(1);
  }

  const searchStoreByName = async (name) => {
    const searchString = name || storeName;
    if (!searchString || searchString.length < 4) {
      return stores;
    }
    setFormState({
      ...formState,
      onEnd: false,
      loading: true
    });
    try {
      const payload = {
        name: searchString,
        page: 1,
        perPage: formState.perPage,
      };
      const { data } = await searchStore(payload);
      const stores = data.data;
      if (!stores.length) {
        setNoStoreMessage(noStoreFoundText);
        setFormState({
          ...formState,
          total: 0,
          page: 1,
          loading: false
        });
        return [];
      }
      setFormState({
        ...formState,
        page: data.page,
        perPage: data.perPage,
        total: data.total,
        loading: false
      });
      if (location) {
        stores.forEach(store => {
          store.distance = calculateDistance(store.address.coords.coordinates);
        });
      }
      return stores;
    } catch (error) {
      console.log(error)
      if (error.response.status === 404) {
        setNoStoreMessage(noStoreFoundText);
      }
      setFormState({
        ...formState,
        total: 0,
        page: 1,
        loading: false
      })
      return [];
    }
  }

  const loadOnEndReached = async () => {
    if (formState.perPage * formState.page >= formState.total) {
      return;
    }
    setFormState({
      ...formState,
      loading: true,
      onEnd: true,
    })
    const newPage = formState.page + 1;
    const payload = {
      name: storeName,
      page: newPage,
      perPage: formState.perPage,
    };

    try {
      const { data } = await searchStore(payload);
      const _stores = data.data;
      setFormState({
        ...formState,
        page: data.page,
        perPage: data.perPage,
        total: data.total,
        loading: false,
        onEnd: false,
      });
      const newStores = stores.concat(_stores);
      setStores(newStores);
    } catch (error) {
      console.log(error)
      setFormState({
        loading: false
      });
    }
  }

  const throttledSearchStoreByName = useMemo(() => throttle(searchStoreByName, 2000), [storeName]);

  useEffect(() => {
    if (isFocused) {
      setTimeout(
        () => {
          if (isFocused && searchInputRef.current) {
            searchInputRef.current.focus()
          }
        }
        , 500);
    }
    if (debouncedStoreName) {
      searchStoreByName(debouncedStoreName)
        .then(stores => {
          setStores(stores);
        });
    }
    else {
      setStores([]);
    }
  }, [isFocused, debouncedStoreName]);

  const renderItem = ({ item }) => (
    <>
      <TouchableOpacity onPress={() => navigation.navigate('StoreScreen', item)}>
        <View style={styles.listItem}>
          <Image style={styles.itemImage} source={storeImgOrDefault(item.photoUri)} />
          <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.name}</Text>
          <Text>{item.distance ? `${item.distance} km` : '-'}</Text>
        </View>
      </TouchableOpacity>
    </>
  );

  const renderFooter = () => {
    if (!formState.onEnd && !formState.loading) return null;
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={"height"}
      enabled={false} style={{ flex: 1 }}>
      <View style={styles.searchStoreContainer}>
        <Icon style={{ alignSelf: 'center', marginLeft: 15 }}
          name="arrow-left" size={24} color="#fff"
          onPress={() => navigation.goBack()} />
        <View style={styles.searchStoreInput}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchStoreText}
            onChangeText={(storeName) => setStoreName(storeName)}
            placeholder="Buscar loja..."
            placeholderTextColor="white"
            autoCapitalize="none"
            onSubmitEditing={throttledSearchStoreByName}
            blurOnSubmit={false}
          />
          <RectButton style={styles.searchUserButton}
            onPress={throttledSearchStoreByName}>
            <Icon name="search" size={24} color="#fff" />
          </RectButton>
        </View>

      </View>
      <View style={{ flex: 1, padding: 16 }}>
        <Loader loading={!formState.onEnd && formState.loading} />
        {stores && stores.length ?
          <FlatList
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.list}
            onEndReached={loadOnEndReached}
            onEndReachedThreshold={0.1}
            data={stores}
            renderItem={renderItem}
            keyExtractor={store => store._id}
            ListFooterComponent={renderFooter}
          /> :
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 20,
                textAlign: 'center',
                marginBottom: 16,
              }}>
              {noStoreMessage}
            </Text>
          </View>}
      </View>
    </KeyboardAvoidingView>
  );
};

export default SearchStoreScreen;
