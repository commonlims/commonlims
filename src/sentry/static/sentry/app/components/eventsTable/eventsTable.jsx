import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import {t} from 'app/locale';
import CustomPropTypes from 'app/sentryTypes';
import EventsTableRow from 'app/components/eventsTable/eventsTableRow';

class EventsTable extends React.Component {
  static propTypes = {
    fixedDimensions: PropTypes.bool,
    events: PropTypes.arrayOf(CustomPropTypes.Event),
    tagList: PropTypes.arrayOf(CustomPropTypes.Tag),
  };

  render() {
    return <h1>test</h1>;
  }
}

export default EventsTable;
