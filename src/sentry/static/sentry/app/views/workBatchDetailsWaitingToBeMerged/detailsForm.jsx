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
