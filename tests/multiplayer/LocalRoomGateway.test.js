import { LocalRoomGateway } from '../../src/services/multiplayer/LocalRoomGateway.js';

describe('LocalRoomGateway', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('persists commands as independent durable records', async () => {
    const gateway = new LocalRoomGateway();
    await gateway.sendCommand('room-1', { actorId: 'host', type: 'START', payload: {} });
    await gateway.sendCommand('room-1', { actorId: 'guest', type: 'SUBMIT_ANSWER', payload: { answer: 'Mars' } });

    const observed = [];
    const unsubscribe = gateway.subscribeCommands('room-1', command => observed.push(command));

    expect(observed.map(command => command.type)).toEqual(['START', 'SUBMIT_ANSWER']);
    expect(new Set(observed.map(command => command.id)).size).toBe(2);

    await gateway.markCommandProcessed('room-1', observed[0].id);
    unsubscribe();

    const replayed = [];
    const stopReplay = gateway.subscribeCommands('room-1', command => replayed.push(command));
    expect(replayed.map(command => command.type)).toEqual(['SUBMIT_ANSWER']);
    stopReplay();
  });

  test('resolves a newly created room code', async () => {
    const gateway = new LocalRoomGateway();
    await gateway.createRoom({
      roomId: 'room-1',
      joinCode: 'B7K9P',
      hostId: 'host',
      players: [{ id: 'host' }],
    });

    await expect(gateway.resolveRoom('b7-k9p')).resolves.toBe('room-1');
  });
});
