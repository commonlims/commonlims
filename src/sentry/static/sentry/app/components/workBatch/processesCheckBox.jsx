import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import SelectedProcessStore from 'app/stores/selectedProcessStore';
import Checkbox from 'app/components/checkbox';

const ProcessCheckBox = createReactClass({
  displayName: 'ProcessCheckBox',

  propTypes: {
    id: PropTypes.string.isRequired,
  },

  mixins: [Reflux.listenTo(SelectedProcessStore, 'onSelectedProcessChange')],

  getInitialState() {
    return {
      isSelected: SelectedProcessStore.isSelected(this.props.id),
    };
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.id != this.props.id) {
      this.setState({
        isSelected: SelectedProcessStore.isSelected(nextProps.id),
      });
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.isSelected !== this.state.isSelected;
  },

  onSelectedProcessChange() {
    const isSelected = SelectedProcessStore.isSelected(this.props.id);
    if (isSelected !== this.state.isSelected) {
      this.setState({
        isSelected,
      });
    }
  },

  onSelect() {
    const id = this.props.id;
    SelectedProcessStore.toggleSelect(id);
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

export default ProcessCheckBox;
