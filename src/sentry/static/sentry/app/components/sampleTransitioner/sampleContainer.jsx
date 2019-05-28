import PropTypes from 'prop-types';
import React from 'react';
import SampleWell from './sampleWell';
import { SampleLocation } from './sampleLocation';

export const SampleContainerType = {
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

  // TODO: make these static or local functions
  getRowIndicator(rowIndex) {
    return String.fromCharCode(65 + rowIndex);
  }

  isHoveredRowOrColumn(row, col) {
    const { hoverRow, hoverCol } = this.state;
    return hoverRow === row || hoverCol === col;
  }

  getHeaderClassName(row, col) {
    return this.isHoveredRowOrColumn(row, col) ? 'highlighted-background' : '';
  }

  isSourceContainer() {
    const { containerType } = this.props;
    return containerType === SampleContainerType.SOURCE;
  }

  isTargetContainer() {
    const { containerType } = this.props;
    return containerType === SampleContainerType.TARGET;
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
    const { cols } = this.props;
    const keyPrefix = 'thead';
    const ths = [(<th key={`${keyPrefix}-corner`} />)];

    for (let c = 0; c < cols; c++) {
      ths.push(
        <th key={`${keyPrefix}-${c}`} className={this.getHeaderClassName(-1, c)}>{c+1}</th>
      );
    }

    return (<tr>{ths}</tr>);
  }

  createRows() {
    let rows = [];
    let key;

    for (let r = 0; r < this.props.rows; r++) {
      let cols = [];
      // Get all samples with this row
      const rowSamples = this.props.samples.filter(s => s.location.row === r);

      key = `-1_${r}`;
      cols.push(
        <th key={key} className={this.getHeaderClassName(r, -1)}>
          {this.getRowIndicator(r)}
        </th>
      );
      for (let c = 0; c < this.props.cols; c++) {
        const thisLocation = new SampleLocation(this.props.id, c, r);

        key = `${c}_${r}`;
        const sample = rowSamples.find(s => s.location.col === c);
        const sampleId = sample ? sample.id : null;
        const isTransitionTargetOfHoveredSample = this.isTransitionTargetOfHoveredSample(thisLocation);
        const isTransitionSource = this.isTransitionSource(thisLocation);
        const isTransitionTarget = this.isTransitionTarget(thisLocation);
        const isActiveTransitionSource = this.isActiveTransitionSource(thisLocation);

        const onWellClick = location => {
          this.props.onWellClicked(location, sampleId);
        };

        const onWellMouseOver = location => {
          if (this.state.hoverRow != r || this.state.hoverCol != c) {
            this.setState({hoverRow: r, hoverCol: c});
          }

          if (this.props.onWellMouseOver) {
            this.props.onWellMouseOver(location, sampleId);
          }
        };

        const location = new SampleLocation(this.props.id, c, r);

        cols.push(
          <SampleWell
            key={key}
            location={location}
            onClick={onWellClick}
            onMouseOver={onWellMouseOver}
            containsSampleId={sampleId}
            isTransitionSource={isTransitionSource}
            isTransitionTarget={isTransitionTarget}
            isActiveTransitionSource={isActiveTransitionSource}
            isTransitionTargetOfHoveredSample={isTransitionTargetOfHoveredSample}
            inHoveredRowOrColumn={this.isHoveredRowOrColumn(r, c)}
          />
        );
      }
      rows.push(<tr>{cols}</tr>);
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
