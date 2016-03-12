import React from 'react';
import { shallow } from 'enzyme';
import {expect} from 'chai';

import Settings from './../../dist/components/settings';

describe('<Settings />', () => {

  //it('renders three <Foo /> components', () => {
  //  const wrapper = shallow(<MyComponent />);
  //  expect(wrapper.find(Foo)).to.have.length(3);
  //});

  it('renders an `.picture-info`', () => {
    let photo = { iso: 400, aperture: 2.8 };
    const wrapper = shallow(<Settings />);

    expect(wrapper.find('.picture-info')).to.have.length(1);
  });

  //it('should display the tags', () => {
  //  let photo = { tags: [
  //    { title: 'my' },
  //    { title: 'fantastic' },
  //    { title: 'tags' },
  //  ] };

  //  const wrapper = shallow(<Settings />);
  //});
});

