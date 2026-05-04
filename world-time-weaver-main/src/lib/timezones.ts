export type TZ = {
  offset: number; // hours from UTC
  label: string;
  city: string;
  iana?: string; // IANA timezone name
};

export const TIMEZONES: TZ[] = [
  { offset: -11, label: "UTC−11", city: "Pago Pago", iana: "Pacific/Pago_Pago" },
  { offset: -10, label: "UTC−10", city: "Honolulu", iana: "Pacific/Honolulu" },
  { offset: -9, label: "UTC−09", city: "Anchorage", iana: "America/Anchorage" },
  { offset: -8, label: "UTC−08", city: "Los Angeles", iana: "America/Los_Angeles" },
  { offset: -7, label: "UTC−07", city: "Denver", iana: "America/Denver" },
  { offset: -6, label: "UTC−06", city: "Mexico City", iana: "America/Mexico_City" },
  { offset: -5, label: "UTC−05", city: "New York", iana: "America/New_York" },
  { offset: -4, label: "UTC−04", city: "Santiago", iana: "America/Santiago" },
  { offset: -3, label: "UTC−03", city: "São Paulo", iana: "America/Sao_Paulo" },
  { offset: -2, label: "UTC−02", city: "Fernando de Noronha", iana: "America/Noronha" },
  { offset: -1, label: "UTC−01", city: "Azores", iana: "Atlantic/Azores" },
  { offset: 0, label: "UTC+00", city: "London", iana: "Europe/London" },
  { offset: 1, label: "UTC+01", city: "Berlin", iana: "Europe/Berlin" },
  { offset: 2, label: "UTC+02", city: "Cairo", iana: "Africa/Cairo" },
  { offset: 3, label: "UTC+03", city: "Moscow", iana: "Europe/Moscow" },
  { offset: 4, label: "UTC+04", city: "Dubai", iana: "Asia/Dubai" },
  { offset: 5, label: "UTC+05", city: "Karachi", iana: "Asia/Karachi" },
  { offset: 6, label: "UTC+06", city: "Dhaka", iana: "Asia/Dhaka" },
  { offset: 7, label: "UTC+07", city: "Bangkok", iana: "Asia/Bangkok" },
  { offset: 8, label: "UTC+08", city: "Singapore", iana: "Asia/Singapore" },
  { offset: 9, label: "UTC+09", city: "Tokyo", iana: "Asia/Tokyo" },
  { offset: 10, label: "UTC+10", city: "Sydney", iana: "Australia/Sydney" },
  { offset: 11, label: "UTC+11", city: "Nouméa", iana: "Pacific/Noumea" },
  { offset: 12, label: "UTC+12", city: "Auckland", iana: "Pacific/Auckland" },
];

export const findTZ = (offset: number) =>
  TIMEZONES.find((t) => t.offset === offset) ?? TIMEZONES[11];

// Convert UTC hour to local hour for a tz
export const localHour = (utcHour: number, offset: number) => {
  return ((utcHour + offset) % 24 + 24) % 24;
};

// Format local hour
export const fmtHour = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};
