import {StyleSheet} from 'react-native';

export const positions = StyleSheet.create({
  undergroundButton: {
    zIndex: 0,
    position: 'absolute',
    top: 100,
    right: 20,
    width: 40,
    height: 40,
  },
  positionDown: {
    zIndex: 0,
    position: 'absolute',
    top: 160,
    right: 20,
    width: 40,
    height: 40,
  },
  hamburgerButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 60,
    height: 60,
  },
});

export const styles = StyleSheet.create({
  item: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 10,
    textAlign: 'center',
  },
  sideButton: {
    marginRight: 0,
    marginLeft: 0,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#a9a9a9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a9a9a9',
  },
  fillView: {
    flex: 1,
    zIndex: 0,
  },
});
