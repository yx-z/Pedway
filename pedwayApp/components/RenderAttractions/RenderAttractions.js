import React, {Component} from 'react';
import PedwayCoordinate from '../../model/PedwayCoordinate';
import PedwayAttraction from '../../model/PedwayAttraction';
import MapView from 'react-native-maps';
import {Text, View} from '../GroundMapView/GroundMapView';

/**
 * Display all of the attractions located within the Pedway on the underground mapview
 * */
export default class RenderAttractions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pedwayAttractions: [],
    };
    this.parseJSONtoModel = this.parseJSONtoModel.bind(this);
  }

  /**
   * Parse provided JSON file to get coordinates of all attractions.
   * The filter step finds all JSON objects labeled as an 'attraction', which are of type 'point',
   * and then the reduce step is used to create a new PedwayAttraction using the corresponding coordinates.
   * */
  parseJSONtoModel(inputJSON) {
    const attractions = inputJSON['features'].filter((item) => {
      try {
        if (item['properties']['attraction'] === 'yes' &&
                    item['geometry']['type'] === 'Point') {
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }).reduce((acc, item) => {
      const thisLongitude = item['geometry']['coordinates'][0];
      const thisLatitude = item['geometry']['coordinates'][1];
      return acc.concat(
          new PedwayAttraction(new PedwayCoordinate(
              thisLatitude,
              thisLongitude),
          item['id'],
          item['properties']['hours']
          ));
    }, []);
    this.setState({
      pedwayAttractions: attractions,
    });
  }

  componentWillMount() {
    if (this.props.JSONData!==undefined) {
      this.parseJSONtoModel(this.props.JSONData);
    }
  }

  componentWillReceiveProps(next) {
    if (next.JSONData!==undefined) {
      this.parseJSONtoModel(next.JSONData);
    }
    this.forceUpdate();
  }

  /**
   * Render all obtained attractions on the map with a green pin marker
   * @returns {*[]}
   */
  render() {
    const retMarkerList = this.state.pedwayAttractions.map((input, idx) => {
      return (
        <MapView.Marker
          coordinate={input.getCoordinate().getJSON()}
          key={idx}
          pinColor='green'
          onPress={()=>{
            this.props.callbackFunc(this.state.pedwayAttractions[idx], false);
          }}
          title={input.getName()}
          description={input.getHours()}
        />
      );
    },
    );
    return (
      retMarkerList
    );
  }
}
