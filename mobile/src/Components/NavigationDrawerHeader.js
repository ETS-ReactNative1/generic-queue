import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const NavigationDrawerHeader = ({navigationProps}) => {
  const toggleDrawer = () => {
    navigationProps.toggleDrawer();
  };

  return (
    <View style={{flexDirection: 'row', marginLeft: 15}}>
      <Icon name="bars" size={25} color="white" onPress={toggleDrawer}/>
    </View>
  );
};
export default NavigationDrawerHeader;
