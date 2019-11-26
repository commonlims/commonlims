import PropTypes from 'prop-types';
import React from 'react';
import utils from 'app/utils';
import {t} from 'app/locale';

export default class Pagination extends React.Component {
  static propTypes = {
    pageLinks: PropTypes.string,
    onCursor: PropTypes.func,
    className: PropTypes.string,
  };

  static contextTypes = {
    location: PropTypes.object,
  };

  static defaultProps = {
    className: 'stream-pagination',
  };

  render() {
    const {className, onCursor, pageLinks} = this.props;
    if (!pageLinks) {
      return null;
    }

    const links = utils.parseLinkHeader(pageLinks);

    let previousPageClassName = 'btn btn-default btn-lg prev';
    if (links.previous.results === false) {
      previousPageClassName += ' disabled';
    }

    let nextPageClassName = 'btn btn-default btn-lg next';
    if (links.next.results === false) {
      nextPageClassName += ' disabled';
    }

    return (
      <div className={'clearfix' + (className ? ` ${className}` : '')}>
        <div className="btn-group pull-right">
          <a
            onClick={() => {
              onCursor(links.previous.cursor);
            }}
            className={previousPageClassName}
            disabled={links.previous.results === false}
          >
            <span title={t('Previous')} className="icon-arrow-left" />
          </a>
          <a
            onClick={() => {
              onCursor(links.next.cursor);
            }}
            className={nextPageClassName}
            disabled={links.next.results === false}
          >
            <span title={t('Next')} className="icon-arrow-right" />
          </a>
        </div>
      </div>
    );
  }
}
