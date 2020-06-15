import {resource} from './shared';
import {SET_SEARCH_RESULT_SHAPE} from '../actions/searchResult';

// Creates a search entry element
//

const example = {
  loading: false,
  errorMessage: null,
  byIds: {
    'Container-1': {},
    'Container-2': {},
  },
  listViewState: {
    allVisibleSelected: false,
  },
  resource: 'Container',
  childResource: 'Substance',
  search: 'substance.name: something',
  pagination: {},
  page: [
    {id: 'Container-1', expanded: false, page: [], pagination: {}},
    {
      id: 'Container-2',
      expanded: true,
      page: [
        {id: 'Substance-1', expanded: false, page: []},
        {id: 'Substance-1', expanded: false, page: []},
      ],
    },
    {id: 'Container-3', expanded: false, page: [], pagination: {}},
  ],
};

const initialState = {
  loading: false,
  errorMessage: null,

  // A page of the results has been selected
  allVisibleSelected: false,

  // The resource we are grouping by
  resource: null,
  child: null,

  search: null,

  // The page includes object that are shaped exactly like this
  pagination: {
    pageLinks: null, // The links returned by the backend
    cursor: null,
  },
  page: [],
};

export const searchResult = (resource, initialState) => (
  state = initialState,
  action
) => {
  switch (action.type) {
    case 'GET_LIST_REQUEST':
      return getListRequest(state, action);
    default:
      return state;
  }
};
