import { ACTION_TYPES, questionActions, scoreActions, uiActions } from '@/state/actions.js';

describe('state action constants', () => {
  test('action creators emit defined action types', () => {
    const actions = [
      questionActions.load({ id: 'q1' }),
      questionActions.revealAnswer(),
      scoreActions.update(100, 'correct'),
      scoreActions.updateStreak(3, true),
      uiActions.openModal('settings'),
      uiActions.changeTheme('dark')
    ];

    for (const action of actions) {
      expect(action.type).toBeTruthy();
      expect(Object.values(ACTION_TYPES)).toContain(action.type);
    }
  });
});
