import keytar from 'keytar';
import { machineId } from 'node-machine-id';

export async function getClientId(): Promise<string> {
  const clientId = await machineId();
  return clientId;
}

export async function getAccessToken(): Promise<string | null> {
  const accessToken = await keytar.getPassword('VoxyLauncher', 'token');
  return accessToken;
}