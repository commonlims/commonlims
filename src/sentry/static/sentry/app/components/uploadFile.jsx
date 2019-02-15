import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import styled from 'react-emotion';

import Well from 'app/components/well';
import {Panel, PanelBody, PanelHeader} from './panels';
import {addErrorMessage, addSuccessMessage} from '../actionCreators/indicator';
import {t} from '../locale';
import ApiMixin from '../mixins/apiMixin';
import Avatar from './avatar';
import AvatarCropper from './avatarCropper';
import Button from './button';
import ExternalLink from './externalLink';
import LoadingError from './loadingError';
import LoadingIndicator from './loadingIndicator';
import RadioGroup from '../views/settings/components/forms/controls/radioGroup';

const UploadFile = createReactClass({
  displayName: 'UploadFile',

  propTypes: {
    endpoint: PropTypes.string.isRequired,
    allowGravatar: PropTypes.bool,
    allowLetter: PropTypes.bool,
    allowUpload: PropTypes.bool,
    type: PropTypes.oneOf(['user', 'team', 'organization', 'project']),
    model: PropTypes.shape({
      avatar: PropTypes.shape({
        avatarType: PropTypes.oneOf(['upload', 'letter_avatar', 'gravatar']),
      }),
    }),
    // Is this a chooser for a User account?
    isUser: PropTypes.bool,
    savedDataUrl: PropTypes.string,
    onSave: PropTypes.func,
    disabled: PropTypes.bool,
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
      loaded: 0
    };
  },

  componentWillReceiveProps(nextProps) {
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
    let {onSave} = this.props;
    this.setState({model});
    onSave(model);
    addSuccessMessage(t('Successfully saved avatar preferences'));
  },

  handleSaveSettings(ev) {
    let {endpoint} = this.props;
    console.log("HERE", endpoint);

    let {model, dataUrl} = this.state;
    ev.preventDefault();
    let data = {};
    let avatarType = model && model.avatar ? model.avatar.avatarType : undefined;
    let avatarPhoto = dataUrl ? dataUrl.split(',')[1] : null;

    data = {
      avatar_photo: avatarPhoto,
      avatar_type: avatarType,
    };

    this.api.request(endpoint, {
      method: 'PUT',
      data,
      success: resp => {
        this.setState({savedDataUrl: this.state.dataUrl});
        this.handleSuccess(resp);
      },
      error: this.handleError.bind(this, 'There was an error saving your preferences.'),
    });
  },

  handleChange(id) {
    console.log("HERE2");
    let model = {...this.state.model};
    model.avatar.avatarType = id;
    this.updateState(model);
  },

  uploadClick(ev) {
    console.log("HERE3");
    ev.preventDefault();
    if (!this.file) return;
    this.file.click();
  },

  handleSelectedFile(event) {
    this.setState({
        selectedFile: event.target.files[0],
        loaded: 0,
    });
  },

  render() {
    let {
      allowGravatar,
      allowUpload,
      allowLetter,
      savedDataUrl,
      type,
      isUser,
      disabled,
    } = this.props;
    let {hasError, model} = this.state;

    if (hasError) {
      return <LoadingError />;
    }
    if (!model) {
      return <LoadingIndicator />;
    }

    let avatarType = 'upload';
    let isLetter = avatarType === 'letter_avatar';
    // let isUpload = avatarType === 'upload';
    let isTeam = type === 'team';
    let isOrganization = type === 'organization';
    let isProject = type === 'project';
    let style = {
      position: 'absolute',
      opacity: 0,
    };

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

const AvatarGroup = styled.div`
  display: flex;
  flex-direction: ${p => (p.inline ? 'row' : 'column')};
`;

const AvatarForm = styled('div')`
  line-height: 1.5em;
  padding: 1em 1.25em;
`;

const AvatarSubmit = styled('fieldset')`
  display: flex;
  justify-content: flex-end;
  margin-top: 1em;
`;

const AvatarUploadSection = styled('div')`
  margin-top: 1em;
`;

export default UploadFile;