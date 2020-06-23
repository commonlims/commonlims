import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';

import {Panel, PanelBody, PanelHeader} from './panels';
import {addErrorMessage, addSuccessMessage} from '../actionCreators/indicator';
import {t} from '../locale';
import ApiMixin from '../mixins/apiMixin';
import LoadingError from './loadingError';
import LoadingIndicator from './loadingIndicator';

const UploadFile = createReactClass({
  displayName: 'UploadFile',

  propTypes: {
    endpoint: PropTypes.string.isRequired,
    model: PropTypes.shape({
      avatar: PropTypes.shape({
        avatarType: PropTypes.oneOf(['upload', 'letter_avatar', 'gravatar']),
      }),
    }),
    // Is this a chooser for a User account?
    onSave: PropTypes.func,
  },

  mixins: [ApiMixin],

  getDefaultProps() {
    return {
      allowGravatar: true,
      allowLetter: true,
      allowUpload: true,
      onSave: () => {},
    };
  },

  getInitialState() {
    return {
      model: this.props.model,
      savedDataUrl: null,
      dataUrl: null,
      hasError: false,
      selectedfile: null,
      loaded: 0,
    };
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Update local state if defined in props
    if (typeof nextProps.model !== 'undefined') {
      this.setState({model: nextProps.model});
    }
  },

  updateState(model) {
    this.setState({model});
  },

  updateDataUrlState(dataUrlState) {
    this.setState(dataUrlState);
  },

  handleError(msg) {
    addErrorMessage(msg);
  },

  handleSuccess(model) {
    const {onSave} = this.props;
    this.setState({model});
    onSave(model);
    addSuccessMessage(t('Successfully saved avatar preferences'));
  },

  handleSaveSettings(ev) {
    const {endpoint} = this.props;

    const {model, dataUrl} = this.state;
    ev.preventDefault();
    let data = {};
    const avatarType = model && model.avatar ? model.avatar.avatarType : undefined;
    const avatarPhoto = dataUrl ? dataUrl.split(',')[1] : null;

    data = {
      avatar_photo: avatarPhoto,
      avatar_type: avatarType,
    };

    this.api.request(endpoint, {
      method: 'PUT',
      data,
      success: (resp) => {
        this.setState({savedDataUrl: this.state.dataUrl});
        this.handleSuccess(resp);
      },
      error: this.handleError.bind(this, 'There was an error saving your preferences.'),
    });
  },

  handleChange(id) {
    const model = {...this.state.model};
    model.avatar.avatarType = id;
    this.updateState(model);
  },

  uploadClick(ev) {
    ev.preventDefault();
    if (!this.file) {
      return;
    }
    this.file.click();
  },

  handleSelectedFile(event) {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    });
  },

  render() {
    const {hasError, model} = this.state;

    if (hasError) {
      return <LoadingError />;
    }
    if (!model) {
      return <LoadingIndicator />;
    }

    return (
      <Panel>
        <PanelHeader>File</PanelHeader>
        <PanelBody>
          <input type="file" name="" id="" onChange={this.handleSelectedFile} />
          <button onClick={this.handleUpload}>Upload</button>
        </PanelBody>
      </Panel>
    );
  },
});

export default UploadFile;
