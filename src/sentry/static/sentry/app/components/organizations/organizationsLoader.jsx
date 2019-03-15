import React from 'react';

import createReactClass from 'create-react-class';

import ApiMixin from 'app/mixins/apiMixin';
import OrganizationsStore from 'app/stores/organizationsStore';

const OrganizationsLoader = createReactClass({
  displayName: 'OrganizationsLoader',
  mixins: [ApiMixin],

  componentWillMount() {
    console.log("Mounting organizations loader");
    this.api.request('/organizations/', {
      query: {
        member: '1',
      },
      success: data => {
        console.log("Mounting organizations loader, before", data);
        OrganizationsStore.load(data);
        console.log("Mounting organizations loader, after");
        this.setState({
          loading: false,
        });
      },
      error: () => {
        this.setState({
          loading: false,
          error: true,
        });
      },
    });
  },

  componentWillUnmount() {
    OrganizationsStore.load([]);
  },

  render() {
    return <div>{this.props.children}</div>;
  },
});

export default OrganizationsLoader;
