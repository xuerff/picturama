require('./../dom-mock').default('<html><body></body></html>');

import jsdom from 'mocha-jsdom';
import assert from 'assert';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

import Picture from './../../src/components/picture';

describe('Testing my div', () => {
  jsdom({ skipWindowCheck: true });

  it('should contain text: Lovely! Here it is - my very first React component!', () => {
    let myDiv = TestUtils.renderIntoDocument(
      <Picture />
    );
    let divText = TestUtils.findRenderedDOMComponentWithTag(myDiv, 'span');

    assert.equal(divText.textContent, 'Lovely! Here it is - my very first React component!');
  });
});
