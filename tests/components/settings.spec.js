import React from 'react';
import { shallow } from 'enzyme';
import {expect} from 'chai';

import Settings from './../../dist/components/settings';

describe('<Settings />', () => {
  it('renders an `.picture-info`', () => {
    let photo = { iso: 400, aperture: 2.8 };
    const wrapper = shallow(<Settings />);

    expect(wrapper.find('#photos-dir')).to.have.length(1);
  });
});

