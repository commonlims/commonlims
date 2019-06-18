import PropTypes from 'prop-types';
import React from 'react';
import {debounce} from 'lodash';

import {t} from 'app/locale';
import {Client} from 'app/api';
import SelectControl from 'app/components/forms/selectControl';

class WorkflowFilter extends React.Component {
  static propTypes = {
    tag: PropTypes.object.isRequired,
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
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
    this.api = new Client();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value,
        textValue: nextProps.value,
      });
    }
  }

  componentWillUnmount() {
    if (!this.api) return;
    this.api.clear();
  }

  getTagValuesAPIEndpoint = () => {
    let {orgId, projectId, tag} = this.props;

    return `/api/0/projects/${orgId}/${projectId}/tags/${tag.key}/values/`;
  };

  handleChangeInput = e => {
    let value = e.target.value;
    this.setState({
      textValue: value,
    });
    this.debouncedTextChange(value);
  };

  debouncedTextChange = debounce(function(text) {
    this.handleChange(text);
  }, 150);

  handleOpenMenu = () => {
    if (this.props.tag.predefined) return;

    this.setState(
      {
        isLoading: true,
      },
      this.handleLoadOptions
    );
  };

  handleChangeSelect = valueObj => {
    let value = valueObj ? valueObj.value : null;
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
    let {onSelect, tag} = this.props;

    this.setState(
      {
        value,
      },
      () => {
        onSelect(tag, value);
      }
    );
  };

  render() {
    let {tag} = this.props;

    return (
      <div className="stream-tag-filter">
        <h6 className="nav-header">Workflow</h6>
        <SelectControl
          filterOptions={(options, filter, currentValues) => options}
          placeholder="--"
          value={this.state.value}
          onChange={this.handleChangeSelect}
          isLoading={this.state.isLoading}
          onInputChange={this.handleChangeSelectInput}
          onOpen={this.handleOpenMenu}
          autoload={false}
          noResultsText={this.state.isLoading ? t('Loading...') : t('No results found')}
          options={
            tag.predefined
              ? tag.values &&
                tag.values.map(value => ({
                  value,
                  label: value,
                }))
              : this.state.options
          }
        />
      </div>
    );
  }
}

export default WorkflowFilter;
