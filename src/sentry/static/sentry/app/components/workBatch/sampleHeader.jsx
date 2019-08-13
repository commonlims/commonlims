import PropTypes from 'prop-types';
import React from 'react';
import styled, {css} from 'react-emotion';
import classNames from 'classnames';
import ProjectLink from 'app/components/projectLink';
import {Metadata} from 'app/sentryTypes';
import WorkBatchGroupTitle from 'app/components/workBatch/workBatchGroupTitle';
// TODO: rename file

/**
 * Displays an event or group/issue title (i.e. in Stream)
 */
class ProcessHeader extends React.Component {
  static propTypes = {
    orgId: PropTypes.string.isRequired,
    /** Either an issue or event **/
    data: PropTypes.shape({
      id: PropTypes.string,
      level: PropTypes.string,
      title: PropTypes.string,
      metadata: Metadata,
      groupID: PropTypes.string,
      process: PropTypes.string,
      taskKey: PropTypes.string,
      running: PropTypes.bool,
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
    let {includeLink, orgId, data} = this.props;
    let props = {};
    let Wrapper;

    if (includeLink) {
      let running = this.props.data.running;

      if (running) {
        props.to = {
          pathname: `/${orgId}/work-batches/1`,
        };
      } else {
        props.to = {
          pathname: `/${orgId}/samples/`,
        };
      }

      Wrapper = ProjectLink;
    } else {
      Wrapper = 'span';
    }

    return (
      <Wrapper
        {...props}
        style={data.status === 'resolved' ? {textDecoration: 'line-through'} : null}
      >
        <TaskGroupTitle {...this.props} style={{fontWeight: data.hasSeen ? 400 : 600}} />
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
