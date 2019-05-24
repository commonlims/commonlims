import PropTypes from 'prop-types';
import React from 'react';
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
      // Get all samples with this row
      const rowSamples = this.props.samples.filter(s => s.location.row === r);

      key = `-1_${r}`;
      cols.push(
        <td key={key} style={this.getHeaderStyle(r, -1)}>
          {this.getRowIndicator(r)}
        </td>
      );
      for (let c = 0; c < this.props.cols; c++) {
        key = `${c}_${r}`;
        const sample = rowSamples.find(s => s.location.col === c);
        const sampleId = sample ? sample.id : null;

        const hasContents = !!sample;

        // The background should be highlighted if this row is in
        // the hovered row or coumn.
        const isHoveredRowOrColumn =
          this.state.hoverRow == r || this.state.hoverCol === c;

        // The sample well should be highlighted if it is the target of
        // a transition of the currently hovered sample.
        const { highlightLocations } = this.props;

        const isTransitionTargetOfHoveredSample = highlightLocations.find(tl => {
          return tl.containerId == this.props.id && tl.x == c && tl.y == r;
        });

        const onWellClick = well => {
          this.props.onWellClicked(well, sampleId);
        };

        const onWellMouseOver = well => {
          if (this.state.hoverRow != r || this.state.hoverCol != c) {
            this.setState({hoverRow: r, hoverCol: c});
          }

          if (this.props.onWellMouseOver) {
            this.props.onWellMouseOver(well, sampleId);
          }
        };

        cols.push(
          <SampleWell
            hasContents={hasContents}
            isTransitionTargetOfHoveredSample={isTransitionTargetOfHoveredSample}
            inHoveredRowOrColumn={isHoveredRowOrColumn}
            onSampleWellClick={onWellClick}
            onSampleWellMouseOver={onWellMouseOver}
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

  onMouseOut() {
    if (this.state.hoverRow || this.state.hoverCol) {
      this.setState({hoverRow: null, hoverCol: null});
    }

    if (this.props.onMouseOut) {
      this.props.onMouseOut();
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
  onWellMouseOver: PropTypes.func, // TODO: make isRequired
  onMouseOut: PropTypes.func,
  containerType: PropTypes.number.isRequired, // TODO: rename to containerSourceOrTarget
  id: PropTypes.string.isRequired, // TODO: change to number
  cols: PropTypes.number.isRequired,
  rows: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  containerTypeName: PropTypes.string.isRequired,

  // TODO: implement these new prop types
  // highlightLocations: PropTypes.arrayOf(),
  /*samples: PropTypes.arrayOf(
    PropTypes.shape({
      col: PropTypes.number.isRequired,
      row: PropTypes.number.isRequired,
    })
  ),*/
};

SampleContainer.displayName = 'SampleContainer';
