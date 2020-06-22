import {Flex, Box} from 'reflexbox';
import PropTypes from 'prop-types';
import React from 'react';
import {PanelItem} from 'app/components/panels';
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
    const {name, count, layout} = this.props;
    const {flexMargin, flexWidth} = layout;

    return (
      <PanelItem onClick={this.selectTask.bind(this)} py={1} px={0} align="center">
        <Flex flex="1">
          <Box w={flexWidth} mx={flexMargin} justify="flex-start">
            {name}
          </Box>
        </Flex>
        <Flex w={flexWidth} mx={flexMargin} justify="flex-start">
          <span className="task-list-item-sample-count">{count}</span>
        </Flex>
        <Flex w={flexWidth} mx={flexMargin} justify="flex-end">
          <Button onClick={this.selectTask.bind(this)}>Select Samples</Button>
        </Flex>
      </PanelItem>
    );
  }
}

TaskListItem.propTypes = {
  name: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  taskDefinitionKey: PropTypes.string.isRequired,
  layout: PropTypes.shape({
    flexWidth: PropTypes.number,
    flexMargin: PropTypes.number,
  }),
};

TaskListItem.defaultProps = {
  layout: {
    flexWidth: 300,
    flexMargin: 2,
  },
};

TaskListItem.displayName = 'TaskListItem';

export default TaskListItem;
