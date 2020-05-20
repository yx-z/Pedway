import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  focusButton: {
    zIndex: 0,
    position: 'absolute',
    top: 160,
    width: 40,
    height: 40,
    right: 20,
  },
  positionDown: {
    zIndex: 0,
    position: 'absolute',
    top: 220,
    right: 20,
    width: 40,
    height: 40,
  },
  mainMap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  }});
