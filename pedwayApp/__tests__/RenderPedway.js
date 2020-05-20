import RenderPedway from '../components/RenderPedway/RenderPedway';
import testRenderer from 'react-test-renderer';
import React from 'react';
import PedwayMockData from '../mock_data/sections';


test('Check if our RenderPedway renders correctly', () => {
  const treeRendered = testRenderer.create(<RenderPedway />).toJSON();
  expect(treeRendered).toMatchSnapshot();
});


test('test JSON helpers', ()=>{
  const treeRendered = testRenderer.create(<RenderPedway JSONData={PedwayMockData}/>).toJSON();
  expect(treeRendered.length).toBe(336);
});
