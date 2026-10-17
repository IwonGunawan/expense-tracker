let LOCALE = 'en-US';

export function setLocale(locale) {
  LOCALE = locale;
}

export function formatIDR(value) {
  const n = Number(value) || 0;
  return 'Rp ' + new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(n);
}

export function formatDateID(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function todayID() {
  const d = new Date();
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function initialOf(email) {
  return (email?.[0] || '?').toUpperCase();
}

export function formatNumberID(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat(LOCALE).format(Number(digits));
}

export function parseNumberID(value) {
  return Number(String(value ?? '').replace(/\D/g, '')) || 0;
}

export function monthRange(year, monthIndex) {
  const pad = (x) => String(x).padStart(2, '0');
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return {
    from: `${year}-${pad(monthIndex + 1)}-01`,
    to: `${year}-${pad(monthIndex + 1)}-${pad(lastDay)}`,
  };
}

export function currentMonthRange() {
  const now = new Date();
  return monthRange(now.getFullYear(), now.getMonth());
}

export function shortMonths() {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2024, i, 1).toLocaleDateString(LOCALE, { month: 'short' }),
  );
}