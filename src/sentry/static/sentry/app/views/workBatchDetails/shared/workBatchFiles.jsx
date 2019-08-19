import PropTypes from 'prop-types';
import React from 'react';
import {Flex} from 'grid-emotion';

import SentryTypes from 'app/sentryTypes';
import Tooltip from 'app/components/tooltip';
import FileSize from 'app/components/fileSize';
import IndicatorStore from 'app/stores/indicatorStore';
import Pagination from 'app/components/pagination';
import LinkWithConfirmation from 'app/components/linkWithConfirmation';
import {t} from 'app/locale';
import {Panel, PanelHeader, PanelBody, PanelItem} from 'app/components/panels';
import withOrganization from 'app/utils/withOrganization';
import withApi from 'app/utils/withApi';

class WorkBatchDetailsFiles extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization,
    api: PropTypes.object,
    workBatch: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      loading: true,
      error: false,
      pageLinks: null,
    };
  }

  getFilesEndpoint() {
    return `/work-batches/1/files/`;
  }

  handleRemove(id) {
    const loadingIndicator = IndicatorStore.add(t('Removing artifact..'));

    this.props.api.request(this.getFilesEndpoint() + `${id}/`, {
      method: 'DELETE',
      success: () => {
        const fileList = this.state.fileList.filter(file => {
          return file.id !== id;
        });

        this.setState({
          fileList,
        });

        IndicatorStore.add(t('Artifact removed.'), 'success', {
          duration: 4000,
        });
      },
      error: () => {
        IndicatorStore.add(t('Unable to remove artifact. Please try again.'), 'error', {
          duration: 4000,
        });
      },
      complete: () => {
        IndicatorStore.remove(loadingIndicator);
      },
    });
  }

  render() {
    const access = new Set(this.props.organization.access);
    // TODO: Get rid of the size

    return (
      <div>
        <Panel>
          <PanelHeader>
            <Flex flex="5" pr={2}>
              {t('Name')}
            </Flex>
            <Flex flex="4">{t('Description')}</Flex>
            <Flex flex="3">{t('Size')}</Flex>
          </PanelHeader>
          <PanelBody>
            {this.props.workBatch.files.map(file => {
              return (
                <PanelItem key={file.id}>
                  <Flex
                    flex="5"
                    pr={2}
                    style={{wordWrap: 'break-word', wordBreak: 'break-all'}}
                  >
                    <strong>{file.name || '(empty)'}</strong>
                  </Flex>
                  <Flex flex="4">
                    {file.headers.Description || (
                      <span className="text-light">{t('None')}</span>
                    )}
                  </Flex>
                  <Flex flex="3" justify="space-between">
                    <FileSize bytes={file.size} />
                    <Flex align="center">
                      {access.has('project:write') ? (
                        <a
                          href={
                            this.props.api.baseUrl +
                            this.getFilesEndpoint() +
                            `${file.id}/?download=1`
                          }
                          className="btn btn-sm btn-default"
                        >
                          <span className="icon icon-open" />
                        </a>
                      ) : (
                        <Tooltip
                          title={t(
                            'You do not have the required permission to download this artifact.'
                          )}
                        >
                          <div className="btn btn-sm btn-default disabled">
                            <span className="icon icon-open" />
                          </div>
                        </Tooltip>
                      )}
                      <div style={{marginLeft: 5}}>
                        <LinkWithConfirmation
                          className="btn btn-sm btn-default"
                          title={t('Delete artifact')}
                          message={t('Are you sure you want to remove this artifact?')}
                          onConfirm={this.handleRemove.bind(this, file.id)}
                        >
                          <span className="icon icon-trash" />
                        </LinkWithConfirmation>
                      </div>
                    </Flex>
                  </Flex>
                </PanelItem>
              );
            })}
          </PanelBody>
        </Panel>
        <Pagination pageLinks={this.state.pageLinks} />
      </div>
    );
  }
}

export {WorkBatchDetailsFiles};
export default withOrganization(withApi(WorkBatchDetailsFiles));
