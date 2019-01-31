import ProcessTagStore from 'app/stores/processTagStore';
import ProcessTagActions from 'app/actions/processTagActions';

// TODO: Copied from the tags mechanism in Sentry, but not required here
// as this should not be extensible for tasks (right?)
export function fetchProcessTags(orgId, projectId) {
  ProcessTagStore.reset();
  ProcessTagActions.loadProcessTags();
  ProcessTagActions.loadProcessTagsSuccess([]);
  // api.request(`/projects/${orgId}/${projectId}/tags/`, {
  //   success: tags => {
  //     console.log("here, success");
  //     let trimmedTags = tags.slice(0, MAX_TAGS);

  //     if (tags.length > MAX_TAGS) {
  //       AlertActions.addAlert({
  //         message: t('You have too many unique tags and some have been truncated'),
  //         type: 'warn',
  //       });
  //     }

  //     console.log("here, trimmed", trimmedTags);
  //     ProcessTagActions.loadProcessTagsSuccess(trimmedTags);
  //   },
  //   error: ProcessTagActions.loadProcessTagsError,
  // });
}
