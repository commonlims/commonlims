import {Client} from 'app/api';

const ApiMixin = {
  UNSAFE_componentWillMount() {
    this.api = new Client();
  },

  componentWillUnmount() {
    this.api.clear();
  },
};

export default ApiMixin;
