# Frontend Architecture Overview

## Components

Common LIMS uses React for its frontend components.

## Store

All new components use a Redux store, while legacy Sentry components use Reflux. Only "smart" components, i.e. views should interact with the store. All other "dumb" components should receive the relevant data as props.

## Redux Architecture

All redux actions and reducers are in the directory `static/sentry/app/redux`.

`store.js` configures the store with middleware, including a logger and [redux-thunk](https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60)
The redux-thunk library is used as a middleware


### Actions


Our Redux actions use the Axios library to make asynchronous calls.

We use the following convention for naming actions: `[RESOURCE_NAME]_[HTTP_METHOD]_[REQUEST|SUCCESS|FAILURE]` For example: 'USER_TASKS_GET_SUCCESS'

Each action will typically be wra

React components should be connected to the Redux store using the `connect` method and its related methods `mapStateToProps` and `mapDispatchToProps`. For details see: https://react-redux.js.org/api/connect

## Jest

All Javascript tests are written in Jest. Asynchronous calls can be mocked with moxios.
