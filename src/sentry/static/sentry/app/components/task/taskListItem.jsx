import {Flex, Box} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import {PanelItem} from 'app/components/panels';
import Count from 'app/components/count';
import Button from 'app/components/button';

class TaskListItem extends React.Component {
  selectTask() {
    const {processKey} = this.props;
    // eslint-disable-next-line no-console
    console.info(
      'TODO: Redirect to Create New Work Batch (not implemented yet)',
      processKey
    );
  }

  render() {
    const {name, count} = this.props;

    return (
      <Group onClick={this.selectTask.bind(this)} py={1} px={0} align="center">
        <GroupSummary w={[8 / 12, 8 / 12, 6 / 12]} ml={2} mr={1} flex="1">
          {name}
        </GroupSummary>
        <Flex w={[40, 60, 80, 80]} mx={2} justify="flex-start">
          <StyledCount value={count} />
        </Flex>
        <Flex w={200} mx={2} justify="flex-end">
          <Button onClick={this.selectTask.bind(this)}>Select Samples</Button>
        </Flex>
      </Group>
    );
  }
}

TaskListItem.propTypes = {
  name: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  processKey: PropTypes.string.isRequired,
};

TaskListItem.displayName = 'TaskListItem';

const Group = styled(PanelItem)`
  line-height: 1.1;
`;

const GroupSummary = styled(Box)`
  overflow: hidden;
`;

const StyledCount = styled(Count)`
  font-size: 18px;
  color: ${p => p.theme.gray3};
`;

export default TaskListItem;
