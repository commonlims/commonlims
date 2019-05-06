/*global global*/
import ConsolidatedScopes from 'app/utils/consolidatedScopes';

describe('ConsolidatedScopes', () => {
  let scopes;

  beforeEach(() => {
    scopes = new ConsolidatedScopes([
      'event:read',
      'event:admin',
      'project:releases',
      'org:read',
    ]);
  });

  it('exposes scopes, grouped for each resource', () => {
    expect(scopes.toResourcePermissions()).toEqual(
      expect.objectContaining({
        Event: 'admin',
        Release: 'admin',
        Organization: 'read',
      })
    );
  });

  it('exposes scopes, grouped by access level', () => {
    expect(scopes.toPermissions()).toEqual({
      admin: expect.arrayContaining(['Event', 'Release']),
      read: ['Organization'],
      write: [],
    });
  });
});
