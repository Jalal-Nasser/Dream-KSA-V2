const { parsePhoneNumberFromString } = require('libphonenumber-js');

function toE164(raw, defaultCountry = 'SA') {
  if (!raw) return null;
  // Accept inputs like "05xxxxxxxx" and convert using default country
  const normalized = String(raw).trim();
  let p = parsePhoneNumberFromString(normalized, defaultCountry);
  if (!p && normalized.startsWith('00')) {
    // handle 00-prefixed intl numbers
    p = parsePhoneNumberFromString(`+${normalized.slice(2)}`);
  }
  if (!p || !p.isValid()) return null;
  return p.number; // E.164
}

module.exports = { toE164 };
