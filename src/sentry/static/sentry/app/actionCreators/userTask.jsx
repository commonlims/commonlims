import * as Sentry from '@sentry/browser';

import { Client } from 'app/api';
import UserTaskActions from 'app/actions/userTaskActions';
import { buildUserId, buildTeamId } from 'app/utils';
import { uniqueId } from 'app/utils/guid';

export function assignToUser(params) {
  const api = new Client();

  let endpoint = `/user-tasks/${params.id}/`;

  let id = uniqueId();

  UserTaskActions.assignTo(id, params.id, {
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
      UserTaskActions.assignToSuccess(id, params.id, data);
    })
    .catch(data => {
      UserTaskActions.assignToError(id, params.id, data);
    });

  return request;
}

export function clearAssignment(groupId) {
  const api = new Client();

  let endpoint = `/issues/${groupId}/`;

  let id = uniqueId();

  UserTaskActions.assignTo(id, groupId, {
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
      UserTaskActions.assignToSuccess(id, groupId, data);
    })
    .catch(data => {
      UserTaskActions.assignToError(id, groupId, data);
    });

  return request;
}

export function assignToActor({ id, actor }) {
  const api = new Client();

  let endpoint = `/issues/${id}/`;

  let guid = uniqueId();
  let actorId;

  UserTaskActions.assignTo(guid, id, { email: '' });

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
      UserTaskActions.assignToSuccess(guid, id, data);
    })
    .catch(data => {
      UserTaskActions.assignToError(guid, id, data);
    });
}
