type PrayerCacheEntry = {
  date: string;
  city: string;
  timings: Record<string, string>;
};

const cache = new Map<string, PrayerCacheEntry>();
const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

type AladhanResponse = {
  data?: {
    timings?: Record<string, string>;
  };
};

function minutesFromTime(time: string) {
  const clean = time.split(" ")[0];
  const [hours, minutes] = clean.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function getNextPrayer(city: string) {
  const now = new Date();
  const watNow = new Date(now.getTime() + 60 * 60 * 1000);
  const dateKey = watNow.toISOString().slice(0, 10);
  const cacheKey = `${city}:${dateKey}`;
  let entry = cache.get(cacheKey);

  if (!entry) {
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Nigeria&method=3`,
      { next: { revalidate: 86_400 } },
    );
    const json = await response.json() as AladhanResponse;
    entry = { city, date: dateKey, timings: json.data?.timings ?? {} };
    cache.set(cacheKey, entry);
  }

  const currentMinutes = watNow.getUTCHours() * 60 + watNow.getUTCMinutes();
  for (const name of prayerNames) {
    const time = entry.timings[name];
    if (!time) continue;
    const prayerMinutes = minutesFromTime(time);
    if (prayerMinutes >= currentMinutes) {
      return { name, time, minutes_until: prayerMinutes - currentMinutes };
    }
  }

  const fajr = entry.timings.Fajr ?? "05:00";
  return { name: "Fajr", time: fajr, minutes_until: 24 * 60 - currentMinutes + minutesFromTime(fajr) };
}
