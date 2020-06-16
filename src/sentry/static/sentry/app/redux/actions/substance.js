import {makeResourceActions} from './shared';

export const RESOURCE_NAME = 'SUBSTANCE_SEARCH_ENTRY';

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

export const substanceActions = makeResourceActions(
  RESOURCE_NAME,
  '/api/0/organizations/lab/substances/' // TODO: Figure out how best to push in the org!
);

// SubstancesSearchEntry encapsulates a potentially grouped entry in the substance search UI
// The store always has one page worth of data. The list contains a generic wrapper class
// that contains the entry that's displayed. Each entry in the list may contain children
// and knows if they have been fetched or not.

// NOTE: an entry might for example contain a project or a container. It all depends
// on by what we're grouping. The page size is based on how many parent entries should be shown,
// not how many child entires there are. It's named SubstancesSearchEntry because that's what the
// user is searching for.
