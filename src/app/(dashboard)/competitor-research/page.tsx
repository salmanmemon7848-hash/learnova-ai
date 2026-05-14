'use client';
import { useState, useEffect } from 'react';

const STAGES = ['idea','early','growing','funded','enterprise'];
const STEPS = ['🔍 Searching the web...','📊 Analyzing market...','🏆 Identifying competitors...','📈 Researching features...','💡 Finding gaps...','✅ Preparing report...'];
const S: Record<string,React.CSSProperties> = {
  input: { width:'100%', padding:'10px 14px', borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'inherit', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' },
  label: { fontSize:'0.85rem', opacity:0.7, display:'block', marginBottom:6 },
  card: { background:'var(--surface,#13151e)', border:'1px solid var(--border,#2a2d3a)', borderRadius:12, padding:'20px 24px', marginBottom:16 },
};

export default function CompetitorResearchPage() {
  const [view, setView] = useState<'form'|'loading'|'results'>('form');
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [warn, setWarn] = useState('');
  const [form, setForm] = useState({ businessName:'', businessCategory:'', targetAudience:'', keyProduct:'', usp:'', businessStage:'early', marketScope:'india' as 'india'|'global'|'both' });
  const [isChecking, setIsChecking] = useState(true);

  // Poll for job status
  const pollJob = () => {
    const iv = setInterval(async () => {
      try {
        const res = await fetch('/api/competitor-research');
        const data = await res.json();
        if (data.job?.metadata?.status === 'completed') {
          clearInterval(iv);
          setResults(data.job.metadata.result);
          if (data.job.metadata.requestData) setForm(data.job.metadata.requestData);
          setView('results');
        } else if (data.job?.metadata?.status === 'failed') {
          clearInterval(iv);
          setError(data.job.metadata.error || 'Research failed.');
          setView('form');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 4000);
    return () => clearInterval(iv);
  };

  // Check on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/competitor-research');
        const data = await res.json();
        if (data.job?.metadata?.status === 'processing') {
          setView('loading');
          pollJob();
        } else if (data.job?.metadata?.status === 'completed' && (Date.now() - new Date(data.job.created_at).getTime() < 300000)) {
          // If recently completed (within 5 minutes), restore results
          setResults(data.job.metadata.result);
          if (data.job.metadata.requestData) setForm(data.job.metadata.requestData);
          setView('results');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsChecking(false);
      }
    };
    checkStatus();
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.businessName.trim()||!form.businessCategory.trim()||!form.targetAudience.trim()||!form.keyProduct.trim()) { setError('Please fill all required fields.'); return; }
    setError(''); setView('loading');
    let si = 0;
    const iv = setInterval(() => { si=(si+1)%STEPS.length; setStep(si); }, 3000);
    try {
      const res = await fetch('/api/competitor-research', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        clearInterval(iv);
        if (data.error === 'already_processing') {
          // It's already processing, just start polling
          pollJob();
          return;
        }
        setError(data.message || data.error || 'Research failed.');
        setView('form');
        return;
      }
      
      if (data.rateLimitInfo?.isWarning) setWarn(data.rateLimitInfo.warningMessage||'');
      
      // The backend might return processing status or complete status
      if (data.jobStatus === 'processing') {
        pollJob();
      } else {
        clearInterval(iv);
        setResults(data.data);
        setView('results');
      }
    } catch { 
      clearInterval(iv); 
      // Instead of failing entirely on connection error (which happens on timeout),
      // we assume the job is running in background and start polling.
      pollJob();
    }
  };

  if (isChecking) return <div style={{padding:40,textAlign:'center',opacity:0.5}}>Loading...</div>;

  if (view==='loading') return (
    <div className="page-container" style={{maxWidth:480,margin:'80px auto',padding:'0 16px',textAlign:'center'}}>
      <div style={{fontSize:'3rem',marginBottom:16}}>🔍</div>
      <h2 style={{marginBottom:8}}>Researching Competitors...</h2>
      <p style={{opacity:0.6,marginBottom:28,fontSize:'0.9rem'}}>Scanning the web and analyzing market data. This takes ~60 seconds. You can safely close or refresh this page.</p>
      <div className="result-card" style={S.card}>
        <p style={{fontSize:'1rem',marginBottom:16}}>{STEPS[step]}</p>
        <div style={{height:4,background:'rgba(255,255,255,0.1)',borderRadius:4,overflow:'hidden'}}>
          <div style={{height:'100%',borderRadius:4,background:'linear-gradient(90deg,#7c3aed,#a78bfa)',width:`${((step+1)/STEPS.length)*100}%`,transition:'width 0.5s ease'}}/>
        </div>
      </div>
    </div>
  );

  if (view==='results'&&results) return <Results results={results} form={form} warn={warn} onReset={async ()=>{
    setView('form');
    setResults(null);
    setWarn('');
    // Optionally clear the job by calling a DELETE or just ignore it
    await fetch('/api/competitor-research', { method: 'DELETE' });
  }} />;

  return (
    <div className="page-container" style={{maxWidth:680,margin:'0 auto',padding:'24px 16px'}}>
      <h1 style={{fontSize:'1.6rem',fontWeight:700,marginBottom:6}}>🔍 Competitor Research</h1>
      <p style={{opacity:0.6,marginBottom:24,fontSize:'0.9rem'}}>Discover what your competitors are doing — and what they are missing.</p>
      {error&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'10px 14px',marginBottom:16,color:'#ef4444',fontSize:'0.875rem'}}>{error}</div>}
      <div className="result-card" style={S.card}>
        {[{k:'businessName',l:'Business Name *',p:'e.g. Thinkior AI',max:100},{k:'businessCategory',l:'Business Category / Industry *',p:'e.g. EdTech, SaaS, Food Delivery',max:150},{k:'targetAudience',l:'Your Target Audience *',p:'e.g. College students in India',max:200},{k:'keyProduct',l:'Key Product or Service *',p:'e.g. AI-powered study platform',max:200},{k:'usp',l:'Unique Selling Point (optional)',p:'What makes you different?',max:300}].map(f=>(
          <div key={f.k} style={{marginBottom:16}}>
            <label style={S.label}>{f.l}</label>
            <input value={(form as any)[f.k]} onChange={set(f.k)} placeholder={f.p} maxLength={f.max} style={S.input}/>
          </div>
        ))}
        <div style={{marginBottom:16}}>
          <label style={S.label}>Business Stage</label>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:6}}>
            {STAGES.map(s=>(
              <button key={s} type="button" onClick={()=>setForm(p=>({...p,businessStage:s}))} style={{padding:'6px 14px',borderRadius:20,fontSize:'0.8rem',border:'1px solid',borderColor:form.businessStage===s?'rgba(124,58,237,0.8)':'rgba(255,255,255,0.15)',background:form.businessStage===s?'rgba(124,58,237,0.2)':'transparent',color:form.businessStage===s?'#a78bfa':'inherit',cursor:'pointer',textTransform:'capitalize'}}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:24}}>
          <label style={S.label}>Market Scope *</label>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
            {([['india','🇮🇳 India Only'],['global','🌍 Global Only'],['both','🌐 India + Global']] as const).map(([v,l])=>(
              <label key={v} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:8,cursor:'pointer',border:'1px solid',borderColor:form.marketScope===v?'rgba(124,58,237,0.6)':'rgba(255,255,255,0.1)',background:form.marketScope===v?'rgba(124,58,237,0.1)':'rgba(255,255,255,0.03)',fontSize:'0.875rem'}}>
                <input type="radio" name="scope" value={v} checked={form.marketScope===v} onChange={()=>setForm(p=>({...p,marketScope:v}))} style={{accentColor:'#7c3aed'}}/>{l}
              </label>
            ))}
          </div>
        </div>
        <button onClick={submit} style={{width:'100%',padding:'14px',borderRadius:10,background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',fontWeight:600,fontSize:'1rem',border:'none',cursor:'pointer'}}>
          🔍 Research My Competitors
        </button>
      </div>
    </div>
  );
}

function Results({ results, form, warn, onReset }: { results:any; form:any; warn:string; onReset:()=>void }) {
  const [tab, setTab] = useState<'indian'|'global'>('indian');
  const all = [...(results.indianCompetitors||[]),...(results.globalCompetitors||[])];
  const compList = form.marketScope==='both'?(tab==='indian'?results.indianCompetitors:results.globalCompetitors):(form.marketScope==='india'?results.indianCompetitors:results.globalCompetitors)||[];

  return (
    <div className="page-container" style={{maxWidth:900,margin:'0 auto',padding:'16px 16px 48px'}}>
      <button onClick={onReset} style={{background:'none',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'8px 16px',cursor:'pointer',color:'inherit',fontSize:'0.875rem',marginBottom:20}}>← New Research</button>
      {warn&&<div style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:8,padding:'10px 14px',marginBottom:16,color:'#f59e0b',fontSize:'0.875rem'}}>⚠️ {warn}</div>}

      {/* S1 Summary */}
      <div className="result-card" style={S.card}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
          <h2 style={{margin:0,fontSize:'1.4rem'}}>{form.businessName}</h2>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
          {[[form.businessCategory,'#7c3aed'],[form.marketScope==='india'?'🇮🇳 India':form.marketScope==='global'?'🌍 Global':'🌐 India+Global','#059669'],[new Date().toLocaleDateString('en-IN'),'#374151']].map(([t,c],i)=>(
            <span key={i} style={{padding:'3px 10px',borderRadius:16,fontSize:'0.75rem',background:`${c}22`,border:`1px solid ${c}44`}}>{t}</span>
          ))}
        </div>
        {results.summary&&<p style={{opacity:0.8,lineHeight:1.6,marginBottom:16}}>{results.summary}</p>}
        <div style={{display:'flex',gap:28,flexWrap:'wrap'}}>
          {[[all.length,'Competitors Found'],[(results.marketGaps||[]).length,'Market Gaps'],[(results.nextSteps||[]).length,'Action Steps']].map(([n,l],i)=>(
            <div key={i} style={{textAlign:'center'}}><div style={{fontSize:'1.8rem',fontWeight:700,color:'#7c3aed'}}>{n}</div><div style={{fontSize:'0.72rem',opacity:0.55}}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* S2 Market Overview */}
      {results.marketOverview&&(
        <div className="result-card" style={S.card}>
          <h3 style={{marginBottom:12}}>🌍 Market Overview</h3>
          {results.marketOverview.trendDetails&&<p style={{opacity:0.8,marginBottom:14,lineHeight:1.6}}>{results.marketOverview.trendDetails}</p>}
          <div className="competitor-results-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:12}}>
            {[['Market Size',results.marketOverview.marketSize],['Trend',results.marketOverview.trend],['Competition',results.marketOverview.competitionLevel],['Entry Barrier',results.marketOverview.entryBarrier]].filter(([,v])=>v).map(([l,v],i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'10px 12px'}}><div style={{fontSize:'0.72rem',opacity:0.55,marginBottom:4}}>{l}</div><div style={{fontSize:'0.9rem',fontWeight:600}}>{v}</div></div>
            ))}
          </div>
          {results.marketOverview.keyInsight&&<div style={{padding:'10px 14px',borderRadius:8,background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.2)',fontSize:'0.875rem'}}>💡 {results.marketOverview.keyInsight}</div>}
        </div>
      )}

      {/* S3 Competitors */}
      <div style={{marginBottom:4}}>
        <h3 style={{marginBottom:12}}>🏆 Top Competitors</h3>
        {form.marketScope==='both'&&(
          <div style={{display:'flex',gap:8,marginBottom:16}}>
            {[['indian','🇮🇳 Indian'],['global','🌍 Global']].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k as any)} style={{padding:'8px 18px',borderRadius:20,fontSize:'0.875rem',border:'1px solid',borderColor:tab===k?'rgba(124,58,237,0.8)':'rgba(255,255,255,0.15)',background:tab===k?'rgba(124,58,237,0.2)':'transparent',color:tab===k?'#a78bfa':'inherit',cursor:'pointer'}}>{l}</button>
            ))}
          </div>
        )}
        {(compList||[]).map((c: any,i: number)=><CompCard key={i} c={c}/>)}
      </div>

      {/* S4 Comparison Table */}
      {results.comparisonTable?.length>0&&(
        <div className="result-card" style={S.card}>
          <h3 style={{marginBottom:14}}>📊 Head-to-Head Comparison</h3>
          <div className="table-wrapper" style={{overflowX:'auto'}}>
            <table className="comparison-table" style={{width:'100%',borderCollapse:'collapse',fontSize:'0.83rem'}}>
              <thead><tr>
                <th style={TH}>Feature</th>
                <th style={{...TH,background:'rgba(124,58,237,0.12)'}}>You ({form.businessName})</th>
                {all.slice(0,3).map((c:any,i:number)=><th key={i} style={TH}>{c.name}</th>)}
              </tr></thead>
              <tbody>
                {results.comparisonTable.map((row:any,i:number)=>(
                  <tr key={i}>
                    <td style={TD}>{row.feature}</td>
                    <td style={{...TD,background:'rgba(124,58,237,0.06)'}}><CBadge s={row.userBusiness?.status} v={row.userBusiness?.value}/></td>
                    {[row.competitor1,row.competitor2,row.competitor3].map((c:any,j:number)=>c&&<td key={j} style={TD}><CBadge s={c.status} v={c.value}/></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{fontSize:'0.75rem',opacity:0.4,marginTop:10}}>🟢 Strong &nbsp; 🟡 Moderate &nbsp; 🔴 Weak &nbsp; ➖ Unknown</p>
        </div>
      )}

      {/* S5 Market Gaps */}
      {results.marketGaps?.length>0&&(
        <div className="result-card" style={S.card}>
          <h3 style={{marginBottom:6}}>💡 What Your Competitors Are Missing</h3>
          <p style={{opacity:0.6,fontSize:'0.85rem',marginBottom:16}}>These gaps give you a genuine competitive advantage.</p>
          {results.marketGaps.map((g:any,i:number)=>(
            <div key={i} style={{borderLeft:'3px solid #7c3aed',padding:'14px 14px 14px 18px',marginBottom:14,background:'rgba(124,58,237,0.04)',borderRadius:'0 8px 8px 0'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,flexWrap:'wrap'}}>
                <span style={{minWidth:24,height:24,borderRadius:'50%',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:700}}>{i+1}</span>
                <h4 style={{margin:0,fontSize:'0.95rem'}}>{g.title}</h4>
                <span style={{padding:'2px 8px',borderRadius:12,fontSize:'0.72rem',fontWeight:600,background:g.priority==='High'?'rgba(239,68,68,0.15)':g.priority==='Medium'?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',color:g.priority==='High'?'#ef4444':g.priority==='Medium'?'#f59e0b':'#10b981'}}>{g.priority} Priority</span>
              </div>
              <p style={{opacity:0.85,fontSize:'0.875rem',marginBottom:10}}>{g.description}</p>
              {[["Why competitors haven't done it",g.whyNotDone],['How you can implement it',g.howToImplement],['Estimated impact',g.estimatedImpact]].filter(([,v])=>v).map(([l,v],j)=>(
                <div key={j} style={{background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'8px 12px',marginTop:6,fontSize:'0.83rem'}}>
                  <strong style={{opacity:0.6}}>{l}:</strong><p style={{margin:'4px 0 0',opacity:0.85}}>{v}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* S6 Strategy */}
      {results.differentiationStrategy?.pillars?.length>0&&(
        <div className="result-card" style={S.card}>
          <h3 style={{marginBottom:8}}>🚀 Your Differentiation Strategy</h3>
          {results.differentiationStrategy.intro&&<p style={{opacity:0.8,marginBottom:16,lineHeight:1.6}}>{results.differentiationStrategy.intro}</p>}
          <div className="competitor-results-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
            {results.differentiationStrategy.pillars.map((p:any,i:number)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:16}}>
                <div style={{fontSize:'1.5rem',marginBottom:8}}>{p.icon}</div>
                <h4 style={{margin:'0 0 8px',fontSize:'0.95rem'}}>{p.title}</h4>
                <p style={{opacity:0.75,fontSize:'0.85rem',marginBottom:10}}>{p.description}</p>
                {p.actionStep&&<div style={{background:'rgba(124,58,237,0.1)',borderRadius:6,padding:'6px 10px',fontSize:'0.8rem'}}><strong>Action:</strong> {p.actionStep}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* S7 Next Steps */}
      {results.nextSteps?.length>0&&(
        <div className="result-card" style={S.card}>
          <h3 style={{marginBottom:14}}>✅ Your Next Steps</h3>
          {results.nextSteps.map((s:any,i:number)=>(
            <div key={i} style={{display:'flex',gap:14,alignItems:'flex-start',padding:'12px 0',borderBottom:i<results.nextSteps.length-1?'1px solid rgba(255,255,255,0.06)':'none'}}>
              <span style={{minWidth:28,height:28,borderRadius:'50%',background:'rgba(124,58,237,0.2)',border:'1px solid rgba(124,58,237,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,flexShrink:0}}>{i+1}</span>
              <div><strong style={{fontSize:'0.9rem'}}>{s.title}</strong><p style={{opacity:0.75,fontSize:'0.85rem',margin:'4px 0'}}>{s.description}</p>{s.timeline&&<span style={{fontSize:'0.75rem',opacity:0.5}}>⏱️ {s.timeline}</span>}</div>
            </div>
          ))}
        </div>
      )}

      {/* S8 Sources */}
      {results.sources?.length>0&&(
        <div className="result-card" style={S.card}>
          <h3 style={{marginBottom:8}}>🔗 Research Sources</h3>
          <p style={{opacity:0.5,fontSize:'0.78rem',marginBottom:12}}>Data gathered from live web search via SearXNG</p>
          {results.sources.map((s:any,i:number)=>(
            <div key={i} style={{display:'flex',gap:10,padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.05)',fontSize:'0.82rem'}}>
              <span style={{opacity:0.4,minWidth:20}}>{i+1}.</span>
              <div><p style={{margin:0,opacity:0.8}}>{s.title}</p>{s.url&&<a href={s.url} target="_blank" rel="noopener noreferrer" style={{opacity:0.4,fontSize:'0.75rem',wordBreak:'break-all'}}>{s.url}</a>}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompCard({ c }: { c: any }) {
  const [exp, setExp] = useState(false);
  const tc = c.threatLevel==='High'?'#ef4444':c.threatLevel==='Medium'?'#f59e0b':'#10b981';
  return (
    <div className="result-card" style={{...S.card,marginBottom:12}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:10}}>
        <div style={{minWidth:36,height:36,borderRadius:'50%',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0}}>#{c.rank}</div>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
            <h3 style={{margin:0,fontSize:'1rem'}}>{c.name}</h3>
            <span style={{padding:'2px 8px',borderRadius:12,fontSize:'0.72rem',fontWeight:600,background:`${tc}22`,color:tc}}>{c.threatLevel} Threat</span>
          </div>
          {c.website&&<a href={c.website} target="_blank" rel="noopener noreferrer" style={{fontSize:'0.78rem',opacity:0.5}}>🔗 {c.website}</a>}
        </div>
        <button onClick={()=>setExp(!exp)} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:'0.8rem',color:'inherit',flexShrink:0}}>{exp?'▲ Less':'▼ More'}</button>
      </div>
      {c.whatTheyDo&&<p style={{opacity:0.8,fontSize:'0.875rem',marginBottom:12,lineHeight:1.5}}>{c.whatTheyDo}</p>}
      <div className="competitor-results-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:6,marginBottom:12,background:'rgba(255,255,255,0.03)',borderRadius:8,padding:10}}>
        {[['📅 Founded',c.founded],['👥 Users',c.userBase],['💰 Funding',c.funding],['💵 Revenue',c.revenueEstimate],['🌍 Markets',c.marketsServed],['👨‍💼 Team',c.teamSize]].filter(([,v])=>v).map(([l,v],i)=>(
          <div key={i} style={{fontSize:'0.78rem',opacity:0.75}}>{l}: <strong>{v}</strong></div>
        ))}
      </div>
      {exp&&(
        <>
          <div className="two-col-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div style={{background:'rgba(16,185,129,0.06)',borderRadius:8,padding:12}}><h4 style={{margin:'0 0 8px',fontSize:'0.85rem',color:'#10b981'}}>💪 Strengths</h4>{c.strengths?.map((s:string,i:number)=><div key={i} style={{fontSize:'0.82rem',marginBottom:4}}>✅ {s}</div>)}</div>
            <div style={{background:'rgba(239,68,68,0.06)',borderRadius:8,padding:12}}><h4 style={{margin:'0 0 8px',fontSize:'0.85rem',color:'#ef4444'}}>⚠️ Weaknesses</h4>{c.weaknesses?.map((w:string,i:number)=><div key={i} style={{fontSize:'0.82rem',marginBottom:4}}>❌ {w}</div>)}</div>
          </div>
          {c.keyFeatures?.length>0&&<div style={{marginBottom:10}}><h4 style={{fontSize:'0.85rem',marginBottom:8}}>🔧 Key Features</h4><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{c.keyFeatures.map((f:string,i:number)=><span key={i} style={{padding:'3px 10px',borderRadius:16,fontSize:'0.78rem',background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.3)'}}>{f}</span>)}</div></div>}
          {c.pricingModel&&<div style={{fontSize:'0.83rem',marginBottom:6,opacity:0.8}}><strong>💳 Pricing:</strong> {c.pricingModel}</div>}
          {c.marketingStrategy&&<div style={{fontSize:'0.83rem',marginBottom:6,opacity:0.8}}><strong>📣 Marketing:</strong> {c.marketingStrategy}</div>}
          {c.whyTheyAreThreat&&<div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:8,padding:'10px 12px',fontSize:'0.83rem',marginTop:8}}><strong>⚡ Why they threaten you:</strong><p style={{margin:'4px 0 0',opacity:0.85}}>{c.whyTheyAreThreat}</p></div>}
        </>
      )}
    </div>
  );
}

const TH: React.CSSProperties = { padding:'10px 12px', textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.1)', fontSize:'0.82rem', whiteSpace:'nowrap' };
const TD: React.CSSProperties = { padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)', fontSize:'0.82rem' };

function CBadge({ s, v }: { s:string; v:string }) {
  const m: Record<string,{bg:string;color:string}> = { strong:{bg:'rgba(16,185,129,0.15)',color:'#10b981'}, moderate:{bg:'rgba(245,158,11,0.15)',color:'#f59e0b'}, weak:{bg:'rgba(239,68,68,0.15)',color:'#ef4444'}, unknown:{bg:'rgba(255,255,255,0.08)',color:'inherit'} };
  const c = m[s]||m.unknown;
  return <span style={{padding:'2px 8px',borderRadius:12,fontSize:'0.75rem',background:c.bg,color:c.color}}>{v||'—'}</span>;
}
