import PropTypes from 'prop-types';
import React from 'react';
import DropdownLink from 'app/components/dropdownLink';
import MenuItem from 'app/components/menuItem';

class SearchOptions extends React.PureComponent {
  static propTypes = {
    selected: PropTypes.string,
    onSelect: PropTypes.func,
    title: PropTypes.string,
    options: PropTypes.array,
  };

  constructor(...args) {
    super(...args);
    this.state = {
      selected: this.props.selected,
    };
  }

  getMenuItem = (item) => {
    return (
      <MenuItem
        onSelect={this.onSelect}
        eventKey={item.key}
        key={item.key}
        isActive={this.state.selected === item.key}
      >
        {item.title}
      </MenuItem>
    );
  };

  onSelect = (selected) => {
    this.setState({selected});
    if (this.props.onSelect) {
      this.props.onSelect(selected);
    }
  };

  getTitle(key) {
    const val = this.props.options.find((x) => x.key === key);
    return val ? val.title : '';
  }

  render() {
    const dropdownTitle = (
      <span>
        <strong>{this.props.title}:</strong>
        &nbsp; {this.getTitle(this.state.selected)}
      </span>
    );

    return (
      <DropdownLink btnGroup={true} title={dropdownTitle}>
        {this.props.options.map((x) => this.getMenuItem(x))}
      </DropdownLink>
    );
  }
}

export default SearchOptions;
