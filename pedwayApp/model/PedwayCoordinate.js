/**
 * model that defines coordinates in the pedway
 * we are only save latitude and longitude for now
 */
export default class PedwayCoordinate {
  /**
   * constructor for this class
   * @param {float} latitude saves the latitude
   * @param {float} longitude saves the longitude
   */
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * get the latitude for this coordinate
   * @return {float}
   */
  getLatitude() {
    return this.latitude;
  }

  /**
   * get the longitude for this coordinate
   * @return {float}
   */
  getLongitude() {
    return this.longitude;
  }

  /**
   * get the longitude for this coordinate in JSON form
   * @return {JSON}
   */
  getJSON() {
    return {latitude: this.getLatitude(), longitude: this.getLongitude()};
  }

  /**
   * set the coordinate to
   * @param {float} latitude saves the latitude
   * @param {float} longitude saves the longitude
   */
  setCoordinates(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}
