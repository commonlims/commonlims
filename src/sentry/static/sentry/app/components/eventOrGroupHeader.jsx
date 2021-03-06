import PropTypes from 'prop-types';
import React from 'react';
import {withRouter, Link} from 'react-router';
import styled, {css} from 'react-emotion';
import classNames from 'classnames';
import {capitalize} from 'lodash';

import ProjectLink from 'app/components/projectLink';
import {Metadata} from 'app/sentryTypes';
import EventOrGroupTitle from 'app/components/eventOrGroupTitle';
import Tooltip from 'app/components/tooltip';

/**
 * Displays an event or group/issue title (i.e. in Stream)
 */
class EventOrGroupHeader extends React.Component {
  static propTypes = {
    params: PropTypes.object,
    /** Either an issue or event **/
    data: PropTypes.shape({
      id: PropTypes.string,
      level: PropTypes.string,
      type: PropTypes.oneOf([
        'error',
        'csp',
        'hpkp',
        'expectct',
        'expectstaple',
        'default',
      ]).isRequired,
      title: PropTypes.string,
      metadata: Metadata,
      groupID: PropTypes.string,
      culprit: PropTypes.string,
    }),
    includeLink: PropTypes.bool,
    hideIcons: PropTypes.bool,
    hideLevel: PropTypes.bool,
    query: PropTypes.string,
  };

  static defaultProps = {
    includeLink: true,
  };

  getMessage() {
    const {data} = this.props;
    const {metadata, type, culprit} = data || {};

    switch (type) {
      case 'error':
        return metadata.value;
      case 'csp':
        return metadata.message;
      case 'expectct':
      case 'expectstaple':
      case 'hpkp':
        return '';
      default:
        return culprit || '';
    }
  }

  getLocation() {
    const {data} = this.props;
    const {metadata} = data || {};
    return metadata.filename || null;
  }

  getTitle() {
    const {hideIcons, hideLevel, includeLink, data, params} = this.props;
    const {orgId, projectId} = params;

    const {id, level, groupID} = data || {};
    const isEvent = !!data.eventID;

    const props = {};
    let Wrapper;

    const basePath = projectId
      ? `/${orgId}/${projectId}/issues/`
      : `/organizations/${orgId}/issues/`;

    if (includeLink) {
      props.to = {
        pathname: `${basePath}${isEvent ? groupID : id}/${
          isEvent ? `events/${data.id}/` : ''
        }`,
        search: `${
          this.props.query ? `?query=${window.encodeURIComponent(this.props.query)}` : ''
        }`,
      };
      if (projectId) {
        Wrapper = ProjectLink;
      } else {
        Wrapper = Link;
      }
    } else {
      Wrapper = 'span';
    }

    return (
      <Wrapper
        {...props}
        style={data.status === 'resolved' ? {textDecoration: 'line-through'} : null}
      >
        {!hideLevel && level && (
          <Tooltip title={`Error level: ${capitalize(level)}`}>
            <GroupLevel level={data.level} />
          </Tooltip>
        )}
        {!hideIcons && data.status === 'ignored' && <Muted className="icon-soundoff" />}
        {!hideIcons && data.isBookmarked && <Starred className="icon-star-solid" />}
        <EventOrGroupTitle
          {...this.props}
          style={{fontWeight: data.hasSeen ? 400 : 600}}
        />
      </Wrapper>
    );
  }

  render() {
    const {className} = this.props;
    const cx = classNames('event-issue-header', className);
    const message = this.getMessage();
    const location = this.getLocation();

    return (
      <div className={cx}>
        <Title>{this.getTitle()}</Title>
        {location && <Location>{location}</Location>}
        {message && <Message>{message}</Message>}
      </div>
    );
  }
}

const truncateStyles = css`
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Title = styled.div`
  ${truncateStyles};
  margin: 0 0 5px;
  & em {
    font-size: 14px;
    font-style: normal;
    font-weight: 300;
    color: ${(p) => p.theme.gray3};
  }
`;

const LocationWrapper = styled.div`
  ${truncateStyles};
  direction: rtl;
  text-align: left;
  font-size: 14px;
  margin: 0 0 5px;
  color: ${(p) => p.theme.gray3};
  span {
    direction: ltr;
  }
`;

function Location(props) {
  const {children, ...rest} = props;
  return (
    <LocationWrapper {...rest}>
      in <span>{children}</span>
    </LocationWrapper>
  );
}

const Message = styled.div`
  ${truncateStyles};
  font-size: 14px;
  margin: 0 0 5px;
`;

const iconStyles = css`
  font-size: 14px;
  margin-right: 5px;
`;

const Muted = styled.span`
  ${iconStyles};
  color: ${(p) => p.theme.red};
`;

const Starred = styled.span`
  ${iconStyles};
  color: ${(p) => p.theme.yellowOrange};
`;

const GroupLevel = styled.div`
  position: absolute;
  left: -1px;
  width: 9px;
  height: 15px;
  border-radius: 0 3px 3px 0;

  background-color: ${(p) => {
    switch (p.level) {
      case 'sample':
        return p.theme.purple;
      case 'info':
        return p.theme.blue;
      case 'warning':
        return p.theme.yellowOrange;
      case 'error':
        return p.theme.orange;
      case 'fatal':
        return p.theme.red;
      default:
        return p.theme.gray2;
    }
  }};
`;

export default withRouter(EventOrGroupHeader);
