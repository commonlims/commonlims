import {Flex} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import {PanelBody} from 'app/components/panels';
import TaskListItem from 'app/components/task/taskListItem';

class ProcessListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTasks: true,
    };
    this.flexWidth = 300;
    this.flexMargin = 2;
  }

  toggleTasks() {
    this.setState({
      showTasks: !this.state.showTasks,
    });
  }

  renderTasks() {
    const {tasks} = this.props;
    return tasks.map((task, i) => {
      const {count, name, taskDefinitionKey} = task;
      return (
        <TaskListItem
          name={name}
          count={count}
          taskDefinitionKey={taskDefinitionKey}
          flexWidth={this.flexWidth}
          flexMargin={this.flexMargin}
          key={i}
        />
      );
    });
  }

  render() {
    const {processDefinitionName, processDefinitionKey, count} = this.props;
    const {showTasks} = this.state;
    const taskListClass = showTasks ? '' : 'hidden';
    const samplesLabelText = count === 1 ? 'sample' : 'samples';

    return (
      <ProcessListItemContainer>
        <Sticky
          onClick={this.toggleTasks.bind(this)}
          className="process-list-item-header"
        >
          <StyledFlex py={1} px={0} align="center">
            <Flex flex="1">
              <Flex w={this.flexWidth} mx={this.flexMargin} justify="flex-start">
                {processDefinitionName || processDefinitionKey}
              </Flex>
            </Flex>
            <Flex w={this.flexWidth} mx={this.flexMargin} justify="flex-start">
              {count} {samplesLabelText}
            </Flex>
            <Flex w={this.flexWidth} mx={this.flexMargin} justify="flex-end" />
          </StyledFlex>
        </Sticky>
        <PanelBody className={taskListClass}>{this.renderTasks()}</PanelBody>
      </ProcessListItemContainer>
    );
  }
}

ProcessListItem.propTypes = {
  processDefinitionKey: PropTypes.string.isRequired,
  processDefinitionName: PropTypes.string,
  count: PropTypes.number.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.shape({})),
};

ProcessListItem.displayName = 'ProcessListItem';

const Sticky = styled.div`
  position: sticky;
  z-index: ${p => p.theme.zIndex.header};
  top: -1px;
`;

const StyledFlex = styled(Flex)`
  align-items: center;
  background: ${p => p.theme.offWhite};
  border-bottom: 1px solid ${p => p.theme.borderDark};
  border-radius: ${p => p.theme.borderRadius} ${p => p.theme.borderRadius} 0 0;
  margin-bottom: -1px;
`;

const ProcessListItemContainer = styled.div`
  border-bottom: 1px solid ${p => p.theme.borderDark};
`;

export default ProcessListItem;
