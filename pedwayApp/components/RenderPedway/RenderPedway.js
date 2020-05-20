import React, {Component} from 'react';
import PedwaySection from '../../model/PedwaySection';
import PedwayCoordinate from '../../model/PedwayCoordinate';
import MapView from 'react-native-maps';

/**
 * Parse the GeoJSON representation of list of lineString and multiLineStrings into a list of polyline
 * that we can display on the map
 * */
export default class RenderPedway extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pedwaySections: [],
      strokeColor: '#FFEF8C',
      strokeWidth: 8,
      zIndex: 1,

    };
    this.parseJSONtoModel = this.parseJSONtoModel.bind(this);
    this.parseLineJSON = this.parseLineJSON.bind(this);
    this.parseMultiLineJSON = this.parseMultiLineJSON.bind(this);
  }

  /**
   * parse lineString in GeoJSON format into a pedway section
   * @param inputJSON The lineString we got
   * @returns {*}
   */
  parseLineJSON(inputJSON) {
    try {
      const retVal = [];
      inputJSON['geometry']['coordinates'].forEach((item) => {
        retVal.push(new PedwayCoordinate(item[1], item[0]));
      });
      return new PedwaySection(retVal);
    } catch (e) {
      return null;
    }
  }

  /**
   * parse multiLineString in GeoJSON format in to a list of pedway sections
   * @param inputJSON The multiLineString we got
   * @returns {*}
   */
  parseMultiLineJSON(inputJSON) {
    try {
      const retVal = [];
      inputJSON['geometry']['coordinates'].forEach((itemList) => {
        const thisList = [];
        itemList.forEach((item) => {
          thisList.push(new PedwayCoordinate(item[1], item[0]));
        });
        retVal.push(new PedwaySection(thisList));
      });
      return retVal;
    } catch (e) {
      return null;
    }
  }

  /**
   * parse a list of lineString and multiLineString into a list of path (a list of pedway sections)
   * @param inputJSON
   */
  parseJSONtoModel(inputJSON) {
    const paths = inputJSON['features'].filter((item) => {
      try {
        if (item['geometry']['type'] === 'LineString' ||
          item['geometry']['type'] === 'Polygon' ||
          item['geometry']['type'] === 'MultiLineString') {
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }).reduce((acc, item) => {
      if (item['geometry']['type'] === 'LineString') {
        const thisSection = this.parseLineJSON(item);
        return (thisSection !== null) ? (acc.concat(thisSection)) : (acc);
      } else if (item['geometry']['type'] === 'Polygon' ||
        item['geometry']['type'] === 'MultiLineString') {
        const thisSection = this.parseMultiLineJSON(item);
        return (thisSection !== null) ? (acc.concat(thisSection)) : (acc);
      } else {
        return acc;
      }
    }, []);
    this.setState({
      pedwaySections: paths,
    });
  }

  componentWillMount() {
    if (this.props.JSONData!==undefined) {
      this.parseJSONtoModel(this.props.JSONData);
    }
    if (this.props.strokeWidth!==undefined) {
      this.setState({
        strokeWidth: this.props.strokeWidth,
      });
    }
    if (this.props.strokeColor!==undefined) {
      this.setState({
        strokeColor: this.props.strokeColor,
      });
    }
    if (this.props.zIndex!==undefined) {
      this.setState({
        zIndex: this.props.zIndex,
      });
    }
  }

  componentWillReceiveProps(next) {
    if (this.props.JSONData!==undefined) {
      this.parseJSONtoModel(next.JSONData);
    }
  }

  /**
   * use the list of path we got from, display a list of Polyline on the map representing the pedway
   * @returns {*[]}
   */
  render() {
    return (
      this.state.pedwaySections.map((path, idx) => {
        return (
          <MapView.Polyline
            key={idx}
            coordinates={path.getJSONList()}
            strokeColor={this.state.strokeColor}
            strokeWidth={this.state.strokeWidth}
            style={{zIndex: this.state.zIndex}}
          />
        );
      })
    );
  }
}
