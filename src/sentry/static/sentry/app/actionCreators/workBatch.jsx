import * as Sentry from '@sentry/browser';

import { Client } from 'app/api';
import WorkBatchActions from 'app/actions/workBatchActions';
import { buildUserId, buildTeamId } from 'app/utils';
import { uniqueId } from 'app/utils/guid';

export function assignToUser(params) {
  const api = new Client();

  let endpoint = `/work-batches/${params.id}/`;

  let id = uniqueId();

  WorkBatchActions.assignTo(id, params.id, {
    email: (params.member && params.member.email) || '',
  });

  let request = api.requestPromise(endpoint, {
    method: 'PUT',
    // Sending an empty value to assignedTo is the same as "clear",
    // so if no member exists, that implies that we want to clear the
    // current assignee.
    data: {
      assignedTo: params.user ? buildUserId(params.user.id) : '',
    },
  });

  request
    .then(data => {
      WorkBatchActions.assignToSuccess(id, params.id, data);
    })
    .catch(data => {
      WorkBatchActions.assignToError(id, params.id, data);
    });

  return request;
}

export function clearAssignment(groupId) {
  const api = new Client();

  let endpoint = `/issues/${groupId}/`;

  let id = uniqueId();

  WorkBatchActions.assignTo(id, groupId, {
    email: '',
  });

  let request = api.requestPromise(endpoint, {
    method: 'PUT',
    // Sending an empty value to assignedTo is the same as "clear"
    data: {
      assignedTo: '',
    },
  });

  request
    .then(data => {
      WorkBatchActions.assignToSuccess(id, groupId, data);
    })
    .catch(data => {
      WorkBatchActions.assignToError(id, groupId, data);
    });

  return request;
}

export function assignToActor({ id, actor }) {
  const api = new Client();

  let endpoint = `/issues/${id}/`;

  let guid = uniqueId();
  let actorId;

  WorkBatchActions.assignTo(guid, id, { email: '' });

  switch (actor.type) {
    case 'user':
      actorId = buildUserId(actor.id);
      break;

    case 'team':
      actorId = buildTeamId(actor.id);
      break;

    default:
      Sentry.withScope(scope => {
        scope.setExtra('actor', actor);
        Sentry.captureException('Unknown assignee type');
      });
  }

  return api
    .requestPromise(endpoint, {
      method: 'PUT',
      data: { assignedTo: actorId },
    })
    .then(data => {
      WorkBatchActions.assignToSuccess(guid, id, data);
    })
    .catch(data => {
      WorkBatchActions.assignToError(guid, id, data);
    });
}
