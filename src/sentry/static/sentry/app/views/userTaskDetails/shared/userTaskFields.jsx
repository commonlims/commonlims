import React from 'react';

import SentryTypes from 'app/sentryTypes';
import PropTypes from 'prop-types';
import { GenericField } from 'app/components/forms';
import UserTaskStore from 'app/stores/userTaskStore';

class UserTaskFields extends React.Component {
  static propTypes = {
    userTask: PropTypes.object.isRequired,
    organization: SentryTypes.Organization.isRequired,
  };

  handleChange(field, value) {
    console.log("Changed", value, field);
    UserTaskStore.setField(field, value);
  }

  renderFields() {
    // TODO: Connect formData from the usertask object, so user data is saved between tab flips
    return this.props.userTask.fields.map(field =>
      <GenericField
        key={field.name}
        config={field}
        onChange={value => this.handleChange(field, value)}
      />
    );
  }

  render() {
    console.log("rendering the fields");

    return (
      <div className="row">
        <div className="col-md-6">
          {this.renderFields()}
        </div>
      </div>
    );
  }
}

export default UserTaskFields;
