import { useState, useEffect, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════
   VEDIC ASTRONOMY ENGINE
   ═══════════════════════════════════════════ */

function julianDay(year, month, day, hour = 12) {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24.0 + B - 1524.5;
}

function lahiriAyanamsa(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.85 + (50.29 / 3600.0) * T * 100;
}

function normalize(deg) {
  let d = deg % 360;
  return d < 0 ? d + 360 : d;
}

function sunTropicalLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = normalize(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalize(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) + 0.000289 * Math.sin(3 * Mrad);
  return normalize(L0 + C);
}

function moonTropicalLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const Lp = normalize(218.3165 + 481267.8813 * T);
  const D = normalize(297.8502 + 445267.1115 * T);
  const M = normalize(357.5291 + 35999.0503 * T);
  const Mp = normalize(134.9634 + 477198.8676 * T);
  const F = normalize(93.2720 + 483202.0175 * T);
  const toRad = (d) => d * Math.PI / 180;
  const lon = Lp + 6.289*Math.sin(toRad(Mp)) + 1.274*Math.sin(toRad(2*D-Mp))
    + 0.658*Math.sin(toRad(2*D)) + 0.214*Math.sin(toRad(2*Mp))
    - 0.186*Math.sin(toRad(M)) - 0.114*Math.sin(toRad(2*F))
    + 0.059*Math.sin(toRad(2*D-2*Mp)) + 0.057*Math.sin(toRad(2*D-M-Mp))
    + 0.053*Math.sin(toRad(2*D+Mp)) + 0.046*Math.sin(toRad(2*D-M))
    - 0.041*Math.sin(toRad(M-Mp)) - 0.035*Math.sin(toRad(D))
    - 0.031*Math.sin(toRad(M+Mp));
  return normalize(lon);
}

function calculateLagna(jd, latDeg, lonDeg) {
  const T = (jd - 2451545.0) / 36525.0;
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  GMST = normalize(GMST);
  const LST = normalize(GMST + lonDeg);
  const obliquity = 23.4393 - 0.0130 * T;
  const oblRad = obliquity * Math.PI / 180;
  const latRad = latDeg * Math.PI / 180;
  const lstRad = LST * Math.PI / 180;
  let asc = Math.atan2(Math.cos(lstRad), -(Math.sin(lstRad)*Math.cos(oblRad)+Math.tan(latRad)*Math.sin(oblRad)));
  return normalize(asc * 180 / Math.PI);
}

/* ═══════════════════════════════════════════
   VEDIC DATA TABLES
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
  "melbourne":{lat:-37.81,lon:144.96,tz:10},"dubai":{lat:25.20,lon:55.27,tz:4},
  "singapore":{lat:1.35,lon:103.82,tz:8},"tokyo":{lat:35.68,lon:139.69,tz:9},
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
  "porto":{lat:41.16,lon:-8.63,tz:0},"naples":{lat:40.85,lon:14.27,tz:1},
  "florence":{lat:43.77,lon:11.25,tz:1},"seville":{lat:37.39,lon:-6.00,tz:1},
  "beijing":{lat:39.90,lon:116.40,tz:8},"shanghai":{lat:31.23,lon:121.47,tz:8},
  "hong kong":{lat:22.32,lon:114.17,tz:8},"bangkok":{lat:13.76,lon:100.50,tz:7},
  "san francisco":{lat:37.77,lon:-122.42,tz:-8},"boston":{lat:42.36,lon:-71.06,tz:-5},
  "washington":{lat:38.91,lon:-77.04,tz:-5},"houston":{lat:29.76,lon:-95.37,tz:-6},
  "miami":{lat:25.76,lon:-80.19,tz:-5},"vancouver":{lat:49.28,lon:-123.12,tz:-8},
  "mexico city":{lat:19.43,lon:-99.13,tz:-6},"sao paulo":{lat:-23.55,lon:-46.63,tz:-3},
  "cairo":{lat:30.04,lon:31.24,tz:2},"lagos":{lat:6.52,lon:3.38,tz:1},
  "nairobi":{lat:-1.29,lon:36.82,tz:3},"johannesburg":{lat:-26.20,lon:28.05,tz:2},
  "freiburg":{lat:47.99,lon:7.85,tz:1},"karlsruhe":{lat:49.01,lon:8.40,tz:1},
  "mannheim":{lat:49.49,lon:8.47,tz:1},"heidelberg":{lat:49.40,lon:8.69,tz:1},
  "nuremberg":{lat:49.45,lon:11.08,tz:1},"dresden":{lat:51.05,lon:13.74,tz:1},
  "leipzig":{lat:51.34,lon:12.37,tz:1},"hanover":{lat:52.37,lon:9.74,tz:1},
  "bremen":{lat:53.08,lon:8.80,tz:1},"essen":{lat:51.46,lon:7.01,tz:1},
  "dortmund":{lat:51.51,lon:7.47,tz:1},"bonn":{lat:50.74,lon:7.10,tz:1},
};

function lookupCity(place) {
  const lower = place.toLowerCase().trim();
  for (const [city, data] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return data;
  }
  return null;
}

function computeChart(dateStr, timeStr, place) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const hasTime = timeStr && timeStr.length >= 4;
  let hour = 12;
  if (hasTime) {
    const [h, m] = timeStr.split(":").map(Number);
    hour = h + m / 60.0;
  }
  const cityData = lookupCity(place);
  let utHour = hour;
  if (cityData) utHour = hour - cityData.tz;

  const jd = julianDay(year, month, day, utHour);
  const ayanamsa = lahiriAyanamsa(jd);
  const sunSidereal = normalize(sunTropicalLongitude(jd) - ayanamsa);
  const moonSidereal = normalize(moonTropicalLongitude(jd) - ayanamsa);

  const moonRashiIdx = Math.floor(moonSidereal / 30);
  const sunRashiIdx = Math.floor(sunSidereal / 30);
  const nakshatraIdx = Math.floor(moonSidereal / (360 / 27));
  const pada = Math.floor((moonSidereal % (360 / 27)) / (360 / 108)) + 1;

  let lagnaInfo = null;
  if (hasTime && cityData) {
    const lagnaSidereal = normalize(calculateLagna(jd, cityData.lat, cityData.lon) - ayanamsa);
    lagnaInfo = { rashi: RASHIS[Math.floor(lagnaSidereal / 30)], degree: lagnaSidereal };
  }

  return {
    moonRashi: RASHIS[moonRashiIdx], moonDegree: moonSidereal.toFixed(2),
    sunRashi: RASHIS[sunRashiIdx], sunDegree: sunSidereal.toFixed(2),
    nakshatra: NAKSHATRAS[nakshatraIdx], nakshatraIdx: nakshatraIdx + 1, pada,
    lagna: lagnaInfo, ayanamsa: ayanamsa.toFixed(4),
    hasTime, hasCoords: !!cityData, jd,
  };
}

/* ═══════════════════════════════════════════
   LANGUAGE SYSTEM
   ═══════════════════════════════════════════ */

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "fr", label: "French", native: "Français" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "nl", label: "Dutch", native: "Nederlands" },
];

function getLanguageInstruction(code) {
  if (code === "en") return "";
  const lang = LANGUAGES.find(l => l.code === code);
  return `\n\nCRITICAL: Generate your ENTIRE response in ${lang.label} (${lang.native}). All text values in the JSON must be in ${lang.native}. Keep Sanskrit terms (Rashi names, Nakshatra names) in their original form but write all interpretive text in ${lang.native}.`;
}

/* ═══════════════════════════════════════════
   UI CONSTANTS & COMPONENTS
   ═══════════════════════════════════════════ */

const C = {
  bgDeep:"#080c16", bgMid:"#0f1628", bgCard:"rgba(201,168,76,0.04)",
  gold:"#c9a84c", goldLight:"#e8d5a3", goldDim:"rgba(201,168,76,0.25)",
  cream:"#f2ece0", creamDim:"#8a8070",
  border:"rgba(201,168,76,0.15)", borderHover:"rgba(201,168,76,0.4)",
};

const stars = Array.from({length:90},(_,i) => ({
  id:i, x:Math.random()*100, y:Math.random()*100,
  s:Math.random()*1.8+0.5, o:Math.random()*0.6+0.2, d:Math.random()*4,
}));

const domainMeta = {
  career: {
    label: "Career & Purpose",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  },
  relationships: {
    label: "Relationships & Love",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  },
  spiritual: {
    label: "Spiritual Growth",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  },
  health: {
    label: "Health & Wellness",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  },
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
    @keyframes twinkle { 0%,100%{opacity:0.2} 50%{opacity:1} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
    @keyframes cardIn { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    *{margin:0;padding:0;box-sizing:border-box}
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
      filter:invert(0.7) sepia(0.5) hue-rotate(10deg); cursor:pointer;
    }
  `}</style>
);

function StarField() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
      {stars.map(s=>(
        <div key={s.id} style={{
          position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
          width:s.s,height:s.s,borderRadius:"50%",
          background:C.goldLight,opacity:s.o,
          animation:`twinkle ${3+s.d}s ease-in-out ${s.d}s infinite`,
        }}/>
      ))}
    </div>
  );
}

function CompassRose({size=80}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{animation:"spin 8s linear infinite"}}>
      <circle cx="50" cy="50" r="45" fill="none" stroke={C.goldDim} strokeWidth="0.5"/>
      <circle cx="50" cy="50" r="35" fill="none" stroke={C.goldDim} strokeWidth="0.3"/>
      <circle cx="50" cy="50" r="3" fill={C.gold}/>
      {[0,45,90,135,180,225,270,315].map((a,i)=>{
        const r=a*Math.PI/180;const l=i%2===0?44:36;
        return <line key={a} x1={50+Math.cos(r)*8} y1={50+Math.sin(r)*8} x2={50+Math.cos(r)*l} y2={50+Math.sin(r)*l} stroke={C.gold} strokeWidth={i%2===0?1:0.5} opacity={i%2===0?0.9:0.4}/>;
      })}
      {[0,90,180,270].map(a=>{
        const r=a*Math.PI/180;
        const pts=[[50+Math.cos(r)*12,50+Math.sin(r)*12],[50+Math.cos(r-0.15)*44,50+Math.sin(r-0.15)*44],[50+Math.cos(r)*48,50+Math.sin(r)*48],[50+Math.cos(r+0.15)*44,50+Math.sin(r+0.15)*44]];
        return <polygon key={a} points={pts.map(p=>p.join(",")).join(" ")} fill={C.gold} opacity="0.15"/>;
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */

const sty = {
  page:{minHeight:"100vh",background:`linear-gradient(170deg,${C.bgDeep} 0%,${C.bgMid} 50%,${C.bgDeep} 100%)`,fontFamily:"'Crimson Pro',Georgia,serif",color:C.cream,position:"relative",overflow:"hidden"},
  container:{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"40px 20px",minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center"},
  heading:(s=42)=>({fontFamily:"'Cormorant Garamond',Georgia,serif",fontWeight:300,fontSize:s,lineHeight:1.15,color:C.cream,letterSpacing:"0.02em"}),
  subhead:{fontFamily:"'Crimson Pro',Georgia,serif",fontSize:17,fontWeight:300,color:C.creamDim,lineHeight:1.6,maxWidth:480},
  label:{fontFamily:"'Cormorant Garamond',serif",fontSize:13,fontWeight:500,color:C.gold,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8},
  input:{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,color:C.cream,fontFamily:"'Crimson Pro',serif",fontSize:16,outline:"none",transition:"border-color 0.3s"},
  btn:(p=true)=>({padding:p?"16px 40px":"12px 28px",background:p?`linear-gradient(135deg,${C.gold},#a8883a)`:"transparent",border:p?"none":`1px solid ${C.border}`,borderRadius:8,color:p?C.bgDeep:C.cream,fontFamily:"'Cormorant Garamond',serif",fontSize:p?18:15,fontWeight:600,letterSpacing:"0.06em",cursor:"pointer",transition:"all 0.3s"}),
  card:(d=0)=>({background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:"24px",animation:`cardIn 0.6s ease ${d}s both`}),
  goldBar:{width:40,height:1,background:`linear-gradient(90deg,${C.gold},transparent)`,margin:"16px 0"},
  tag:{display:"inline-block",padding:"4px 14px",background:"rgba(201,168,76,0.1)",border:`1px solid ${C.border}`,borderRadius:100,fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontWeight:500,color:C.goldLight,letterSpacing:"0.04em"},
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function KarmaCompass() {
  const [phase, setPhase] = useState("welcome");
  const [vis, setVis] = useState(true);
  const [form, setForm] = useState({name:"",date:"",time:"",place:""});
  const [lang, setLang] = useState("en");
  const [reading, setReading] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");
  const [loadIdx, setLoadIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  const loadMsgs = useMemo(()=>["Computing sidereal positions…","Reading your Nakshatra…","Decoding your karmic blueprint…","Aligning the cosmic compass…"],[]);

  useEffect(()=>{
    if(phase!=="loading") return;
    const iv=setInterval(()=>setLoadIdx(p=>(p+1)%loadMsgs.length),3000);
    return ()=>clearInterval(iv);
  },[phase,loadMsgs]);

  const goTo = useCallback((next)=>{
    setVis(false);
    setTimeout(()=>{setPhase(next);setVis(true);},450);
  },[]);

  const onInput = (f) => (e) => setForm(s=>({...s,[f]:e.target.value}));

  const generate = async () => {
    if(busy||!form.date||!form.place) return;
    setBusy(true); setError(""); setPhase("loading"); setVis(true);

    try {
      const chart = computeChart(form.date, form.time, form.place);
      setChartData(chart);

      const lagnaStr = chart.lagna
        ? `${chart.lagna.rashi.sanskrit} (${chart.lagna.rashi.english}) at ${chart.lagna.degree.toFixed(1)}°`
        : "Not calculated (requires exact birth time and recognized city)";

      const langInstruction = getLanguageInstruction(lang);

      const systemPrompt = `You are a master Vedic astrologer (Jyotishi) who integrates classical Jyotish with Jungian depth psychology and Stoic philosophy.

IMPORTANT: The astronomical positions below have been PRE-CALCULATED using proper sidereal/Lahiri ayanamsa algorithms. Do NOT recalculate or change them. Use these exact positions as the basis for your interpretation.

You MUST respond with ONLY valid JSON. No markdown fences, no backticks, no text before or after the JSON object.${langInstruction}`;

      const userPrompt = `CALCULATED CHART DATA (do not modify):
- Moon Rashi: ${chart.moonRashi.sanskrit} (${chart.moonRashi.english}) at ${chart.moonDegree}° sidereal
- Moon Rashi Ruler: ${chart.moonRashi.ruler}
- Sun Rashi: ${chart.sunRashi.sanskrit} (${chart.sunRashi.english}) at ${chart.sunDegree}° sidereal
- Nakshatra: ${chart.nakshatra.name} (Pada ${chart.pada})
- Nakshatra Ruler: ${chart.nakshatra.ruler}
- Nakshatra Deity: ${chart.nakshatra.deity}
- Lagna: ${lagnaStr}
- Ayanamsa: ${chart.ayanamsa}° (Lahiri)

Name: ${form.name || "Seeker"}
Birth date: ${form.date}
Birth time: ${form.time || "Not provided"}
Birth place: ${form.place}

Generate a concise life compass reading based on these EXACT positions. Be specific to this Nakshatra, Rashi, and their rulers. Reference the deity. Weave in one Jungian archetype and one Stoic principle.

JSON format:
{"overview":"2-3 sentences","career":{"insight":"3-4 sentences","action":"One step"},"relationships":{"insight":"3-4 sentences","action":"One practice"},"spiritual":{"insight":"3-4 sentences","action":"One sadhana"},"health":{"insight":"3-4 sentences","action":"One practice"},"archetype":{"name":"archetype","brief":"one sentence"},"stoic":"reflection"}`;

      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemPrompt, prompt: userPrompt }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error ${res.status}: ${errText.slice(0,200)}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      if (!data.content || data.content.length === 0) throw new Error("Empty response");

      const txt = data.content.filter(b=>b.type==="text").map(b=>b.text).join("");
      const clean = txt.replace(/```json\s?|```/g,"").trim();

      let parsed;
      try { parsed = JSON.parse(clean); }
      catch {
        const m = clean.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
        else throw new Error("Could not parse response");
      }

      setReading(parsed);
      setBusy(false);
      goTo("results");
    } catch (e) {
      console.error("Karma Compass Error:", e);
      setError(e.message || "Something went wrong. Please try again.");
      setBusy(false);
      goTo("form");
    }
  };

  const restart = () => {
    setReading(null); setChartData(null);
    setForm({name:"",date:"",time:"",place:""});
    setError(""); goTo("welcome");
  };

  const wrapStyle = {
    opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(12px)",
    transition:"opacity 0.45s ease, transform 0.45s ease",
  };

  const selectStyle = {
    padding:"10px 16px", background:"rgba(255,255,255,0.04)",
    border:`1px solid ${C.border}`, borderRadius:8,
    color:C.cream, fontFamily:"'Crimson Pro',serif", fontSize:15,
    outline:"none", cursor:"pointer", appearance:"none",
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23c9a84c' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center",
    paddingRight:36, minWidth:160, textAlign:"center",
  };

  return (
    <div style={sty.page}>
      <GlobalStyles/>
      <StarField/>
      <div style={sty.container}>
        <div style={wrapStyle}>

          {/* WELCOME */}
          {phase==="welcome"&&(
            <div style={{textAlign:"center",animation:"fadeUp 0.8s ease both"}}>
              <div style={{marginBottom:32}}><CompassRose size={72}/></div>
              <div style={{...sty.label,marginBottom:20}}>The Karma Compass</div>
              <h1 style={{...sty.heading(40),marginBottom:20}}>
                Discover Your<br/>
                <span style={{color:C.gold,fontWeight:400,fontStyle:"italic"}}>Cosmic Blueprint</span>
              </h1>
              <p style={{...sty.subhead,margin:"0 auto 32px"}}>
                Vedic astrology meets Jungian depth psychology and Stoic wisdom.
                Your birth chart, calculated with astronomical precision and interpreted through ancient wisdom.
              </p>

              {/* Language Selector */}
              <div style={{marginBottom:32}}>
                <div style={{...sty.label,fontSize:11,marginBottom:10,opacity:0.6}}>Reading Language</div>
                <select value={lang} onChange={e=>setLang(e.target.value)} style={selectStyle}>
                  {LANGUAGES.map(l=>(
                    <option key={l.code} value={l.code} style={{background:C.bgDeep,color:C.cream}}>
                      {l.native}
                    </option>
                  ))}
                </select>
              </div>

              <button style={sty.btn()} onClick={()=>goTo("form")}>Begin Your Reading</button>
              <p style={{...sty.subhead,fontSize:13,marginTop:24,margin:"24px auto 0",opacity:0.5}}>
                Algorithmically calculated · Sidereal positions · Lahiri ayanamsa
              </p>
            </div>
          )}

          {/* FORM */}
          {phase==="form"&&(
            <div style={{animation:"fadeUp 0.6s ease both"}}>
              <div style={{textAlign:"center",marginBottom:36}}>
                <div style={{...sty.label,marginBottom:12}}>Your Birth Details</div>
                <h2 style={sty.heading(32)}>When & Where Were You Born?</h2>
                <p style={{...sty.subhead,margin:"12px auto 0",fontSize:15}}>
                  Your birth moment encodes your unique karmic signature.
                </p>
              </div>

              {error&&(
                <div style={{padding:"14px 18px",background:"rgba(200,80,80,0.1)",border:"1px solid rgba(200,80,80,0.25)",borderRadius:8,color:"#e8a0a0",fontSize:14,marginBottom:20,textAlign:"center",lineHeight:1.5}}>
                  {error}
                </div>
              )}

              <div style={{display:"flex",flexDirection:"column",gap:20}}>
                <div>
                  <label style={sty.label}>Name (optional)</label>
                  <input style={sty.input} type="text" placeholder="Your name or alias" value={form.name} onChange={onInput("name")} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <div>
                    <label style={sty.label}>Date of Birth *</label>
                    <input style={sty.input} type="date" value={form.date} onChange={onInput("date")} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>
                  </div>
                  <div>
                    <label style={sty.label}>Time of Birth</label>
                    <input style={sty.input} type="time" value={form.time} onChange={onInput("time")} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>
                  </div>
                </div>
                <div>
                  <label style={sty.label}>Place of Birth *</label>
                  <input style={sty.input} type="text" placeholder="City, Country" value={form.place} onChange={onInput("place")} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>
                </div>
                <p style={{fontSize:13,color:C.creamDim,lineHeight:1.5,opacity:0.6}}>
                  * Required. Birth time enables Lagna calculation. Reading will be generated in {LANGUAGES.find(l=>l.code===lang)?.native || "English"}.
                </p>
                <div style={{display:"flex",gap:12,marginTop:8}}>
                  <button style={sty.btn(false)} onClick={()=>goTo("welcome")}>Back</button>
                  <button style={{...sty.btn(),flex:1,opacity:(!form.date||!form.place)?0.4:1,pointerEvents:(!form.date||!form.place)?"none":"auto"}} onClick={generate}>
                    Generate My Compass
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LOADING */}
          {phase==="loading"&&(
            <div style={{textAlign:"center",animation:"fadeUp 0.6s ease both"}}>
              <div style={{marginBottom:40}}><CompassRose size={100}/></div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:400,color:C.goldLight,animation:"pulse 2.5s ease-in-out infinite",fontStyle:"italic"}}>
                {loadMsgs[loadIdx]}
              </p>
              <p style={{fontSize:14,color:C.creamDim,marginTop:16,opacity:0.5}}>
                Calculating positions & generating interpretation…
              </p>
            </div>
          )}

          {/* RESULTS */}
          {phase==="results"&&reading&&chartData&&(
            <div style={{animation:"fadeUp 0.6s ease both"}}>
              <div style={{textAlign:"center",marginBottom:32}}>
                <div style={{...sty.label,marginBottom:12}}>Your Karma Compass</div>
                <h2 style={{...sty.heading(34),marginBottom:16}}>
                  {form.name||"Seeker"}<span style={{color:C.gold}}>'s</span> Reading
                </h2>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:12}}>
                  <span style={sty.tag}>☽ {chartData.moonRashi.sanskrit} ({chartData.moonRashi.english})</span>
                  <span style={sty.tag}>✦ {chartData.nakshatra.name} · Pada {chartData.pada}</span>
                  {chartData.lagna&&<span style={sty.tag}>↑ {chartData.lagna.rashi.sanskrit} Lagna</span>}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:20}}>
                  <span style={{...sty.tag,fontSize:12,opacity:0.7}}>☉ {chartData.sunRashi.sanskrit}</span>
                  <span style={{...sty.tag,fontSize:12,opacity:0.7}}>Ruler: {chartData.nakshatra.ruler}</span>
                  <span style={{...sty.tag,fontSize:12,opacity:0.7}}>Deity: {chartData.nakshatra.deity}</span>
                </div>
                <p style={{...sty.subhead,margin:"0 auto",fontSize:16,lineHeight:1.7}}>{reading.overview}</p>
              </div>

              <div style={{...sty.card(0.1),textAlign:"center",marginBottom:24}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,fontWeight:500,color:C.gold,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Your Dominant Archetype</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:C.cream,marginBottom:6}}>The {reading.archetype?.name}</div>
                <p style={{fontSize:15,color:C.creamDim,lineHeight:1.5}}>{reading.archetype?.brief}</p>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr",gap:16,marginBottom:24}}>
                {["career","relationships","spiritual","health"].map((key,i)=>(
                  <div key={key} style={sty.card(0.15+i*0.1)}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                      {domainMeta[key].icon}
                      <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:500,color:C.goldLight,letterSpacing:"0.02em"}}>{domainMeta[key].label}</span>
                    </div>
                    <p style={{fontSize:15,color:C.cream,lineHeight:1.7,opacity:0.85,marginBottom:14}}>{reading[key]?.insight}</p>
                    <div style={sty.goldBar}/>
                    <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                      <span style={{color:C.gold,fontSize:14,marginTop:1}}>→</span>
                      <p style={{fontSize:14,color:C.goldLight,lineHeight:1.5,fontWeight:400,fontStyle:"italic"}}>{reading[key]?.action}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{...sty.card(0.6),textAlign:"center",marginBottom:24,borderColor:"rgba(201,168,76,0.25)",background:"rgba(201,168,76,0.06)"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,fontWeight:500,color:C.gold,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Stoic Reflection</div>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:300,color:C.cream,lineHeight:1.6,fontStyle:"italic"}}>"{reading.stoic}"</p>
              </div>

              <div style={{...sty.card(0.7),marginBottom:24,opacity:0.6,padding:"16px 20px"}}>
                <div style={{fontSize:12,color:C.creamDim,lineHeight:1.6}}>
                  <span style={{color:C.gold,fontWeight:500}}>Calculation details:</span> Lahiri ayanamsa {chartData.ayanamsa}° · Moon at {chartData.moonDegree}° sidereal · Sun at {chartData.sunDegree}° sidereal
                  {!chartData.hasTime&&" · Birth time not provided — Nakshatra may shift if born near boundary"}
                  {chartData.hasTime&&!chartData.hasCoords&&" · City not in database — Lagna requires recognized city"}
                </div>
              </div>

              <div style={{...sty.card(0.8),textAlign:"center",background:"linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.02))",marginBottom:24}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,color:C.cream,marginBottom:8}}>Go Deeper</div>
                <p style={{fontSize:15,color:C.creamDim,lineHeight:1.6,marginBottom:20,maxWidth:400,margin:"0 auto 20px"}}>
                  Unlock your full Vedic life report — planetary periods (Dasha), compatibility, career timing, and a personalized spiritual practice guide.
                </p>
                <button style={{...sty.btn(),fontSize:16,padding:"14px 36px"}}>Get Your Deep Reading</button>
                <p style={{fontSize:13,color:C.creamDim,marginTop:12,opacity:0.5}}>Coming soon · Join the waitlist</p>
              </div>

              <div style={{display:"flex",justifyContent:"center",gap:12}}>
                <button style={sty.btn(false)} onClick={restart}>New Reading</button>
              </div>

              <p style={{textAlign:"center",fontSize:12,color:C.creamDim,marginTop:32,opacity:0.4,lineHeight:1.5}}>
                The Karma Compass · Algorithmically calculated Vedic positions · AI-interpreted guidance<br/>
                For spiritual reflection and personal growth · Not a substitute for professional advice · © {new Date().getFullYear()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
