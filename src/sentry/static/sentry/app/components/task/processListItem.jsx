import {Flex} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import {PanelBody} from 'app/components/panels';
import TaskListItem from 'app/components/task/taskListItem';

class ProcessListItem extends React.Component {
  toggleProcess() {
    // TODO
  }

  renderTasks() {
    const {tasks} = this.props;
    return tasks.map((task, i) => {
      const {count, name, processKey} = task;
      return <TaskListItem name={name} count={count} processKey={processKey} key={i} />;
    });
  }

  samplesLabelText(count) {
    return count === 1 ? 'sample' : 'samples';
  }

  render() {
    const {processDefinitionName, processDefinitionKey, count} = this.props;

    return (
      <ProcessListItemContainer>
        <Sticky>
          <StyledFlex py={1} px={0} align="center">
            <Flex flex="1">
              <Flex w={200} mx={2} justify="flex-start">
                {processDefinitionName || processDefinitionKey}
              </Flex>
            </Flex>
            <Flex w={200} mx={2} justify="flex-start">
              {count} {this.samplesLabelText(count)}
            </Flex>
            <Flex w={200} mx={2} justify="flex-end" />
          </StyledFlex>
        </Sticky>
        <PanelBody>{this.renderTasks()}</PanelBody>
      </ProcessListItemContainer>
    );
  }
}

ProcessListItem.propTypes = {
  processDefinitionKey: PropTypes.string.isRequired,
  processDefinitionName: PropTypes.string.isRequired,
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
