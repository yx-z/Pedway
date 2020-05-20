import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  backgroundView: {
    position: 'relative',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    // borderTopRightRadius: 10,
    // borderTopLeftRadius: 10,
    height: 150,
    zIndex: 100000,
  },
  aboveFlexContainer: {
    height: 80,
    backgroundColor: 'white',
  },
  belowFlexContainer: {
    height: 70,
    backgroundColor: 'white',
  },
  belowFlex: {
    flex: 1,
    flexDirection: 'row',
  },
  entranceLabel: {
    position: 'absolute',
    top: 20,
    left: 30,
    fontSize: 30,
    width: 300,
    color: '#222',
  },
  routeButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  routeBackgroundContainer: {
    top: 20,
    marginRight: 40,
  },
  routeButton: {
    fontSize: 40,
  },
  feedbackBackgroundContainer: {
    top: 0,
    marginRight: 50,
  },
  feedbackButton: {
    fontSize: 20,
  },
  statusLabelContainer: {
    borderRadius: 5,
    marginLeft: 30,
    height: 30,
  },
  statusLabelGreen: {
    backgroundColor: '#59b60f',
  },
  statusLabelRed: {
    backgroundColor: '#f44242',
  },
  statusLabelGrey: {
    backgroundColor: '#888',
  },
  statusLabelText: {
    fontSize: 17,
    padding: 4,
    color: '#fff',
  },
  coordinateText: {
    color: '#999',
    fontSize: 13,
    marginLeft: 30,
  },
});
