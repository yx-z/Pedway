import SlidingUpDetailView from '../components/SlidingUpDetailView/SlidingUpDetailView';
import testRenderer from 'react-test-renderer';
import React from 'react';


test('Check if our SlidingUpDetailView renders correctly', () => {
  const treeRendered = testRenderer.create(<SlidingUpDetailView />).toJSON();
  expect(treeRendered).toMatchSnapshot();
});

