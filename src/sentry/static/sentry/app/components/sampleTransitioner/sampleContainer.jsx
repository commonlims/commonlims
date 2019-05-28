import PropTypes from 'prop-types';
import React from 'react';
import SampleWell from './sampleWell';
import { SampleLocation } from './sampleLocation';

export const SampleContainerDirectionality = {
  SOURCE: 1,
  TARGET: 2,
};

export class SampleContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hoverRow: null,
      hoverCol: null,
    };
  }

  isHoveredRowOrColumn(row, col) {
    const { hoverRow, hoverCol } = this.state;
    return hoverRow === row || hoverCol === col;
  }

  getHeaderClassName(row, col) {
    return this.isHoveredRowOrColumn(row, col) ? 'highlighted-background' : '';
  }

  isSourceContainer() {
    const { containerDirectionality } = this.props;
    return containerDirectionality === SampleContainerDirectionality.SOURCE;
  }

  isTargetContainer() {
    const { containerDirectionality } = this.props;
    return containerDirectionality === SampleContainerDirectionality.TARGET;
  }

  isTransitionSource(location) {
    const { transitionSources } = this.props;

    if (!this.isSourceContainer()) {
      return false;
    }

    return !!transitionSources.find(tl => tl.equals(location));
  }

  isActiveTransitionSource(location) {
    const { activeSampleTransition } = this.props;
    let isActiveTransitionSrc = false;

    if (!this.isSourceContainer()) {
      return isActiveTransitionSrc;
    }

    if (activeSampleTransition) {
      const activeSampleTransitionSource = activeSampleTransition.getSource();
      if (activeSampleTransitionSource) {
        isActiveTransitionSrc = activeSampleTransitionSource.equals(location);
      }
    }

    return isActiveTransitionSrc;
  }

  isTransitionTarget(location) {
    const { transitionTargets } = this.props;

    if (!this.isTargetContainer()) {
      return false;
    }

    return !!transitionTargets.find(tl => tl.equals(location));
  }

  isTransitionTargetOfHoveredSample(location) {
    const { transitionTargetsOfHoveredSample } = this.props;

    if (!this.isTargetContainer()) {
      return false;
    }

    return !!transitionTargetsOfHoveredSample.find(tl => tl.equals(location));
  }

  onMouseOut() {
    if (this.state.hoverRow || this.state.hoverCol) {
      this.setState({hoverRow: null, hoverCol: null});
    }

    if (this.props.onMouseOut) {
      this.props.onMouseOut();
    }
  }

  renderColumnsHeader() {
    const { numColumns } = this.props;
    const keyPrefix = 'thead-th-';
    const ths = [(<th key={`${keyPrefix}-corner`} />)];

    for (let c = 0; c < numColumns; c++) {
      const label = c + 1;
      ths.push(
        <th key={`${keyPrefix}-${c}`} className={this.getHeaderClassName(-1, c)}>{label}</th>
      );
    }

    return (<tr>{ths}</tr>);
  }

  renderRowHeader(row) {
    const keyPrefix = 'th-';
    const label = String.fromCharCode(65 + row);
    return(<th key={`${keyPrefix}-${row}`} className={this.getHeaderClassName(row, -1)}>{label}</th>);
  }

  renderSampleWell(row, col, sampleId) {
    const {
      containerId,
      onWellClicked,
      onWellMouseOver,
    } = this.props;

    const key = `samplewell-${row}-${col}`;
    const location = new SampleLocation(containerId, col, row);
    const isTransitionSource = this.isTransitionSource(location);
    const isTransitionTarget = this.isTransitionTarget(location);
    const isTransitionTargetOfHoveredSample = this.isTransitionTargetOfHoveredSample(location);
    const isActiveTransitionSource = this.isActiveTransitionSource(location);
    const isHoveredRowOrColumn = this.isHoveredRowOrColumn(row, col);

    const handleClick = location => {
      onWellClicked(location, sampleId);
    };

    const handleMouseOver = location => {
      if(!this.isHoveredRowOrColumn(row, col)) {
        this.setState({ hoverRow: row, hoverCol: col });
      }

      onWellMouseOver(location, sampleId);
    };

    return (<SampleWell
      key={key}
      location={location}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      containsSampleId={sampleId}
      isTransitionSource={isTransitionSource}
      isTransitionTarget={isTransitionTarget}
      isActiveTransitionSource={isActiveTransitionSource}
      isTransitionTargetOfHoveredSample={isTransitionTargetOfHoveredSample}
      inHoveredRowOrColumn={isHoveredRowOrColumn}
    />);
  }

  createRows() {
    const {
      numColumns,
      numRows,
      samples,
    } = this.props;
    const keyPrefix = 'tr-';
    const rows = [];

    for (let r = 0; r < numRows; r++) {
      const row = [this.renderRowHeader(r)];

      // Get all samples with this row
      const rowSamples = samples.filter(s => s.location.row === r);

      for (let c = 0; c < numColumns; c++) {
        const sample = rowSamples.find(s => s.location.col === c);
        const sampleId = sample ? sample.id : null;
        row.push(this.renderSampleWell(r, c, sampleId));
      }

      rows.push(<tr key={`${keyPrefix}-${r}`}>{row}</tr>);
    }
    return rows;
  }

  render() {
    return (
      <table className="sample-container" onMouseOut={this.onMouseOut.bind(this)}>
        <thead>
          {this.renderColumnsHeader()}
        </thead>
        <tbody>{this.createRows()}</tbody>
      </table>
    );
  }
}

SampleContainer.propTypes = {
  containerId: PropTypes.number.isRequired,
  containerDirectionality: PropTypes.number.isRequired,
  numColums: PropTypes.number.isRequired,
  numRows: PropTypes.number.isRequired,
  onWellClicked: PropTypes.func.isRequired,
  onWellMouseOver: PropTypes.func.isRequired,
  onMouseOut: PropTypes.func.isRequired,

  // TODO: implement these new prop types
  // transitionSources: PropTypes.arrayOf(),
  // transitionTargets: PropTypes.arrayOf(),
  // transitionTargetsOfHoveredSample: PropTypes.arrayOf(),
  // activeSampleTransition: PropTypes.shape(),
  /*samples: PropTypes.arrayOf(
    PropTypes.shape({
      col: PropTypes.number.isRequired,
      row: PropTypes.number.isRequired,
    })
  ),*/
};

SampleContainer.displayName = 'SampleContainer';
