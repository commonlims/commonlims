import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import {logException} from 'app/utils/logging';
import EventContexts from 'app/components/events/contexts';
import EventContextSummary from 'app/components/events/contextSummary';
import EventDataSection from 'app/components/events/eventDataSection';
import EventErrors from 'app/components/events/errors';
import EventExtraData from 'app/components/events/extraData';
import EventPackageData from 'app/components/events/packageData';
import EventSdk from 'app/components/events/sdk';
import EventDevice from 'app/components/events/device';
import SentryTypes from 'app/sentryTypes';
import utils from 'app/utils';
import {t} from 'app/locale';

import ExceptionInterface from 'app/components/events/interfaces/exception';
import MessageInterface from 'app/components/events/interfaces/message';
import RequestInterface from 'app/components/events/interfaces/request';
import StacktraceInterface from 'app/components/events/interfaces/stacktrace';
import TemplateInterface from 'app/components/events/interfaces/template';
import CspInterface from 'app/components/events/interfaces/csp';
import BreadcrumbsInterface from 'app/components/events/interfaces/breadcrumbs';
import GenericInterface from 'app/components/events/interfaces/generic';
import ThreadsInterface from 'app/components/events/interfaces/threads';
import DebugMetaInterface from 'app/components/events/interfaces/debugmeta';

export const INTERFACES = {
  exception: ExceptionInterface,
  message: MessageInterface,
  request: RequestInterface,
  stacktrace: StacktraceInterface,
  template: TemplateInterface,
  csp: CspInterface,
  expectct: GenericInterface,
  expectstaple: GenericInterface,
  hpkp: GenericInterface,
  breadcrumbs: BreadcrumbsInterface,
  threads: ThreadsInterface,
  debugmeta: DebugMetaInterface,
};

const SampleEventEntries = createReactClass({
  displayName: 'SampleEventEntries',

  propTypes: {
    group: SentryTypes.Group.isRequired,
    event: SentryTypes.Event.isRequired,
    isShare: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      isShare: false,
    };
  },

  componentDidMount() {
    const {event} = this.props;

    if (!event.errors || !event.errors.length > 0) {
      return;
    }
    const errors = event.errors;
    const errorTypes = errors.map(errorEntries => errorEntries.type);
    const errorMessages = errors.map(errorEntries => errorEntries.message);

    this.recordIssueError(errorTypes, errorMessages);
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.event.id !== nextProps.event.id;
  },

  recordIssueError(errorTypes, errorMessages) {},

  interfaces: INTERFACES,

  render() {
    const {group, isShare, event} = this.props;
    const entries = event.entries.map((entry, entryIdx) => {
      try {
        const Component = this.interfaces[entry.type];
        if (!Component) {
          /*eslint no-console:0*/
          window.console &&
            console.error &&
            console.error('Unregistered interface: ' + entry.type);
          return null;
        }
        return (
          <Component
            key={'entry-' + entryIdx}
            group={group}
            event={event}
            type={entry.type}
            data={entry.data}
            isShare={isShare}
          />
        );
      } catch (ex) {
        logException(ex);
        return (
          <EventDataSection
            group={group}
            event={event}
            type={entry.type}
            title={entry.type}
          >
            <p>{t('There was an error rendering this data.')}</p>
          </EventDataSection>
        );
      }
    });

    const hasContext =
      !utils.objectIsEmpty(event.user) || !utils.objectIsEmpty(event.contexts);

    return (
      <div className="entries">
        {!utils.objectIsEmpty(event.errors) && (
          <EventErrors group={group} event={event} />
        )}{' '}
        {hasContext && <EventContextSummary group={group} event={event} />}
        {entries}
        {hasContext && <EventContexts group={group} event={event} />}
        {!utils.objectIsEmpty(event.context) && (
          <EventExtraData group={group} event={event} />
        )}
        {!utils.objectIsEmpty(event.packages) && (
          <EventPackageData group={group} event={event} />
        )}
        {!utils.objectIsEmpty(event.device) && (
          <EventDevice group={group} event={event} />
        )}
        {!utils.objectIsEmpty(event.sdk) && <EventSdk group={group} event={event} />}
        {!utils.objectIsEmpty(event.sdk) &&
          event.sdk.upstream.isNewer && (
            <div className="alert-block alert-info box">
              <span className="icon-exclamation" />
              {t(
                'This event was reported with an old version of the %s SDK.',
                event.platform
              )}
              {event.sdk.upstream.url && (
                <a href={event.sdk.upstream.url} className="btn btn-sm btn-default">
                  {t('Learn More')}
                </a>
              )}
            </div>
          )}{' '}
      </div>
    );
  },
});

export default SampleEventEntries;
