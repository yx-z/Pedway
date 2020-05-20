import FeedbackView from '../components/FeedbackView/FeedbackView';
import testRenderer from 'react-test-renderer';
import React from 'react';


test('Check if our FeedbackView renders correctly', () => {
  const treeRendered = testRenderer.create(<FeedbackView />).toJSON();
  expect(treeRendered).toMatchSnapshot();
});
