import {Flex, Box} from 'rebass';
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import styled from 'react-emotion';
import SelectedSampleStore from 'app/stores/selectedSampleStore';

const SampleContainerStackActions = createReactClass({
  displayName: 'SampleContainerStackActions',

  propTypes() {
    return {
      canAdd: PropTypes.boolean,
      source: PropTypes.boolean,
      name: PropTypes.string,
    };
  },

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
      <StyledContainer>
        <Flex p={1} minHeight={50}>
          {this.props.name}
        </Flex>
        <Flex>
          <Box p={1}>{this.renderPager()}</Box>
          <Box marginLeft="auto" p={1}>
            <span className="badge">96 well plate</span>
          </Box>
        </Flex>
      </StyledContainer>
    );
  },

  renderTarget() {
    // TODO: remove hardcoded px
    return (
      <StyledContainer>
        <Flex p={1} minHeight={50}>
          <input
            type="text"
            className="form-control"
            value={this.props.name}
            style={{height: '28px'}}
          />
        </Flex>
        <Flex>
          <Box p={1}>{this.renderPager()}</Box>
          <Box marginLeft="auto" p={1}>
            <div className="input-group">
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
          </Box>
        </Flex>
      </StyledContainer>
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
  z-index: ${(p) => p.theme.zIndex.header};
  top: -1px;
`;

const StyledContainer = styled.div`
  align-items: center;
  background: ${(p) => p.theme.offWhite};
  border-bottom: 1px solid ${(p) => p.theme.borderDark};
  border-radius: ${(p) => p.theme.borderRadius} ${(p) => p.theme.borderRadius} 0 0;
  margin-bottom: -1px;
`;

export default SampleContainerStackActions;
