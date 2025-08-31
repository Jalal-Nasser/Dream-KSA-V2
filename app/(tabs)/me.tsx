import React from 'react';
let RealMe: any;
try { RealMe = require('../me').default; } catch {}
export default function MeTab() { return RealMe ? <RealMe /> : null; }
