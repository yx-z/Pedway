/**
 * model to save a list of coordinates representing a section of the pedway
 * the whole pedway is represented with a list of PedwaySections
 */
export default class PedwaySection {
  /**
   * constructor for this class
   * @param {Array} inputCoordinates
   */
  constructor(inputCoordinates = []) {
    this.coordinates = inputCoordinates;
  }

  /**
   * get an array of coordinates
   * @return {Array}
   */
  getCoordinates() {
    return this.coordinates;
  }

  /**
   * get an array of coordinates in JSON
   * @return {Array}
   */
  getJSONList() {
    let retVal = [];
    retVal = [];
    this.coordinates.forEach((item) => {
      retVal.push(item.getJSON());
    });
    return retVal;
  }

  /**
   * set the section to
   * @param {Array} inputCoordinates
   */
  setCoordinates(inputCoordinates) {
    this.coordinates = inputCoordinates;
  }
}
