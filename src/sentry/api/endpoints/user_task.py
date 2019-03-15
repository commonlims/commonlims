from __future__ import absolute_import

from rest_framework.response import Response
from sentry.api.bases.user_task import UserTaskBaseEndpoint
from sentry.api.bases.organization import OrganizationEndpoint
from sentry.models import UserTask
from sentry.models.activity import Activity
from sentry.api.serializers import serialize
from sentry.api.paginator import OffsetPaginator


def update_user_tasks(request, organization_id, search_fn):
    group_ids = request.GET.getlist('id')
    print(group_ids)
    raise Exception()

    if group_ids:
        group_list = Group.objects.filter(
            project__organization_id=organization_id,
            project__in=projects,
            id__in=group_ids,
        )
        # filter down group ids to only valid matches
        group_ids = [g.id for g in group_list]
        if not group_ids:
            return Response(status=204)
    else:
        group_list = None

    # TODO(jess): We may want to look into refactoring GroupValidator
    # to support multiple projects, but this is pretty complicated
    # because of the assignee validation. Punting on this for now.
    for project in projects:
        serializer = GroupValidator(
            data=request.DATA,
            partial=True,
            context={'project': project},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

    result = dict(serializer.object)

    # so we won't have to requery for each group
    project_lookup = {p.id: p for p in projects}

    acting_user = request.user if request.user.is_authenticated() else None

    if not group_ids:
        try:
            # bulk mutations are limited to 1000 items
            # TODO(dcramer): it'd be nice to support more than this, but its
            # a bit too complicated right now
            cursor_result, _ = search_fn()
        except ValidationError as exc:
            return Response({'detail': six.text_type(exc)}, status=400)

        group_list = list(cursor_result)
        group_ids = [g.id for g in group_list]

    is_bulk = len(group_ids) > 1

    queryset = Group.objects.filter(
        id__in=group_ids,
    )

    discard = result.get('discard')
    if discard:
        return handle_discard(request, list(queryset), projects, acting_user)

    statusDetails = result.pop('statusDetails', result)
    status = result.get('status')
    release = None
    commit = None

    if status in ('resolved', 'resolvedInNextRelease'):
        if status == 'resolvedInNextRelease' or statusDetails.get('inNextRelease'):
            # TODO(jess): We may want to support this for multi project, but punting on it for now
            if len(projects) > 1:
                return Response({
                    'detail': 'Cannot set resolved in next release for multiple projects.'
                }, status=400)
            release = statusDetails.get('inNextRelease') or Release.objects.filter(
                projects=projects[0],
                organization_id=projects[0].organization_id,
            ).extra(select={
                'sort': 'COALESCE(date_released, date_added)',
            }).order_by('-sort')[0]
            activity_type = Activity.SET_RESOLVED_IN_RELEASE
            activity_data = {
                # no version yet
                'version': '',
            }
            status_details = {
                'inNextRelease': True,
                'actor': serialize(extract_lazy_object(request.user), request.user),
            }
            res_type = GroupResolution.Type.in_next_release
            res_type_str = 'in_next_release'
            res_status = GroupResolution.Status.pending
        elif statusDetails.get('inRelease'):
            # TODO(jess): We could update validation to check if release
            # applies to multiple projects, but I think we agreed to punt
            # on this for now
            if len(projects) > 1:
                return Response({
                    'detail': 'Cannot set resolved in release for multiple projects.'
                }, status=400)
            release = statusDetails['inRelease']
            activity_type = Activity.SET_RESOLVED_IN_RELEASE
            activity_data = {
                # no version yet
                'version': release.version,
            }
            status_details = {
                'inRelease': release.version,
                'actor': serialize(extract_lazy_object(request.user), request.user),
            }
            res_type = GroupResolution.Type.in_release
            res_type_str = 'in_release'
            res_status = GroupResolution.Status.resolved
        elif statusDetails.get('inCommit'):
            # TODO(jess): Same here, this is probably something we could do, but
            # punting for now.
            if len(projects) > 1:
                return Response({
                    'detail': 'Cannot set resolved in commit for multiple projects.'
                }, status=400)
            commit = statusDetails['inCommit']
            activity_type = Activity.SET_RESOLVED_IN_COMMIT
            activity_data = {
                'commit': commit.id,
            }
            status_details = {
                'inCommit': serialize(commit, request.user),
                'actor': serialize(extract_lazy_object(request.user), request.user),
            }
            res_type_str = 'in_commit'
        else:
            res_type_str = 'now'
            activity_type = Activity.SET_RESOLVED
            activity_data = {}
            status_details = {}

        now = timezone.now()
        metrics.incr('group.resolved', instance=res_type_str, skip_internal=True)

        # if we've specified a commit, let's see if its already been released
        # this will allow us to associate the resolution to a release as if we
        # were simply using 'inRelease' above
        # Note: this is different than the way commit resolution works on deploy
        # creation, as a given deploy is connected to an explicit release, and
        # in this case we're simply choosing the most recent release which contains
        # the commit.
        if commit and not release:
            # TODO(jess): If we support multiple projects for release / commit resolution,
            # we need to update this to find the release for each project (we shouldn't assume
            # it's the same)
            try:
                release = Release.objects.filter(
                    projects__in=projects,
                    releasecommit__commit=commit,
                ).extra(select={
                    'sort': 'COALESCE(date_released, date_added)',
                }).order_by('-sort')[0]
                res_type = GroupResolution.Type.in_release
                res_status = GroupResolution.Status.resolved
            except IndexError:
                release = None

        for group in group_list:
            with transaction.atomic():
                resolution = None
                if release:
                    resolution_params = {
                        'release': release,
                        'type': res_type,
                        'status': res_status,
                        'actor_id': request.user.id
                        if request.user.is_authenticated() else None,
                    }
                    resolution, created = GroupResolution.objects.get_or_create(
                        group=group,
                        defaults=resolution_params,
                    )
                    if not created:
                        resolution.update(
                            datetime=timezone.now(), **resolution_params)

                if commit:
                    GroupLink.objects.create(
                        group_id=group.id,
                        project_id=group.project_id,
                        linked_type=GroupLink.LinkedType.commit,
                        relationship=GroupLink.Relationship.resolves,
                        linked_id=commit.id,
                    )

                affected = Group.objects.filter(
                    id=group.id,
                ).update(
                    status=GroupStatus.RESOLVED,
                    resolved_at=now,
                )
                if not resolution:
                    created = affected

                group.status = GroupStatus.RESOLVED
                group.resolved_at = now

                assigned_to = self_subscribe_and_assign_issue(acting_user, group)
                if assigned_to is not None:
                    result['assignedTo'] = assigned_to

                if created:
                    activity = Activity.objects.create(
                        project=project_lookup[group.project_id],
                        group=group,
                        type=activity_type,
                        user=acting_user,
                        ident=resolution.id if resolution else None,
                        data=activity_data,
                    )
                    # TODO(dcramer): we need a solution for activity rollups
                    # before sending notifications on bulk changes
                    if not is_bulk:
                        activity.send_notification()

            if release:
                issue_resolved_in_release.send_robust(
                    group=group,
                    project=project_lookup[group.project_id],
                    user=acting_user,
                    resolution_type=res_type_str,
                    sender=update_groups,
                )
            elif commit:
                resolved_with_commit.send_robust(
                    organization_id=organization_id,
                    user=request.user,
                    group=group,
                    sender=update_groups,
                )
            else:
                issue_resolved.send_robust(
                    project=project_lookup[group.project_id],
                    group=group,
                    user=acting_user,
                    sender=update_groups,
                )

            kick_off_status_syncs.apply_async(kwargs={
                'project_id': group.project_id,
                'group_id': group.id,
            })

        result.update({
            'status': 'resolved',
            'statusDetails': status_details,
        })

    elif status:
        new_status = STATUS_CHOICES[result['status']]

        with transaction.atomic():
            happened = queryset.exclude(
                status=new_status,
            ).update(
                status=new_status,
            )

            GroupResolution.objects.filter(
                group__in=group_ids,
            ).delete()

            if new_status == GroupStatus.IGNORED:
                metrics.incr('group.ignored', skip_internal=True)

                ignore_duration = (
                    statusDetails.pop('ignoreDuration', None) or
                    statusDetails.pop('snoozeDuration', None)
                ) or None
                ignore_count = statusDetails.pop(
                    'ignoreCount', None) or None
                ignore_window = statusDetails.pop(
                    'ignoreWindow', None) or None
                ignore_user_count = statusDetails.pop(
                    'ignoreUserCount', None) or None
                ignore_user_window = statusDetails.pop(
                    'ignoreUserWindow', None) or None
                if ignore_duration or ignore_count or ignore_user_count:
                    if ignore_duration:
                        ignore_until = timezone.now() + timedelta(
                            minutes=ignore_duration,
                        )
                    else:
                        ignore_until = None
                    for group in group_list:
                        state = {}
                        if ignore_count and not ignore_window:
                            state['times_seen'] = group.times_seen
                        if ignore_user_count and not ignore_user_window:
                            state['users_seen'] = group.count_users_seen()
                        GroupSnooze.objects.create_or_update(
                            group=group,
                            values={
                                'until':
                                ignore_until,
                                'count':
                                ignore_count,
                                'window':
                                ignore_window,
                                'user_count':
                                ignore_user_count,
                                'user_window':
                                ignore_user_window,
                                'state':
                                state,
                                'actor_id':
                                request.user.id if request.user.is_authenticated() else None,
                            }
                        )
                        result['statusDetails'] = {
                            'ignoreCount': ignore_count,
                            'ignoreUntil': ignore_until,
                            'ignoreUserCount': ignore_user_count,
                            'ignoreUserWindow': ignore_user_window,
                            'ignoreWindow': ignore_window,
                            'actor': serialize(extract_lazy_object(request.user), request.user),
                        }
                else:
                    GroupSnooze.objects.filter(
                        group__in=group_ids,
                    ).delete()
                    ignore_until = None
                    result['statusDetails'] = {}
            else:
                result['statusDetails'] = {}

        if group_list and happened:
            if new_status == GroupStatus.UNRESOLVED:
                activity_type = Activity.SET_UNRESOLVED
                activity_data = {}
            elif new_status == GroupStatus.IGNORED:
                activity_type = Activity.SET_IGNORED
                activity_data = {
                    'ignoreCount': ignore_count,
                    'ignoreDuration': ignore_duration,
                    'ignoreUntil': ignore_until,
                    'ignoreUserCount': ignore_user_count,
                    'ignoreUserWindow': ignore_user_window,
                    'ignoreWindow': ignore_window,
                }

            groups_by_project_id = defaultdict(list)
            for group in group_list:
                groups_by_project_id[group.project_id].append(group)

            for project in projects:
                project_groups = groups_by_project_id.get(project.id)
                if project_groups:
                    issue_ignored.send_robust(
                        project=project,
                        user=acting_user,
                        group_list=project_groups,
                        activity_data=activity_data,
                        sender=update_groups)

            for group in group_list:
                group.status = new_status

                activity = Activity.objects.create(
                    project=project_lookup[group.project_id],
                    group=group,
                    type=activity_type,
                    user=acting_user,
                    data=activity_data,
                )
                # TODO(dcramer): we need a solution for activity rollups
                # before sending notifications on bulk changes
                if not is_bulk:
                    if acting_user:
                        GroupSubscription.objects.subscribe(
                            user=acting_user,
                            group=group,
                            reason=GroupSubscriptionReason.status_change,
                        )
                    activity.send_notification()

                if new_status == GroupStatus.UNRESOLVED:
                    kick_off_status_syncs.apply_async(kwargs={
                        'project_id': group.project_id,
                        'group_id': group.id,
                    })

    if 'assignedTo' in result:
        assigned_actor = result['assignedTo']
        if assigned_actor:
            for group in group_list:
                resolved_actor = assigned_actor.resolve()

                GroupAssignee.objects.assign(group, resolved_actor, acting_user)
            result['assignedTo'] = serialize(
                assigned_actor.resolve(), acting_user, ActorSerializer())
        else:
            for group in group_list:
                GroupAssignee.objects.deassign(group, acting_user)

    is_member_map = {
        project.id: project.member_set.filter(user=acting_user).exists() for project in projects
    }
    if result.get('hasSeen'):
        for group in group_list:
            if is_member_map.get(group.project_id):
                instance, created = create_or_update(
                    GroupSeen,
                    group=group,
                    user=acting_user,
                    project=project_lookup[group.project_id],
                    values={
                        'last_seen': timezone.now(),
                    }
                )
    elif result.get('hasSeen') is False:
        GroupSeen.objects.filter(
            group__in=group_ids,
            user=acting_user,
        ).delete()

    if result.get('isBookmarked'):
        for group in group_list:
            GroupBookmark.objects.get_or_create(
                project=project_lookup[group.project_id],
                group=group,
                user=acting_user,
            )
            GroupSubscription.objects.subscribe(
                user=acting_user,
                group=group,
                reason=GroupSubscriptionReason.bookmark,
            )
    elif result.get('isBookmarked') is False:
        GroupBookmark.objects.filter(
            group__in=group_ids,
            user=acting_user,
        ).delete()

    # TODO(dcramer): we could make these more efficient by first
    # querying for rich rows are present (if N > 2), flipping the flag
    # on those rows, and then creating the missing rows
    if result.get('isSubscribed') in (True, False):
        is_subscribed = result['isSubscribed']
        for group in group_list:
            # NOTE: Subscribing without an initiating event (assignment,
            # commenting, etc.) clears out the previous subscription reason
            # to avoid showing confusing messaging as a result of this
            # action. It'd be jarring to go directly from "you are not
            # subscribed" to "you were subscribed due since you were
            # assigned" just by clicking the "subscribe" button (and you
            # may no longer be assigned to the issue anyway.)
            GroupSubscription.objects.create_or_update(
                user=acting_user,
                group=group,
                project=project_lookup[group.project_id],
                values={
                    'is_active': is_subscribed,
                    'reason': GroupSubscriptionReason.unknown,
                },
            )

        result['subscriptionDetails'] = {
            'reason': SUBSCRIPTION_REASON_MAP.get(
                GroupSubscriptionReason.unknown,
                'unknown',
            ),
        }

    if 'isPublic' in result:
        # We always want to delete an existing share, because triggering
        # an isPublic=True even when it's already public, should trigger
        # regenerating.
        for group in group_list:
            if GroupShare.objects.filter(group=group).delete():
                result['shareId'] = None
                Activity.objects.create(
                    project=project_lookup[group.project_id],
                    group=group,
                    type=Activity.SET_PRIVATE,
                    user=acting_user,
                )

    if result.get('isPublic'):
        for group in group_list:
            share, created = GroupShare.objects.get_or_create(
                project=project_lookup[group.project_id],
                group=group,
                user=acting_user,
            )
            if created:
                result['shareId'] = share.uuid
                Activity.objects.create(
                    project=project_lookup[group.project_id],
                    group=group,
                    type=Activity.SET_PUBLIC,
                    user=acting_user,
                )

    # XXX(dcramer): this feels a bit shady like it should be its own
    # endpoint
    if result.get('merge') and len(group_list) > 1:
        # don't allow merging cross project
        if len(projects) > 1:
            return Response({'detail': 'Merging across multiple projects is not supported'})
        group_list_by_times_seen = sorted(
            group_list,
            key=lambda g: (g.times_seen, g.id),
            reverse=True,
        )
        primary_group, groups_to_merge = group_list_by_times_seen[0], group_list_by_times_seen[1:]

        group_ids_to_merge = [g.id for g in groups_to_merge]
        eventstream_state = eventstream.start_merge(
            primary_group.project_id,
            group_ids_to_merge,
            primary_group.id
        )

        Group.objects.filter(
            id__in=group_ids_to_merge
        ).update(
            status=GroupStatus.PENDING_MERGE
        )

        transaction_id = uuid4().hex
        merge_groups.delay(
            from_object_ids=group_ids_to_merge,
            to_object_id=primary_group.id,
            transaction_id=transaction_id,
            eventstream_state=eventstream_state,
        )

        Activity.objects.create(
            project=project_lookup[primary_group.project_id],
            group=primary_group,
            type=Activity.MERGE,
            user=acting_user,
            data={
                'issues': [{
                    'id': c.id
                } for c in groups_to_merge],
            },
        )

        result['merge'] = {
            'parent': six.text_type(primary_group.id),
            'children': [six.text_type(g.id) for g in groups_to_merge],
        }

    return Response(result)


class UserTaskEndpoint(OrganizationEndpoint):

    def get(self, request, organization):
        user_tasks = UserTask.objects.filter(organization=organization)
        return self.paginate(
            request=request,
            queryset=user_tasks,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(x),
        )

    def post(self, request):
        return Response([], status=201)

    # TODO: scenarios
    def put(self, request, project):
        """
        Bulk Mutate a List of UserTasks
        ````````````````````````````

        Bulk mutate various attributes on user tasks.  The list of user tasks
        to modify is given through the `id` query parameter.  It is repeated
        for each user task that should be modified.

        - For non-status updates, the `id` query parameter is required.
        - For status updates, the `id` query parameter may be omitted
          for a batch "update all" query.
        - An optional `status` query parameter may be used to restrict
          mutations to only events with the given status.

        The following attributes can be modified and are supplied as
        JSON object in the body:

        If any ids are out of scope this operation will succeed without
        any data mutation.

        :qparam int id: a list of IDs of the issues to be mutated.  This
                        parameter shall be repeated for each issue.  It
                        is optional only if a status is mutated in which
                        case an implicit `update all` is assumed.
        :qparam string status: optionally limits the query to issues of the
                               specified status.  Valid values are
                               ``"resolved"``, ``"unresolved"`` and
                               ``"archived"``.
        :pparam string organization_slug: the slug of the organization the
                                          user tasks belong to.
        :param string status: the new status for the user task.  Valid values
                              are ``"resolved"``, ``"resolvedInNextRelease"``,
                              ``"unresolved"``, and ``"ignored"``.
        :param string assignedTo: the actor id (or username) of the user or team that should be
                                  assigned to this user task.
        :param boolean hasSeen: in case this API call is invoked with a user
                                context this allows changing of the flag
                                that indicates if the user has seen the
                                user task.
        :param boolean isBookmarked: in case this API call is invoked with a
                                     user context this allows changing of
                                     the bookmark flag.
        :auth: required
        """

        search_fn = functools.partial(
            self._search, request, project, {
                'limit': 1000,
                'paginator_options': {'max_limit': 1000},
            }
        )
        return update_groups(
            request,
            [project],
            project.organization_id,
            search_fn,
        )


class UserTaskDetailsEndpoint(UserTaskBaseEndpoint):
    def get(self, request, user_task_id):
        user_task = UserTask.objects.get(pk=user_task_id)
        return Response(serialize(user_task), status=200)

    def put(self, request, organization, user_task_id):
        """
        Update a UserTask
        ```````````````

        Updates an individual user task's attributes.  Only the attributes
        submitted are modified.

        :pparam string user_task_id: the ID of the user task to retrieve.
        :param string status: the new status for the issue.  Valid values
                              are ``"resolved"`` and ``"unresolved"``
        :param string assignedTo: the actor id (or username) of the user or team that should be
                                  assigned to this issue.
        :param boolean hasSeen: in case this API call is invoked with a user
                                context this allows changing of the flag
                                that indicates if the user has seen the
                                user task.
        :param boolean isBookmarked: in case this API call is invoked with a
                                     user context this allows changing of
                                     the bookmark flag.
        :param boolean isSubscribed:
        :auth: required
        """

        print("updating a single user_task", user_task_id)
        return Response("")

        try:
            response = client.put(
                path=u'/projects/{}/{}/issues/'.format(
                    group.project.organization.slug,
                    group.project.slug,
                ),
                params={
                    'id': group.id,
                },
                data=request.DATA,
                request=request,
            )
        except client.ApiError as e:
            return Response(e.body, status=e.status_code)

        return response

        # we need to fetch the object against as the bulk mutation endpoint
        # only returns a delta, and object mutation returns a complete updated
        # entity.
        # TODO(dcramer): we should update the API and have this be an explicit
        # flag (or remove it entirely) so that delta's are the primary response
        # for mutation.
        group = Group.objects.get(id=group.id)

        serialized = serialize(
            group,
            request.user,
            GroupSerializer(
                environment_func=self._get_environment_func(
                    request, group.project.organization_id)
            )
        )

        return Response(serialized, status=response.status_code)


class UserTaskDetailsActivityEndpoint(UserTaskBaseEndpoint):
    def get(self, request, user_task_id):
        return Response("", 200);



        user_task = UserTask.objects.get(pk=user_task_id)

        activity = Activity.objects.filter(
            user_task=user_task,
        ).order_by('-datetime').select_related('user')

        return self.paginate(
            request=request,
            queryset=activity,
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(x))
