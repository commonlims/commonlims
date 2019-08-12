import React from 'react';

import SentryTypes from 'app/sentryTypes';
import PropTypes from 'prop-types';
import {GenericField} from 'app/components/forms';
import WorkBatchStore from 'app/stores/workBatchStore';

class WorkBatchFields extends React.Component {
  static propTypes = {
    workBatch: PropTypes.object.isRequired,
    organization: SentryTypes.Organization.isRequired,
  };

  handleChange(field, value) {
    WorkBatchStore.setField(field, value);
  }

  renderFields() {
    // TODO: Connect formData from the workbatch object, so user data is saved between tab flips
    return this.props.workBatch.fields.map(field => (
      <GenericField
        key={field.name}
        config={field}
        onChange={value => this.handleChange(field, value)}
      />
    ));
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-6">{this.renderFields()}</div>
      </div>
    );
  }
}

export default WorkBatchFields;
