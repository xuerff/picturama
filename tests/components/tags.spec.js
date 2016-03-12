import React from 'react';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import store from './../../dist/store';
import Tags from './../../dist/components/tags';
import TagButton from './../../dist/components/tag-button';

describe('<Tags />', () => {
  it('renders a list of tags', () => {
    let tags = [
      { title: 'my' },
      { title: 'fantastic' },
      { title: 'tags' }
    ];

    const wrapper = shallow(
      <Provider store={store}>
        <Tags tags={tags} />
      </Provider>
    );

    expect(wrapper.find(TagButton)).to.have.length(3);
  });
});
