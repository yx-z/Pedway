import PedwaySection from '../model/PedwaySection';
import PedwayCoordinate from '../model/PedwayCoordinate';

test('Check Section Constructor', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  expect(testCoord !== null);
  const testSection = new PedwaySection([testCoord]);
  expect(testSection !== null);
});

test('Check Coordinates Getter', () => {
  const testCoord1 = new PedwayCoordinate(-70.20232, 42.353523);
  const testCoord2 = new PedwayCoordinate(-42.20232, 42.353523);

  const testSection = new PedwaySection([testCoord1, testCoord2]);
  expect(testSection.getCoordinates()).toEqual( [testCoord1, testCoord2]);
});


test('Check Coordinates Setter', () => {
  const testCoord1 = new PedwayCoordinate(-70.20232, 42.353523);
  const testCoord2 = new PedwayCoordinate(-42.20232, 42.353523);

  const testSection = new PedwaySection([testCoord1, testCoord2]);
  expect(testSection.getCoordinates()).toEqual([testCoord1, testCoord2]);
  testSection.setCoordinates([testCoord2, testCoord1]);
  expect(testSection.getCoordinates()).toEqual([testCoord2, testCoord1]);
});


