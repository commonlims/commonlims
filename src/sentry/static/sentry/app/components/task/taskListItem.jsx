import {Flex, Box} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import {PanelItem} from 'app/components/panels';
import Count from 'app/components/count';
import Button from 'app/components/button';

class TaskListItem extends React.Component {
  selectTask() {
    const {taskDefinitionKey} = this.props;
    // eslint-disable-next-line no-console
    console.info(
      'TODO: Redirect to Create New Work Batch (not implemented yet)',
      taskDefinitionKey
    );
  }

  render() {
    const {name, count, flexMargin, flexWidth} = this.props;

    return (
      <Group onClick={this.selectTask.bind(this)} py={1} px={0} align="center">
        <Flex flex="1">
          <GroupSummary w={flexWidth} mx={flexMargin} justify="flex-start">
            {name}
          </GroupSummary>
        </Flex>
        <Flex w={flexWidth} mx={flexMargin} justify="flex-start">
          <StyledCount value={count} />
        </Flex>
        <Flex w={flexWidth} mx={flexMargin} justify="flex-end">
          <Button onClick={this.selectTask.bind(this)}>Select Samples</Button>
        </Flex>
      </Group>
    );
  }
}

TaskListItem.propTypes = {
  name: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  taskDefinitionKey: PropTypes.string.isRequired,
  flexWidth: PropTypes.number,
  flexMargin: PropTypes.number,
};

TaskListItem.defaultProps = {
  flexWidth: 200,
  flexMargin: 2,
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
