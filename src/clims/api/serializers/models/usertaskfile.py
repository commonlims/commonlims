from __future__ import absolute_import

import six

from sentry.api.serializers import Serializer, register
from clims.models import UserTaskFile, UserTask


@register(UserTaskFile)
class UserTaskFileSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        return {
            'id': six.text_type(obj.id),
            'name': obj.name,
            'headers': obj.file.headers,
            'size': obj.file.size,
            'sha1': obj.file.checksum,
            'dateCreated': obj.file.timestamp,
        }


@register(UserTask)
class UserTaskSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        user = {
            "id": "1",
            "name": "steinar.sturlaugsson@medsci.uu.se",
            "avatarUrl": "https://secure.gravatar.com/avatar/c454a1cd6f9395d199b0aa97aefd9e67?s=32&d=mm",
            "avatar": {
                "avatarUuid": None,
                "avatarType": "letter_avatar"
            },
            "hasPasswordAuth": True,
            "permissions": [],
            "email": "steinar.sturlaugsson@medsci.uu.se"
        }

        user2 = {
            "username": "ingvar@example.com",
            "lastLogin": "2019-03-17T20:31:13.521Z",
            "isSuperuser": False,
            "isManaged": False,
            "lastActive": "2019-03-17T20:31:13.521Z",
            "id": "12",
            "isActive": True,
            "has2fa": False,
            "name": "ingvar@example.com",
            "avatarUrl": "https://secure.gravatar.com/avatar/67258d4d6b5159da0afa80dd3fa3956a?s=32&d=mm",
            "dateJoined": "2019-03-17T20:31:13.521Z",
            "emails": [
                {
                  "is_verified": False,
                  "id": "10",
                  "email": "ingvar@example.com"
                }
            ],
            "avatar": {
                "avatarUuid": None,
                "avatarType": "letter_avatar"
            },
            "hasPasswordAuth": True,
            "email": "ingvar@example.com"
        }

        # NOTE: This is a wireframe thing, some of this must go on another endpoint (although
        # the UI might use the same store for it
        return {
            'id': six.text_type(obj.id),
            'handler': obj.handler,
            'extraFields': obj.extra_fields,
            'numComments': obj.num_comments,
            'status': obj.status,
            # TODO: Set these in the model
            'taskId': 'Fragment Analyzer DNA',
            'taskTitle': 'Fragment Analyzer DNA',
            'processTitle': 'Reception QC',
            'processId': 'clims_snpseq.core.workflows.reception_qc',
            'subtasks': [
                {'description': 'Place samples', 'status': 'todo',
                    'manualOverride': False, 'view': 'samples', 'viewType': 'tab'},
                {'description': 'Print labels',
                 'status': 'todo',
                 'manualOverride': False,
                 'view': 'print_labels',
                 'viewType': 'popup'},
                {'description': 'Fill required fields', 'status': 'todo',
                    'manualOverride': False, 'view': 'details', 'viewType': 'tab'},
                {'description': 'Prepare QA plate', 'status': 'todo',
                    'manualOverride': False, 'view': 'prep', 'viewType': 'popup'},
                {'description': 'Run fragment analyzer', 'status': 'todo',
                    'manualOverride': False, 'view': 'run', 'viewType': 'popup'},
                {'description': 'All samples passed QA', 'status': 'todo',
                    'manualOverride': False, 'view': 'qa', 'viewType': 'tab'},
            ],
            'files':
                [
                {
                    "sha1": "ea40a664346c0cb7d4326830d76b8ef468a512d7",
                    "name": "108620_190321_FA_Sample_List.txt",
                    "dateCreated": "2019-03-08T14:18:01.371Z",
                    "headers": {
                            "Content-Type": "application/octet-stream",
                            "Description": "Sample list"
                    },
                    "id": "30",
                    "size": 7566
                },
                {
                    "sha1": "ea40a664346c0cb7d4326830d76b8ef468a512d7",
                    "name": "quality.csv",
                    "dateCreated": "2019-03-06T14:32:04.056Z",
                    "headers": {
                            "Content-Type": "application/octet-stream",
                            "Description": "Quality table",
                    },
                    "id": "20",
                    "size": 7566
                },
                {
                    "sha1": "ea40a664346c0cb7d4326830d76b8ef468a512d7",
                    "name": "PDF report",
                    "dateCreated": "2019-03-06T14:32:04.056Z",
                    "headers": {
                            "Content-Type": "application/octet-stream",
                            "Description": "PDF report from the robot",
                    },
                    "id": "20",
                    "size": 7566
                },
                {
                    "sha1": "ea40a664346c0cb7d4326830d76b8ef468a512d7",
                    "name": "file.bmf",
                    "dateCreated": "2019-03-06T14:33:16.353Z",
                    "headers": {
                            "Content-Type": "application/octet-stream",
                            "Description": "Robot file (bmf)"
                    },
                    "id": "24",
                    "size": 7566
                },
                {
                    "sha1": "ea40a664346c0cb7d4326830d76b8ef468a512d7",
                    "name": "raw.zip",
                    "dateCreated": "2019-03-06T14:33:33.306Z",
                    "headers": {
                            "Content-Type": "application/octet-stream",
                            "Description": "Raw data from the robot",
                    },
                    "id": "26",
                    "size": 7566
                },
            ],
            'tabs': [
                {'id': 'samples', 'title': 'Samples', 'visible': True, 'active': False},
                {'id': 'details', 'title': 'Details', 'visible': True, 'active': False},
                {'id': 'files', 'title': 'Files', 'visible': True, 'active': False},
                {'id': 'activity', 'title': 'Activity', 'visible': True, 'active': True},
            ],
            'activity': [{
                'id': '1',
                'user': user2,
                'type': 'note',
                'data': {'text': '@kristina, do you know what this is?'},
                "dateCreated": "2019-03-06T14:33:16.353Z",
            },
                {
                'id': '2',
                'user': user,
                'type': 'note',
                'data': {'text': '@ingvar: Could you check this out?'},
                "dateCreated": "2019-03-06T14:33:16.353Z",
            }
            ],
            # TODO: This endpoint should probably not return these settings, as some optimization
            # will be gained from caching them longer, so break down into usertask
            # settings and usertasks
            'fields': [
                {
                    "readonly": False,
                    "name": "kit_type",
                    "type": "text",
                    "defaultValue": None,
                    "required": True,
                    "help": "The kit type",
                    "label": "Kit type",
                    "value": None,
                },
                {
                    "readonly": False,
                    "name": "pipetting_handling",
                    "type": "text",
                    "defaultValue": None,
                    "required": True,
                    "help": "Fill in v#",
                    "label": "Pippeting handling",
                    "value": None,
                    "choices": [
                        "FXp-7-2_v?",
                        "FXp-7-3_v?",
                        "H-17-1_v?",
                        "Manual",
                    ]
                },
                {
                    "readonly": False,
                    "name": "gel_lot",
                    "type": "text",
                    "defaultValue": None,
                    "required": False,
                    "help": "Use barcode",
                    "label": "Gel lot #",
                    "value": None,
                },
                {
                    "readonly": False,
                    "name": "te_lot",
                    "type": "text",
                    "defaultValue": None,
                    "required": False,
                    "help": "Use barcode",
                    "label": "0.6X TE lot",
                    "value": None,
                },
                {
                    "readonly": True,
                    "name": "te_lot",
                    "type": "text",
                    "defaultValue": "2",
                    "required": False,
                    "help": "",
                    "label": "Volume in destination (ul)",
                    "value": "2",
                },
                {
                    "readonly": False,
                    "name": "dilution_marker_lot",
                    "type": "text",
                    "defaultValue": None,
                    "required": False,
                    "help": "",
                    "label": "Dilution marker lot #",
                    "value": None,
                },
                {
                    "readonly": False,
                    "name": "ladder_lot",
                    "type": "text",
                    "defaultValue": None,
                    "required": False,
                    "help": "",
                    "label": "Ladder lot #",
                    "value": None,
                },
                {
                    "readonly": False,
                    "name": "ladder_lot",
                    "type": "text",
                    "defaultValue": None,
                    "required": False,
                    "help": "diluent marker & ladder arrival date (YYDDMM)",
                    "label": "GEL, TE",
                    "value": None,
                },
                {
                    "readonly": False,
                    "name": "inlet_buffer",
                    "type": "text",
                    "defaultValue": None,
                    "required": False,
                    "help": "",
                    "label": "Inlet buffer arrival date",
                    "value": None,
                },
                {
                    "readonly": False,
                    "name": "cap_cond_sol_lot",
                    "type": "text",
                    "defaultValue": None,
                    "required": False,
                    "help": "",
                    "label": "Capillary conditioning solution lot",
                    "value": None,
                },
                {
                    "readonly": False,
                    "name": "cap_cond_sol_arrival",
                    "type": "text",
                    "defaultValue": None,
                    "required": False,
                    "help": "",
                    "label": "Capillary conditioning solution arrival date",
                    "value": None,
                },
            ],
            'sampleBatch': {
                'samples': [
                    {
                        'location': {
                            'containerId': 1,
                            'col': 3,
                            'row': 3,
                        },
                        'name': 'sample1',
                        'id': 10,
                    },
                    {
                        'location': {
                            'containerId': 1,
                            'col': 1,
                            'row': 1,
                        },
                        'name': 'sample2',
                        'id': 11,
                    },
                ],
                'correlation': {
                    'handler': 'features.fragment_analyze.controller.FragmentAnalyzeController',
                    'hash': 'hash-with-signature-TODO',
                    'plugin': 'snpseq',
                },
                'tempContainers': [],
                'transitions': [],
                'containers': [
                    {
                        'dimensions': {
                            'rows': 8,
                            'cols': 12,
                        },
                        'typeName': '96 well plate',
                        'name': 'HiSeqX-Thruplex_PL1_org_181212',
                        'isTemporary': False,
                        'id': 1,
                    },
                    {
                        'dimensions': {
                            'rows': 8,
                            'cols': 12,
                        },
                        'typeName': '96 well plate',
                        'name': 'HiSeqX-Thruplex_PL1_org_181213',
                        'isTemporary': False,
                        'id': 2,
                    },
                ]
            }
        }
