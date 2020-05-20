import PedwayAttraction from '../model/PedwayAttraction';
import PedwayCoordinate from '../model/PedwayCoordinate';

test('Check Coordinate Getter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  const testAttraction = new PedwayAttraction(testCoord);
  expect(testCoord).toEqual(testAttraction.getCoordinate());
});

test('Check Coordinate Setter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  const testCoord2 = new PedwayCoordinate(70.20232, -42.353523);
  const testAttraction = new PedwayAttraction(testCoord);
  expect(testCoord).toEqual(testAttraction.getCoordinate());
  expect(testCoord2).not.toEqual(testAttraction.getCoordinate());
  testAttraction.setCoordinate(testCoord2);
  expect(testCoord).not.toEqual(testAttraction.getCoordinate());
  expect(testCoord2).toEqual(testAttraction.getCoordinate());
});

test('Check Name Getter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  const testAttraction1 = new PedwayAttraction(testCoord);
  expect(testAttraction1.getName()).toBe('');
  const testAttraction2 = new PedwayAttraction(testCoord, 'Attraction 2');
  expect(testAttraction2.getName()).toBe('Attraction 2');
});

test('Check Name Setter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  let testAttraction = new PedwayAttraction(testCoord);
  testAttraction.setName('Attraction 1');
  expect(testAttraction.getName()).toBe('Attraction 1');

  testAttraction = new PedwayAttraction(testCoord, 'Attraction 2');
  testAttraction.setName('Attraction 2');

  testAttraction.setName('');
  expect(testAttraction.getName()).toBe('');

  testAttraction.setName('Attraction 25');
  expect(testAttraction.getName()).toBe('Attraction 25');
});

test('Check Hours Getter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  const testAttraction1 = new PedwayAttraction(testCoord);
  expect(testAttraction1.getHours()).toBe('');
  const testAttraction2 = new PedwayAttraction(testCoord, 'Attraction 2', 'Hours Open: Mon - Fri 7:00am - 2:00pm');
  expect(testAttraction2.getHours()).toBe('Hours Open: Mon - Fri 7:00am - 2:00pm');
});

test('Check Hours Setter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  let testAttraction = new PedwayAttraction(testCoord);
  testAttraction.setHours('Hours Open: Mon - Fri 7:00am - 2:00pm');
  expect(testAttraction.getHours()).toBe('Hours Open: Mon - Fri 7:00am - 2:00pm');

  testAttraction = new PedwayAttraction(testCoord, 'Attraction 2', 'Hours Open: Mon - Fri 7:00am - 2:00pm');
  testAttraction.setHours('Hours Open: Mon - Fri 9:00am - 5:00pm');
  expect(testAttraction.getHours()).toBe('Hours Open: Mon - Fri 9:00am - 5:00pm');

  testAttraction.setHours('');
  expect(testAttraction.getHours()).toBe('');
});
