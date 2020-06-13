# Database

All data in Common LIMS is kept in one database, even regular files. This simplifies data management and backups. You can configure on which server the database is. You might for example want to keep the database server separate from the application server for increased security.

Here we describe the tables in Common LIMS, relationships between them as well as useful queries one can make.

# Tables

## Core tables

```
```

```
SELECT *
  FROM clims_substanceassignment
```

## Camunda (workflow engine)

TODO

# Views

TODO

# For developers

In general, database tables are defined with Django models, but in certain cases, more optimized queries are used too.

The workflow engine's database objects are kept in the same database as the core objects. They are though not managed in the same way as that engine is a separate project.

TODO
