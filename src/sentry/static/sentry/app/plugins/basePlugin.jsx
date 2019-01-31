import React from 'react';

import Settings from 'app/plugins/components/settings';
import ProcessSettings from 'app/plugins/components/processSettings';

class BasePlugin {
  constructor(data) {
    Object.assign(this, data);
  }

  renderSettings(props) {
    return <Settings plugin={this} {...props} />;
  }

  renderProcessVars(props) {
    return <ProcessSettings plugin={this} {...props} />;
  }
}

BasePlugin.DefaultSettings = Settings;

export default BasePlugin;
