from __future__ import absolute_import, print_function


def button(button_text):
    def button_decorator(fn):
        fn._hook_type = 'button'
        fn._hook_button_name = button_text
        return fn
    return button_decorator
