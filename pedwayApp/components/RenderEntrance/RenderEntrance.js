import React, {Component} from 'react';
import {Image} from 'react-native';
import PedwayCoordinate from '../../model/PedwayCoordinate';
import PedwayEntrance from '../../model/PedwayEntrance';
import entrance from '../../media/entrances.png';
import MapView from 'react-native-maps';
/**
 * The current pedway sections are hard coded place holders
 * In the future we are gonna to get those values from the API
 * */
export default class RenderEntrance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pedwayEntrances: [],
    };
    this.parseJSONtoModel = this.parseJSONtoModel.bind(this);
  }

  /**
   * parses the representation of the pedway entrances fetched from the backend given in the inputJSON
   * into a list of pedwayEntrances
   * the coordinate and status will be set according to the inputJSON
   * @param inputJSON
   */
  parseJSONtoModel(inputJSON) {
    if (inputJSON === undefined || inputJSON['data'] === undefined) {
      return;
    }
    const entrances = inputJSON['data'].reduce((acc, item, idx) => {
      const thisLongitude = item['geometry']['coordinates'][0];
      const thisLatitude = item['geometry']['coordinates'][1];
      const thisStatus = item['status'];
      return acc.concat(
          new PedwayEntrance(new PedwayCoordinate(
              thisLatitude,
              thisLongitude), thisStatus,
          false,
          'Entrance #'+idx.toString()));
    }, []);
    this.setState({
      pedwayEntrances: entrances,
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
   * renders the pedwayEntrance list parsed from the inputJSON into a list of markers on the map
   * onclickListener is setup for the markers so that the user can click on a marker and bring up
   * the corresponding slingupview
   * @returns {*[]}
   */
  render() {
    const retMarkerList = this.state.pedwayEntrances.map((input, idx) => {
      return (
        <MapView.Marker
          coordinate={input.getCoordinate().getJSON()}
          key={idx}
          onPress={()=>{
            this.props.callbackFunc(this.state.pedwayEntrances[idx], true);
          }}
          tracksViewChanges={false}
        >
          <Image source={entrance} style={{width: 30, height: 30}} />
        </MapView.Marker>
      );
    },
    );
    return (
      retMarkerList
    );
  }
}
