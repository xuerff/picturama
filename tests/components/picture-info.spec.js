import React from 'react';
import { shallow, render } from 'enzyme';
import { expect } from 'chai';

import PictureInfo from './../../dist/components/picture-info';

describe('<PictureInfo />', () => {
  it('renders an `.picture-info`', () => {
    let photo = { iso: 400, aperture: 2.8 };
    const wrapper = shallow(<PictureInfo photo={photo} />);

    expect(wrapper.find('.picture-info')).to.have.length(1);
  });

  it('should display the tags', () => {
    let photo = { name: 'test', iso: '400', aperture: 2, tags: [
      { title: 'my' },
      { title: 'fantastic' },
      { title: 'tags' }
    ] };

    const wrapper = render(<PictureInfo photo={photo} />);

    expect(wrapper.text()).to.contain(
      photo.tags.map((tag) => tag.title).join(', ')
    );
  });
});
