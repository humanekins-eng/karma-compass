import Astronomy from "astronomy-engine";

/* ═══════════════════════════════════════════
   VEDIC ASTRONOMY ENGINE (Swiss-grade accuracy)
   Using astronomy-engine: VSOP87 for Sun, full lunar theory for Moon
   ═══════════════════════════════════════════ */

const RASHIS = [
  { sanskrit:"Mesha", english:"Aries", ruler:"Mars", element:"Fire" },
  { sanskrit:"Vrishabha", english:"Taurus", ruler:"Venus", element:"Earth" },
  { sanskrit:"Mithuna", english:"Gemini", ruler:"Mercury", element:"Air" },
  { sanskrit:"Karka", english:"Cancer", ruler:"Moon", element:"Water" },
  { sanskrit:"Simha", english:"Leo", ruler:"Sun", element:"Fire" },
  { sanskrit:"Kanya", english:"Virgo", ruler:"Mercury", element:"Earth" },
  { sanskrit:"Tula", english:"Libra", ruler:"Venus", element:"Air" },
  { sanskrit:"Vrischika", english:"Scorpio", ruler:"Mars", element:"Water" },
  { sanskrit:"Dhanu", english:"Sagittarius", ruler:"Jupiter", element:"Fire" },
  { sanskrit:"Makara", english:"Capricorn", ruler:"Saturn", element:"Earth" },
  { sanskrit:"Kumbha", english:"Aquarius", ruler:"Saturn", element:"Air" },
  { sanskrit:"Meena", english:"Pisces", ruler:"Jupiter", element:"Water" },
];

const NAKSHATRAS = [
  { name:"Ashwini", ruler:"Ketu", deity:"Ashwini Kumaras" },
  { name:"Bharani", ruler:"Venus", deity:"Yama" },
  { name:"Krittika", ruler:"Sun", deity:"Agni" },
  { name:"Rohini", ruler:"Moon", deity:"Brahma" },
  { name:"Mrigashira", ruler:"Mars", deity:"Soma" },
  { name:"Ardra", ruler:"Rahu", deity:"Rudra" },
  { name:"Punarvasu", ruler:"Jupiter", deity:"Aditi" },
  { name:"Pushya", ruler:"Saturn", deity:"Brihaspati" },
  { name:"Ashlesha", ruler:"Mercury", deity:"Sarpa" },
  { name:"Magha", ruler:"Ketu", deity:"Pitris" },
  { name:"Purva Phalguni", ruler:"Venus", deity:"Bhaga" },
  { name:"Uttara Phalguni", ruler:"Sun", deity:"Aryaman" },
  { name:"Hasta", ruler:"Moon", deity:"Savitar" },
  { name:"Chitra", ruler:"Mars", deity:"Tvashtar" },
  { name:"Swati", ruler:"Rahu", deity:"Vayu" },
  { name:"Vishakha", ruler:"Jupiter", deity:"Indra-Agni" },
  { name:"Anuradha", ruler:"Saturn", deity:"Mitra" },
  { name:"Jyeshtha", ruler:"Mercury", deity:"Indra" },
  { name:"Moola", ruler:"Ketu", deity:"Nirriti" },
  { name:"Purva Ashadha", ruler:"Venus", deity:"Apas" },
  { name:"Uttara Ashadha", ruler:"Sun", deity:"Vishvadevas" },
  { name:"Shravana", ruler:"Moon", deity:"Vishnu" },
  { name:"Dhanishta", ruler:"Mars", deity:"Vasus" },
  { name:"Shatabhisha", ruler:"Rahu", deity:"Varuna" },
  { name:"Purva Bhadrapada", ruler:"Jupiter", deity:"Aja Ekapada" },
  { name:"Uttara Bhadrapada", ruler:"Saturn", deity:"Ahir Budhnya" },
  { name:"Revati", ruler:"Mercury", deity:"Pushan" },
];

const CITY_COORDS = {
  "new delhi":{lat:28.61,lon:77.21,tz:5.5},"delhi":{lat:28.61,lon:77.21,tz:5.5},
  "mumbai":{lat:19.07,lon:72.88,tz:5.5},"bombay":{lat:19.07,lon:72.88,tz:5.5},
  "chennai":{lat:13.08,lon:80.27,tz:5.5},"madras":{lat:13.08,lon:80.27,tz:5.5},
  "kolkata":{lat:22.57,lon:88.36,tz:5.5},"calcutta":{lat:22.57,lon:88.36,tz:5.5},
  "bangalore":{lat:12.97,lon:77.59,tz:5.5},"bengaluru":{lat:12.97,lon:77.59,tz:5.5},
  "hyderabad":{lat:17.39,lon:78.49,tz:5.5},"pune":{lat:18.52,lon:73.86,tz:5.5},
  "ahmedabad":{lat:23.02,lon:72.57,tz:5.5},"jaipur":{lat:26.92,lon:75.79,tz:5.5},
  "lucknow":{lat:26.85,lon:80.95,tz:5.5},"kochi":{lat:9.93,lon:76.27,tz:5.5},
  "cochin":{lat:9.93,lon:76.27,tz:5.5},
  "thiruvananthapuram":{lat:8.52,lon:76.94,tz:5.5},"trivandrum":{lat:8.52,lon:76.94,tz:5.5},
  "kozhikode":{lat:11.25,lon:75.78,tz:5.5},"calicut":{lat:11.25,lon:75.78,tz:5.5},
  "thrissur":{lat:10.52,lon:76.21,tz:5.5},"kannur":{lat:11.87,lon:75.37,tz:5.5},
  "palakkad":{lat:10.78,lon:76.65,tz:5.5},"ernakulam":{lat:9.98,lon:76.29,tz:5.5},
  "kollam":{lat:8.89,lon:76.60,tz:5.5},"alappuzha":{lat:9.49,lon:76.34,tz:5.5},
  "london":{lat:51.51,lon:-0.13,tz:0},"new york":{lat:40.71,lon:-74.01,tz:-5},
  "los angeles":{lat:34.05,lon:-118.24,tz:-8},"chicago":{lat:41.88,lon:-87.63,tz:-6},
  "toronto":{lat:43.65,lon:-79.38,tz:-5},"sydney":{lat:-33.87,lon:151.21,tz:10},
  "dubai":{lat:25.20,lon:55.27,tz:4},"singapore":{lat:1.35,lon:103.82,tz:8},
  "tokyo":{lat:35.68,lon:139.69,tz:9},
  "paris":{lat:48.86,lon:2.35,tz:1},"berlin":{lat:52.52,lon:13.41,tz:1},
  "frankfurt":{lat:50.11,lon:8.68,tz:1},"munich":{lat:48.14,lon:11.58,tz:1},
  "hamburg":{lat:53.55,lon:9.99,tz:1},"düsseldorf":{lat:51.23,lon:6.78,tz:1},
  "dusseldorf":{lat:51.23,lon:6.78,tz:1},"cologne":{lat:50.94,lon:6.96,tz:1},
  "köln":{lat:50.94,lon:6.96,tz:1},"stuttgart":{lat:48.78,lon:9.18,tz:1},
  "offenburg":{lat:48.47,lon:7.94,tz:1},"amsterdam":{lat:52.37,lon:4.90,tz:1},
  "rome":{lat:41.90,lon:12.50,tz:1},"madrid":{lat:40.42,lon:-3.70,tz:1},
  "lisbon":{lat:38.72,lon:-9.14,tz:0},"moscow":{lat:55.76,lon:37.62,tz:3},
  "barcelona":{lat:41.39,lon:2.17,tz:1},"milan":{lat:45.46,lon:9.19,tz:1},
  "vienna":{lat:48.21,lon:16.37,tz:1},"zurich":{lat:47.38,lon:8.54,tz:1},
  "geneva":{lat:46.20,lon:6.14,tz:1},"brussels":{lat:50.85,lon:4.35,tz:1},
  "copenhagen":{lat:55.68,lon:12.57,tz:1},"stockholm":{lat:59.33,lon:18.07,tz:1},
  "oslo":{lat:59.91,lon:10.75,tz:1},"helsinki":{lat:60.17,lon:24.94,tz:2},
  "warsaw":{lat:52.23,lon:21.01,tz:1},"prague":{lat:50.08,lon:14.44,tz:1},
  "budapest":{lat:47.50,lon:19.04,tz:1},"athens":{lat:37.98,lon:23.73,tz:2},
  "istanbul":{lat:41.01,lon:28.98,tz:3},"dublin":{lat:53.35,lon:-6.26,tz:0},
  "edinburgh":{lat:55.95,lon:-3.19,tz:0},"manchester":{lat:53.48,lon:-2.24,tz:0},
  "lyon":{lat:45.76,lon:4.84,tz:1},"marseille":{lat:43.30,lon:5.37,tz:1},
  "freiburg":{lat:47.99,lon:7.85,tz:1},"karlsruhe":{lat:49.01,lon:8.40,tz:1},
  "mannheim":{lat:49.49,lon:8.47,tz:1},"heidelberg":{lat:49.40,lon:8.69,tz:1},
  "nuremberg":{lat:49.45,lon:11.08,tz:1},"dresden":{lat:51.05,lon:13.74,tz:1},
  "leipzig":{lat:51.34,lon:12.37,tz:1},"hanover":{lat:52.37,lon:9.74,tz:1},
  "bremen":{lat:53.08,lon:8.80,tz:1},"essen":{lat:51.46,lon:7.01,tz:1},
  "dortmund":{lat:51.51,lon:7.47,tz:1},"bonn":{lat:50.74,lon:7.10,tz:1},
  "san francisco":{lat:37.77,lon:-122.42,tz:-8},"boston":{lat:42.36,lon:-71.06,tz:-5},
  "washington":{lat:38.91,lon:-77.04,tz:-5},"houston":{lat:29.76,lon:-95.37,tz:-6},
  "miami":{lat:25.76,lon:-80.19,tz:-5},"vancouver":{lat:49.28,lon:-123.12,tz:-8},
};

function lookupCity(place) {
  const lower = place.toLowerCase().trim();
  for (const [city, data] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return data;
  }
  return null;
}

function lahiriAyanamsa(date) {
  const t = Astronomy.MakeTime(date);
  const jd = t.tt + 2451545.0;
  return 23.853056 + ((jd - 2451545.0) / 365.25) * (50.29 / 3600.0);
}

function calcAscendant(date, lat, lon) {
  const t = Astronomy.MakeTime(date);
  const gmst = Astronomy.SiderealTime(t); // hours
  const lst = ((gmst * 15.0) + lon + 360) % 360; // degrees
  const T = t.tt / 36525.0;
  const obliquity = 23.4393 - 0.0130 * T;
  const oblRad = obliquity * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const lstRad = lst * Math.PI / 180;
  let asc = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad))
  );
  return ((asc * 180 / Math.PI) + 360) % 360;
}

function computeChart(dateStr, timeStr, place) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const hasTime = timeStr && timeStr.length >= 4;
  let hour = 12, minute = 0;
  if (hasTime) { [hour, minute] = timeStr.split(":").map(Number); }
  
  const cityData = lookupCity(place);
  const tz = cityData ? cityData.tz : 0;
  
  // Construct UTC date
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour - tz, minute));
  
  const ayanamsa = lahiriAyanamsa(utcDate);
  const moon = Astronomy.EclipticGeoMoon(utcDate);
  const sun = Astronomy.SunPosition(utcDate);
  
  const moonSid = ((moon.lon - ayanamsa) + 360) % 360;
  const sunSid = ((sun.elon - ayanamsa) + 360) % 360;
  
  const moonRashiIdx = Math.floor(moonSid / 30);
  const sunRashiIdx = Math.floor(sunSid / 30);
  const nakIdx = Math.floor(moonSid / (360 / 27));
  const pada = Math.floor((moonSid % (360 / 27)) / (360 / 108)) + 1;
  
  let lagna = null;
  if (hasTime && cityData) {
    const ascTrop = calcAscendant(utcDate, cityData.lat, cityData.lon);
    const ascSid = ((ascTrop - ayanamsa) + 360) % 360;
    lagna = {
      rashi: RASHIS[Math.floor(ascSid / 30)],
      degree: ascSid.toFixed(2),
    };
  }
  
  return {
    moonRashi: RASHIS[moonRashiIdx],
    moonDegree: moonSid.toFixed(2),
    sunRashi: RASHIS[sunRashiIdx],
    sunDegree: sunSid.toFixed(2),
    nakshatra: NAKSHATRAS[nakIdx],
    nakshatraNum: nakIdx + 1,
    pada,
    lagna,
    ayanamsa: ayanamsa.toFixed(4),
    hasTime,
    hasCoords: !!cityData,
    engine: "astronomy-engine (VSOP87/ELP)",
  };
}

/* ═══════════════════════════════════════════
   RATE LIMITING
   ═══════════════════════════════════════════ */

const rateLimits = new Map();
function checkRate(ip) {
  const now = Date.now();
  const rec = rateLimits.get(ip);
  if (!rec || now - rec.start > 3600000) {
    rateLimits.set(ip, { start: now, count: 1 });
    return true;
  }
  if (rec.count >= 5) return false;
  rec.count++;
  return true;
}

/* ═══════════════════════════════════════════
   API HANDLER
   ═══════════════════════════════════════════ */

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = (req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  if (!checkRate(ip)) return res.status(429).json({ error: "Reading limit reached. Try again in an hour." });

  const { date, time, place, name, lang } = req.body;
  if (!date || !place) return res.status(400).json({ error: "Date and place are required." });

  try {
    // Step 1: Compute chart with astronomy-engine
    const chart = computeChart(date, time, place);

    const lagnaStr = chart.lagna
      ? `${chart.lagna.rashi.sanskrit} (${chart.lagna.rashi.english}) at ${chart.lagna.degree}°`
      : "Not calculated (requires birth time + recognized city)";

    const langInstruction = lang && lang !== "en"
      ? `\n\nCRITICAL: Generate your ENTIRE response in ${lang}. All text values in the JSON must be in that language. Keep Sanskrit terms (Rashi names, Nakshatra names, deity names) in their original form.`
      : "";

    // Step 2: Send to AI for interpretation only
    const systemPrompt = `You are a master Vedic astrologer (Jyotishi) who integrates classical Jyotish with Jungian depth psychology and Stoic philosophy. You speak with quiet authority and warmth.

IMPORTANT: The astronomical positions below have been PRE-CALCULATED using the VSOP87/ELP lunar theory with Lahiri ayanamsa. These are accurate to sub-arcminute precision. Do NOT recalculate or change them. Use these exact positions as the basis for your interpretation.

You MUST respond with ONLY valid JSON. No markdown, no backticks, no text outside the JSON.${langInstruction}`;

    const userPrompt = `CALCULATED CHART (astronomy-engine, VSOP87):
- Moon: ${chart.moonRashi.sanskrit} (${chart.moonRashi.english}) at ${chart.moonDegree}° sidereal
- Moon Rashi Ruler: ${chart.moonRashi.ruler} | Element: ${chart.moonRashi.element}
- Sun: ${chart.sunRashi.sanskrit} (${chart.sunRashi.english}) at ${chart.sunDegree}° sidereal
- Nakshatra: ${chart.nakshatra.name} (Pada ${chart.pada})
- Nakshatra Ruler: ${chart.nakshatra.ruler} | Deity: ${chart.nakshatra.deity}
- Lagna: ${lagnaStr}
- Ayanamsa: ${chart.ayanamsa}° (Lahiri)

Name: ${name || "Seeker"}

Based on these positions, generate a concise life compass reading. Be specific to this Nakshatra, its deity, the Rashi ruler, and element. Weave in one Jungian archetype and one Stoic principle that genuinely connect.

Respond as JSON:
{"overview":"2-3 sentences on cosmic identity","career":{"insight":"3-4 sentences","action":"One step"},"relationships":{"insight":"3-4 sentences","action":"One practice"},"spiritual":{"insight":"3-4 sentences referencing the deity","action":"One sadhana"},"health":{"insight":"3-4 sentences on constitution from element","action":"One practice"},"archetype":{"name":"archetype name","brief":"One sentence linking to deity"},"stoic":"One reflection for this chart"}`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!aiRes.ok) {
      console.error("Anthropic error:", aiRes.status, await aiRes.text());
      return res.status(500).json({ error: "Reading generation failed." });
    }

    const aiData = await aiRes.json();
    const txt = (aiData.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    const clean = txt.replace(/```json\s?|```/g, "").trim();

    let reading;
    try { reading = JSON.parse(clean); }
    catch { const m = clean.match(/\{[\s\S]*\}/); if (m) reading = JSON.parse(m[0]); else throw new Error("Parse failed"); }

    // Return both chart data and AI reading
    return res.status(200).json({ chart, reading });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: error.message || "Something went wrong." });
  }
}
