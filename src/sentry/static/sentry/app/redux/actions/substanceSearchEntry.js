import axios from 'axios';

// SubstancesSearchEntry encapsulates a potentially grouped entry in the substance search UI
// The store always has one page worth of data. The list contains a generic wrapper class
// that contains the entry that's displayed. Each entry in the list may contain children
// and knows if they have been fetched or not.

// NOTE: an entry might for example contain a project or a container. It all depends
// on by what we're grouping. The page size is based on how many parent entries should be shown,
// not how many child entires there are. It's named SubstancesSearchEntry because that's what the
// user is searching for.

export const SUBSTANCE_SEARCH_ENTRIES_GET_REQUEST =
  'SUBSTANCE_SEARCH_ENTRIES_GET_REQUEST';
export const SUBSTANCE_SEARCH_ENTRIES_GET_SUCCESS =
  'SUBSTANCE_SEARCH_ENTRIES_GET_SUCCESS';
export const SUBSTANCE_SEARCH_ENTRIES_GET_FAILURE =
  'SUBSTANCE_SEARCH_ENTRIES_GET_FAILURE';
export const SUBSTANCE_SEARCH_ENTRIES_TOGGLE_SELECT_ALL =
  'SUBSTANCE_SEARCH_ENTRIES_TOGGLE_SELECT_ALL';
export const SUBSTANCE_SEARCH_ENTRY_TOGGLE_SELECT =
  'SUBSTANCE_SEARCH_ENTRY_TOGGLE_SELECT';

export const substanceSearchEntriesGetRequest = (query, groupBy) => {
  return {
    type: SUBSTANCE_SEARCH_ENTRIES_GET_REQUEST,
    query,
    groupBy,
  };
};

export const substanceSearchEntriesGetSuccess = substanceSearchEntries => {
  return {
    type: SUBSTANCE_SEARCH_ENTRIES_GET_SUCCESS,
    substanceSearchEntries,
  };
};

export const substanceSearchEntriesGetFailure = err => ({
  type: SUBSTANCE_SEARCH_ENTRIES_GET_FAILURE,
  message: err,
});

function setInitialViewState(groupBy, searchEntry) {
  searchEntry.viewState = {
    isSelected: false,
    hasLoadedChildren: false,
    canExpand: false,
  };
}

export const substanceSearchEntriesGet = (query, groupBy) => dispatch => {
  dispatch(substanceSearchEntriesGetRequest(query, groupBy));
  return axios
    .get('/api/0/organizations/lab/substances/?query=' + query)
    .then(res => {
      // TODO: keep the state outside of these
      for (const entry of res.data) {
        setInitialViewState(groupBy, entry);
      }
      dispatch(substanceSearchEntriesGetSuccess(res.data));
    })
    .catch(err => dispatch(substanceSearchEntriesGetFailure(err)));
};

export const substanceSearchEntriesToggleSelectAll = doSelect => {
  return {
    type: SUBSTANCE_SEARCH_ENTRIES_TOGGLE_SELECT_ALL,
    doSelect,
  };
};

export const substanceSearchEntryToggleSelect = (id, doSelect) => {
  return {
    type: SUBSTANCE_SEARCH_ENTRY_TOGGLE_SELECT,
    id,
    doSelect,
  };
};
