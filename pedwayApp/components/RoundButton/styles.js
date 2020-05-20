import {StyleSheet} from 'react-native';


const styles = StyleSheet.create({
  roundButton: {
    zIndex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
  },
  floating: {
    shadowOffset: {width: 30, height: 30},
    shadowColor: 'rgba(0, 0, 0, 0.6)',
    shadowOpacity: 0.8,
    elevation: 6,
    shadowRadius: 15,
    alignItems: 'center',
    textAlignVertical: 'center',
    opacity: 0.95,
  },
});

export default styles;
