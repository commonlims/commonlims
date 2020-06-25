/* global process */
process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error(reason);
});

// NOTE: Don't add to this list without a ticket for fixing the warning, and remove the
// suppression after fixing it
const suppressedMessages = [
  'componentWillReceiveProps has been renamed',
  'componentWillMount has been renamed',
  'componentWillUpdate has been renamed',
];

function suppressMessage(msg) {
  for (let substring of suppressedMessages) {
    if (msg.includes(substring)) return true;
  }
  return false;
}

// Override console.warning so we can suppress specific warnings
const originalWarn = console.warn;
function logWarning(...warnings) {
  if (warnings.length === 0) {
    return;
  }
  // NOTE: This assumes that the text to filter is in the first argument, which
  // might be incorrect, as the following arguments can be substitutions.
  if (suppressMessage(warnings[0])) return;
  originalWarn(...warnings);
}
global.console.warn = logWarning;
