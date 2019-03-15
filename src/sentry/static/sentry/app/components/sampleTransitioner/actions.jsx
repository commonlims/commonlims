import {Flex} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';
import styled from 'react-emotion';
import {t} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import IndicatorStore from 'app/stores/indicatorStore';
import SelectedSampleStore from 'app/stores/selectedSampleStore';

const SampleContainerStackActions = createReactClass({
  displayName: 'SampleContainerStackActions',

  propTypes() {
    return {
      canAdd: PropTypes.boolean,
      // TODO: The container should be reused between all components
      container: PropTypes.shape({
        name: PropTypes.string,
      }),
      source: PropTypes.boolean,
    };
  },

  mixins: [ApiMixin, Reflux.listenTo(SelectedSampleStore, 'onSelectedGroupChange')],

  getInitialState() {
    return {
      datePickerActive: false,
      anySelected: false,
      multiSelected: false, // more than one selected
      pageSelected: false, // all on current page selected (e.g. 25)
      allInQuerySelected: false, // all in current search query selected (e.g. 1000+)
      selectedIds: new Set(),
    };
  },

  selectAll() {
    this.setState({
      allInQuerySelected: true,
    });
  },

  actionSelectedGroups(callback) {
    let selectedIds;

    if (this.state.allInQuerySelected) {
      selectedIds = undefined; // undefined means "all"
    } else {
      let itemIdSet = SelectedSampleStore.getSelectedIds();
      selectedIds = this.props.groupIds.filter(itemId => itemIdSet.has(itemId));
    }

    callback(selectedIds);

    this.deselectAll();
  },

  deselectAll() {
    SelectedSampleStore.deselectAll();
    this.setState({allInQuerySelected: false});
  },

  onUpdate(data) {
    this.actionSelectedGroups(itemIds => {
      let loadingIndicator = IndicatorStore.add(t('Saving changes..'));

      this.api.bulkUpdate(
        {
          orgId: this.props.orgId,
          projectId: this.props.projectId,
          itemIds,
          data,
          query: this.props.query,
          environment: this.props.environment && this.props.environment.name,
        },
        {
          complete: () => {
            IndicatorStore.remove(loadingIndicator);
          },
        }
      );
    });
  },

  onDelete(event) {
    let loadingIndicator = IndicatorStore.add(t('Removing events..'));

    this.actionSelectedGroups(itemIds => {
      this.api.bulkDelete(
        {
          orgId: this.props.orgId,
          projectId: this.props.projectId,
          itemIds,
          query: this.props.query,
          environment: this.props.environment && this.props.environment.name,
        },
        {
          complete: () => {
            IndicatorStore.remove(loadingIndicator);
          },
        }
      );
    });
  },

  onMerge(event) {
    let loadingIndicator = IndicatorStore.add(t('Merging events..'));

    this.actionSelectedGroups(itemIds => {
      this.api.merge(
        {
          orgId: this.props.orgId,
          projectId: this.props.projectId,
          itemIds,
          query: this.props.query,
          environment: this.props.environment && this.props.environment.name,
        },
        {
          complete: () => {
            IndicatorStore.remove(loadingIndicator);
          },
        }
      );
    });
  },

  onSelectedGroupChange() {
    this.setState({
      pageSelected: SelectedSampleStore.allSelected(),
      multiSelected: SelectedSampleStore.multiSelected(),
      anySelected: SelectedSampleStore.anySelected(),
      allInQuerySelected: false, // any change resets
      selectedIds: SelectedSampleStore.getSelectedIds(),
    });
  },

  renderPager() {
    return (
      <div className=" btn-group">
        <button
          type="button"
          className="btn btn-default btn-sm"
          disabled={this.props.numContainers < 2}
        >
          <span
            className="glyphicon glyphicon-chevron-left"
            aria-hidden="true"
            onClick={this.props.previousContainer}
          />
        </button>
        <button
          type="button"
          className="btn btn-default btn-sm"
          disabled={this.props.numContainers < 2}
        >
          {this.props.containerIndex} of {this.props.numContainers}
        </button>
        <button
          type="button"
          className="btn btn-default btn-sm"
          disabled={this.props.numContainers < 2}
        >
          <span
            className="glyphicon glyphicon-chevron-right"
            aria-hidden="true"
            onClick={this.props.nextContainer}
          />
        </button>
      </div>
    );
  },

  renderSource() {
    return (
      <StyledFlex py={1}>
        <div className="col-md-4">{this.renderPager()}</div>
        <div className="col-md-8">
          <p className="pull-right" style={{marginBottom: 0}}>
            <small>{this.props.container.name}</small>
            <span className="badge">96 well plate</span>
          </p>
        </div>
      </StyledFlex>
    );
  },

  renderTarget() {
    // TODO: remove hardcoded px
    return (
      <StyledFlex py={1}>
        <div className="col-md-4">{this.renderPager()}</div>
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={this.props.container.name}
              style={{height: '28px'}}
            />
            <div className="input-group-btn">
              <button
                type="button"
                className="btn btn-default btn-sm dropdown-toggle"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                style={{borderRadius: '0px'}}
              >
                96 well plate <span className="caret" />
              </button>
              <ul className="dropdown-menu dropdown-menu-right">
                <li>
                  <a href="#">48 well plate</a>
                </li>
                <li>
                  <a href="#">96 well plate</a>
                </li>
                <li>
                  <a href="#">384 well plate</a>
                </li>
              </ul>
              <button
                type="button"
                className="btn btn-default btn-sm"
                disabled={!this.props.canAdd}
                onClick={this.addContainer}
              >
                <span className="glyphicon glyphicon-trash" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn btn-default btn-sm"
                disabled={!this.props.canAdd}
                onClick={this.removeContainer}
              >
                <span className="glyphicon glyphicon-plus" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </StyledFlex>
    );
  },

  renderActions() {
    if (this.props.source) {
      return this.renderSource();
    }
    return this.renderTarget();
  },

  render() {
    return <Sticky>{this.renderActions()}</Sticky>;
  },
});

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

export default SampleContainerStackActions;
