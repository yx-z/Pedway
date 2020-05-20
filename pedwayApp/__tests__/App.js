/**
 * @format
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 * Since for this iteration our user interface is static,
 * We are only asserting if the UI is rendered correctly
 */

import 'react-native';
import React from 'react';
import testRenderer from 'react-test-renderer';
import App from '../App.js';
import HomeScreen from '../App.js';
import MainView from '../App.js';
import GroundMapView from '../components/GroundMapView/GroundMapView';

test('Check if our main app renders correctly', () => {
  const treeRendered = testRenderer.create(<App />).toJSON();
  expect(treeRendered).toMatchSnapshot();
});

test('Check if our HomeScreen renders correctly', () => {
  const treeRendered = testRenderer.create(<HomeScreen />).toJSON();
  expect(treeRendered).toMatchSnapshot();
});

test('Check if our MainView renders correctly', () => {
  const treeRendered = testRenderer.create(<MainView />).toJSON();
  expect(treeRendered).toMatchSnapshot();
});

test('Check if our GroundMapView renders correctly', () => {
  const treeRendered = testRenderer.create(<GroundMapView />).toJSON();
  expect(treeRendered).toMatchSnapshot();
});

