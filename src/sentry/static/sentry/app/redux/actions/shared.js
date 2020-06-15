// Helper function that creates an action creator.
// From: https://redux.js.org/recipes/reducing-boilerplate
export function ac(type, ...argNames) {
  return function(...args) {
    const action = {type};
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index];
    });
    return action;
  };
}

// Action creators for standard actions

// List actions:
export const makeListRequest = type => {
  return () => {
    return {
      type,
    };
  };
};

export const list = {
  makeListRequest,
};
