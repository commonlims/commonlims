import React from 'react';
import {mount} from 'enzyme';
import {ThemeProvider} from 'emotion-theming';
import theme from 'app/utils/theme';
import renderer from 'react-test-renderer';

export function mountWithThemeAndContext(component) {
  return mount(
    <ThemeProvider theme={theme}>{component}</ThemeProvider>,
    TestStubs.routerContext()
  );
}

// export function shallowWithThemeAndContext(component) {
//   return shallow(
//     <ThemeProvider theme={theme}>{component}</ThemeProvider>,
//     TestStubs.routerContext()
//   );
// }

// NOTE: In the test setup we have the line
//   expect.addSnapshotSerializer(createSerializer(emotion));
// which makes jest create a snapshot with css styles, not only class names
export function render(component) {
  // Add the default theme:
  const withTheme = <ThemeProvider theme={theme}>{component}</ThemeProvider>;
  return renderer.create(withTheme).toJSON();
}
