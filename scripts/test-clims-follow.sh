
watchmedo shell-command --patterns="*.py" --recursive --command='flock -n test2.lock pytest --tb=no --last-failed -v -s ./tests/clims'
