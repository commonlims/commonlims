import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {substancesGet} from 'app/redux/actions/substance';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import {Panel, PanelBody} from 'app/components/panels';
import UploadSubstancesButton from 'app/views/substances/uploadSubstancesButton';
import {t} from 'app/locale';
import DropdownButton from 'app/components/dropdownButton';
import DropdownAutoComplete from 'app/components/dropdownAutoComplete';

class Substances extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      groupBy: {value: 'container', label: 'Container'},
    };
  }

  UNSAFE_componentWillMount() {
    this.props.getSubstances();
  }

  getHeaders() {
    // TODO: Headers will be specified by plugins and fetched from the API via a store,
    // e.g. viewSettings.
    return [
      {
        Header: 'Sample name',
        accessor: 'name',
        aggregate: vals => '',
      },
      {
        Header: 'Container',
        id: 'container',
        accessor: d => d.properties.container,
      },
      {
        Header: 'Position',
        id: 'position',
        accessor: d => d.position.index,
        aggregate: vals => '',
      },
      {
        Header: 'Volume',
        id: 'volume',
        accessor: d => d.properties.volume,
        aggregate: vals => '',
      },
      {
        Header: 'Sample Type',
        id: 'sample_type',
        accessor: d => d.properties.sample_type,
        aggregate: vals =>
          Array.from(new Set(vals))
            .sort()
            .join(', '),
      },
      {
        Header: 'Priority',
        id: 'priority',
        accessor: d => d.priority,
        aggregate: vals => '',
      },
      {
        Header: 'Waiting',
        id: 'days_waiting',
        accessor: d => d.days_waiting,
        Cell: row => <WaitingCell value={row.value} />,
        aggregate: vals => '',
        Aggregated: row => {
          <span />;
        },
      },
    ];
  }

  selectGroupBy(selection) {
    this.setState({groupBy: {value: selection.value, label: selection.label}});
  }

  renderDropdown() {
    const groupedItems = [
      {
        value: 'Fields',
        label: <div>Field</div>,
        items: [
          {
            value: 'sample',
            label: 'Sample',
          },
          {
            value: 'container',
            label: 'Container',
          },
          {
            value: 'sample_type',
            label: 'Sample Type',
          },
        ],
      },
    ];

    return (
      <DropdownAutoComplete
        items={groupedItems}
        alignMenu="left"
        onSelect={this.selectGroupBy.bind(this)}
      >
        {({isOpen, selectedItem}) => (
          <DropdownButton isOpen={isOpen}>
            {'Group by: ' + this.state.groupBy.label}
          </DropdownButton>
        )}
      </DropdownAutoComplete>
    );
  }

  currentGrouping() {
    if (this.state.groupBy.value == 'sample') {
      // Grouping by sample is the same as not grouping at all
      return [];
    } else {
      return [this.state.groupBy.value];
    }
  }

  render() {
    if (this.props.loading) {
      return <LoadingIndicator />;
    } else if (this.props.errorMessage) {
      return <LoadingError />;
    }

    return (
      <Panel>
        {this.renderDropdown()}
        <UploadSubstancesButton disabled={false}>
          {t('Import samples')}
        </UploadSubstancesButton>
        <PanelBody>
          <ReactTable
            data={this.props.substances}
            columns={this.getHeaders()}
            defaultPageSize={10}
            className="-striped -highlight"
            pivotBy={this.currentGrouping()}
          />
        </PanelBody>
      </Panel>
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
