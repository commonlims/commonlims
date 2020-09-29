import PropTypes from 'prop-types';

// TODO: Auto generate this file from Python serializers

export const WorkDefinition = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  processDefinitionName: PropTypes.string.isRequired,
  processDefinitionKey: PropTypes.string.isRequired,
  workDefinitionKey: PropTypes.string.isRequired,
});

export const Resources = {
  WorkDefinition,
};
