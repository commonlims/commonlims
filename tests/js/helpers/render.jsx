import React from 'react';
import {mount as enzymeMount} from 'enzyme';
import {ThemeProvider} from 'emotion-theming';
import theme from 'app/utils/theme';
import renderer from 'react-test-renderer';

export function mount(component, context = null) {
  if (context === null) {
    context = TestStubs.routerContext();
  }
  return enzymeMount(<ThemeProvider theme={theme}>{component}</ThemeProvider>, context);
}

// Add:
//
// import serializer from 'jest-emotion';
// expect.addSnapshotSerializer(serializer);
//
// to make jest create a snapshot with css styles, not only class names
// https://emotion.sh/docs/testing
export function render(component) {
  // Add the default theme:
  const withTheme = <ThemeProvider theme={theme}>{component}</ThemeProvider>;
  return renderer.create(withTheme).toJSON();
}
