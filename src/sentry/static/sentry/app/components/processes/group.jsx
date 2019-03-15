import jQuery from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import styled from 'react-emotion';
import { Flex, Box } from 'grid-emotion';

import Count from 'app/components/count';
import ProjectState from 'app/mixins/projectState';

import ProcessStore from 'app/stores/processStore';
import SelectedProcessStore from 'app/stores/selectedProcessStore';

import SampleHeader from 'app/components/processes/sampleHeader';
import { PanelItem } from 'app/components/panels';

// TODO: Should be called Task or similar

const ProcessesGroup = createReactClass({
  displayName: 'ProcessesGroup',

  propTypes: {
    id: PropTypes.string.isRequired,
    orgId: PropTypes.string.isRequired,
    canSelect: PropTypes.bool,
    query: PropTypes.string,
  },

  mixins: [Reflux.listenTo(ProcessStore, 'onProcessChange'), ProjectState],

  getDefaultProps() {
    return {
      canSelect: true,
      id: '',
      statsPeriod: '24h',
    };
  },

  getInitialState() {
    let data = ProcessStore.get(this.props.id);
    return {
      data,
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.id != this.props.id) {
      this.setState({
        data: ProcessStore.get(this.props.id),
      });
    }
  },

  onProcessChange(itemIds) {
    if (!itemIds.has(this.props.id)) {
      return;
    }
    let id = this.props.id;
    let data = ProcessStore.get(id);
    this.setState({
      data,
    });
  },

  toggleSelect(evt) {
    if (evt.target.tagName === 'A') return;
    if (evt.target.tagName === 'INPUT') return;
    if (jQuery(evt.target).parents('a').length !== 0) return;

    SelectedProcessStore.toggleSelect(this.state.data.id);
  },

  render() {
    const { data } = this.state;
    const { orgId, projectId, query, canSelect } = this.props;

    return (
      <TaskGroup onClick={this.toggleSelect} py={1} px={0} align="center">
        <TaskGroupSummary
          w={[8 / 12, 8 / 12, 6 / 12]}
          ml={canSelect ? 1 : 2}
          mr={1}
          flex="1"
        >
          <SampleHeader data={data} orgId={orgId} projectId={projectId} query={query} />
        </TaskGroupSummary>
        <Flex w={[40, 60, 80, 80]} mx={2} justify="flex-end">
          <StyledCount value={data.waitingCount} />
        </Flex>
      </TaskGroup>
    );
  },
});

const TaskGroup = styled(PanelItem)`
  line-height: 1.1;
`;

const TaskGroupSummary = styled(Box)`
  overflow: hidden;
`;

const StyledCount = styled(Count)`
  font-size: 18px;
  color: ${p => p.theme.gray3};
`;

export default ProcessesGroup;
