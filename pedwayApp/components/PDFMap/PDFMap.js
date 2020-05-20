import styles from './styles';
import {Text, TouchableOpacity, View, Image} from 'react-native';
import React, {Component} from 'react';

/**
 * Renders a screen displaying the official map
 * of the Pedway system, which can be accessed
 * when the user is offline
 */
export default class PDFMap extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.header}> City of Chicago Pedway System </Text>
        <Image
          style={styles.stretch}
          source={{uri: 'https://s3.amazonaws.com/luxechicago/wp-content/uploads/2017/12/01132557/CityOfChicago_PedwayMapWithLogo_800x469.jpg'}}
        />
      </View>
    );
  }
}
