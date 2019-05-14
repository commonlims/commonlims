import PropTypes from 'prop-types';
import React from 'react';
import {Container as ContainerPropType} from 'app/climsTypes';
import SampleWell from './sampleWell';

export const SampleContainerType = {
  SOURCE: 1,
  TARGET: 2,
};

const containerStyle = {
  margin: '20px auto',
  borderCollapse: 'collapse',
};

const cellStyleHeader = {
  padding: '1px',
  margin: '1px',
  color: '#BDB4C7',
  textAlign: 'center',
};

const cellStyleHighlightBackground = {
  backgroundColor: 'aliceblue',
};

export class SampleContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hoverRow: null,
      hoverCol: null,
    };
  }

  getRowIndicator(rowIndex) {
    return String.fromCharCode(65 + rowIndex);
  }

  getColIndicator(colIndex) {
    return colIndex + 1;
  }

  getHeaderStyle(row, col) {
    let style = {};
    Object.assign(style, cellStyleHeader);
    if (this.state.hoverRow == row || this.state.hoverCol === col) {
      Object.assign(style, cellStyleHighlightBackground);
    }
    return style;
  }

  createRows() {
    let rows = [];
    let colsHeader = [];
    let key;

    key = '-1_-1';
    colsHeader.push(<td key={key} style={cellStyleHeader} />);
    for (let c = 0; c < this.props.cols; c++) {
      key = `${c}_-1`;
      colsHeader.push(
        <td key={key} style={this.getHeaderStyle(-1, c)}>
          {this.getColIndicator(c)}
        </td>
      );
    }
    rows.push(<tr>{colsHeader}</tr>);

    for (let r = 0; r < this.props.rows; r++) {
      let cols = [];

      key = `-1_${r}`;
      cols.push(
        <td key={key} style={this.getHeaderStyle(r, -1)}>
          {this.getRowIndicator(r)}
        </td>
      );
      for (let c = 0; c < this.props.cols; c++) {
        key = `${c}_${r}`;
        const wellLocation = this.props.locations[r + '_' + c];
        const wellState = wellLocation.getLocationState();
        const wellBackgroundHighlighted =
          this.state.hoverRow == r || this.state.hoverCol === c;

        const eventData = {
          location: wellLocation,
        };

        const onWellClick = e => {
          e.preventDefault();
          this.props.onWellClicked(r, c);
        };

        cols.push(
          <SampleWell
            sampleWellState={wellState}
            isSelected={wellLocation.isSelected}
            isHighlighted={wellLocation.highlightTransition}
            isHighlightedBackground={wellBackgroundHighlighted}
            onSampleWellClick={onWellClick}
            onSampleWellMouseOver={this.onSampleWellMouseOver.bind(this)}
            row={r}
            col={c}
            key={key}
          />
        );
      }
      rows.push(<tr>{cols}</tr>);
    }
    return rows;
  }

  onSampleWellMouseOver(row, col) {
    if (this.state.hoverRow != row || this.state.hoverCol != col) {
      this.setState({hoverRow: row, hoverCol: col});
    }
  }

  onMouseOut() {
    if (this.state.hoverRow || this.state.hoverCol) {
      this.setState({hoverRow: null, hoverCol: null});
    }
  }

  render() {
    return (
      <table style={containerStyle} onMouseOut={this.onMouseOut.bind(this)}>
        <tbody>{this.createRows()}</tbody>
      </table>
    );
  }
}

SampleContainer.propTypes = {
  onWellClicked: PropTypes.func, // TODO: make isRequired
  containerType: PropTypes.number.isRequired, // TODO: rename to containerSourceOrTarget
  locations: PropTypes.arrayOf(PropTypes.shape({})), // TODO: Remove
  id: PropTypes.string.isRequired, // TODO: change to number
  cols: PropTypes.number.isRequired,
  rows: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  containerTypeName: PropTypes.string.isRequired,

  // TODO: implement these new prop types
  /*samples: PropTypes.arrayOf(
    PropTypes.shape({
      col: PropTypes.number.isRequired,
      row: PropTypes.number.isRequired,
    })
  ),
  onSampleWellClick: PropTypes.func, // TODO: make isRequired*/
};

SampleContainer.displayName = 'SampleContainer';
