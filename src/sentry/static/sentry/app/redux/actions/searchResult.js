import {ac} from './shared';

/*
 * Searches will lead to top level results which can be expanded 
 *  - Search, Group by substance
 *    - Expanding shows processes
 *  - Search, Group by container
 *    - Expanding shows substances
 *  - Search, Group by project
 *    - Expanding shows substances (for example)
 */

// TODO: We might want to be able to go deeper, but for now, one can only expand one level
export const SET_SEARCH_RESULT_SHAPE = 'SET_SEARCH_RESULT_SHAPE';
export const setSearchResultShape = ac(SET_SEARCH_RESULT_SHAPE, 'parent', 'child');

export const searchResultActions = {
  setShape: setSearchResultShape,
};

// export const RESOURCE_NAME = 'SUBSTANCE_SEARCH_ENTRY';

// export const substanceSearchEntriesGet = (search, groupBy, cursor) => dispatch => {
//   dispatch(substanceSearchEntriesGetRequest(search, groupBy, cursor));

//   const request = {
//     params: {
//       search,
//       cursor,
//     },
//   };
//   return axios
//     .get('/api/0/organizations/lab/substances/', request)
//     .then(res => {
//       dispatch(substanceSearchEntriesGetSuccess(res.data, res.headers.link));
//     })
//     .catch(err => dispatch(substanceSearchEntriesGetFailure(err)));
// };

// export const substanceActions = makeResourceActions(
//   RESOURCE_NAME,
//   '/api/0/organizations/lab/substances/' // TODO: Figure out how best to push in the org!
// );

// SubstancesSearchEntry encapsulates a potentially grouped entry in the substance search UI
// The store always has one page worth of data. The list contains a generic wrapper class
// that contains the entry that's displayed. Each entry in the list may contain children
// and knows if they have been fetched or not.

// NOTE: an entry might for example contain a project or a container. It all depends
// on by what we're grouping. The page size is based on how many parent entries should be shown,
// not how many child entires there are. It's named SubstancesSearchEntry because that's what the
// user is searching for.
