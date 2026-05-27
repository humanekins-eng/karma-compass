import { useState, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════
   THE KARMA COMPASS — Frontend
   All astronomy runs server-side via astronomy-engine
   ═══════════════════════════════════════════ */

const C = {
  bgDeep:"#080c16", bgMid:"#0f1628", bgCard:"rgba(201,168,76,0.04)",
  gold:"#c9a84c", goldLight:"#e8d5a3", goldDim:"rgba(201,168,76,0.25)",
  cream:"#f2ece0", creamDim:"#8a8070",
  border:"rgba(201,168,76,0.15)",
};

const LANGUAGES = [
  { code:"en", native:"English" }, { code:"de", native:"Deutsch" },
  { code:"fr", native:"Français" }, { code:"es", native:"Español" },
  { code:"it", native:"Italiano" }, { code:"pt", native:"Português" },
  { code:"nl", native:"Nederlands" },
];

const stars = Array.from({length:80},(_,i) => ({
  id:i, x:Math.random()*100, y:Math.random()*100,
  s:Math.random()*1.8+0.5, o:Math.random()*0.6+0.2, d:Math.random()*4,
}));

const domainIcons = {
  career: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  relationships: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  spiritual: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  health: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
};

const domainLabels = { career:"Career & Purpose", relationships:"Relationships & Love", spiritual:"Spiritual Growth", health:"Health & Wellness" };

/* ═══ Components ═══ */

const GlobalStyles = () => <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  @keyframes twinkle{0%,100%{opacity:.2}50%{opacity:1}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
  @keyframes cardIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  *{margin:0;padding:0;box-sizing:border-box}
  input[type="date"]::-webkit-calendar-picker-indicator,input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(.7) sepia(.5) hue-rotate(10deg);cursor:pointer}
`}</style>;

function StarField() {
  return <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
    {stars.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.s,height:s.s,borderRadius:"50%",background:C.goldLight,opacity:s.o,animation:`twinkle ${3+s.d}s ease-in-out ${s.d}s infinite`}}/>)}
  </div>;
}

function Compass({size=72}) {
  return <svg width={size} height={size} viewBox="0 0 100 100" style={{animation:"spin 8s linear infinite"}}>
    <circle cx="50" cy="50" r="44" fill="none" stroke={C.goldDim} strokeWidth=".5"/>
    <circle cx="50" cy="50" r="3" fill={C.gold}/>
    {[0,90,180,270].map(a=>{const r=a*Math.PI/180;return <line key={a} x1={50+Math.cos(r)*8} y1={50+Math.sin(r)*8} x2={50+Math.cos(r)*44} y2={50+Math.sin(r)*44} stroke={C.gold} strokeWidth=".8" opacity=".7"/>;
    })}
  </svg>;
}

function Privacy({onClose}) {
  return <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{maxWidth:560,maxHeight:"80vh",overflow:"auto",background:C.bgMid,border:`1px solid ${C.border}`,borderRadius:14,padding:"28px 24px",color:C.cream,fontFamily:"'Crimson Pro',serif",fontSize:15,lineHeight:1.7}}>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:C.goldLight,marginBottom:16}}>Privacy Policy</h2>
      <p style={{marginBottom:12}}>The Karma Compass complies with GDPR. Birth details (date, time, place) are sent to our server for astronomical calculation, then to Anthropic's AI for interpretation. No birth data is stored after your session. Your email is stored only for reading delivery and occasional updates. You can unsubscribe at any time. No tracking cookies. No ads. Contact: karma@thekarmacompass.com</p>
      <button onClick={onClose} style={{marginTop:12,padding:"10px 28px",background:`linear-gradient(135deg,${C.gold},#a8883a)`,border:"none",borderRadius:8,color:C.bgDeep,fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:600,cursor:"pointer"}}>Close</button>
    </div>
  </div>;
}

/* ═══ Styles ═══ */

const S = {
  page:{minHeight:"100vh",background:`linear-gradient(170deg,${C.bgDeep},${C.bgMid},${C.bgDeep})`,fontFamily:"'Crimson Pro',Georgia,serif",color:C.cream,position:"relative"},
  wrap:{position:"relative",zIndex:1,maxWidth:640,margin:"0 auto",padding:"40px 20px",minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center"},
  h:(sz=38)=>({fontFamily:"'Cormorant Garamond',serif",fontWeight:300,fontSize:sz,lineHeight:1.15,color:C.cream}),
  sub:{fontSize:16,fontWeight:300,color:C.creamDim,lineHeight:1.6},
  lbl:{fontFamily:"'Cormorant Garamond',serif",fontSize:12,fontWeight:500,color:C.gold,letterSpacing:".12em",textTransform:"uppercase",marginBottom:7},
  inp:{width:"100%",padding:"13px 15px",background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`,borderRadius:8,color:C.cream,fontFamily:"'Crimson Pro',serif",fontSize:15,outline:"none"},
  btn:(p=true)=>({padding:p?"15px 36px":"11px 24px",background:p?`linear-gradient(135deg,${C.gold},#a8883a)`:"transparent",border:p?"none":`1px solid ${C.border}`,borderRadius:8,color:p?C.bgDeep:C.cream,fontFamily:"'Cormorant Garamond',serif",fontSize:p?17:14,fontWeight:600,letterSpacing:".05em",cursor:"pointer"}),
  card:(d=0)=>({background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:11,padding:"22px",animation:`cardIn .5s ease ${d}s both`}),
  tag:{display:"inline-block",padding:"3px 12px",background:"rgba(201,168,76,.1)",border:`1px solid ${C.border}`,borderRadius:100,fontFamily:"'Cormorant Garamond',serif",fontSize:13,fontWeight:500,color:C.goldLight},
  bar:{width:36,height:1,background:`linear-gradient(90deg,${C.gold},transparent)`,margin:"14px 0"},
};

/* ═══ Main App ═══ */

export default function KarmaCompass() {
  const [phase, setPhase] = useState("welcome");
  const [form, setForm] = useState({name:"",date:"",time:"",place:"",email:""});
  const [lang, setLang] = useState("en");
  const [result, setResult] = useState(null); // { chart, reading }
  const [error, setError] = useState("");
  const [loadIdx, setLoadIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [consent, setConsent] = useState(false);

  const loadMsgs = useMemo(()=>["Computing sidereal positions…","Reading your Nakshatra…","Decoding your karmic blueprint…","Generating your reading…"],[]);

  useEffect(()=>{
    if(phase!=="loading") return;
    const iv=setInterval(()=>setLoadIdx(p=>(p+1)%loadMsgs.length),2800);
    return ()=>clearInterval(iv);
  },[phase,loadMsgs]);

  const go = (p) => setPhase(p);
  const inp = (f) => (e) => setForm(s=>({...s,[f]:e.target.value}));
  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const canSubmit = form.date && form.place && form.email && consent && validEmail(form.email);

  const generate = async () => {
    if (busy || !canSubmit) return;
    setBusy(true); setError(""); go("loading");

    // Fire-and-forget email capture
    fetch("/api/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:form.email,name:form.name,lang})}).catch(()=>{});

    try {
      const res = await fetch("/api/reading", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ date:form.date, time:form.time, place:form.place, name:form.name, lang:LANGUAGES.find(l=>l.code===lang)?.native||"English" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.error || `Error ${res.status}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
      setBusy(false);
      go("results");
    } catch(e) {
      console.error("KC:", e);
      setError(e.message); setBusy(false); go("form");
    }
  };

  const restart = () => { setResult(null); setForm({name:"",date:"",time:"",place:"",email:""}); setError(""); setConsent(false); go("welcome"); };

  const focus = (e) => e.target.style.borderColor = C.gold;
  const blur = (e) => e.target.style.borderColor = C.border;

  return (
    <div style={S.page}>
      <GlobalStyles/>
      <StarField/>
      {showPrivacy && <Privacy onClose={()=>setShowPrivacy(false)}/>}

      <div style={S.wrap}>

        {/* WELCOME */}
        {phase==="welcome"&&(
          <div style={{textAlign:"center",animation:"fadeUp .7s ease both"}}>
            <div style={{marginBottom:28}}><Compass/></div>
            <div style={{...S.lbl,marginBottom:16}}>The Karma Compass</div>
            <h1 style={{...S.h(38),marginBottom:18}}>
              Discover Your<br/><span style={{color:C.gold,fontWeight:400,fontStyle:"italic"}}>Cosmic Blueprint</span>
            </h1>
            <p style={{...S.sub,maxWidth:440,margin:"0 auto 28px"}}>
              Vedic astrology meets Jungian depth psychology and Stoic wisdom.
              Calculated with astronomical precision. Interpreted through ancient wisdom.
            </p>
            <div style={{marginBottom:28}}>
              <div style={{...S.lbl,fontSize:10,marginBottom:8,opacity:.5}}>Reading Language</div>
              <select value={lang} onChange={e=>setLang(e.target.value)} style={{padding:"9px 36px 9px 14px",background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`,borderRadius:8,color:C.cream,fontFamily:"'Crimson Pro',serif",fontSize:14,outline:"none",cursor:"pointer",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23c9a84c' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center"}}>
                {LANGUAGES.map(l=><option key={l.code} value={l.code} style={{background:C.bgDeep,color:C.cream}}>{l.native}</option>)}
              </select>
            </div>
            <button style={S.btn()} onClick={()=>go("form")}>Begin Your Reading</button>
            <p style={{...S.sub,fontSize:12,marginTop:20,opacity:.4}}>VSOP87 solar · Full lunar theory · Lahiri ayanamsa</p>
          </div>
        )}

        {/* FORM */}
        {phase==="form"&&(
          <div style={{animation:"fadeUp .5s ease both"}}>
            <div style={{textAlign:"center",marginBottom:32}}>
              <div style={{...S.lbl,marginBottom:10}}>Your Birth Details</div>
              <h2 style={S.h(30)}>When & Where Were You Born?</h2>
            </div>
            {error&&<div style={{padding:"12px 16px",background:"rgba(200,80,80,.1)",border:"1px solid rgba(200,80,80,.25)",borderRadius:8,color:"#e8a0a0",fontSize:14,marginBottom:18,textAlign:"center"}}>{error}</div>}
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              <div><label style={S.lbl}>Email *</label><input style={S.inp} type="email" placeholder="your@email.com" value={form.email} onChange={inp("email")} onFocus={focus} onBlur={blur}/></div>
              <div><label style={S.lbl}>Name (optional)</label><input style={S.inp} type="text" placeholder="Your name" value={form.name} onChange={inp("name")} onFocus={focus} onBlur={blur}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div><label style={S.lbl}>Date of Birth *</label><input style={S.inp} type="date" value={form.date} onChange={inp("date")} onFocus={focus} onBlur={blur}/></div>
                <div><label style={S.lbl}>Time of Birth</label><input style={S.inp} type="time" value={form.time} onChange={inp("time")} onFocus={focus} onBlur={blur}/></div>
              </div>
              <div><label style={S.lbl}>Place of Birth *</label><input style={S.inp} type="text" placeholder="City, Country" value={form.place} onChange={inp("place")} onFocus={focus} onBlur={blur}/></div>
              <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{width:16,height:16,accentColor:C.gold,cursor:"pointer",marginTop:2}}/>
                <p style={{fontSize:12,color:C.creamDim,lineHeight:1.5}}>I consent to email storage for reading delivery.{" "}<span onClick={()=>setShowPrivacy(true)} style={{color:C.gold,cursor:"pointer",textDecoration:"underline"}}>Privacy Policy</span></p>
              </div>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button style={S.btn(false)} onClick={()=>go("welcome")}>Back</button>
                <button style={{...S.btn(),flex:1,opacity:canSubmit?1:.4,pointerEvents:canSubmit?"auto":"none"}} onClick={generate}>Generate My Compass</button>
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {phase==="loading"&&(
          <div style={{textAlign:"center",animation:"fadeUp .5s ease both"}}>
            <div style={{marginBottom:36}}><Compass size={90}/></div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:C.goldLight,animation:"pulse 2.5s ease-in-out infinite",fontStyle:"italic"}}>{loadMsgs[loadIdx]}</p>
            <p style={{fontSize:13,color:C.creamDim,marginTop:14,opacity:.5}}>This takes about 15 seconds</p>
          </div>
        )}

        {/* RESULTS */}
        {phase==="results"&&result&&(()=>{
          const {chart,reading} = result;
          return (
            <div style={{animation:"fadeUp .5s ease both"}}>
              <div style={{textAlign:"center",marginBottom:28}}>
                <div style={{...S.lbl,marginBottom:10}}>Your Karma Compass</div>
                <h2 style={{...S.h(32),marginBottom:14}}>{form.name||"Seeker"}<span style={{color:C.gold}}>'s</span> Reading</h2>
                <div style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center",marginBottom:10}}>
                  <span style={S.tag}>☽ {chart.moonRashi.sanskrit} ({chart.moonRashi.english})</span>
                  <span style={S.tag}>✦ {chart.nakshatra.name} · Pada {chart.pada}</span>
                  {chart.lagna&&<span style={S.tag}>↑ {chart.lagna.rashi.sanskrit} Lagna</span>}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center",marginBottom:18}}>
                  <span style={{...S.tag,fontSize:11,opacity:.65}}>☉ {chart.sunRashi.sanskrit}</span>
                  <span style={{...S.tag,fontSize:11,opacity:.65}}>Ruler: {chart.nakshatra.ruler}</span>
                  <span style={{...S.tag,fontSize:11,opacity:.65}}>Deity: {chart.nakshatra.deity}</span>
                </div>
                <p style={{...S.sub,maxWidth:480,margin:"0 auto",lineHeight:1.7}}>{reading.overview}</p>
              </div>

              {/* Archetype */}
              <div style={{...S.card(.1),textAlign:"center",marginBottom:20}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,fontWeight:500,color:C.gold,letterSpacing:".1em",textTransform:"uppercase",marginBottom:6}}>Your Dominant Archetype</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:300,color:C.cream,marginBottom:5}}>The {reading.archetype?.name}</div>
                <p style={{fontSize:14,color:C.creamDim,lineHeight:1.5}}>{reading.archetype?.brief}</p>
              </div>

              {/* Domain Cards */}
              {["career","relationships","spiritual","health"].map((key,i)=>(
                <div key={key} style={{...S.card(.15+i*.08),marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
                    {domainIcons[key]}
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:500,color:C.goldLight}}>{domainLabels[key]}</span>
                  </div>
                  <p style={{fontSize:14,color:C.cream,lineHeight:1.7,opacity:.85,marginBottom:12}}>{reading[key]?.insight}</p>
                  <div style={S.bar}/>
                  <div style={{display:"flex",gap:7}}>
                    <span style={{color:C.gold,fontSize:13}}>→</span>
                    <p style={{fontSize:13,color:C.goldLight,lineHeight:1.5,fontStyle:"italic"}}>{reading[key]?.action}</p>
                  </div>
                </div>
              ))}

              {/* Stoic */}
              <div style={{...S.card(.55),textAlign:"center",marginBottom:20,borderColor:"rgba(201,168,76,.25)",background:"rgba(201,168,76,.06)"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,fontWeight:500,color:C.gold,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>Stoic Reflection</div>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:300,color:C.cream,lineHeight:1.6,fontStyle:"italic"}}>"{reading.stoic}"</p>
              </div>

              {/* Calculation details */}
              <div style={{...S.card(.65),marginBottom:20,opacity:.5,padding:"14px 18px"}}>
                <p style={{fontSize:11,color:C.creamDim,lineHeight:1.6}}>
                  <span style={{color:C.gold,fontWeight:500}}>Engine:</span> {chart.engine} · Ayanamsa {chart.ayanamsa}° (Lahiri) · Moon {chart.moonDegree}° · Sun {chart.sunDegree}° sidereal
                  {!chart.hasTime&&" · No birth time — Nakshatra may shift near boundaries"}
                  {chart.hasTime&&!chart.hasCoords&&" · City not recognized — Lagna unavailable"}
                </p>
              </div>

              {/* CTA */}
              <div style={{...S.card(.7),textAlign:"center",background:"linear-gradient(135deg,rgba(201,168,76,.08),rgba(201,168,76,.02))",marginBottom:20}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:400,color:C.cream,marginBottom:6}}>Go Deeper</div>
                <p style={{fontSize:14,color:C.creamDim,lineHeight:1.6,marginBottom:16,maxWidth:380,margin:"0 auto 16px"}}>Full Vedic life report with Dasha periods, compatibility, career timing, and personalized spiritual practices.</p>
                <button style={{...S.btn(),fontSize:15,padding:"12px 32px"}}>Get Your Deep Reading</button>
                <p style={{fontSize:12,color:C.creamDim,marginTop:10,opacity:.4}}>Coming soon</p>
              </div>

              <div style={{display:"flex",justifyContent:"center"}}><button style={S.btn(false)} onClick={restart}>New Reading</button></div>

              <p style={{textAlign:"center",fontSize:11,color:C.creamDim,marginTop:28,opacity:.35,lineHeight:1.5}}>
                The Karma Compass · For spiritual reflection · Not professional advice · © {new Date().getFullYear()}{" "}
                <span onClick={()=>setShowPrivacy(true)} style={{color:C.gold,cursor:"pointer",textDecoration:"underline"}}>Privacy</span>
              </p>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
