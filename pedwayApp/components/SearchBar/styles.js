import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  searchBox: {
    position: 'absolute',
    top: 25,
    height: 50,
    width: 380,
    backgroundColor: '#FFFFFF',
    color: '#CCCCCC',
    textAlignVertical: 'center',
    marginLeft: 20,
    borderRadius: 10,
    zIndex: -1,
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
  textInput: {
    flex: 1,
    fontSize: 18,
    marginLeft: 80,
    textAlign: 'left',
    paddingTop: 12,
    marginRight: 20,
  },
});
