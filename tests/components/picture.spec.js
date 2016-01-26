require('./../dom-mock')('<html><body></body></html>');

var jsdom = require('mocha-jsdom');
var assert = require('assert');
var React = require('react');
var TestUtils = require('react-addons-test-utils');

describe('Testing my div', function() {
  jsdom({ skipWindowCheck: true });

  it('should contain text: Lovely! Here it is - my very first React component!', function() {
    var Picture = require('./../../src/components/picture.js');
    var myDiv = TestUtils.renderIntoDocument(
      <Picture />
    );
    var divText = TestUtils.findRenderedDOMComponentWithTag(myDiv, 'span');

    assert.equal(divText.textContent, 'Lovely! Here it is - my very first React component!');
  });
});
