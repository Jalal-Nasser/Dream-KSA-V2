// Full world list with Arabic names, with fallback for Hermes compatibility
export type Country = { code: string; nameAr: string };

// ISO 3166-1 alpha-2 codes (249)
const ISO2: string[] = [
  'AF','AX','AL','DZ','AS','AD','AO','AI','AQ','AG','AR','AM','AW','AU','AT','AZ',
  'BS','BH','BD','BB','BY','BE','BZ','BJ','BM','BT','BO','BQ','BA','BW','BV','BR',
  'IO','BN','BG','BF','BI','KH','CM','CA','CV','KY','CF','TD','CL','CN','CX','CC',
  'CO','KM','CG','CD','CK','CR','CI','HR','CU','CW','CY','CZ','DK','DJ','DM','DO',
  'EC','EG','SV','GQ','ER','EE','SZ','ET','FK','FO','FJ','FI','FR','GF','PF','TF',
  'GA','GM','GE','DE','GH','GI','GR','GL','GD','GP','GU','GT','GG','GN','GW','GY',
  'HT','HM','VA','HN','HK','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','JM',
  'JP','JE','JO','KZ','KE','KI','KP','KR','KW','KG','LA','LV','LB','LS','LR','LY',
  'LI','LT','LU','MO','MK','MG','MW','MY','MV','ML','MT','MH','MQ','MR','MU','YT',
  'MX','FM','MD','MC','MN','ME','MS','MA','MZ','MM','NA','NR','NP','NL','NC','NZ',
  'NI','NE','NG','NU','NF','MP','NO','OM','PK','PW','PS','PA','PG','PY','PE','PH',
  'PN','PL','PT','PR','QA','RE','RO','RU','RW','BL','SH','KN','LC','MF','PM','VC',
  'WS','SM','ST','SA','SN','RS','SC','SL','SG','SX','SK','SI','SB','SO','ZA','GS',
  'SS','ES','LK','SD','SR','SJ','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TK',
  'TO','TT','TN','TR','TM','TC','TV','UG','UA','AE','GB','US','UM','UY','UZ','VU',
  'VE','VN','VG','VI','WF','EH','YE','ZM','ZW'
];

// Safe fallback for Intl.DisplayNames (Hermes compatibility)
function getCountryName(code: string): string {
  try {
    if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
      const display = new Intl.DisplayNames(['ar'], { type: 'region' });
      return display.of(code) || code;
    }
  } catch (e) {
    console.warn('[countries] Intl.DisplayNames failed:', e);
  }
  
  // Fallback to English names for common countries
  const fallbacks: Record<string, string> = {
    'SA': 'السعودية', 'AE': 'الإمارات', 'EG': 'مصر', 'JO': 'الأردن', 'KW': 'الكويت',
    'QA': 'قطر', 'BH': 'البحرين', 'OM': 'عُمان', 'IQ': 'العراق', 'SY': 'سوريا',
    'LB': 'لبنان', 'PS': 'فلسطين', 'YE': 'اليمن', 'MA': 'المغرب', 'DZ': 'الجزائر',
    'TN': 'تونس', 'LY': 'ليبيا', 'SD': 'السودان', 'SO': 'الصومال', 'DJ': 'جيبوتي',
    'US': 'الولايات المتحدة', 'GB': 'المملكة المتحدة', 'FR': 'فرنسا', 'DE': 'ألمانيا',
    'IT': 'إيطاليا', 'ES': 'إسبانيا', 'RU': 'روسيا', 'CN': 'الصين', 'JP': 'اليابان',
    'IN': 'الهند', 'BR': 'البرازيل', 'CA': 'كندا', 'AU': 'أستراليا', 'TR': 'تركيا',
    'IR': 'إيران', 'PK': 'باكستان', 'BD': 'بنغلاديش', 'ID': 'إندونيسيا', 'MY': 'ماليزيا',
    'TH': 'تايلاند', 'VN': 'فيتنام', 'PH': 'الفلبين', 'KR': 'كوريا الجنوبية', 'SG': 'سنغافورة'
  };
  
  return fallbacks[code] || code;
}

export const COUNTRIES: Country[] = ISO2
  .map(code => ({ code, nameAr: getCountryName(code) }))
  .sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));

export const countryNameAr = (code?: string | null) => {
  if (!code) return '';
  const found = COUNTRIES.find(c => c.code === code);
  return found?.nameAr ?? code;
};
