from __future__ import absolute_import

import os


def configure_logging():
    from django.conf import settings
    import logging
    import logging.config
    import structlog
    from sentry import options
    from sentry.logging import LoggingFormat
    WrappedDictClass = structlog.threadlocal.wrap_dict(dict)
    kwargs = {
        'context_class':
        WrappedDictClass,
        'wrapper_class':
        structlog.stdlib.BoundLogger,
        'cache_logger_on_first_use':
        True,
        'processors': [
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.format_exc_info,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.UnicodeDecoder(),
        ]
    }

    fmt_from_env = os.environ.get('SENTRY_LOG_FORMAT')
    if fmt_from_env:
        settings.SENTRY_OPTIONS['system.logging-format'] = fmt_from_env.lower()

    fmt = options.get('system.logging-format')

    if fmt == LoggingFormat.HUMAN:
        from sentry.logging.handlers import HumanRenderer
        kwargs['processors'].extend(
            [
                structlog.processors.ExceptionPrettyPrinter(),
                HumanRenderer(),
            ]
        )
    elif fmt == LoggingFormat.MACHINE:
        from sentry.logging.handlers import JSONRenderer
        kwargs['processors'].append(JSONRenderer())

    structlog.configure(**kwargs)

    lvl = os.environ.get('CLIMS_LOG_LEVEL')

    if lvl and lvl not in logging._levelNames:
        raise AttributeError('%s is not a valid logging level.' % lvl)

    settings.LOGGING['root'].update({'level': lvl or settings.LOGGING['default_level']})

    if lvl:
        for logger in settings.LOGGING['overridable']:
            try:
                settings.LOGGING['loggers'][logger].update({'level': lvl})
            except KeyError:
                raise KeyError('%s is not a defined logger.' % logger)

    logging.config.dictConfig(settings.LOGGING)
