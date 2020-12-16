import {Flex, Box} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import {PanelItem} from 'app/components/panels';
import {Link} from 'react-router';

class WorkUnitListItem extends React.Component {
  render() {
    const {name, count, layout} = this.props;
    const {flexMargin, flexWidth} = layout;
    return (
      <PanelItem py={1} px={0} align="center">
        <Flex flex="1">
          <Box w={flexWidth} mx={flexMargin} justify="flex-start">
            <Link
              to={`/lab/available-work/${this.props.processDefinitionKey}:${this.props.workDefinitionKey}/`}
            >
              {name}
            </Link>
          </Box>
        </Flex>
        <Flex w={flexWidth} mx={flexMargin} justify="flex-start">
          <span className="workUnit-list-item-sample-count">{count}</span>
        </Flex>
        <Flex w={flexWidth} mx={flexMargin} justify="flex-end" />
      </PanelItem>
    );
  }
}

WorkUnitListItem.propTypes = {
  name: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  processDefinitionKey: PropTypes.string.isRequired,
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
