import {Flex} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import {PanelBody} from 'app/components/panels';
import WorkUnitListItem from 'app/components/workUnit/workUnitListItem';

class ProcessListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showWorkUnits: true,
    };
    this.layout = {
      flexWidth: 300,
      flexMargin: 2,
    };
  }

  toggleWorkUnits() {
    this.setState({
      showWorkUnits: !this.state.showWorkUnits,
    });
  }

  renderWorkUnits() {
    const {workUnits} = this.props;
    return workUnits.map((workUnit, i) => {
      const {count, name, workDefinitionKey} = workUnit;
      return (
        <WorkUnitListItem
          name={name}
          count={count}
          workDefinitionKey={workDefinitionKey}
          layout={this.layout}
          key={i}
        />
      );
    });
  }

  render() {
    const {processDefinitionName, processDefinitionKey, count} = this.props;
    const {showWorkUnits} = this.state;
    const workUnitListClass = showWorkUnits ? '' : 'hidden';
    const samplesLabelText = count === 1 ? 'sample' : 'samples';
    const {flexWidth, flexMargin} = this.layout;

    return (
      <ProcessListItemContainer>
        <Sticky
          onClick={this.toggleWorkUnits.bind(this)}
          className="process-list-item-header"
        >
          <StyledFlex py={1} px={0} align="center">
            <Flex flex="1">
              <Flex w={flexWidth} mx={flexMargin} justify="flex-start">
                {processDefinitionName || processDefinitionKey}
              </Flex>
            </Flex>
            <Flex w={flexWidth} mx={flexMargin} justify="flex-start">
              {count} {samplesLabelText}
            </Flex>
            <Flex w={flexWidth} mx={flexMargin} justify="flex-end" />
          </StyledFlex>
        </Sticky>
        <PanelBody className={workUnitListClass}>{this.renderWorkUnits()}</PanelBody>
      </ProcessListItemContainer>
    );
  }
}

ProcessListItem.propTypes = {
  processDefinitionKey: PropTypes.string.isRequired,
  processDefinitionName: PropTypes.string,
  count: PropTypes.number.isRequired,
  workUnits: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      workDefinitionKey: PropTypes.string.isRequired,
    })
  ),
};

ProcessListItem.displayName = 'ProcessListItem';

const Sticky = styled.div`
  position: sticky;
  z-index: ${(p) => p.theme.zIndex.header};
  top: -1px;
`;

const StyledFlex = styled(Flex)`
  align-items: center;
  background: ${(p) => p.theme.offWhite};
  border-bottom: 1px solid ${(p) => p.theme.borderDark};
  border-radius: ${(p) => p.theme.borderRadius} ${(p) => p.theme.borderRadius} 0 0;
  margin-bottom: -1px;
`;

const ProcessListItemContainer = styled.div`
  border-bottom: 1px solid ${(p) => p.theme.borderDark};
`;

export default ProcessListItem;
