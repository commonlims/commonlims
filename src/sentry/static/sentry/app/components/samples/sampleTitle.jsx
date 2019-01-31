import PropTypes from 'prop-types';
import React from 'react';

class SampleTitle extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      type: PropTypes.oneOf([
        'error',
        'csp',
        'hpkp',
        'expectct',
        'expectstaple',
        'default',
      ]).isRequired,
      name: PropTypes.string,
    }),
  };

  render() {
    let {data} = this.props;
    let {name} = data;
    let subtitle = null;

    if (subtitle) {
      return (
        <span style={this.props.style}>
          <span style={{marginRight: 10}}>{name}</span>
          <em title={subtitle}>{subtitle}abc</em>
          <br />
        </span>
      );
    }
    return <span style={this.props.style}>{name}</span>;
  }
}

export default SampleTitle;
