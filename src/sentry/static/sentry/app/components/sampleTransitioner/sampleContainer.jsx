import PropTypes from 'prop-types';
import React from 'react';
import {Container as ContainerPropType} from 'app/climsTypes';
import SampleWell from './sampleWell';

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

class SampleContainer extends React.Component {
  //displayName: 'SampleContainer';

  // Receives a prop container, that can e.g. come from the sample-batch endpoint

  getRowIndicator(rowIndex) {
    return String.fromCharCode(65 + rowIndex);
  }

  getColIndicator(colIndex) {
    return colIndex + 1;
  }

  getHeaderStyle(row, col) {
    let style = {};
    Object.assign(style, cellStyleHeader);
    if (
      this.props.container.viewLogic.focusRow === row ||
      this.props.container.viewLogic.focusCol === col
    ) {
      Object.assign(style, cellStyleHighlightBackground);
    }
    return style;
  }

  createRows() {
    let rows = [];
    let colsHeader = [];

    colsHeader.push(<td style={cellStyleHeader} />);
    for (let c = 0; c < this.props.container.dimensions.cols; c++) {
      colsHeader.push(
        <td style={this.getHeaderStyle(-1, c)}>{this.getColIndicator(c)}</td>
      );
    }
    rows.push(<tr>{colsHeader}</tr>);

    for (let r = 0; r < this.props.container.dimensions.rows; r++) {
      let cols = [];

      cols.push(<td style={this.getHeaderStyle(r, -1)}>{this.getRowIndicator(r)}</td>);
      for (let c = 0; c < this.props.container.dimensions.cols; c++) {
        // let lState = this.props.data.getLocationState();
        const wellLocation = this.props.container.get(r, c);
        const wellState = wellLocation.getLocationState();

        cols.push(
          <SampleWell
            data={this.props.container.get(r, c)}
            onWellClicked={this.props.onWellClicked}
            handleLocationHover={this.props.handleLocationHover}
            sampleWellState={wellState}
          />
        );
      }
      rows.push(<tr>{cols}</tr>);
    }
    return rows;
  }

  onMouseLeave(e) {
    this.props.handleLeaveContainer(this.props.container);
  }

  render() {
    return (
      <table style={containerStyle} onMouseLeave={this.onMouseLeave.bind(this)}>
        <tbody> {this.createRows()} </tbody>
      </table>
    );
  }
}

SampleContainer.propTypes = {
  handleLeaveContainer: PropTypes.func, // TODO: remove
  handleLocationHover: PropTypes.func, // TODO: remove
  onWellClicked: PropTypes.func, // TODO: remove
  container: ContainerPropType, // TODO: remove
  cols: PropTypes.number, // TODO: make isRequired
  rows: PropTypes.number, // TODO: make isRequired
  // TODO: implement these new prop types
  /*samples: PropTypes.arrayOf(
    PropTypes.shape({
      col: PropTypes.number.isRequired,
      row: PropTypes.number.isRequired,
    })
  ),
  onSampleWellClick: PropTypes.func, // TODO: make isRequired
  onSampleWellHover: PropTypes.func, // TODO: make isRequired
  hoverRow: PropTypes.number,
  hoverCol: PropTypes.number,*/
};

SampleContainer.displayName = 'SampleContainer';

export default SampleContainer;
