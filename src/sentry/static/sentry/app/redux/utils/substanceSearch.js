export function getRestcall(search, groupBy, cursor) {
  let endpoint = null;
  let request = null;
  if (groupBy === 'sample_type') {
    endpoint = '/api/0/organizations/lab/substances/property/' + groupBy + '/';
    request = {
      params: {
        unique: true,
      },
    };
  } else if (groupBy === 'container') {
    endpoint = '/api/0/organizations/lab/containers/';
    request = {
      params: {
        unique: true,
      },
    };
  } else {
    endpoint = '/api/0/organizations/lab/substances/';
    request = {
      params: {
        search,
        cursor,
      },
    };
  }
  return {
    endpoint,
    request,
  };
}

// Generate json that is adapted to list view,
// e.g. assure id is present for group header, and that there always is a 'name' attribute
export class ListViewEntryGenerator {
  constructor() {
    this.tempId = 1;
  }

  get(groupBy, originalEntry) {
    const isGroupHeader = groupBy !== 'substance';
    let name = null;
    if (groupBy === 'sample_type') {
      name = originalEntry;
    } else if (groupBy === 'container') {
      name = originalEntry.name;
    }
    const tempEntry = {
      id: this.tempId++,
      name,
    };
    const listViewEntry = isGroupHeader ? tempEntry : {...originalEntry};
    listViewEntry.isGroupHeader = isGroupHeader;
    return listViewEntry;
  }
}
