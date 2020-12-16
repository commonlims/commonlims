import {Flex, Box} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import {PanelItem} from 'app/components/panels';
import Button from 'app/components/button';

class WorkUnitListItem extends React.Component {
  selectWorkUnit() {
    const {workDefinitionKey} = this.props;
    // eslint-disable-next-line no-console
    console.info(
      'TODO: Redirect to Create New Work Batch (not implemented yet)',
      workDefinitionKey
    );
  }

  render() {
    const {name, count, layout} = this.props;
    const {flexMargin, flexWidth} = layout;

    return (
      <PanelItem onClick={this.selectWorkUnit.bind(this)} py={1} px={0} align="center">
        <Flex flex="1">
          <Box w={flexWidth} mx={flexMargin} justify="flex-start">
            {name}
          </Box>
        </Flex>
        <Flex w={flexWidth} mx={flexMargin} justify="flex-start">
          <span className="workUnit-list-item-sample-count">{count}</span>
        </Flex>
        <Flex w={flexWidth} mx={flexMargin} justify="flex-end">
          <Button onClick={this.selectWorkUnit.bind(this)}>Select Samples</Button>
        </Flex>
      </PanelItem>
    );
  }
}

WorkUnitListItem.propTypes = {
  name: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  workDefinitionKey: PropTypes.string.isRequired,
  layout: PropTypes.shape({
    flexWidth: PropTypes.number,
    flexMargin: PropTypes.number,
  }),
};

WorkUnitListItem.defaultProps = {
  layout: {
    flexWidth: 300,
    flexMargin: 2,
  },
};

WorkUnitListItem.displayName = 'WorkUnitListItem';

export default WorkUnitListItem;
