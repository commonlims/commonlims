from __future__ import absolute_import, print_function

HOOK_TYPE = '_hook_type'

HOOK_TAG = '_hook_tag'


def button(button_text):
    def button_decorator(fn):
        setattr(fn, HOOK_TYPE, 'button')
        setattr(fn, HOOK_TAG, button_text)
        return fn
    return button_decorator


def criteria(description):
    def criteria_decorator(fn):
        setattr(fn, HOOK_TYPE, 'criteria')
        setattr(fn, HOOK_TAG, description)
        return fn
    return criteria_decorator
