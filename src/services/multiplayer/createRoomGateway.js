import { hasFirebaseMultiplayerConfig } from './firebaseClient.js';
import { FirebaseRoomGateway } from './FirebaseRoomGateway.js';
import { LocalRoomGateway } from './LocalRoomGateway.js';

export async function createRoomGateway() {
  const forcedLocal = new URLSearchParams(window.location.search).get('transport') === 'local';
  if (forcedLocal || !hasFirebaseMultiplayerConfig()) {
    return new LocalRoomGateway();
  }

  return FirebaseRoomGateway.create();
}
