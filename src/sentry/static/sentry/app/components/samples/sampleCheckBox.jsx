import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import SelectedSampleStore from 'app/stores/selectedSampleStore';
import Checkbox from 'app/components/checkbox';

const SampleCheckBox = createReactClass({
  displayName: 'SampleCheckBox',

  propTypes: {
    id: PropTypes.string.isRequired,
  },

  mixins: [Reflux.listenTo(SelectedSampleStore, 'onSelectedSampleChange')],

  getInitialState() {
    return {
      isSelected: SelectedSampleStore.isSelected(this.props.id),
    };
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.id != this.props.id) {
      this.setState({
        isSelected: SelectedSampleStore.isSelected(nextProps.id),
      });
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.isSelected !== this.state.isSelected;
  },

  onSelectedSampleChange() {
    const isSelected = SelectedSampleStore.isSelected(this.props.id);
    if (isSelected !== this.state.isSelected) {
      this.setState({
        isSelected,
      });
    }
  },

  onSelect() {
    const id = this.props.id;
    SelectedSampleStore.toggleSelect(id);
  },

  render() {
    return (
      <Checkbox
        value={this.props.id}
        checked={this.state.isSelected}
        onChange={this.onSelect}
      />
    );
  },
});

export default SampleCheckBox;
