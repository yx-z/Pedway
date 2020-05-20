import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#4185f4',
    height: 140,
    zIndex: 10,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  activityIndicator: {
  },
  rowFlexContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconOuterContainer: {
    width: 80,
    height: 80,
  },
  iconInnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colFlexContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',

  },
  instructionIcon: {
    fontSize: 35,
    color: 'white',
  },
  instructionLabel: {
    fontSize: 27,
    color: 'white',
    marginRight: 6,
  },
  distanceLabel: {
    fontSize: 13,
    color: 'white',
    marginTop: 10,
    marginBottom: 6,

  },
});

export default styles;
