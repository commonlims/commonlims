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
        cols.push(
          <SampleWell
            data={this.props.container.get(r, c)}
            onWellClicked={this.props.onWellClicked}
            handleLocationHover={this.props.handleLocationHover}
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
  handleLeaveContainer: PropTypes.func,
  handleLocationHover: PropTypes.func,
  onWellClicked: PropTypes.func,
  container: ContainerPropType,
};

SampleContainer.displayName = 'SampleContainer';

export default SampleContainer;
