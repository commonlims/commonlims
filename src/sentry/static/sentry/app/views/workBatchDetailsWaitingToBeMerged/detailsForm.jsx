import React from 'react';
import PropTypes from 'prop-types';

class DetailsForm extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {
      fields: fieldDefinitions,
      buttons: buttonDefinitions,
    } = this.props.workDefinition;
    return (
      <div>
        <h1>Workbatch details proxy</h1>
        <div>
          {buttonDefinitions.map((entry) => {
            const buttonClick = () => {
              this.sendButtonClickedEvent(entry.event, this.props.workBatchId);
            };
            return (
              <button
                className="btn btn-sm btn-default"
                key={'button-' + entry.event}
                onClick={buttonClick}
                name={entry.event}
              >
                {entry.caption}
              </button>
            );
          })}
        </div>
        <p></p>
        <div>
          {fieldDefinitions.map((entry) => (
            <div key={'property-div-' + entry.prop_name}>
              <label key={'property-label-' + entry.prop_name} htmlFor={entry.prop_name}>
                {entry.caption}
              </label>
              <br />
              <input
                id={entry.prop_name}
                key={'property-field-' + entry.prop_name}
                name={entry.prop_name}
                type={entry.type}
                value={this.props.currentFieldValues[entry.prop_name] || ''}
                onChange={this.props.handleChange}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  sendButtonClickedEvent(event, workBatchId) {
    const buttonEvent = {
      event,
      work_batch_id: workBatchId,
    };
    this.props.sendButtonClickedEvent(buttonEvent);
  }
}

DetailsForm.propTypes = {
  workDefinition: PropTypes.object.isRequired,
  sendButtonClickedEvent: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  currentFieldValues: PropTypes.object.isRequired,
  workBatchId: PropTypes.number.isRequired,
};

export default DetailsForm;
