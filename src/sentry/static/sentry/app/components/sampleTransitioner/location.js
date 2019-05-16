export const LocationState = {
  EMPTY: 1,
  NOT_EMPTY: 2, // The well has a sample before entering the view
  NOT_EMPTY_TRANSITION_SOURCE: 3, // The well has a sample that has been transitioned (from src to target)
  NOT_EMPTY_TRANSITION_TARGET: 4, // A target well has a sample that has been transitioned
};
