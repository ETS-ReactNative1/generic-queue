import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './DrawerScreens/HomeScreen';
import SettingsScreen from './DrawerScreens/SettingsScreen';
import CustomSidebarMenu from '../Components/CustomSidebarMenu';
import NavigationDrawerHeader from '../Components/NavigationDrawerHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { View, TouchableOpacity } from 'react-native';
import SearchStoreScreen from './DrawerScreens/SearchStoreScreen';
import OrdersScreen from './DrawerScreens/OrdersScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const homeScreenStack = ({ navigation, route }) => {
  const { location } = route.params;

  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen
        name="HomeScreen"
        initialParams={{ location: location }}
        component={HomeScreen}
        options={{
          title: 'Home',
          headerLeft: () => (
            <NavigationDrawerHeader navigationProps={navigation} />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 15 }}>
              <TouchableOpacity onPress={() => navigation.navigate('SearchStoreScreenStack')}>
                <Icon name="search" size={25} color="white" />
              </TouchableOpacity>
            </View>
          ),
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#307ecc',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

const ordersScreenStack = ({ navigation }) => {
  return (
    <Stack.Navigator
      initialRouteName="OrdersScreen"
      screenOptions={{
        title: 'Meus Pedidos',
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <NavigationDrawerHeader navigationProps={navigation} />
        ),
        headerStyle: {
          backgroundColor: '#307ecc',
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="OrdersScreen"
        component={OrdersScreen}
      />
    </Stack.Navigator>
  );
};

const searchStoreScreenStack = ({ route }) => {
  const { location } = route.params;
  return (
    <Stack.Navigator
      initialRouteName="SearchStoreScreen"
      screenOptions={{
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        initialParams={{ location: location }}
        name="SearchStoreScreen"
        component={SearchStoreScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const settingsScreenStack = ({ navigation }) => {
  return (
    <Stack.Navigator
      initialRouteName="SettingsScreen"
      screenOptions={{
        headerLeft: () => (
          <NavigationDrawerHeader navigationProps={navigation} />
        ),
        headerStyle: {
          backgroundColor: '#307ecc',
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{
          title: 'Editar Cadastro',
        }}
      />
    </Stack.Navigator>
  );
};

const DrawerNavigatorRoutes = ({ route }) => {
  const { location } = route.params;
  return (
    <Drawer.Navigator
      screenOptions={{
        activeTintColor: '#cee1f2',
        color: '#cee1f2',
        itemStyle: { marginVertical: 5, color: 'white' },
        labelStyle: {
          color: '#d8d8d8',
        },
      }}
      screenOptions={{ headerShown: false }}
      drawerContent={CustomSidebarMenu}>
      <Drawer.Screen
        name="homeScreenStack"
        options={{ drawerLabel: 'Home', overlayColor: 'white', drawerActiveTintColor: 'white' }}
        component={homeScreenStack}
        initialParams={{ location: location }}
      />
      <Drawer.Screen
        name="settingsScreenStack"
        options={{ drawerLabel: 'Editar Cadastro', overlayColor: 'white', drawerActiveTintColor: 'white' }}
        component={settingsScreenStack}
      />
      <Drawer.Screen
        name="SearchStoreScreenStack"
        options={{ drawerLabel: 'Procurar Loja', overlayColor: 'white', drawerActiveTintColor: 'white' }}
        component={searchStoreScreenStack}
        initialParams={{ location: location }}
      />
      <Drawer.Screen
        name="OrdersScreenStack"
        options={{ drawerLabel: 'Meus Pedidos', overlayColor: 'white', drawerActiveTintColor: 'white' }}
        component={ordersScreenStack}
        initialParams={{ location: location }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigatorRoutes;
