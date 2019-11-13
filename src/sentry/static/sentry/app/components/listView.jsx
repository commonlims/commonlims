import React from 'react';
import styled from 'react-emotion';
import {useTable, useRowSelect} from 'react-table';
import LoadingIndicator from 'app/components/loadingIndicator';
import LoadingError from 'app/components/loadingError';
import ListActionBar from 'app/components/listActionBar';
import {Panel, PanelBody} from 'app/components/panels';
import PropTypes from 'prop-types';

const ColumnHeader = styled('div')`
  font-size: 14px;
  text-transform: uppercase;
  font-weight: bold;
  color: ${p => p.theme.gray3};
`;

// TODO: Make the headers sticky again
const Styles = styled.div`
  table {
    width: 100%;
    border-spacing: 0;
    background: ${p => p.theme.offWhite};

    th {
      /*position: sticky;
      position: -webkit-sticky;
      top: 0;
      z-index: 10;*/
      padding: 0.5rem;
      border-bottom: 1px solid ${p => p.theme.borderDark};
    }

    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid ${p => p.theme.borderDark};

      position: relative;

      :last-child {
        border-right: 0;
      }
    }

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }
  }
`;

// eslint-disable-next-line react/prop-types
function Table({columns, data}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // eslint-disable-next-line no-unused-vars
    selectedFlatRows,
    // eslint-disable-next-line no-unused-vars
    state: {selectedRowPaths},
  } = useTable(
    {
      columns,
      data,
    },
    useRowSelect
  );

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          // eslint-disable-next-line react/jsx-key
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              // eslint-disable-next-line react/jsx-key
              <th {...column.getHeaderProps()}>
                <ColumnHeader>{column.render('Header')}</ColumnHeader>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            // eslint-disable-next-line react/jsx-key
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                // eslint-disable-next-line react/jsx-key
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

class ListView extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    errorMessage: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    orgId: PropTypes.string.isRequired,
  };

  render() {
    if (this.props.loading) {
      return <LoadingIndicator />;
    } else if (this.props.errorMessage) {
      return <LoadingError />;
    }

    return (
      <Panel>
        <ListActionBar realtimeActive={false} query="" orgId={this.props.orgId} />
        <PanelBody>
          <Styles>
            <Table columns={this.props.columns} data={this.props.data} />
          </Styles>
        </PanelBody>
      </Panel>
    );
  }
}

export default ListView;
