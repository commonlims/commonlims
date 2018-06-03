#!/usr/bin/env python
# flake8: noqa

from __future__ import absolute_import
from __future__ import print_function
import sys

# hacked together, fix and add to the main tool

name = sys.argv[1]
print_help = len(sys.argv) > 2 and sys.argv[2] == "--help"

# simply looks for 'components' (models, endpoints, jsx views etc) that should be added. Adds them based on templates
# look for TODO-COMP for files that need to be implemented

import os
import shutil
import inflect
import stringcase

# NOTE: The names created here might be grammatically incorrect (automatically/naively pluralized).
print()


def component_file(path, template_file, help):
    if template_file:
        template_path = "{}/{}".format("component_templates", template_file)
        exists = os.path.exists(path)
        if not exists:
            if os.path.exists(template_path):
                shutil.copy(template_path, path)
            else:
                if print_help:
                    print("WARNING: There is no template path for", template_path)

    if print_help:
        print(help)

    if os.path.exists(path):
        with open(path) as fs:
            content = fs.read()
            if "{{TODO_TEMPLATE}}" in content:
                status = "TEMPLATE"
            else:
                status = "EXISTS"
    else:
        status = "NA"

    print("{}: {}".format(status, path))
    if print_help:
        print()


inf = inflect.engine()
snake = stringcase.snakecase(name)
snakes = inf.plural(snake)
camel = stringcase.camelcase(name)
camels = inf.plural(camel)
nocase = snake.replace("_", "")


# sentry has a convention of naming the model files with no underscore. We can
# do the same for now:
component_file("src/sentry/models/{}.py".format(nocase),
               "model.py.j2",
               "Model (Django ORM) describing the component. Maps to a database entity.")

component_file("src/sentry/api/endpoints/{}.py".format(snakes),
               "api_endpoint_list.py.j2",
               "Endpoint that lists all or part of all entities of this type. Usually provides GET and POST.")

component_file("src/sentry/api/endpoints/{}_details.py".format(snake),
               "api_endpoint_details.py.j2",
               "Endpoint for returning a single instance. Usually provides GET, POST and PUT")

component_file("src/sentry/api/urls.py",
               None,
               "Map your endpoint classes to urls here")

component_file("src/sentry/static/sentry/app/views/{}.jsx".format(camels),
               "viewList.jsx.j2",
               "A view that lists a set of entities of this type (optional)")

component_file("src/sentry/static/sentry/app/views/{}Details.jsx".format(camel),
               "viewDetails.jsx.j2",
               "A view for viewing/editing a single entity of this type (optional)")

component_file("src/sentry/static/sentry/app/routes.jsx",
               None,
               "Routes for your view components")
