/**
 * db/mic.ts — project-root compatibility shim
 * Re-exports canonical src/db/mic if present; otherwise provides safe placeholders.
 */
let mod: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  mod = require('../src/db/mic');
} catch (e) {
  // fallback placeholder
  // eslint-disable-next-line no-console
  console.warn('[db/mic shim] ../src/db/mic not found. Using placeholders.');
  async function raiseHand(roomId: string, userId: string) {
    throw new Error('raiseHand: placeholder not implemented.');
  }
  async function cancelHand(roomId: string, userId: string) {
    throw new Error('cancelHand: placeholder not implemented.');
  }
  async function grantMic(adminId: string, userId: string) {
    throw new Error('grantMic: placeholder not implemented.');
  }
  async function revokeMic(adminId: string, userId: string) {
    throw new Error('revokeMic: placeholder not implemented.');
  }
  function listenRoom(roomId: string, callback: (change: any) => void) {
    console.warn('listenRoom: placeholder shim; no realtime events.');
    return () => {};
  }
  mod = { raiseHand, cancelHand, grantMic, revokeMic, listenRoom };
}
module.exports = mod;
export default mod;
export * from '../src/db/mic';
