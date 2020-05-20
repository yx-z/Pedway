import RenderAttraction from '../components/RenderAttractions/RenderAttractions';
import testRenderer from 'react-test-renderer';
import React from 'react';
import PedwayMockData from '../mock_data/attractions';


test('Check if our RenderAttractions renders correctly', () => {
  const treeRendered = testRenderer.create(<RenderAttraction />).toJSON();
  expect(treeRendered).toMatchSnapshot();
});


test('test JSON helpers', ()=>{
  const treeRendered = testRenderer.create(<RenderAttraction
    JSONData={PedwayMockData}/>).toJSON();
  expect(treeRendered.length).toBe(16);
});
