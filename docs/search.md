# Searching

IN-DEVELOPMENT

Elasticsearch is used for fast online searching, e.g. for samples and containers. This is achieved by regularily indexing the production data in elasticsearch. Notice that your business data is always in postgres and that's the main source of truth. This means that at any point one can recreate the elasticsearch instance, e.g. during an upgrade, without affecting the sytem.

Notice that when doing searches in the UI, you may have to wait a few seconds until production data has been indexed. The aim is that this shouldn't be more than ten seconds after the actual data was created.

No business logic is ever based on the results of the data in the elasticsearch instance, i.e. the postgresql data is the source of truth.
