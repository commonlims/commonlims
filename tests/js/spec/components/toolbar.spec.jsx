import React from 'react';
import Toolbar from 'app/components/toolbar';

import {render} from 'app-test/helpers/render';

import serializer from 'jest-emotion';
expect.addSnapshotSerializer(serializer);

describe('Toolbar', function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('renders', function () {
    const rendered = render(
      <Toolbar>
        <div />
      </Toolbar>
    );
    expect(rendered).toMatchSnapshot();
  });
});
