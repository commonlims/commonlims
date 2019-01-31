import PropTypes from 'prop-types';
import React from 'react';
import styled, {css} from 'react-emotion';
import classNames from 'classnames';

// TODO: Don't call it ProjectLink
import ProjectLink from 'app/components/projectLink';
import {Metadata} from 'app/sentryTypes';
import SampleTitle from 'app/components/samples/sampleTitle';

/**
 * Displays an event or group/issue title (i.e. in Stream)
 */
class SampleHeader extends React.Component {
  static propTypes = {
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
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

  getContainer() {
    let {data} = this.props;
    let {container, position} = data || {};
    return position + '@' + container;
  }

  getTitle() {
    let {hideIcons, includeLink, orgId, data} = this.props;
    let props = {};
    let Wrapper;

    let sampleId = this.props.data.id;

    if (includeLink) {
      props.to = {
        pathname: `/${orgId}/rc-0123/samples/${sampleId}`,
        search: `${this.props.query ? `?query=${this.props.query}` : ''}`,
      };
      Wrapper = ProjectLink;
    } else {
      Wrapper = 'span';
    }

    return (
      <Wrapper
        {...props}
        style={data.status === 'resolved' ? {textDecoration: 'line-through'} : null}
      >
        {/*!hideLevel &&
          level && (
            <Tooltip title={`Error level: ${capitalize(level)}`}>
              <SampleType level={data.level} />
            </Tooltip>
          )*/}
        {!hideIcons && data.status === 'ignored' && <Muted className="icon-soundoff" />}
        {!hideIcons && data.isBookmarked && <Starred className="icon-star-solid" />}
        <SampleTitle {...this.props} style={{fontWeight: data.hasSeen ? 400 : 600}} />
      </Wrapper>
    );
  }

  render() {
    let {className} = this.props;
    let cx = classNames('event-issue-header', className);
    let container = this.getContainer();

    return (
      <div className={cx}>
        <Title>{this.getTitle()}</Title>
        {container && <Container>{container}</Container>}
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
    color: ${p => p.theme.gray3};
  }
`;

const Container = styled.div`
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
  color: ${p => p.theme.red};
`;

const Starred = styled.span`
  ${iconStyles};
  color: ${p => p.theme.yellowOrange};
`;

export default SampleHeader;