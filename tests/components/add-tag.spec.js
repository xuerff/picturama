require('./../dom-mock').default('<html><body></body></html>');

import jsdom from 'mocha-jsdom';
import assert from 'assert';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import {expect} from 'chai';

import PictureDetail from './../../dist/components/picture-detail';
import AddTag from './../../dist/components/add-tag';

describe('AddTag Component', () => {
  jsdom({ skipWindowCheck: true });

  it('should deactivate keyboard listener', (done) => {
    done();
  });
});
