import jQuery from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import styled from '@emotion/styled';
import {Box} from 'reflexbox';

import SampleCheckBox from 'app/components/samples/sampleCheckBox';
import ProjectState from 'app/mixins/projectState';
import SampleStore from 'app/stores/sampleStore';
import GuideAnchor from 'app/components/assistant/guideAnchor';
import SelectedSampleStore from 'app/stores/selectedSampleStore';
import SampleHeader from 'app/components/samples/sampleHeader';
import {PanelItem} from 'app/components/panels';

const SampleComponent = createReactClass({
  displayName: 'SampleComponent',

  propTypes: {
    id: PropTypes.string.isRequired,
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    canSelect: PropTypes.bool,
    query: PropTypes.string,
    hasGuideAnchor: PropTypes.bool,
  },

  mixins: [Reflux.listenTo(SampleStore, 'onSampleChange'), ProjectState],

  getDefaultProps() {
    return {
      canSelect: true,
      id: '',
      statsPeriod: '24h',
    };
  },

  getInitialState() {
    return {
      data: SampleStore.get(this.props.id),
    };
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.id != this.props.id) {
      this.setState({
        data: SampleStore.get(this.props.id),
      });
    }
  },

  onSampleChange(itemIds) {
    if (!itemIds.has(this.props.id)) {
      return;
    }
    const id = this.props.id;
    const data = SampleStore.get(id);
    this.setState({
      data,
    });
  },

  toggleSelect(evt) {
    if (evt.target.tagName === 'A') {
      return;
    }
    if (evt.target.tagName === 'INPUT') {
      return;
    }
    if (jQuery(evt.target).parents('a').length !== 0) {
      return;
    }

    SelectedSampleStore.toggleSelect(this.state.data.id);
  },

  render() {
    const {data} = this.state;
    const {orgId, projectId, query, hasGuideAnchor, canSelect} = this.props;

    return (
      <Sample onClick={this.toggleSelect} py={1} px={0} align="center">
        {canSelect && (
          <SampleCheckBoxDiv ml={2}>
            {hasGuideAnchor && <GuideAnchor target="issues" type="text" />}
            <SampleCheckBox id={data.id} />
          </SampleCheckBoxDiv>
        )}
        <SampleEntrySummary
          w={[8 / 12, 8 / 12, 6 / 12]}
          ml={canSelect ? 1 : 2}
          mr={1}
          flex="1"
        >
          <SampleHeader data={data} orgId={orgId} projectId={projectId} query={query} />
        </SampleEntrySummary>
      </Sample>
    );
  },
});

const Sample = styled(PanelItem)`
  line-height: 1.1;
`;

const SampleEntrySummary = styled(Box)`
  overflow: hidden;
`;

const SampleCheckBoxDiv = styled(Box)`
  align-self: flex-start;
  & input[type='checkbox'] {
    margin: 0;
    display: block;
  }
`;

export default SampleComponent;
