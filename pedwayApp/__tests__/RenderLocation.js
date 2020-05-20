import RenderLocation from '../components/RenderLocation/RenderLocation';
import testRenderer from 'react-test-renderer';
import React from 'react';


test('Check if our RenderLocation renders correctly', () => {
  const treeRendered = testRenderer.create(<RenderLocation />).toJSON();
  expect(treeRendered).toMatchSnapshot();
});


