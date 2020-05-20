import PedwayCoordinate from '../model/PedwayCoordinate';

test('Check Coordinate Constructor', () => {
  let testVar = new PedwayCoordinate(42, 42);
  expect(testVar !== null);

  testVar = new PedwayCoordinate(0, 0.1);
  expect(testVar !== null);

  testVar = new PedwayCoordinate(180, -180);
  expect(testVar !== null);

  testVar = new PedwayCoordinate(-70.20232, 42.353523);
  expect(testVar !== null);
});

test('Check Coordinate Getter', () => {
  let testVar = new PedwayCoordinate(42, 42);
  expect(testVar.getLatitude()).toBeCloseTo(42);
  expect(testVar.getLongitude()).toBeCloseTo(42);
  testVar = new PedwayCoordinate(0, 0.1);
  expect(testVar.getLatitude()).toBeCloseTo(0);
  expect(testVar.getLongitude()).toBeCloseTo(0.1);
  testVar = new PedwayCoordinate(180, -180);
  expect(testVar.getLatitude()).toBeCloseTo(180);
  expect(testVar.getLongitude()).toBeCloseTo(-180);
  testVar = new PedwayCoordinate(-70.20232, 42.353523);
  expect(testVar.getLatitude()).toBeCloseTo(-70.20232);
  expect(testVar.getLongitude()).toBeCloseTo(42.353523);
});


test('Check Coordinate Setter', () => {
  const testVar = new PedwayCoordinate(42, 42);
  expect(testVar.getLatitude()).toBeCloseTo(42);
  expect(testVar.getLongitude()).toBeCloseTo(42);
  testVar.setCoordinates(-70.20232, 42.353523);
  expect(testVar.getLatitude()).toBeCloseTo(-70.20232);
  expect(testVar.getLongitude()).toBeCloseTo(42.353523);
});


