import timezones from 'app/data/timezones';
import languages from 'app/data/languages';

// Export route to make these forms searchable by label/help
export const route = '/settings/account/details/';

// Called before sending API request, these fields need to be sent as an `options` object
const transformOptions = (data) => ({options: data});

const formGroups = [
  {
    // Form "section"/"panel"
    title: 'Preferences',
    fields: [
      {
        name: 'language',
        type: 'choice',
        label: 'Language',
        // seems weird to have choices in initial form data
        choices: languages,
        getData: transformOptions,
      },
      {
        name: 'timezone',
        type: 'choice',
        label: 'Timezone',
        choices: timezones,
        getData: transformOptions,
      },
      {
        name: 'clock24Hours',
        type: 'boolean',
        label: 'Use a 24-hour clock',
        getData: transformOptions,
      },
    ],
  },
];

export default formGroups;
