import PropTypes from 'prop-types';
import React from 'react';
import styled, {css} from 'react-emotion';
import classNames from 'classnames';
import ProjectLink from 'app/components/projectLink';
import {Metadata} from 'app/sentryTypes';
import SampleTitle from 'app/components/processes/sampleTitle';

/**
 * Displays an event or group/issue title (i.e. in Stream)
 */
class ProcessHeader extends React.Component {
  static propTypes = {
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    /** Either an issue or event **/
    data: PropTypes.shape({
      id: PropTypes.string,
      level: PropTypes.string,
      title: PropTypes.string,
      metadata: Metadata,
      groupID: PropTypes.string,
      process: PropTypes.string,
      taskKey: PropTypes.string,
    }),
    includeLink: PropTypes.bool,
    hideIcons: PropTypes.bool,
    hideLevel: PropTypes.bool,
    query: PropTypes.string,
  };

  static defaultProps = {
    includeLink: true,
  };

  getProcessInfo() {
    let {data} = this.props;
    let {processVersion, process} = data || {};
    return process + '' + processVersion;
  }

  getTitle() {
    let {includeLink, orgId, projectId, data} = this.props;
    let props = {};
    let Wrapper;

    if (includeLink) {
      let process = this.props.data.process;
      let taskKey = this.props.data.taskKey;
      let searchParams = `task:${taskKey} process:${process}`;
      props.to = {
        pathname: `/${orgId}/${projectId}/samples/`, //?waitingFor=${this.props.data.process}:${this.props .data.taskKey}`,
        search: `?query=${searchParams}`,
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
        <SampleTitle {...this.props} style={{fontWeight: data.hasSeen ? 400 : 600}} />
      </Wrapper>
    );
  }

  render() {
    let {className} = this.props;
    let cx = classNames('event-issue-header', className);

    return (
      <div className={cx}>
        <Title>{this.getTitle()}</Title>
        {/*processInfo && <ProcessInfo>{processInfo}</ProcessInfo>*/}
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

export default ProcessHeader;
