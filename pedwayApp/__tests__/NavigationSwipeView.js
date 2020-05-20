import NavigationSwipeView from '../components/NavigationSwipeView/NavigationSwipeView';
import testRenderer from 'react-test-renderer';
import React from 'react';


test('Check if our NavigationSwipeView renders correctly', () => {
  const treeRendered = testRenderer.create(<NavigationSwipeView />).toJSON();
  expect(treeRendered).toMatchSnapshot();
});

