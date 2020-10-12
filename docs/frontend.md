# Frontend Architecture Overview

The Common LIMS frontend app code can be found in `src/static/sentry`. Javascript tests are written in Jest and can be found in `tests/js/spec`.

## Components

Common LIMS uses React for its frontend components.

## API calls

Common LIMS API calls should be performed with the [Axios library](https://github.com/axios/axios) (and mocked with [moxios](https://github.com/axios/moxios)). Legacy Sentry components use a custom HTTP client defined in `app/api.jsx` that uses jQuery under the hood.

## Store

All Common LIMS components use a [Redux](https://react-redux.js.org/) store, while legacy Sentry components use [Reflux](https://github.com/reflux/refluxjs). Only "smart" components, i.e. views should interact with the store. All other "dumb" components should receive the relevant data as props.

Information on connecting React components to the Redux store can be found [here](https://react-redux.js.org/api/connect).

## Redux Architecture

Redux code is in the directory `app/redux`. Common LIMS configures Redux as follows:

* `store.js` configures the store with middleware, including a logger and [redux-thunk](https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60)
* `app/views/app.jsx` invokes the configuration logic and uses ReduxProvider to expose the store to the React application

This configuration, together with an example Redux implementation, is illustrated in [this pull request](https://github.com/commonlims/commonlims/pull/17/files).

To enable advanced Redux logging, set the "diff" option to "true" in store.js#createLogger.

### Actions and Reducers

Typically, each API resource should have its own action and reducer file in `app/redux`. The reducer file should also be added to the index `app/redux/reducers/index.js`.

We use the following convention for naming actions: `[ACTION]_[RESOURCE_NAME]_[REQUEST|SUCCESS|FAILURE]`, where ACTION often corresponds to the CRUD method being used. For example: 'GET_USER_TASK_DEFINITIONS_SUCCESS'. Each action should be wrapped in its own function, such as getUserTasksAggregateSuccess().

In addition, you will want to create a thunk wrapper for any asynchronous API calls, such as getUserTasksAggregate(). This function does the actual side effect (such as getting or creating a resource), while the other actions are dispatched as a result of that side effect.

Every action should be handled in the corresponding reducer file.

### Testing Redux-connected components

When writing tests, there is a trick to importing Redux-connected components, i.e. components exported in this way:

`export default connect(mapStateToProps, mapDispatchToProps)(MyComponent);`

In addition to the default export, the component should also be made available as a named export, like so:

`export class MyComponent extends React.Component {}`

In the test, import the __named__ export by enclosing it in curly braces, like so:

`import { MyComponent } from 'app/views/myComponent';`

You can then test the component like any other.

## Icons

Some icons are still being used from the Sentry codebase. All new ready-made icons are from the
FontAwesome package using the solid style.

To add a new FontAwesome icon, search for it on:

    https://fontawesome.com/icons?d=gallery&s=solid&m=free

Then add it as a new component in app/components/icons.jsx.
