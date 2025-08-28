/**
 * app/db/mic.ts — compatibility shim for app/* imports
 * Tries ../../src/db/mic then ../src/db/mic, falling back to placeholders.
 */
let mod: any;
function tryReq(p: string) {
  try { return require(p); } catch { return null; }
}
mod = tryReq('../../src/db/mic') || tryReq('../src/db/mic');
if (!mod) {
  // eslint-disable-next-line no-console
  console.warn('[app/db/mic shim] src/db/mic not found. Using placeholders.');
  async function raiseHand(roomId: string, userId: string) { throw new Error('raiseHand: placeholder not implemented.'); }
  async function cancelHand(roomId: string, userId: string) { throw new Error('cancelHand: placeholder not implemented.'); }
  async function grantMic(adminId: string, userId: string) { throw new Error('grantMic: placeholder not implemented.'); }
  async function revokeMic(adminId: string, userId: string) { throw new Error('revokeMic: placeholder not implemented.'); }
  function listenRoom(roomId: string, callback: (change: any) => void) { console.warn('listenRoom: placeholder shim; no realtime events.'); return () => {}; }
  mod = { raiseHand, cancelHand, grantMic, revokeMic, listenRoom };
}
module.exports = mod;
export default mod;
export * from '../../src/db/mic';
