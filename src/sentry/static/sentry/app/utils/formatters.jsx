export function userDisplayName(user) {
  let displayName = user.name;
  if (user.email && user.email !== user.name) {
    displayName += ' (' + user.email + ')';
  }
  return displayName;
}

export function showRounded(value, decimals = 2) {
  // locale=undefine shows the number format of browser
  const x = new Intl.NumberFormat(undefined, {maximumFractionDigits: decimals});
  return x.format(value);
}
