import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Link} from 'react-router';
import styled from 'react-emotion';
import {Flex, Box} from 'grid-emotion';

import ProjectState from 'app/mixins/projectState';
import ShortId from 'app/components/shortId';
import {tct} from 'app/locale';

const SampleExtraDetails = createReactClass({
  displayName: 'SampleExtraDetails',

  propTypes: {
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    groupId: PropTypes.string.isRequired,
    subscriptionDetails: PropTypes.shape({
      reason: PropTypes.string,
    }),
    numComments: PropTypes.number,
    logger: PropTypes.string,
    annotations: PropTypes.arrayOf(PropTypes.string),
    assignedTo: PropTypes.shape({
      name: PropTypes.string,
    }),
    showAssignee: PropTypes.bool,
    shortId: PropTypes.string,
  },

  mixins: [ProjectState],

  render() {
    let {
      orgId,
      projectId,
      groupId,
      subscriptionDetails,
      numComments,
      logger,
      assignedTo,
      annotations,
      showAssignee,
      shortId,
    } = this.props;
    let styles = {};
    if (subscriptionDetails && subscriptionDetails.reason === 'mentioned') {
      styles = {color: '#57be8c'};
    }

    return (
      <SampleExtra align="center">
        {shortId && (
          <Box mr={2}>
            <SampleShortId shortId={shortId} />
          </Box>
        )}
        <SampleExtraCommentsAndLogger>
          {numComments > 0 && (
            <Box mr={2}>
              <Link
                to={`/${orgId}/${projectId}/issues/${groupId}/activity/`}
                className="comments"
              >
                <SampleExtraIcon className="icon icon-comments" style={styles} />
                <SampleExtraIcon className="tag-count">{numComments}</SampleExtraIcon>
              </Link>
            </Box>
          )}
          {logger && (
            <Box className="event-annotation" mr={2}>
              <Link
                to={{
                  pathname: `/${orgId}/${projectId}/`,
                  query: {
                    query: 'logger:' + logger,
                  },
                }}
              >
                {logger}
              </Link>
            </Box>
          )}
        </SampleExtraCommentsAndLogger>
        {annotations &&
          annotations.map((annotation, key) => {
            return (
              <Box
                className="event-annotation"
                dangerouslySetInnerHTML={{
                  __html: annotation,
                }}
                key={key}
              />
            );
          })}

        {showAssignee &&
          assignedTo && <Box>{tct('Assigned to [name]', {name: assignedTo.name})}</Box>}
      </SampleExtra>
    );
  },
});

const SampleExtra = styled(Flex)`
  color: ${p => p.theme.gray3};
  font-size: 12px;
  a {
    color: inherit;
  }
`;

const SampleExtraCommentsAndLogger = styled(Flex)`
  color: ${p => p.theme.gray4};
`;

const SampleShortId = styled(ShortId)`
  font-size: 12px;
  color: ${p => p.theme.gray3};
`;

const SampleExtraIcon = styled.span`
  font-size: 11px;
  margin-right: 4px;
`;

export default SampleExtraDetails;
