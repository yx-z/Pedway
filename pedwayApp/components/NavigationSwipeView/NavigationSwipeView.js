import React, {Component} from 'react';
import styles from './styles';
import {TouchableOpacity, View, ActivityIndicator, Text} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Swiper from 'react-native-swiper';

// map of way types to icon names
// for more information checkout https://github.com/GIScience/openrouteservice-docs/blob/master/README.md
let vectorIconDisplayList = [
  'long-arrow-left',
  'long-arrow-right',
  'long-arrow-left',
  'long-arrow-right',
  'long-arrow-left',
  'long-arrow-right',
  'long-arrow-up',
  'long-arrow-up',
  'long-arrow-up',
  'long-arrow-down',
  'flag',
  'home',
  'long-arrow-left',
  'long-arrow-right',
];

let isProgrammaticallyUpdatingIndex = false;
/**
 * Swiper view based component that displays a list of navigation instructions
 * User can swipe to view the instructions
 * If user is centered on himself/herself(in focus mode), while user is walking, this swiper would swipe automatically
 * to display the most up-to-date instruction
 */

export default class NavigationSwipeView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navigationData: [],
      currentIndex: 0,
      dataRequested: false,
      previousIndex: 0,
    };
    this.updateState = this.updateState.bind(this);
    this.onIndexChanged = this.onIndexChanged.bind(this);
    this.updateSwiperViewIndex = this.updateSwiperViewIndex.bind(this);
    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);
  }

  componentDidMount() {
    this.updateState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      // previousIndex: this.state.currentIndex,
    }, () => {
      if (nextProps.navigationData !== this.state.navigationData) {
        this.updateState(nextProps);
      }
    });
  }

  updateState(inputProps) {
    this.updateSwiperViewIndex(0);
    this.setState({
      navigationData: inputProps.navigationData,
      dataRequested: inputProps.navigationDataRequested,
      currentIndex: 0,
    });

    // set the highlight segment for the path in groundmap to the initial segment
    try {
      let route = inputProps.navigationData['data']['routes'][0];
      let wayPoint = route['segments'][0]['steps'][0]['way_points'];
      this.props.updateSegmentStartEndCallback(wayPoint[0], wayPoint[1]);
    } catch (e) {}
  }

  /**
   * Takes in a 0 indexed index variable, and update the swiper view's index to that variable
   * @param idx
   */
  updateSwiperViewIndex(idx) {
    if (this.state.dataRequested) {
      isProgrammaticallyUpdatingIndex = true;
      this.swiper.scrollBy(idx - this.state.currentIndex + this.state.previousIndex, true);
    }
  }

  /**
   * callBack function that is triggered whenever the swiper view's index changes
   * this function also calls the corresponding function to update the highlighted segment on the mapView
   * @param inputIndex
   */
  onIndexChanged(inputIndex) {
    let acutalIndex = inputIndex + this.state.previousIndex;
    try {
      this.setState({
        currentIndex: acutalIndex,
      });

      let route = this.state.navigationData['data']['routes'][0];
      let wayPoint = route['segments'][0]['steps'][acutalIndex]['way_points'];
      this.props.updateSegmentStartEndCallback(wayPoint[0], wayPoint[1]);
    } catch (e) {
    }
  }

  /**
   * listener that is called when the scroll animation ended
   * we use the global isProgrammaticallyUpdatingIndex is check if this is due to a user swipe or not
   * if it is due to a user swipe, to need to set the focus mode of the groundmapView to false
   */
  onMomentumScrollEnd() {
    // if user is scrolling it, we need to unlock the mapView to let it not in focus
    if (!isProgrammaticallyUpdatingIndex) {
      this.props.setMapInFocus(false);
    }
    isProgrammaticallyUpdatingIndex = false;
  }

  render() {
    if (this.state.dataRequested === false) {
      return (
        <View style={styles.outerContainer}>
          <View style={styles.innerContainer}>
            <ActivityIndicator
              size='large'
              color='#fff'
              animating={true}
              style={styles.activityIndicator}
            />
          </View>
        </View>
      );
    } else {
      // right now using the first route
      let navigationData = [];
      try {
        navigationData = this.state.navigationData['data']['routes'][0]['segments'][0]['steps'];
      } catch (e) {
      }
      let swiperViewData = navigationData.map((item, idx)=>{
        return (
          <View style={styles.rowFlexContainer} key={idx}>
            <View style={styles.iconOuterContainer}>
              <View style={styles.iconInnerContainer}>
                <Icon name={vectorIconDisplayList[item['type']]} style={styles.instructionIcon}/>
              </View>
            </View>
            <View style={styles.colFlexContainer}>
              <Text style={styles.instructionLabel} numberOfLines={3}>{item['instruction']}</Text>
              <Text style={styles.distanceLabel}>{ + (idx + 1) + '/' +
              this.state.navigationData['data']['routes'][0]['segments'][0]['steps'].length +
              '  ' + item['distance'] + 'm'}</Text>
            </View>
          </View>
        );
      });
      return (
        <View style={styles.outerContainer}>
          <View style={styles.innerContainer}>
            <Swiper
              loop={false}
              showsButton={true}
              showsPagination={false}
              onIndexChanged={this.onIndexChanged}
              onMomentumScrollEnd={this.onMomentumScrollEnd}
              ref={(swiper) => {
                this.swiper = swiper;
              }}>
              { swiperViewData }
            </Swiper>
          </View>
        </View>
      );
    }
  }
}
