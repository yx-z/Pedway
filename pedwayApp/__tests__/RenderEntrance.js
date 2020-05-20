import RenderEntrance from '../components/RenderEntrance/RenderEntrance';
import testRenderer from 'react-test-renderer';
import React from 'react';
import PedwayMockData from '../mock_data/export';


test('Check if our RenderPedway renders correctly', () => {
  const treeRendered = testRenderer.create(<RenderEntrance />).toJSON();
  expect(treeRendered).toMatchSnapshot();
});


test('test JSON helpers', ()=>{
  const totalEntranceAmount = 77;
  const treeRendered = testRenderer.create(<RenderEntrance
    JSONData={PedwayMockData}/>).toJSON();
  expect(treeRendered.length).toBe(totalEntranceAmount);
});

