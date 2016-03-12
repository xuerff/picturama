import React from 'react';
import { shallow } from 'enzyme';
import {expect} from 'chai';

import PictureInfo from './../../dist/components/picture-info';

describe('<PictureInfo />', () => {

  //it('renders three <Foo /> components', () => {
  //  const wrapper = shallow(<MyComponent />);
  //  expect(wrapper.find(Foo)).to.have.length(3);
  //});

  it('renders an `.picture-info`', () => {
    let photo = { iso: 400, aperture: 2.8 };
    const wrapper = shallow(<PictureInfo photo={photo} />);

    expect(wrapper.find('.picture-info')).to.have.length(1);
  });

  //it('renders children when passed in', () => {
  //  const wrapper = shallow(
  //    <MyComponent>
  //      <div className="unique" />
  //    </MyComponent>
  //  );
  //  expect(wrapper.contains(<div className="unique" />)).to.equal(true);
  //});

  //it('simulates click events', () => {
  //  const onButtonClick = sinon.spy();
  //  const wrapper = shallow(
  //    <Foo onButtonClick={onButtonClick} />
  //  );
  //  wrapper.find('button').simulate('click');
  //  expect(onButtonClick.calledOnce).to.equal(true);
  //});

});
