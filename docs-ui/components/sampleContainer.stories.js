import React from 'react';
import {storiesOf} from '@storybook/react';
import {withInfo} from '@storybook/addon-info';
import {withKnobs} from '@storybook/addon-knobs';

import SampleContainer from 'app/components/sampleTransitioner/sampleContainer';

const stories = storiesOf('sampleTransitioner|SampleContainer', module);
stories.addDecorator(withKnobs);

stories.add(
  'default',
  withInfo('SampleContainer is a container for samples')(() => {
    const onWellClicked = () => {};
    const onWellMouseOver = () => {};
    const onMouseOut = () => {};

    return (
      <SampleContainer
        containerId={1}
        containerDirectionality={1}
        numColumns={2}
        numRows={2}
        onWellClicked={onWellClicked}
        onWellMouseOver={onWellMouseOver}
        onMouseOut={onMouseOut}
        samples={[]}
        transitionTargetLocationsOfHoveredSample={[]}
        activeSampleTransitionSourceLocation={null}
        transitionSourceLocations={[]}
        transitionTargetLocations={[]}
      />
    );
  })
);
