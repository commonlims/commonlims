import React from 'react';

import {t} from 'app/locale';
import ConfigStore from 'app/stores/configStore';
import DynamicWrapper from 'app/components/dynamicWrapper';
import Hook from 'app/components/hook';

const Footer = () => {
  const config = ConfigStore.getConfig();
  return (
    <footer>
      <div className="container">
        <div className="pull-right">
          <a className="hidden-xs" href="/api/">
            {t('API')}
          </a>
          <a href="/docs/">{t('Docs')}</a>
          <a
            className="hidden-xs"
            href="https://github.com/commonlims/commonlims"
            rel="noreferrer"
          >
            {t('Contribute')}
          </a>
        </div>
        {config.isOnPremise && (
          <div className="version pull-left">
            {'Common LIMS '}
            <DynamicWrapper fixed="Acceptance Test" value={'0.1.0'} />
          </div>
        )}
        <a href="/" className="icon-sentry-logo" />
        <Hook name="footer" />
      </div>
    </footer>
  );
};

export default Footer;
