import React, {Component} from 'react';
import PedwayCoordinate from '../../model/PedwayCoordinate';
import PedwayEntrance from '../../model/PedwayEntrance';
import MapView from 'react-native-maps';

/**
 * The current pedway sections are hard coded place holders
 * In the future we are gonna to get those values from the API
 * */
export default class RenderLocation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pedwayLocations: [],
    };
    this.parseJSONtoModel = this.parseJSONtoModel.bind(this);
  }

  /**
   * parses the representation of a list of locations fetched from the point of interest api
   * into a list of locations
   * the coordinate and status will be set according to the inputJSON
   * @param inputJSON
   */
  parseJSONtoModel(inputJSON) {
    const locations = inputJSON.filter((item) => {
      try {
        if (item['geometry']['type'] === 'Point') {
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }).reduce((acc, item) => {
      const thisLongitude = item['geometry']['coordinates'][0];
      const thisLatitude = item['geometry']['coordinates'][1];
      const thisName = item['properties']['name'];
      return acc.concat(
          new PedwayEntrance(new PedwayCoordinate(
              thisLatitude,
              thisLongitude),
          true,
          false,
          thisName));
    }, []);
    this.setState({
      pedwayLocations: locations,
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
   * renders the location list parsed from the inputJSON into a list of markers on the map
   * onclickListener is setup for the markers so that the user can click on a marker and bring up
   * the corresponding slingupview
   * @returns {*[]}
   */
  render() {
    const retMarkerList = this.state.pedwayLocations.map((input, idx) => {
      return (
        <MapView.Marker
          coordinate={input.getCoordinate().getJSON()}
          key={idx}
          onPress={()=>{
            this.props.callbackFunc(this.state.pedwayLocations[idx], false);
          }}
        />
      );
    },
    );
    return (
      retMarkerList
    );
  }
}
