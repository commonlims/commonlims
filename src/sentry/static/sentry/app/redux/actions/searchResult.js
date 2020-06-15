import {ac, list} from './shared';
import axios from 'axios';

export const RESOURCE_NAME = 'SEARCH_RESULT';

/*
 * Searches will lead to top level results which can be expanded 
 *  - Search, Group by substance
 *    - Expanding shows processes
 *  - Search, Group by container
 *    - Expanding shows substances
 *  - Search, Group by project
 *    - Expanding shows substances (for example)
 */

/*
  Searches for a single page for a particular parent
*/

const getListRequest = list.acRequest(RESOURCE_NAME);
const getListSuccess = list.acSuccess(RESOURCE_NAME);
const getListFailure = list.acFailure(RESOURCE_NAME);

function getEndpoint(org, resource, search) {
  if (resource == 'Container') {
    return `api/0/organizations/${org}/containers/`;
  } else if (resource == 'Substance') {
    return `api/0/organizations/${org}/substances/`;
  } else if (resource == 'SubstanceType') {
    return `api/0/organizations/${org}/substanceTypes/`;
  }

  throw Error('Unknown resource: ' + resource);
}

const search = (resource, parent, cursor) => dispatch => {
  dispatch(getListRequest(search, null, cursor, parent));

  const config = {
    params: {
      search,
      cursor,
    },
  };

  const url = getEndpoint('lab', resource, parent);

  return axios
    .get(url, config)
    .then(res => dispatch(getListSuccess(res.data, res.headers.link, parent)))
    .catch(err => dispatch(getListFailure(err)));
};

export const searchResultActions = {
  getListRequest,
  getListSuccess,
  getListFailure,
  search,
};
