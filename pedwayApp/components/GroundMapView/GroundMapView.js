import React, {Component} from 'react';
import styles from './styles';
import {Image, Platform, StyleSheet, Text, View, TouchableOpacity, ToastAndroid, Picker, PermissionsAndroid} from 'react-native';
import MapView, {
  Polyline,
} from 'react-native-maps';
import Dialog, {DialogContent, SlideAnimation, DialogTitle, DialogFooter, DialogButton} from 'react-native-popup-dialog';
import RenderPedway from '../RenderPedway/RenderPedway';
import MapStyle from './mapStyleDark';
import RenderEntrance from '../RenderEntrance/RenderEntrance';
import RenderLocation from '../RenderLocation/RenderLocation';
import RenderAttraction from '../RenderAttractions/RenderAttractions';
import circle from '../../media/pedwayEntranceMarker.png';
import axios from 'axios';
import RoundButton from '../RoundButton/RoundButton';
import * as polyline from 'google-polyline';
import PedwayCoordinate from '../../model/PedwayCoordinate';
import PedwaySection from '../../model/PedwaySection';
import {Keyboard} from 'react-native';
import PedwaySections from '../../mock_data/sections';
import {point, lineString} from '@turf/helpers';
import pointToLineDistance from '@turf/point-to-line-distance';
import distance from '@turf/distance';
import Attractions from '../../mock_data/attractions';
import FeedbackView from '../FeedbackView/FeedbackView';

const AZURE_API = 'https://pedway.azurewebsites.net/api';

const INITIAL_LATITUDE = 41.881898;
const INITIAL_LONGITUDE = -87.623977;
const INITIAL_DELTA = 0.007;
const RECENTER_DELTA = 0.005;
const MAXIMUM_OFFSET_DISTANCE = 0.1;
const PIN_COLOR = '#dc143c';

let LOCATION_SERVICE_AVAILABLE = false;


let isUserInitiatedRegionChange = false;
let appInitiated = false;
let nextMapState = undefined;

let currentSegmentIndex = -1;

/**
 * Renders a MapView that display the ground level map
 * we are setting provider to null and UrlTile to OpenStreetMap's API
 * to use OSM
 * If highlight segment is true, highlight color used for indexes within start and end
 * If greyscale is also true, grey scale color will be used for indexes < start index
 * The initial highlight segment is 0 to 1, only highlighting the first line in a route
 */
export default class GroundMapView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: INITIAL_LATITUDE,
      longitude: INITIAL_LONGITUDE,
      latitudeDelta: RECENTER_DELTA,
      longitudeDelta: RECENTER_DELTA,
      userLatitude: INITIAL_LATITUDE,
      userLongitude: INITIAL_LONGITUDE,
      error: null,
      pedwayData: undefined,
      updateGeoLocation: true,
      id: 0,
      navigate: false,
      navigateTo: null,
      navigateDataRequested: false,
      navigateJSON: null,
      searchData: [],
      navigateList: [],
      highlightSegment: true,
      greyScaleSegment: true,
      highlightSegmentStart: 0,
      highlightSegmentEnd: 1,
      strokeColor: '#234ca0',
      highlightStrokeColor: '#4185F4',
      greyScaleStrokeColor: '#777',
      underground: this.props.underground?false:this.props.underground,
      mapReady: false,
      mapInFocus: true,
      dialogVisibility: false,
      dialogContent: '',
      dialogTitle: '',
      dialogButtonText: '',
    };
    this.forwardSelectedEntrance = this.forwardSelectedEntrance.bind(this);
    this.renderPath = this.renderPath.bind(this);
    this.requestEntranceData = this.requestEntranceData.bind(this);
    this.recenter = this.recenter.bind(this);
    this.getGeometry = this.getGeometry.bind(this);
    this.renderMarkers =this.renderMarkers.bind(this);
    this.setSearchData = this.setSearchData.bind(this);
    this.getCurrentClosestSegment = this.getCurrentClosestSegment.bind(this);
    this.setMapInFocus = this.setMapInFocus.bind(this);
    this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this);
    this.mapOnPanDrag = this.mapOnPanDrag.bind(this);
    this.updateCurrentSegment = this.updateCurrentSegment.bind(this);
    this.positionDidUpdateCallback = this.positionDidUpdateCallback.bind(this);
    this.recalculatePath = this.recalculatePath.bind(this);
    this.updateNavigationState = this.updateNavigationState.bind(this);
    this.updateHighlightSegment = this.updateHighlightSegment.bind(this);
    this.onReachedDestination = this.onReachedDestination.bind(this);
    this.updateMapMode = this.updateMapMode.bind(this);
    this.findOntoString = this.findOntoString.bind(this);
    this.networkErrorHandler = this.networkErrorHandler.bind(this);
    this.showSuggestionToast = this.showSuggestionToast.bind(this);
    this.displayFeedbackWindow = this.displayFeedbackWindow.bind(this);
  }

  /**
   * Fetch the pedway entrance geoJSON data from the back end
   */
  requestEntranceData() {
    axios.get(AZURE_API + '/pedway/entrance').then((res) => {
      this.setState({
        pedwayData: res,
      });
    }).catch((e) => {
    },
    );
  }

  setSearchData(data) {
    this.setState({
      searchData: data,
    });
  }

  setMapInFocus(input) {
    this.setState({
      mapInFocus: input,
    });
  }

  /**
   * callBack function for refocusing the map and navigation whenever user position is updated
   * @param position
   * @param id reference for the listener (so we can unmount it)
   */
  positionDidUpdateCallback(position, id) {
    // also center during app init
    if (!appInitiated) {
      appInitiated = true;
      this.setState({
        Latitude: position.coords.latitude,
        Longitude: position.coords.longitude,
      });
    }
    this.setState({
      userLatitude: position.coords.latitude,
      userLongitude: position.coords.longitude,
      error: null,
      id: id,
    });
    if (this.state.navigate) {
      if (this.state.mapInFocus) {
        const region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: INITIAL_DELTA,
          longitudeDelta: INITIAL_DELTA,
        };

        this.map.animateToRegion(region, 1000);
        // update the current segment for the swiper view and navigation path while navigating
        this.updateCurrentSegment(position.coords.longitude, position.coords.latitude);
      } else {
        // although map is not in focus, we still need to check for recalculation
        this.getCurrentClosestSegment(position.coords.longitude, position.coords.latitude);
      }
    }
  }

  /**
   * get the /node id of the entrance, and make the api request
   * @param index
   */
  displayFeedbackWindow(index) {
    try {
      let nodeID = this.state.pedwayData['data'][index]['properties']['@id'];
      if (this.feedbackView !== null) {
        this.feedbackView.showDialog(nodeID);
      }
    } catch (e) {
    }
  }

  /**
   * watch user's real time location and update the map accordingly.
   * also check if have location permission or not, if no permission, toast no permission
   */
  async componentDidMount() {
    LOCATION_SERVICE_AVAILABLE = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (LOCATION_SERVICE_AVAILABLE) {
      let id = navigator.geolocation.watchPosition(
          (position) => {
            this.positionDidUpdateCallback(position, id);
          }, (error)=>{
            this.setState({dialogTitle: 'GPS Error',
              dialogVisibility: true,
              dialogContent: 'Oops, we lose you on the map. Please enable GPS access to the app. If you are underground, the GPS service may be unstable.',
              dialogButtonText: 'Dismiss',
            });
          }, {enableHighAccuracy: true, distanceFilter: 1});
      this.requestEntranceData();
    } else {
      this.setState({dialogTitle: 'GPS Error',
        dialogVisibility: true,
        dialogContent: 'You should grant permission access for this app',
        dialogButtonText: 'Dismiss',
      });
    }
  }

  /**
   * this function is called when user is navigation. Update the user's current segment
   * @param longitude
   * @param latitude
   */
  updateCurrentSegment(longitude, latitude) {
    // if the user is still in route, we just need to update his current section to the closest section
    if (this.state.navigateJSON!==undefined && this.state.navigateJSON!==null) {
      // here we need to check which of the line section is the user currently closest to
      // then set that section to the swiper view's props and update this state's segment start and end
      let [closestSegment, segmentIdx] = this.getCurrentClosestSegment(longitude, latitude);
      this.setState({
        highlightSegmentStart: closestSegment['way_points'][0],
        highlightSegmentEnd: closestSegment['way_points'][1],
      });
      // we also need to update the current index for the swiper view
      this.props.updateSwiperViewIndex(segmentIdx);
    }
  }

  /**
   * Helper for updateCurrentSegment, use turf to calculate the user's closest segment in navigation path
   * Take in user's current location and parses the user's current route from geoJSON representation into
   * turf data structure.
   * Then we can use the pointToLineDistance() method from turf to find out what step is the user currently
   * on in his/her route
   * We then return that closest segment and the index of that segment in the list
   * If this function finds the users is away from the closest section more than 50 meter,
   * it will call recalculatePath() to recalculate
   * @param longitude
   * @param latitude
   * @returns {*[]}
   */
  getCurrentClosestSegment(longitude, latitude) {
    let navigateRoute = this.state.navigateJSON['data']['routes'][0];
    let segmentList = navigateRoute['segments'][0]['steps'];
    let closestSegmentIdx = 0;
    let closestDistanceOverall = Number.MAX_VALUE;


    segmentList.forEach((item, idx) => {
      let currentDistance = Number.MAX_VALUE;
      // we have to consider that the destination is a point
      if (item['way_points'][0] !== item['way_points'][1]) {
        let thisLineSection = this.state.navigateList['coordinates'].slice(item['way_points'][0], item['way_points'][1] + 1);

        let currentLineArray = thisLineSection.map((item) => {
          return [item['longitude'], item['latitude']];
        }).reduce((acc, item) => {
          return acc.concat([item]);
        }, []);

        let currentLine = lineString(currentLineArray);
        let currentPoint = point([longitude, latitude]);
        currentDistance = pointToLineDistance(currentPoint, currentLine);
      }

      if (currentDistance < closestDistanceOverall) {
        closestDistanceOverall = currentDistance;
        closestSegmentIdx = idx;
      }
    });

    // now we need to check, if the next index is within 10 meters of the current index,
    // if so, we need to update it ahead of time
    let nextSegment = segmentList[closestSegmentIdx + 1];
    let currentDistance = 0;
    if (nextSegment['way_points'][0] !== nextSegment['way_points'][1]) {
      let thisLineSection = this.state.navigateList['coordinates'].slice(nextSegment['way_points'][0], nextSegment['way_points'][1] + 1);

      let currentLineArray = thisLineSection.map((item) => {
        return [item['longitude'], item['latitude']];
      }).reduce((acc, item) => {
        return acc.concat([item]);
      }, []);

      let currentLine = lineString(currentLineArray);
      let currentPoint = point([longitude, latitude]);
      currentDistance = pointToLineDistance(currentPoint, currentLine);
    } else {
      let currentPoint = point([longitude, latitude]);
      let destinationCoordinate = this.state.navigateList['coordinates'][nextSegment['way_points'][0]];
      let destinationPoint = point([destinationCoordinate['longitude'], destinationCoordinate['latitude']]);
      currentDistance = distance(currentPoint, destinationPoint);
    }

    if (currentDistance - 0.01 < closestDistanceOverall) {
      closestSegmentIdx += 1;
      closestDistanceOverall = currentDistance;
    }

    // check if user deviated more than 100 meters from the path
    if (closestDistanceOverall > MAXIMUM_OFFSET_DISTANCE) {
      this.recalculatePath(longitude, latitude);
    } else if (closestSegmentIdx === segmentList.length - 1) {
      // user reached the destination, we need to end navigation
      this.onReachedDestination();
    }

    // this.updateMapMode(closestSegmentIdx);
    if (closestSegmentIdx !== currentSegmentIndex) {
      currentSegmentIndex = closestSegmentIdx;
      this.updateMapMode(closestSegmentIdx);
    }

    return [segmentList[closestSegmentIdx], closestSegmentIdx];
  }

  /**
   * pass in the next idx the user is about to enter, check if the user is about to enter the pedway or not
   * @param idx
   */
  updateMapMode(idx) {
    let route = this.state.navigateJSON['data']['routes'][0];
    let nextInstruction = route['segments'][0]['steps'][idx]['instruction'];
    this.findOntoString(nextInstruction);
  }

  /**
   * parse the 'onto someRoad' in the instruction, if 'someRoad' === 'pedway', we need to show the suggestion toast
   * suggesting the user to use the underground mode
   * @param instruction
   */
  findOntoString(instruction) {
    let ontoIndex = instruction.indexOf('onto');
    let roadString = '';
    if (ontoIndex === -1) {
      let onIndex = instruction.indexOf('on');
      if (onIndex !== -1) {
        roadString = instruction.slice(onIndex + 3);
      } else {
        return;
      }
    } else {
      roadString = instruction.slice(ontoIndex + 5);
    }

    if (!this.state.underground && roadString === 'Pedway') {
      this.showSuggestionToast();
    }
  }

  /**
   * suggest user to take the pedway
   */
  showSuggestionToast() {
    ToastAndroid.showWithGravityAndOffset('Switch to underground mode to view the Pedway', ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 350);
  }

  /**
   * tell app component which entrance/attraction the user have selected
   * also make api request to the backend to get the updated status of the entrance
   * if there is a status change, we need to update our data stored in the app
   * @param inputEntrance   data of the entrance/attration
   * @param isEntrance  whether the selected marker is entrance or not
   */
  forwardSelectedEntrance(inputEntrance, isEntrance) {
    Keyboard.dismiss();
    if (this.props.selectedMarkerCallback !== undefined) {
      this.props.selectedMarkerCallback(inputEntrance, isEntrance);
    }
    //
    if (isEntrance) {
      let entranceIndexString = inputEntrance.getName().slice(10);
      try {
        let entranceIndex = parseInt(entranceIndexString);
        let nodeID = this.state.pedwayData.data[entranceIndex].id;
        // now we can make the api call and update our states
        axios.get(AZURE_API + '/pedway/entrance/' + nodeID)
            .then( (res) => {
              let newStatus = res.data.status;
              this.state.pedwayData.data[entranceIndex].status = newStatus;
              inputEntrance.setStatus(newStatus);
              this.props.selectedMarkerCallback(inputEntrance, isEntrance);
            })
            .catch((e) => {});
      } catch (e) {
      }
    }
  }

  /**
   * This function is called whenever the user deviates from the path,
   * request a new path based on the location, and reset the UI for navigation
   * @param newLongitude
   * @param newLatitude
   */
  recalculatePath(newLongitude, newLatitude) {
    let destination = this.state.navigateTo;
    this.props.clearNavigationData();
    try {
      this.getGeometry([newLatitude, newLongitude],
          [destination.getCoordinate().getLatitude(), destination.getCoordinate().getLongitude()]);
    } catch (e) {
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setSearchData(nextProps.searchData);
    if (nextProps.underground !== this.state.underground && nextProps.underground) {
      this.setState({mapReady: false});
    }
    this.setState({underground: nextProps.underground});
  }

  /**
   * update the highlight segment of the line shown during routing to the start and end index
   * @param highlightSegmentStart
   * @param highlightSegmentEnd
   */
  updateHighlightSegment(highlightSegmentStart, highlightSegmentEnd) {
    if (this.state.navigate === true) {
      this.setState({
        highlightSegmentStart: highlightSegmentStart,
        highlightSegmentEnd: highlightSegmentEnd,
      });
    }
  }

  /**
   * helper function for app component to call
   * also pass in the initial highlight segment start end index
   * @param navigate bool, whether map should start naviagte
   * @param navigateTo  where is the point user want navigate to
   * @param highlightSegmentStart
   * @param highlightSegmentEnd
   */
  updateNavigationState(navigate, navigateTo, highlightSegmentStart, highlightSegmentEnd) {
    this.setState({
      navigateTo: navigateTo,
      navigateDataRequested: false,
    });

    if (navigate === false) {
      this.setState({
        navigate: false,
      });
    } else {
      this.setState({
        highlightSegmentStart: highlightSegmentStart,
        highlightSegmentEnd: highlightSegmentEnd,
        navigate: true,
      });
      this.renderPath(navigateTo);
    }
  }

  /**
   * fetch the directions data if the user what to start navigate
   * @param start
   * @param end
   * @returns {Promise<AxiosResponse<any> | never | void>}
   */
  getGeometry(start, end) {
    // https://pedway.azurewebsites.net/api/ors/directions?coordinates=
    currentSegmentIndex = -1;
    return axios.get(
        AZURE_API + '/ors/directions?coordinates='
      + start[1] + ',%20' + start[0] + '%7C' + end[1] + ',%20' + end[0] + '&profile=foot-walking')
        .then((json) => {
          this.props.updateNavigationDataCallback(json);
          this.state.navigateJSON = json;
          const geometry = json.data.routes[0].geometry;
          const coords = polyline.decode(geometry);
          let retList = [];
          coords.forEach((item)=>{
            retList.push(new PedwayCoordinate(item[0], item[1]));
          });
          let retSection = new PedwaySection(retList);
          this.setState({
            navigateDataRequested: true,
            navigateList: retSection,
          });
          try {
            let estimateSecond = json.data.routes[0].summary.duration;
            let estimateMinute = Math.ceil(estimateSecond/60);
            let warningString = '';
            if (estimateMinute > 60) {
              warningString = ' You are too far away from your destination, are you sure to take this path?';
            }
            ToastAndroid.showWithGravityAndOffset('Estimate Time: ' + String(estimateMinute) + 'min' + warningString,
                ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 350);
          } catch (e) {
          }
        })
        .catch(this.networkErrorHandler);
  }

  /**
   * Handle no network error. Open up a dialog telling the user that he/she loses connection.
   */
  networkErrorHandler() {
    this.setState({dialogTitle: 'Network Error',
      dialogVisibility: true,
      dialogButtonText: 'Dismiss',
      dialogContent: 'There is no network connection. Get back online and try again.'});
  }


  /**
   * request the API and render a path from this.state.latitude/longitude
   * to destinationCoordinate's coordinate
   * the latitdueDelta is the difference between max/min latitdue within a view frame
   * @param destinationCoordinate
   */
  renderPath(destinationCoordinate) {
    this.getGeometry([this.state.userLatitude, this.state.userLongitude],
        [destinationCoordinate.getCoordinate().getLatitude(), destinationCoordinate.getCoordinate().getLongitude()]);
  }

  /**
   * clear the geolocation watch
   */
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.state.id);
  }

  /**
   * retrun the map makers representing the pedway entrances.
   * @returns a view that contains all the pedway entrances.
   */
  renderMarkers() {
    if (this.state.searchData.length===0) {
      return (<RenderEntrance
        JSONData={this.state.pedwayData}
        callbackFunc={(input, isEntrance) => {
          this.forwardSelectedEntrance(input, isEntrance);
        }}/> +
        <RenderAttraction JSONData={Attractions}/>
      );
    } else {
      return (<RenderLocation
        JSONData={this.state.searchData}
        callbackFunc={(input, isEntrance) => {
          this.forwardSelectedEntrance(input, isEntrance);
        }}/>);
    }
  }

  /**
   * Use animation to recenter the camera to the user's current position.
   */
  recenter() {
    const region = {
      latitude: this.state.userLatitude,
      longitude: this.state.userLongitude,
      latitudeDelta: RECENTER_DELTA,
      longitudeDelta: RECENTER_DELTA,
    };
    this.setState({
      mapInFocus: true,
    });
    this.map.animateToRegion(region, 1000);
    this.updateCurrentSegment(this.state.userLongitude, this.state.userLatitude);
  }

  /**
   * callback function that is trigger whenever the map completes a region change
   * if the map is uninitialized, the initial location is (0,0)
   * only after the inital region change is completely, we can set mapReady to true
   * and render the components on the map
   * We also use this function together with mapOnPanDrag() to determine if a region
   * change is trigger by the user or done programmatically
   * @param regionChangedTo
   */
  onRegionChangeComplete(regionChangedTo) {
    this.setState({
      latitude: regionChangedTo.latitude,
      longitude: regionChangedTo.longitude,
      latitudeDelta: regionChangedTo.latitudeDelta,
      longitudeDelta: regionChangedTo.longitudeDelta,
    });
    if (!this.state.mapReady) {
      this.setState({
        mapReady: true,
      });
    }

    if (isUserInitiatedRegionChange) {
      this.setState({
        mapInFocus: false,
      });
    }

    if (nextMapState !== undefined) {
      let stateSave = nextMapState;
      nextMapState = undefined;
      this.props.setUnderground(stateSave);
    }

    isUserInitiatedRegionChange = false;
  }

  /**
   * this function gets called whenever user drags the map
   * we use this function together with onRegionChangeComplete() to determine if
   * the region change is done by the user or not
   * the latitdueDelta is the difference between max/min latitdue within a view frame
   */
  mapOnPanDrag() {
    isUserInitiatedRegionChange = true;
  }


  /**
   * this function is called when the user reached the destination
   * after a delay of 3 second, display a dialog stating the user have completed navigation
   * when user clicked 'ok', end this navigation
   */
  onReachedDestination() {
    setTimeout(
        () => {
          this.setState({
            dialogVisibility: true,
            dialogContent: '',
            dialogTitle: 'Navigation Completed',
            dialogButtonText: 'OK',
          });
        },
        2000);
  }

  render() {
    let pathToGo = [];
    let pathHighlight = [];
    let pathGreyScale = [];
    if (this.state.navigateDataRequested) {
      pathToGo = this.state.navigateList.getJSONList();
      if (this.state.highlightSegment) {
        pathHighlight = pathToGo.slice(this.state.highlightSegmentStart, this.state.highlightSegmentEnd + 1);
        if (this.state.greyScaleSegment) {
          pathGreyScale = pathToGo.slice(0, this.state.highlightSegmentStart + 1);
        }
        pathToGo = pathToGo.slice(this.state.highlightSegmentEnd);
      }
    }

    return (
      <View style={StyleSheet.absoluteFillObject}>
        <FeedbackView
          ref={(feedbackView) => {
            this.feedbackView = feedbackView;
          }}
        />
        <Dialog
          visible={this.state.dialogVisibility}
          width={0.7}
          dialogTitle={<DialogTitle title={this.state.dialogTitle}/>}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
          footer={
            <DialogFooter>
              <DialogButton
                text={this.state.dialogButtonText}
                onPress={()=>{
                  this.setState({dialogVisibility: false});
                  if (this.state.dialogTitle === 'Navigation Completed') {
                    // we need to end navigation
                    this.props.endNavigateCallback();
                  }
                  if (this.state.dialogTitle === 'Network Error' || this.state.dialogTitle === 'Unable to Route') {
                    this.props.endNavigateCallback();
                  }
                }}
              />
            </DialogFooter>
          }
          onTouchOutside={() => {
            this.setState({dialogVisibility: false});
          }}
        >{this.state.dialogContent===''?null:
          <DialogContent>
            <Text>{this.state.dialogContent}</Text>
          </DialogContent>}
        </Dialog>
        <RoundButton
          style={this.state.navigate?[styles.positionDown]:[styles.focusButton]}
          icon={'crosshairs'}
          func={this.recenter}/>
        <MapView
          ref={(mapView) => {
            this.map = mapView;
          }}
          style={styles.mainMap}
          key={this.state.underground}
          customMapStyle={this.state.underground? MapStyle : null}
          initialRegion={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: this.state.latitudeDelta,
            longitudeDelta: this.state.longitudeDelta,
          }}
          onRegionChangeComplete={this.onRegionChangeComplete}
          onPanDrag={this.mapOnPanDrag}
        >
          {this.state.navigate===true?
            <View>
              <Polyline
                coordinates={pathToGo}
                strokeColor={this.state.strokeColor}
                strokeWidth={5}
                style={{zIndex: 100000}}
              />
              <Polyline
                coordinates={pathHighlight}
                strokeColor={this.state.highlightStrokeColor}
                strokeWidth={6}
                style={{zIndex: 100000}}
              />
              <Polyline
                coordinates={pathGreyScale}
                strokeColor={this.state.greyScaleStrokeColor}
                strokeWidth={5}
                style={{zIndex: 100000}}
              />
            </View>:
            (this.state.searchData.length===0?
              <View>
                <RenderEntrance
                  JSONData={this.state.pedwayData}
                  callbackFunc={(input, isEntrance) => {
                    this.forwardSelectedEntrance(input, isEntrance);
                  }}/>
                <RenderAttraction
                  JSONData={Attractions}
                  callbackFunc={(input, isEntrance) => {
                    this.forwardSelectedEntrance(input, isEntrance);
                  }}
                />
              </View>:
              <RenderLocation
                JSONData={this.state.searchData}
                callbackFunc={(input, isEntrance) => {
                  this.forwardSelectedEntrance(input, isEntrance);
                }}/> )}

          <MapView.Marker
            coordinate={{
              latitude: this.state.userLatitude,
              longitude: this.state.userLongitude,
            }}
            style={{zIndex: 10}}
            title={'You'}
          >
            <Image source={circle} style={{width: 25, height: 25}} />
          </MapView.Marker>

          {this.state.navigate &&
          <MapView.Marker
            coordinate={{
              latitude: this.state.navigateTo.getCoordinate().getLatitude(),
              longitude: this.state.navigateTo.getCoordinate().getLongitude(),
            }}
            style={{zIndex: 10}}
            pinColor={PIN_COLOR}
          />
          }
          {this.state.underground && this.state.mapReady?
          <RenderPedway JSONData={PedwaySections}/>:null}
        </MapView>
      </View>);
  }
}

