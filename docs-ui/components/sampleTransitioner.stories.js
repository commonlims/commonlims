import React from 'react';
import {storiesOf} from '@storybook/react';
import {withInfo} from '@storybook/addon-info';
import {withKnobs} from '@storybook/addon-knobs';

import SampleTransitioner from 'app/components/sampleTransitioner/sampleTransitioner';

const stories = storiesOf('sampleTransitioner|SampleTransitioner', module);
stories.addDecorator(withKnobs);

stories.add(
  'default',
  withInfo(
    'SampleTransitioner is a component for moving samples from one container to another'
  )(() => {
    const sampleBatch = {
      containers: [
        {
          dimensions: {
            cols: 12,
            rows: 8,
          },
          id: 1,
          isTemporary: false,
          name: 'HiSeqX-Thruplex_PL1_org_181212',
          typeName: '96 well plate',
        },
        {
          dimensions: {
            cols: 12,
            rows: 8,
          },
          id: 2,
          isTemporary: false,
          name: 'HiSeqX-Thruplex_PL1_org_181213',
          typeName: '96 well plate',
        },
      ],
      correlation: {
        handler: 'features.fragment_analyze.controller.FragmentAnalyzeController',
        hash: 'hash-with-signature-TODO',
        plugin: 'snpseq',
      },
      samples: [
        {
          id: 10,
          location: {
            col: 3,
            containerId: 1,
            row: 3,
          },
          name: 'sample1',
        },
        {
          id: 11,
          location: {
            col: 1,
            containerId: 1,
            row: 1,
          },
          name: 'sample2',
        },
      ],
      tempContainers: [],
      transitions: [],
    };

    return <SampleTransitioner sampleBatch={sampleBatch} />;
  })
);
