import PropTypes from 'prop-types';
import React from 'react';
import {debounce} from 'lodash';

import SelectControl from 'app/components/forms/selectControl';

class WorkflowFilter extends React.Component {
  static propTypes = {
    tag: PropTypes.object.isRequired,
    value: PropTypes.string,
    onSelect: PropTypes.func,
  };

  static tagValueToSelectFormat = ({value}) => {
    return {
      value,
      label: value,
    };
  };

  static defaultProps = {
    tag: {},
    value: '',
  };

  constructor(...args) {
    super(...args);
    this.state = {
      query: '',
      isLoading: false,
      value: this.props.value,
      textValue: this.props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value,
        textValue: nextProps.value,
      });
    }
  }

  handleLoadOptions = () => {};

  handleChangeInput = e => {
    const value = e.target.value;
    this.setState({
      textValue: value,
    });
    this.debouncedTextChange(value);
  };

  debouncedTextChange = debounce(function(text) {
    this.handleChange(text);
  }, 150);

  handleOpenMenu = () => {
    if (this.props.tag.predefined) {
      return;
    }

    this.setState(
      {
        isLoading: true,
      },
      this.handleLoadOptions
    );
  };

  handleChangeSelect = valueObj => {
    const value = valueObj ? valueObj.value : null;
    this.handleChange(value);
  };

  handleChangeSelectInput = value => {
    this.setState(
      {
        textValue: value,
      },
      this.handleLoadOptions
    );
  };

  handleChange = value => {
    const {onSelect, tag} = this.props;

    this.setState(
      {
        value,
      },
      () => {
        onSelect(tag, value);
      }
    );
  };
  // <SelectControl
  //   filterOptions={(options, filter, currentValues) => options}
  //   placeholder="Select workflow"
  //   value={this.state.value}
  //   onChange={this.handleChangeSelect}
  //   isLoading={this.state.isLoading}
  //   onInputChange={this.handleChangeSelectInput}
  //   onOpen={this.handleOpenMenu}
  //   autoload={false}
  //   noResultsText={this.state.isLoading ? t('Loading...') : t('No results found')}
  //   options={
  //     tag.predefined
  //       ? tag.values &&
  //         tag.values.map(value => ({
  //           value,
  //           label: value,
  //         }))
  //       : this.state.options
  //   }
  // />

  render() {
    // Should be all known starting workflows
    const options = [
      {
        value: 'workflow-1',
        label: 'Sequence',
      },
      {
        value: 'workflow-2',
        label: 'Something else',
      },
    ];

    // <SelectControl
    //   onChange={this.onSelectOrg}
    //   value={selectedOrg}
    //   placeholder={t('Select an organization')}
    //   options={choices.map(([value, label]) => ({value, label}))}
    // />

    return (
      <div className="stream-tag-filter">
        <h6 className="nav-header">Workflow</h6>
        <SelectControl
          onChange={this.onWorkflowSelected}
          placeholder="Select workflow"
          options={options}
          value="workflow-1"
        />
      </div>
    );
  }
}

export default WorkflowFilter;
