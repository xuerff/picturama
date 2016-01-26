require('./../dom-mock').default('<html><body></body></html>');

import jsdom from 'mocha-jsdom';
import assert from 'assert';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';

import PictureDetail from './../../src/components/picture-detail';

describe('PictureDetail Component', () => {
  jsdom({ skipWindowCheck: true });

  it('should toggle the flag', (done) => {
    let photo = {};

    let handleFlag = () => {
      console.log('test handle flg');
      done();
    };

    let picture = TestUtils.renderIntoDocument(
      <PictureDetail photo={photo} toggleFlag={handleFlag} />
    );

    TestUtils.Simulate.keyup(picture, 'p');
  });

 
  //describe('When adding a tag', () => {
  //  it('should deactivate keyboard listener', (done) => {
  //  });
  //});
});
