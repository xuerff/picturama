require('./../dom-mock').default('<html><body></body></html>');

import jsdom from 'mocha-jsdom';
import assert from 'assert';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';

import Picture from './../../src/components/picture';

describe('Picture Component', () => {
  jsdom({ skipWindowCheck: true });

  it('should fire setCurrent after click', (done) => {
    let photo = {};

    let handleCurrent = () => {
      done();
    };

    let picture = TestUtils.renderIntoDocument(
      <Picture photo={photo} setCurrent={handleCurrent} />
    );

    TestUtils.Simulate.click(
      TestUtils.findRenderedDOMComponentWithTag(picture, 'a')
    );
  });
});
