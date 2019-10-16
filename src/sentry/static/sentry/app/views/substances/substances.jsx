import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {substancesGet} from 'app/redux/actions/substance';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';

class Substances extends React.Component {
  componentWillMount() {
    this.props.getSubstances();
  }

  getHeaders() {
    // TODO: Headers will be specified by plugins and fetched from the API via a store,
    // e.g. viewSettings.
    return [
      {
        Header: 'Sample name',
        accessor: 'name',
      },
      {
        Header: 'Position',
        id: 'position',
        accessor: d => d.position.index,
      },
      {
        Header: 'Volume',
        id: 'volume',
        accessor: d => d.properties.volume,
      },
      {
        Header: 'Sample Type',
        id: 'sample_type',
        accessor: d => d.properties.sample_type,
      },
      {
        Header: 'Priority',
        id: 'priority',
        accessor: d => d.priority,
      },
      {
        Header: 'Waiting',
        id: 'days_waiting',
        accessor: d => d.days_waiting,
        Cell: row => <WaitingCell value={row.value} />,
      },
    ];
  }

  render() {
    if (this.props.loading) {
      return <LoadingIndicator />;
    } else if (this.props.errorMessage) {
      return <LoadingError />;
    }

    return (
      <div>
        <ReactTable
          data={this.props.substances}
          columns={this.getHeaders()}
          defaultPageSize={10}
          className="-striped -highlight"
        />
        <br />
      </div>
    );
  }
}

Substances.propTypes = {
  getSubstances: PropTypes.func.isRequired,
  substances: PropTypes.arrayOf(PropTypes.shape({})),
  errorMessage: PropTypes.string,
  loading: PropTypes.bool,
};

// TODO: Colors from scheme
const WaitingCell = props => (
  <span>
    <span
      style={{
        color: props.value > 50 ? '#ff2e00' : props.value > 10 ? '#ffbf00' : '#57d500',
        transition: 'all .3s ease',
      }}
    >
      &#x25cf;
    </span>{' '}
    {props.value}
  </span>
);

WaitingCell.propTypes = {value: PropTypes.number};

const mapStateToProps = state => state.substance;

const mapDispatchToProps = dispatch => ({
  getSubstances: () => dispatch(substancesGet()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Substances);
