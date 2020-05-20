/**
 * Model to save coordinates representing Pedway attractions
 */
export default class PedwayAttraction {
  /**
     * Constructor for PedwayAttraction
     * @param {PedwayCoordinate} inputCoordinate
     * @param {string} name
     */
  constructor(inputCoordinate, name = '', hours = '') {
    this.coordinate = inputCoordinate;
    this.name = name;
    this.hours = hours;
  }

  /**
     * Getter for a coordinate
     * @return {PedwayCoordinate}
     */
  getCoordinate() {
    return this.coordinate;
  }

  /**
     * Get coordinate JSON data
     * @return {JSON}
     */
  getJSON() {
    return ({
      coordinate: this.coordinate.getJSON(),
    });
  }

  /**
     * Setter for a coordinate
     * @param {PedwayCoordinate} inputCoordinate
     */
  setCoordinate(inputCoordinate) {
    this.coordinate = inputCoordinate;
  }

  /**
     * Setter for the name of the attraction
     * @param {string} name
     */
  setName(name) {
    this.name = name;
  }

  /**
     * Getter for the name of the attraction
     * @return {string} name
     */
  getName() {
    return this.name;
  }

  /**
   * Setter for the hours of the attraction
   * @param {string} hours
   */
  setHours(hours) {
    this.hours = hours;
  }

  /**
   * Getter for the hours of the attraction
   * @return {string} hours
   */
  getHours() {
    return this.hours;
  }
}

