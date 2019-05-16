import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';
import styled from 'react-emotion';

import { StyledMenu } from 'app/components/dropdownAutoCompleteMenu';
import { assignToUser, assignToActor, clearAssignment } from 'app/actionCreators/userTask';
import { t } from 'app/locale';
import { valueIsEqual, buildUserId, buildTeamId } from 'app/utils';
import ActorAvatar from 'app/components/actorAvatar';
import Avatar from 'app/components/avatar';
import ConfigStore from 'app/stores/configStore';
import DropdownAutoComplete from 'app/components/dropdownAutoComplete';
import UserTaskStore from 'app/stores/userTaskStore';
import Highlight from 'app/components/highlight';
import InlineSvg from 'app/components/inlineSvg';
import Link from 'app/components/link';
import LoadingIndicator from 'app/components/loadingIndicator';
import MemberListStore from 'app/stores/memberListStore';
import SentryTypes from 'app/sentryTypes';
import TextOverflow from 'app/components/textOverflow';
import space from 'app/styles/space';
import TeamStore from 'app/stores/teamStore';

const AssigneeSelectorComponent = createReactClass({
  displayName: 'AssigneeSelector',

  propTypes: {
    id: PropTypes.string.isRequired,
    size: PropTypes.number,
    // Either a list of users, or null. If null, members will
    // be read from the MemberListStore. The prop is useful when the
    // store contains more/different users than you need to show
    // in an individual component, eg. Org Issue list
    memberList: PropTypes.array,
  },

  contextTypes: {
    organization: SentryTypes.Organization,
  },

  mixins: [
    Reflux.connect(MemberListStore, 'memberList'),
  ],

  statics: {
    putSessionUserFirst(members) {
      // If session user is in the filtered list of members, put them at the top
      if (!members) return [];

      let sessionUser = ConfigStore.get('user');
      let sessionUserIndex = members.findIndex(
        member => sessionUser && member.id === sessionUser.id
      );

      if (sessionUserIndex === -1) return members;

      return [members[sessionUserIndex]]
        .concat(members.slice(0, sessionUserIndex))
        .concat(members.slice(sessionUserIndex + 1));
    },
  },

  getDefaultProps() {
    return {
      size: 20,
    };
  },

  getInitialState() {
    let group = UserTaskStore.get(this.props.id);
    let memberList = MemberListStore.loaded ? MemberListStore.getAll() : null;
    let loading = UserTaskStore.hasStatus(this.props.id, 'assignTo');

    return {
      assignedTo: group && group.assignedTo,
      memberList,
      loading,
    };
  },

  componentWillReceiveProps(nextProps) {
    let loading = UserTaskStore.hasStatus(nextProps.id, 'assignTo');
    if (nextProps.id !== this.props.id || loading !== this.state.loading) {
      let group = UserTaskStore.get(this.props.id);
      this.setState({
        loading,
        assignedTo: group && group.assignedTo,
      });
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.loading !== this.state.loading) {
      return true;
    }

    let currentMembers = this.memberList();
    // XXX(billyvg): this means that once `memberList` is not-null, this component will never update due to `memberList` changes
    // Note: this allows us to show a "loading" state for memberList, but only before `MemberListStore.loadInitialData`
    // is called
    if (currentMembers === null && nextState.memberList !== currentMembers) {
      return true;
    }
    return !valueIsEqual(nextState.assignedTo, this.state.assignedTo, true);
  },

  memberList() {
    if (this.props.memberList) {
      return this.props.memberList;
    }
    return this.state.memberList;
  },

  assignableTeams() {
    // TODO: Make sure TeamStore doesn't include teams from other orgs than the one in scope
    return TeamStore.getAll()
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map(team => ({
        id: buildTeamId(team.id),
        display: `#${team.slug}`,
        email: team.id,
        team,
      }));
  },

  assignToUser(user) {
    console.log("ASSIGNING TO USER", user);
    assignToUser({ id: this.props.id, user });
    this.setState({ loading: true });
  },

  assignToTeam(team) {
    assignToActor({ actor: { id: team.id, type: 'team' }, id: this.props.id });
    this.setState({ loading: true });
  },

  handleAssign({ value: { type, assignee } }, state, e) {
    if (type === 'member') {
      this.assignToUser(assignee);
    }

    if (type === 'team') {
      this.assignToTeam(assignee);
    }

    e.stopPropagation();
  },

  clearAssignTo(e) {
    // clears assignment
    clearAssignment(this.props.id);
    this.setState({ loading: true });
    e.stopPropagation();
  },

  renderNewMemberNodes() {
    let { size } = this.props;
    let members = AssigneeSelectorComponent.putSessionUserFirst(this.memberList());

    return members.map(member => {
      return {
        value: { type: 'member', assignee: member },
        searchKey: `${member.email} ${member.name} ${member.slug}`,
        label: ({ inputValue }) => (
          <MenuItemWrapper
            key={buildUserId(member.id)}
            onSelect={this.assignToUser.bind(this, member)}
          >
            <IconContainer>
              <Avatar user={member} size={size} />
            </IconContainer>
            <Label>
              <Highlight text={inputValue}>{member.name || member.email}</Highlight>
            </Label>
          </MenuItemWrapper>
        ),
      };
    });
  },

  renderNewTeamNodes() {
    let { size } = this.props;

    return this.assignableTeams().map(({ id, display, team }) => {
      return {
        value: { type: 'team', assignee: team },
        searchKey: team.slug,
        label: ({ inputValue }) => (
          <MenuItemWrapper key={id} onSelect={this.assignToTeam.bind(this, team)}>
            <IconContainer>
              <Avatar team={team} size={size} />
            </IconContainer>
            <Label>
              <Highlight text={inputValue}>{display}</Highlight>
            </Label>
          </MenuItemWrapper>
        ),
      };
    });
  },

  renderNewDropdownItems() {
    let teams = this.renderNewTeamNodes();
    let members = this.renderNewMemberNodes();

    return [
      { id: 'team-header', hideGroupLabel: true, items: teams },
      { id: 'members-header', items: members },
    ];
  },

  render() {
    let { className } = this.props;
    let { organization } = this.context;
    let { loading, assignedTo } = this.state;
    let canInvite = ConfigStore.get('invitesEnabled');
    let hasOrgWrite = organization.access.includes('org:write');
    let memberList = this.memberList();

    return (
      <div className={className}>
        {loading && (
          <LoadingIndicator mini style={{ height: '24px', margin: 0, marginRight: 11 }} />
        )}
        {!loading && (
          <DropdownAutoComplete
            maxHeight={400}
            zIndex={2}
            onOpen={e => {
              // This can be called multiple times and does not always have `event`
              if (!e) return;
              e.stopPropagation();
            }}
            busy={memberList === null}
            items={memberList !== null ? this.renderNewDropdownItems() : null}
            alignMenu="right"
            onSelect={this.handleAssign}
            itemSize="small"
            searchPlaceholder={t('Filter teams and people')}
            menuWithArrow
            emptyHidesInput
            menuHeader={
              assignedTo && (
                <MenuItemWrapper
                  data-test-id="clear-assignee"
                  disabled={!loading}
                  onClick={this.clearAssignTo}
                  py={0}
                >
                  <IconContainer>
                    <ClearAssigneeIcon />
                  </IconContainer>
                  <Label>{t('Clear Assignee')}</Label>
                </MenuItemWrapper>
              )
            }
            menuFooter={
              canInvite &&
              hasOrgWrite && (
                <InviteMemberLink
                  data-test-id="invite-member"
                  disabled={loading}
                  to={`/settings/${this.context.organization
                    .slug}/members/new/?referrer=assignee_selector`}
                >
                  <MenuItemWrapper>
                    <IconContainer>
                      <InviteMemberIcon />
                    </IconContainer>
                    <Label>{t('Invite Member')}</Label>
                  </MenuItemWrapper>
                </InviteMemberLink>
              )
            }
          >
            {({ getActorProps }) => {
              return (
                <DropdownButton {...getActorProps({})}>
                  {assignedTo ? (
                    <ActorAvatar actor={assignedTo} className="avatar" size={24} />
                  ) : (
                      <IconUser src="icon-user" />
                    )}
                  <StyledChevron src="icon-chevron-down" />
                </DropdownButton>
              );
            }}
          </DropdownAutoComplete>
        )}
      </div>
    );
  },
});

const AssigneeSelector = styled(AssigneeSelectorComponent)`
  display: flex;
  justify-content: flex-end;

  /* manually align menu underneath dropdown caret */
  /* stylelint-disable-next-line no-duplicate-selectors */
  ${StyledMenu} {
    right: -14px;
  }
`;

export default AssigneeSelector;
export { AssigneeSelectorComponent };

const getSvgStyle = () => `
  font-size: 16px;
  opacity: 0.3;
`;

const IconUser = styled(InlineSvg)`
  color: ${p => p.theme.gray3};
  height: 20px;
  width: 20px;

  /* We need this to center with Avatar */
  margin-right: 2px;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const MenuItemWrapper = styled(({ py, ...props }) => <div {...props} />)`
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 13px;
  ${props =>
    typeof props.py !== 'undefined' &&
    `
      padding-top: ${props.py};
      padding-bottom: ${props.py};
    `};
`;

const InviteMemberLink = styled(Link)`
  color: ${p => p.theme.textColor};
`;

const Label = styled(TextOverflow)`
  margin-left: 6px;
`;

const ClearAssigneeIcon = styled(props => (
  <InlineSvg {...props} src="icon-circle-close" />
))`
  ${getSvgStyle};
`;

const InviteMemberIcon = styled(props => <InlineSvg {...props} src="icon-circle-add" />)`
  ${getSvgStyle};
`;

const StyledChevron = styled(InlineSvg)`
  margin-left: ${space(1)};
  width: 12px;
  height: 12px;
`;

const DropdownButton = styled('div')`
  display: flex;
  align-items: center;
  font-size: 20px;
`;