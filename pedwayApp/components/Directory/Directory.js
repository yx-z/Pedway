import styles from './styles';
import {Text, TouchableOpacity, View} from 'react-native';
import React, {Component} from 'react';

/**
 * Renders a screen displaying a directory
 * of all the restaurants located within the Pedway
 */
export default class Directory extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Directory</Text>
        <Text style={styles.subtitle}>James R Thompson Center</Text>
        <Text style={styles.subtext}>
                    M Burger - 100 West Randolph Street{'\n'}
                    Pita Express - 100 West Randolph Street
        </Text>
        <Text style={styles.subtitle}>Chase Tower</Text>
        <Text style={styles.subtext}>
                    Big Easy - Urban Market, 10 South Dearborn Street{'\n'}
                    Tortas Frontera - Urban Market, 10 South Dearborn Street
        </Text>
        <Text style={styles.subtitle}>Prudential Plaza</Text>
        <Text style={styles.subtext}>
                    Caffe RoM - 180 North Stetson Avenue{'\n'}
                    Snarf's - 180 North Stetson Avenue
        </Text>
        <Text style={styles.subtitle}>Block 37</Text>
        <Text style={styles.subtext}>
                    Which Wich - 108 North State Street #002
        </Text>
        <Text style={styles.subtitle}>Illinois Center</Text>
        <Text style={styles.subtext}>
                    Hannah's Bretzel - 233 North Michigan Avenue{'\n'}
                    Potbelly - 111 East Wacker Drive
        </Text>
        <Text style={styles.subtitle}>Millennium Station</Text>
        <Text style={styles.subtext}>
                    Armand's Pizzeria - 151 North Michigan Avenue
        </Text>
        <Text style={styles.subtitle}>Michigan Plaza</Text>
        <Text style={styles.subtext}>
                    Mezza - 225 North Michigan Avenue{'\n'}
                    Wow Bao - 225 North Michigan Avenue{'\n'}
                    Pret a manger - 225 North Michigan Avenue
        </Text>
        <Text style={styles.subtitle}>201 N. Clark</Text>
        <Text style={styles.subtext}>
                    Olive Mediterranean Grill - 201 North Clark Street
        </Text>
        <Text style={styles.subtitle}>Renaissance Chicago Hotel</Text>
        <Text style={styles.subtext}>
                    Protein Bar - 10 W Lake St{'\n'}
                    Wow Bao - 1 West Wacker Drive
        </Text>
      </View>
    );
  }
}
