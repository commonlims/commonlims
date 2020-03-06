
from sentry.plugins.base import Plugin2


class DemoPlugin(Plugin2):
    description = 'Common LIMS core demo plugin'
    title = 'Demo plugin'
    slug = 'clims_demo'  # Used?
    conf_title = title
    conf_key = slug

    asset_key = 'snpseq'
    assets = [
        'dist/snpseq.js',
    ]

    version = '1.0.0'
