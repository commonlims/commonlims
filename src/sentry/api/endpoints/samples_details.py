from __future__ import absolute_import

import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from uuid import uuid4

from sentry.api.base import Endpoint, SessionAuthentication
from sentry.api.exceptions import ResourceDoesNotExist
from sentry.api.serializers import serialize
from sentry.models import ApiApplication, ApiApplicationStatus
from sentry.models.sample import Sample
from sentry.tasks.deletion import delete_api_application

delete_logger = logging.getLogger('sentry.deletions.api')
logger = logging.getLogger(__name__)
from clims.workflow import WorkflowEngine


class SampleDetailsEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request, sample_id):
        try:
            instance = Sample.objects.get(
                id=sample_id,
            )
        except ApiApplication.DoesNotExist:
            raise ResourceDoesNotExist

        s = serialize(instance, request.user)

        # TODO: Add some data for fun and profit
        s["name"] = "silly name"

        ret = {
            "status": "unresolved",
            "pluginIssues": [],
            "numComments": 1,
            "lastSeen": "2018-10-14T22:07:06Z",
            "userReportCount": 0,
            "id": "5",
            "userCount": 1,
            "stats": {
                "30d": [
                  [
                      1543795200.0,
                      0
                  ],
                    [
                      1543881600.0,
                      0
                  ],
                    [
                      1543968000.0,
                      0
                  ],
                ],
                "24h": [
                    [
                        1546430400.0,
                        0
                    ]
                ]
            },
            "culprit": "hello_world",
            "title": "Exception: will this happen?",
            "pluginActions": [],
            "assignedTo": {
                "id": "3",
                "type": "user",
                "email": "steinar.sturlaugsson@medsci.uu.se",
                "name": "steinar.sturlaugsson@medsci.uu.se"
            },
            "participants": [
                {
                    "username": "steinar.sturlaugsson@medsci.uu.se",
                    "name": "steinar.sturlaugsson@medsci.uu.se",
                    "avatarUrl": "https://secure.gravatar.com/avatar/da1dfdd48be7b8672a6c4c19297e070a?s=32&d=mm",
                    "hasPasswordAuth": True,
                    "dateJoined": "2018-10-02T12:26:34.216Z",
                    "emails": [
                        {
                            "is_verified": False,
                            "id": "2",
                            "email": "steinar.sturlaugsson@medsci.uu.se"
                        }
                    ],
                    "email": "steinar.sturlaugsson@medsci.uu.se",
                    "isManaged": False,
                    "lastActive": "2019-01-01T12:31:02.445Z",
                    "avatar": {
                        "avatarUuid": None,
                        "avatarType": "letter_avatar"
                    },
                    "lastLogin": "2018-12-18T10:24:32.968Z",
                    "identities": [],
                    "id": "3",
                    "isActive": True,
                    "has2fa": False
                },
                {
                    "username": "steinar.sturlaugsson@medsci.uu.se",
                    "name": "steinar.sturlaugsson@medsci.uu.se",
                    "avatarUrl": "https://secure.gravatar.com/avatar/c454a1cd6f9395d199b0aa97aefd9e67?s=32&d=mm",
                    "hasPasswordAuth": True,
                    "dateJoined": "2018-08-26T10:47:17.795Z",
                    "id": "1",
                    "email": "steinar.sturlaugsson@medsci.uu.se",
                    "isManaged": False,
                    "options": {
                        "timezone": "UTC",
                        "clock24Hours": False,
                        "language": "en",
                        "stacktraceOrder": -1,
                        "seenReleaseBroadcast": True
                    },
                    "lastActive": "2019-01-02T12:23:40.624Z",
                    "avatar": {
                        "avatarUuid": None,
                        "avatarType": "letter_avatar"
                    },
                    "lastLogin": "2019-01-02T10:23:13.305Z",
                    "flags": {
                        "newsletter_consent_prompt": False
                    },
                    "identities": [],
                    "emails": [
                        {
                            "is_verified": False,
                            "id": "1",
                            "email": "steinar.sturlaugsson@medsci.uu.se"
                        }
                    ],
                    "isActive": True,
                    "has2fa": False
                }
            ],
            "logger": None,
            "type": "error",
            "annotations": [],
            "metadata": {
                "type": "Exception",
                "value": "will this happen?"
            },
            "seenBy": [
                {
                    "username": "steinar.sturlaugsson@medsci.uu.se",
                    "name": "steinar.sturlaugsson@medsci.uu.se",
                    "avatarUrl": "https://secure.gravatar.com/avatar/c454a1cd6f9395d199b0aa97aefd9e67?s=32&d=mm",
                    "hasPasswordAuth": True,
                    "dateJoined": "2018-08-26T10:47:17.795Z",
                    "avatar": {
                        "avatarUuid": None,
                        "avatarType": "letter_avatar"
                    },
                    "id": "1",
                    "email": "steinar.sturlaugsson@medsci.uu.se",
                    "isManaged": False,
                    "options": {
                        "timezone": "UTC",
                        "clock24Hours": False,
                        "language": "en",
                        "stacktraceOrder": -1,
                        "seenReleaseBroadcast": True
                    },
                    "lastActive": "2019-01-02T12:23:40.624Z",
                    "lastSeen": "2019-01-02T10:51:58.665Z",
                    "lastLogin": "2019-01-02T10:23:13.305Z",
                    "flags": {
                        "newsletter_consent_prompt": False
                    },
                    "identities": [],
                    "emails": [
                        {
                            "is_verified": False,
                            "id": "1",
                            "email": "steinar.sturlaugsson@medsci.uu.se"
                        }
                    ],
                    "isActive": True,
                    "has2fa": False
                },
                {
                    "username": "steinar.sturlaugsson@medsci.uu.se",
                    "name": "steinar.sturlaugsson@medsci.uu.se",
                    "avatarUrl": "https://secure.gravatar.com/avatar/da1dfdd48be7b8672a6c4c19297e070a?s=32&d=mm",
                    "hasPasswordAuth": True,
                    "dateJoined": "2018-10-02T12:26:34.216Z",
                    "avatar": {
                        "avatarUuid": None,
                        "avatarType": "letter_avatar"
                    },
                    "emails": [
                        {
                            "is_verified": False,
                            "id": "2",
                            "email": "steinar.sturlaugsson@medsci.uu.se"
                        }
                    ],
                    "email": "steinar.sturlaugsson@medsci.uu.se",
                    "isManaged": False,
                    "lastActive": "2019-01-01T12:31:02.445Z",
                    "lastSeen": "2018-12-19T10:13:22.942Z",
                    "lastLogin": "2018-12-18T10:24:32.968Z",
                    "identities": [],
                    "id": "3",
                    "isActive": True,
                    "has2fa": False
                }
            ],
            "tags": [
                {
                    "uniqueValues": 1,
                    "name": "Browser",
                    "key": "browser"
                },
                {
                    "uniqueValues": 1,
                    "name": "Device",
                    "key": "device"
                },
                {
                    "uniqueValues": 2,
                    "name": "Handled",
                    "key": "handled"
                },
                {
                    "uniqueValues": 1,
                    "name": "Level",
                    "key": "level"
                },
                {
                    "uniqueValues": 1,
                    "name": "Logger",
                    "key": "logger"
                },
                {
                    "uniqueValues": 3,
                    "name": "Mechanism",
                    "key": "mechanism"
                },
                {
                    "uniqueValues": 1,
                    "name": "OS",
                    "key": "os"
                },
                {
                    "uniqueValues": 1,
                    "name": "Server",
                    "key": "server_name"
                },
                {
                    "uniqueValues": 1,
                    "name": "Transaction",
                    "key": "transaction"
                },
                {
                    "uniqueValues": 1,
                    "name": "URL",
                    "key": "url"
                },
                {
                    "uniqueValues": 1,
                    "name": "User",
                    "key": "user"
                }
            ],
            "subscriptionDetails": {
                "reason": "assigned"
            },
            "isPublic": True,
            "permalink": "snpseq/internal/issues/5/",
            "firstRelease": None,
            "shortId": "RC-0123-4",
            "shareId": "d7da866462cb4894a56b57abd85ca1fd",
            "firstSeen": "2018-10-14T22:01:39Z",
            "count": "8",
            "hasSeen": True,
            "level": "error",
            "isSubscribed": True,
            "pluginContexts": [
                {
                    "status": "unknown",
                    "slug": "snpseq",
                    "description": "Watch SnpSeq recordings in Sentry.",
                    "isTestable": False,
                    "author": {
                        "url": "https://github.com/getsentry/sentry-plugins",
                        "name": "Sentry Team"
                    },
                    "contexts": [
                        "snpseq"
                    ],
                    "doc": "",
                    "resourceLinks": [
                        {
                            "url": "https://github.com/getsentry/sentry-plugins/issues",
                            "title": "Bug Tracker"
                        },
                        {
                            "url": "https://github.com/getsentry/sentry-plugins",
                            "title": "Source"
                        }
                    ],
                    "enabled": True,
                    "hasConfiguration": True,
                    "name": "SnpSeq",
                    "version": "9.1.0.dev0",
                    "canDisable": True,
                    "shortName": "SnpSeq",
                    "metadata": {},
                    "type": "default",
                    "id": "snpseq",
                    "assets": [
                        {
                          "url": "_static/1546432045/snpseq/dist/snpseq.js"
                        }
                    ]
                }
            ],
            "isBookmarked": False,
            "project": {
                "slug": "internal",
                "name": "internal",
                "id": "2"
            },
            "lastRelease": None,
            "activity": [
                {
                    "type": "set_unresolved",
                    "user": {
                        "username": "steinar.sturlaugsson@medsci.uu.se",
                        "name": "steinar.sturlaugsson@medsci.uu.se",
                        "avatarUrl": "https://secure.gravatar.com/avatar/c454a1cd6f9395d199b0aa97aefd9e67?s=32&d=mm",
                        "hasPasswordAuth": True,
                        "dateJoined": "2018-08-26T10:47:17.795Z",
                        "id": "1",
                        "email": "steinar.sturlaugsson@medsci.uu.se",
                        "isManaged": False,
                        "options": {
                            "timezone": "UTC",
                            "clock24Hours": False,
                            "language": "en",
                            "stacktraceOrder": -1,
                            "seenReleaseBroadcast": True
                        },
                        "lastActive": "2019-01-02T12:23:40.624Z",
                        "avatar": {
                            "avatarUuid": None,
                            "avatarType": "letter_avatar"
                        },
                        "lastLogin": "2019-01-02T10:23:13.305Z",
                        "flags": {
                            "newsletter_consent_prompt": False
                        },
                        "identities": [],
                        "emails": [
                            {
                                "is_verified": False,
                                "id": "1",
                                "email": "steinar.sturlaugsson@medsci.uu.se"
                            }
                        ],
                        "isActive": True,
                        "has2fa": False
                    },
                    "data": {},
                    "id": "52",
                    "dateCreated": "2019-01-02T10:51:49.303Z"
                },
                {
                    "type": "assigned",
                    "user": {
                        "username": "steinar.sturlaugsson@medsci.uu.se",
                        "name": "steinar.sturlaugsson@medsci.uu.se",
                        "avatarUrl": "https://secure.gravatar.com/avatar/da1dfdd48be7b8672a6c4c19297e070a?s=32&d=mm",
                        "hasPasswordAuth": True,
                        "dateJoined": "2018-10-02T12:26:34.216Z",
                        "emails": [
                            {
                                "is_verified": False,
                                "id": "2",
                                "email": "steinar.sturlaugsson@medsci.uu.se"
                            }
                        ],
                        "email": "steinar.sturlaugsson@medsci.uu.se",
                        "isManaged": False,
                        "lastActive": "2019-01-01T12:31:02.445Z",
                        "avatar": {
                            "avatarUuid": None,
                            "avatarType": "letter_avatar"
                        },
                        "lastLogin": "2018-12-18T10:24:32.968Z",
                        "identities": [],
                        "id": "3",
                        "isActive": True,
                        "has2fa": False
                    },
                    "data": {
                        "assignee": "3",
                        "assigneeType": "user",
                        "assigneeEmail": "steinar.sturlaugsson@medsci.uu.se"
                    },
                    "id": "51",
                    "dateCreated": "2018-12-17T14:21:22.079Z"
                },
                {
                    "type": "unassigned",
                    "user": {
                        "username": "steinar.sturlaugsson@medsci.uu.se",
                        "name": "steinar.sturlaugsson@medsci.uu.se",
                        "avatarUrl": "https://secure.gravatar.com/avatar/da1dfdd48be7b8672a6c4c19297e070a?s=32&d=mm",
                        "hasPasswordAuth": True,
                        "dateJoined": "2018-10-02T12:26:34.216Z",
                        "emails": [
                            {
                                "is_verified": False,
                                "id": "2",
                                "email": "steinar.sturlaugsson@medsci.uu.se"
                            }
                        ],
                        "email": "steinar.sturlaugsson@medsci.uu.se",
                        "isManaged": False,
                        "lastActive": "2019-01-01T12:31:02.445Z",
                        "avatar": {
                            "avatarUuid": None,
                            "avatarType": "letter_avatar"
                        },
                        "lastLogin": "2018-12-18T10:24:32.968Z",
                        "identities": [],
                        "id": "3",
                        "isActive": True,
                        "has2fa": False
                    },
                    "data": {},
                    "id": "48",
                    "dateCreated": "2018-12-17T13:27:00.771Z"
                },
                {
                    "type": "set_resolved",
                    "user": {
                        "username": "steinar.sturlaugsson@medsci.uu.se",
                        "name": "steinar.sturlaugsson@medsci.uu.se",
                        "avatarUrl": "https://secure.gravatar.com/avatar/da1dfdd48be7b8672a6c4c19297e070a?s=32&d=mm",
                        "hasPasswordAuth": True,
                        "dateJoined": "2018-10-02T12:26:34.216Z",
                        "emails": [
                            {
                                "is_verified": False,
                                "id": "2",
                                "email": "steinar.sturlaugsson@medsci.uu.se"
                            }
                        ],
                        "email": "steinar.sturlaugsson@medsci.uu.se",
                        "isManaged": False,
                        "lastActive": "2019-01-01T12:31:02.445Z",
                        "avatar": {
                            "avatarUuid": None,
                            "avatarType": "letter_avatar"
                        },
                        "lastLogin": "2018-12-18T10:24:32.968Z",
                        "identities": [],
                        "id": "3",
                        "isActive": True,
                        "has2fa": False
                    },
                    "data": {},
                    "id": "47",
                    "dateCreated": "2018-12-17T12:33:19.685Z"
                },
                {
                    "type": "note",
                    "user": {
                        "username": "steinar.sturlaugsson@medsci.uu.se",
                        "name": "steinar.sturlaugsson@medsci.uu.se",
                        "avatarUrl": "https://secure.gravatar.com/avatar/da1dfdd48be7b8672a6c4c19297e070a?s=32&d=mm",
                        "hasPasswordAuth": True,
                        "dateJoined": "2018-10-02T12:26:34.216Z",
                        "emails": [
                            {
                                "is_verified": False,
                                "id": "2",
                                "email": "steinar.sturlaugsson@medsci.uu.se"
                            }
                        ],
                        "email": "steinar.sturlaugsson@medsci.uu.se",
                        "isManaged": False,
                        "lastActive": "2019-01-01T12:31:02.445Z",
                        "avatar": {
                            "avatarUuid": None,
                            "avatarType": "letter_avatar"
                        },
                        "lastLogin": "2018-12-18T10:24:32.968Z",
                        "identities": [],
                        "id": "3",
                        "isActive": True,
                        "has2fa": False
                    },
                    "data": {
                        "text": "I thought this was excellent!"
                    },
                    "id": "27",
                    "dateCreated": "2018-12-10T14:55:42.161Z"
                },
                {
                    "type": "set_resolved",
                    "user": {
                        "username": "steinar.sturlaugsson@medsci.uu.se",
                        "name": "steinar.sturlaugsson@medsci.uu.se",
                        "avatarUrl": "https://secure.gravatar.com/avatar/c454a1cd6f9395d199b0aa97aefd9e67?s=32&d=mm",
                        "hasPasswordAuth": True,
                        "dateJoined": "2018-08-26T10:47:17.795Z",
                        "id": "1",
                        "email": "steinar.sturlaugsson@medsci.uu.se",
                        "isManaged": False,
                        "options": {
                            "timezone": "UTC",
                            "clock24Hours": False,
                            "language": "en",
                            "stacktraceOrder": -1,
                            "seenReleaseBroadcast": True
                        },
                        "lastActive": "2019-01-02T12:23:40.624Z",
                        "avatar": {
                            "avatarUuid": None,
                            "avatarType": "letter_avatar"
                        },
                        "lastLogin": "2019-01-02T10:23:13.305Z",
                        "flags": {
                            "newsletter_consent_prompt": False
                        },
                        "identities": [],
                        "emails": [
                            {
                                "is_verified": False,
                                "id": "1",
                                "email": "steinar.sturlaugsson@medsci.uu.se"
                            }
                        ],
                        "isActive": True,
                        "has2fa": False
                    },
                    "data": {},
                    "id": "21",
                    "dateCreated": "2018-10-29T14:06:58.662Z"
                },
                {
                    "type": "set_ignored",
                    "user": {
                        "username": "steinar.sturlaugsson@medsci.uu.se",
                        "name": "steinar.sturlaugsson@medsci.uu.se",
                        "avatarUrl": "https://secure.gravatar.com/avatar/da1dfdd48be7b8672a6c4c19297e070a?s=32&d=mm",
                        "hasPasswordAuth": True,
                        "dateJoined": "2018-10-02T12:26:34.216Z",
                        "emails": [
                            {
                                "is_verified": False,
                                "id": "2",
                                "email": "steinar.sturlaugsson@medsci.uu.se"
                            }
                        ],
                        "email": "steinar.sturlaugsson@medsci.uu.se",
                        "isManaged": False,
                        "lastActive": "2019-01-01T12:31:02.445Z",
                        "avatar": {
                            "avatarUuid": None,
                            "avatarType": "letter_avatar"
                        },
                        "lastLogin": "2018-12-18T10:24:32.968Z",
                        "identities": [],
                        "id": "3",
                        "isActive": True,
                        "has2fa": False
                    },
                    "data": {
                        "ignoreUntil": "2018-10-24T12:51:59.909Z",
                        "ignoreCount": None,
                        "ignoreUserCount": None,
                        "ignoreDuration": 120,
                        "ignoreWindow": None,
                        "ignoreUserWindow": None
                    },
                    "id": "14",
                    "dateCreated": "2018-10-24T10:51:59.920Z"
                },
                {
                    "type": "merge",
                    "user": {
                        "username": "steinar.sturlaugsson@medsci.uu.se",
                        "name": "steinar.sturlaugsson@medsci.uu.se",
                        "avatarUrl": "https://secure.gravatar.com/avatar/da1dfdd48be7b8672a6c4c19297e070a?s=32&d=mm",
                        "hasPasswordAuth": True,
                        "dateJoined": "2018-10-02T12:26:34.216Z",
                        "emails": [
                            {
                                "is_verified": False,
                                "id": "2",
                                "email": "steinar.sturlaugsson@medsci.uu.se"
                            }
                        ],
                        "email": "steinar.sturlaugsson@medsci.uu.se",
                        "isManaged": False,
                        "lastActive": "2019-01-01T12:31:02.445Z",
                        "avatar": {
                            "avatarUuid": None,
                            "avatarType": "letter_avatar"
                        },
                        "lastLogin": "2018-12-18T10:24:32.968Z",
                        "identities": [],
                        "id": "3",
                        "isActive": True,
                        "has2fa": False
                    },
                    "data": {
                        "issues": [
                            {
                                "id": 3
                            }
                        ]
                    },
                    "id": "9",
                    "dateCreated": "2018-10-15T10:43:38.094Z"
                },
                {
                    "type": "set_public",
                    "user": {
                        "username": "steinar.sturlaugsson@medsci.uu.se",
                        "name": "steinar.sturlaugsson@medsci.uu.se",
                        "avatarUrl": "https://secure.gravatar.com/avatar/da1dfdd48be7b8672a6c4c19297e070a?s=32&d=mm",
                        "hasPasswordAuth": True,
                        "dateJoined": "2018-10-02T12:26:34.216Z",
                        "emails": [
                            {
                                "is_verified": False,
                                "id": "2",
                                "email": "steinar.sturlaugsson@medsci.uu.se"
                            }
                        ],
                        "email": "steinar.sturlaugsson@medsci.uu.se",
                        "isManaged": False,
                        "lastActive": "2019-01-01T12:31:02.445Z",
                        "avatar": {
                            "avatarUuid": None,
                            "avatarType": "letter_avatar"
                        },
                        "lastLogin": "2018-12-18T10:24:32.968Z",
                        "identities": [],
                        "id": "3",
                        "isActive": True,
                        "has2fa": False
                    },
                    "data": {},
                    "id": "7",
                    "dateCreated": "2018-10-15T06:28:02.419Z"
                },
                {
                    "type": "first_seen",
                    "user": None,
                    "data": {},
                    "id": "0",
                    "dateCreated": "2018-10-14T22:01:39Z"
                }
            ],
            "statusDetails": {}
        }

        s.update(ret)

        return Response(s)

    def put(self, request, app_id):
        pass
        # try:
        #     instance = Sample.objects.get(
        #         # owner=request.user,
        #         id=app_id,
        #         # status=ApiApplicationStatus.active,
        #     )
        # except ApiApplication.DoesNotExist:
        #     raise ResourceDoesNotExist

        # serializer = SampleSerializer(data=request.DATA, partial=True)

        # if serializer.is_valid():
        #     result = serializer.object
        #     csv = result['csv'].split("\n")
        #     header = csv[0]
        #     body = csv[1:]
        #     keys = header.split(";")
        #     obj = dict()
        #     for line in body:
        #         values = line.split(";")
        #         obj.update(zip(keys, values))

        #     if result:
        #         instance.update(**result)
        #     return Response(serialize(instance, request.user), status=200)
        # return Response(serializer.errors, status=400)

    def delete(self, request, app_id):
        try:
            instance = ApiApplication.objects.get(
                owner=request.user,
                client_id=app_id,
                status=ApiApplicationStatus.active,
            )
        except ApiApplication.DoesNotExist:
            raise ResourceDoesNotExist

        updated = ApiApplication.objects.filter(
            id=instance.id,
        ).update(
            status=ApiApplicationStatus.pending_deletion,
        )
        if updated:
            transaction_id = uuid4().hex

            delete_api_application.apply_async(
                kwargs={
                    'object_id': instance.id,
                    'transaction_id': transaction_id,
                },
                countdown=3600,
            )

            delete_logger.info(
                'object.delete.queued',
                extra={
                    'object_id': instance.id,
                    'transaction_id': transaction_id,
                    'model': type(instance).__name__,
                }
            )

        return Response(status=204)


class SampleWorkflowsBatchEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def post(self, request, organization_slug):
        # TODO(withrocks): Go through a serializer object for this, and validate
        data = request.DATA
        engine = WorkflowEngine()

        for sample in data["samples"]:
            # variables = {
            #     "method": "Ready-made libraries",
            #     "sample_type": "rna",
            #     "sequencer": "HiSeq X"
            # }
            business_key = "sample-{}".format(sample)
            process = data["process"]
            variables = data["variables"]
            engine.start_process(process, business_key, variables)

        return Response(dict(), status=200)


class SampleWorkflowsEndpoint(Endpoint):
    """
    Lists relations between samples and workflows
    """
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    # test 2
    def post(self, request):
        pass

    def get(self, request, sample_id):
        pass

        # 1. Get all workflow definitions that are top level/sample level (from plugins). This should be a per-process cached list
        #    NOTE: We might actually have several top level/sample level workflows, which would lead to a bunch of calls
        #    here, so we might want to revisit that from a perf. perspective later. But currently, that's unlikely.
        # 2. Query the workflow backend for those
        # 3.

        # First, simply get the list of all workflows this process is in. Note that if this list is large, it might
        # make sense to add processDefinitionKey to the query, but then we would
        # have to execute more queries
        from clims.workflow import WorkflowEngine
        engine = WorkflowEngine()
        instances = engine.process_instances(business_key="sample-{}".format(sample_id),
                                             active="true", suspended="false")
        # todo: paging
        # TODO: ended, suspended should be query parameters
        # TODO Have the engine service group this:

        ret = list()
        for instance in instances:
            # TODO: ask the plugin how they want the workflow to be shown. The plugin might want the
            # entry level processes to be shown e.g. like "Sequence - HiSeqX - RML", based on workflow
            # variables. Since the variables are not loaded by default with the process, the plugin
            # developer is provided with
            key, version, _ = instance["definitionId"].split(":")
            instance["definitionKey"] = key
            instance["definitionVersion"] = version

            # TODO: demo
            instance["variables"] = {
                "sequencer": "HiSeqX",
                "method": "Ready-made libraries"
            }
            if not plugin_is_entry_level_process(instance):
                continue

            # TODO: cache the title, since it requires loading vars
            instance["title"] = plugin_get_workflow_title(instance)
            ret.append(instance)
        return Response(ret, status=200)


class SampleProcessesEndpoint(Endpoint):
    """
    Lists relations between samples and samples
    """
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request, sample_id):
        # TODO: Take active from the query
        from clims.workflow import WorkflowEngine
        engine = WorkflowEngine()
        instances = engine.process_instances(business_key="sample-{}".format(sample_id),
                                             active="true", suspended="false")

        return Response(instances, status=200)
        # todo: paging
        # TODO: ended, suspended should be query parameters
        # TODO Have the engine service group this:

        ret = list()
        for instance in instances:
            # TODO: ask the plugin how they want the workflow to be shown. The plugin might want the
            # entry level processes to be shown e.g. like "Sequence - HiSeqX - RML", based on workflow
            # variables. Since the variables are not loaded by default with the process, the plugin
            # developer is provided with
            key, version, _ = instance["definitionId"].split(":")
            instance["definitionKey"] = key
            instance["definitionVersion"] = version

            # TODO: demo
            instance["variables"] = {
                "sequencer": "HiSeqX",
                "method": "Ready-made libraries"
            }
            if not plugin_is_entry_level_process(instance):
                continue

            # TODO: cache the title, since it requires loading vars
            instance["title"] = plugin_get_workflow_title(instance)
            ret.append(instance)
        return Response(ret, status=200)


def plugin_is_entry_level_process(instance):
    sample_level_workflows = ["snpseq.poc.sequence", "clims_snpseq.sequence"]
    for workflow in sample_level_workflows:
        if instance["definitionId"].startswith(workflow):
            return True
    return False


def plugin_get_workflow_title(instance):
    # TODO: have the variables lazy load into the object, and the object should not be a dict
    variables = instance["variables"]
    name = instance["definitionKey"].split(".")[-1]
    return " - ".join([name, variables["sequencer"], variables["method"]])
