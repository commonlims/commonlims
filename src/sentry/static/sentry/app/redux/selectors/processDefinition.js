import {createSelector} from 'reselect';
// import {Map} from 'immutable';

const getProcessDefinitions = (state) => state.processDefinition.byIds;

// Fetches all available presets from all available processDefinitions
export const getPresetsById = createSelector(
  [getProcessDefinitions],
  (processDefinitions) => {
    // Returns all presets basd on all processDefinitions we've got. The presets are sorted by ID.
    const allPresets = [];

    for (const procDef of Object.values(processDefinitions)) {
      allPresets.push(...procDef.presets);
    }
    const presetsById = {};

    for (const entry of allPresets) {
      // We add a new key for the preset that's not available in the backend:
      entry.id = entry.processDefinitionId + '/' + entry.name;
      presetsById[entry.id] = entry;
    }
    return presetsById;
  }
);
