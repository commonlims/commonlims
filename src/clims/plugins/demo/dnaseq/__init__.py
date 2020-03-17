from __future__ import absolute_import
from sentry.plugins.base import Plugin2


class DemoDnaSeqPlugin(Plugin2):
    description = 'Common LIMS core dnaseq demo plugin'
    title = 'DnaSeq Demo plugin'
    slug = 'clims_demodnaseq'
    conf_title = title
    conf_key = slug

    asset_key = 'snpseq'
    assets = [
        'dist/snpseq.js',
    ]

    version = '1.0.0'
