import PedwayEntrance from '../model/PedwayEntrance';
import PedwayCoordinate from '../model/PedwayCoordinate';

test('Check Entrance Constructor', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  expect(testCoord !== null);
  let testEntrance = new PedwayEntrance(testCoord, 'open', false);
  expect(testEntrance !== null);
  testEntrance = new PedwayEntrance(testCoord, 'open', false, 'entrance1');
  expect(testEntrance !== null);
});

test('Check Coordinate Getter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  expect(testCoord !== null);
  const testEntrance = new PedwayEntrance(testCoord, 'open', false);
  expect(testCoord).toEqual(testEntrance.getCoordinate());
});

test('Check Status Getter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  const testEntrance = new PedwayEntrance(testCoord, 'open', false);
  expect(testEntrance.getStatus()).toBe('open');
});

test('Check Elevator Getter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  const testEntrance = new PedwayEntrance(testCoord, 'open', false);
  expect(testEntrance.getElevatorAvailability()).toBe(false);
});

test('Check Coordinate Setter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  const testCoord2 = new PedwayCoordinate(70.20232, -42.353523);
  const testEntrance = new PedwayEntrance(testCoord, 'open', false);
  expect(testCoord).toEqual(testEntrance.getCoordinate());
  expect(testCoord2).not.toEqual(testEntrance.getCoordinate());
  testEntrance.setCoordinate(testCoord2);
  expect(testCoord).not.toEqual(testEntrance.getCoordinate());
  expect(testCoord2).toEqual(testEntrance.getCoordinate());
});

test('Check Status Setter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  const testEntrance = new PedwayEntrance(testCoord, 'open', false);
  expect(testEntrance.getStatus()).toBe('open');
  testEntrance.setStatus('closed');
  expect(testEntrance.getStatus()).toBe('closed');
});


test('Check Elevator Setter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  const testEntrance = new PedwayEntrance(testCoord, 'open', false);
  testEntrance.setElevator(true);
  expect(testEntrance.getElevatorAvailability()).toBe(true);
});

test('Check Name Getter and Setter', () => {
  const testCoord = new PedwayCoordinate(-70.20232, 42.353523);
  let testEntrance = new PedwayEntrance(testCoord, 'open', false);
  testEntrance.setElevator(true);
  testEntrance.setName('Entrance 1');
  expect(testEntrance.getName()).toBe('Entrance 1');

  testEntrance = new PedwayEntrance(testCoord, 'open', false, 'Entrance 42');
  testEntrance.setName('Entrance 42');

  testEntrance.setName('');
  expect(testEntrance.getName()).toBe('');

  testEntrance.setName('Lorem ipsum dolor sit amet, ' +
    'consectetur adipiscing elit, sed do ' +
    'eiusmod tempor incididunt ut labore et dolore magna aliqua.');
  expect(testEntrance.getName()).toBe('Lorem ipsum dolor sit amet,' +
    ' consectetur adipiscing elit, sed do eiusmod t' +
    'empor incididunt ut labore et dolore magna aliqua.');
});

