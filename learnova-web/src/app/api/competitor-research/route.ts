import { createClient } from '@/lib/supabase/server';
import { chatWithFallback } from '@/lib/aiFallback';
import { searchWebMultiple } from '@/lib/searxng';
import { checkAndIncrementUsage, buildBlockedResponse } from '@/lib/rateLimit';
import { sanitizeString, sanitizeEnum, stripUnexpectedFields, checkBodySize } from '@/lib/validation';
import { THINKIOR_FULL_CONTEXT, FOUNDER_KNOWLEDGE } from '@/lib/thinkiorKnowledge';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: job } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('activity_type', 'competitor-research-job')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!job || job.metadata?.cleared) return NextResponse.json({ job: null });

    // Mark failed if stuck processing for > 2 mins
    if (job.metadata?.status === 'processing') {
      const age = Date.now() - new Date(job.created_at).getTime();
      if (age > 120000) {
        await supabase.from('activity_log').update({ metadata: { ...job.metadata, status: 'failed', error: 'Job timed out. Please try again.' } }).eq('id', job.id);
        return NextResponse.json({ job: { ...job, metadata: { ...job.metadata, status: 'failed' } } });
      }
    }

    return NextResponse.json({ job });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: job } = await supabase
      .from('activity_log')
      .select('id, metadata')
      .eq('user_id', session.user.id)
      .eq('activity_type', 'competitor-research-job')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (job) {
      await supabase.from('activity_log').update({ metadata: { ...job.metadata, cleared: true } }).eq('id', job.id);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to clear job' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Active Job Check ──────────────────────────────────────────────────
    const { data: activeJob } = await supabase
      .from('activity_log')
      .select('id, created_at')
      .eq('user_id', session.user.id)
      .eq('activity_type', 'competitor-research-job')
      .contains('metadata', { status: 'processing' })
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (activeJob) {
      const age = Date.now() - new Date(activeJob.created_at).getTime();
      if (age < 120000) {
        return NextResponse.json({ error: 'already_processing', message: 'Your competitor research is already processing.' }, { status: 429 });
      }
    }

    // ── Rate Limit ────────────────────────────────────────────────────────
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(
      session.user.id,
      'competitor-research',
      ipAddress
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    }

    // ── Parse + Validate Body ─────────────────────────────────────────────
    let rawBody: any = {};
    try { rawBody = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    if (!checkBodySize(rawBody, 50000)) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    const body = stripUnexpectedFields(rawBody, [
      'businessName', 'businessCategory', 'targetAudience',
      'keyProduct', 'usp', 'businessStage', 'marketScope',
    ]);

    const businessName     = sanitizeString((body as any).businessName as string, 100);
    const businessCategory = sanitizeString((body as any).businessCategory as string, 150);
    const targetAudience   = sanitizeString((body as any).targetAudience as string, 200);
    const keyProduct       = sanitizeString((body as any).keyProduct as string, 200);
    const usp              = sanitizeString(((body as any).usp as string) || '', 300);
    const businessStage    = sanitizeEnum(
      (body as any).businessStage,
      ['idea', 'early', 'growing', 'funded', 'enterprise'],
      'early'
    );
    const marketScope = sanitizeEnum(
      (body as any).marketScope,
      ['india', 'global', 'both'],
      'india'
    );

    if (!businessName || !businessCategory || !targetAudience || !keyProduct) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // ── Create Job ─────────────────────────────────────────────────────────
    const { data: jobRecord, error: jobError } = await supabase.from('activity_log').insert({
      user_id: session.user.id,
      activity_type: 'competitor-research-job',
      title: `Competitor Research — ${businessName} (${businessCategory})`,
      metadata: { status: 'processing', requestData: body }
    }).select('id').single();

    if (jobError || !jobRecord) {
      return NextResponse.json({ error: 'Failed to start research job' }, { status: 500 });
    }

    // Send immediate response so client can poll, BUT continue execution
    // Next.js on Vercel Node.js runtime generally allows promises to finish 
    // before the connection is completely killed if we do it in the same function,
    // though the most robust way is to just NOT return until done (if client waits).
    // Wait, if we DO return early, Vercel might kill it. 
    // So we will execute it inline, and if client times out, the server STILL finishes the job!
    const performResearch = async () => {
      try {

    // ── Build Search Queries ───────────────────────────────────────────────
    const currentYear = new Date().getFullYear();
    const searchQueries: string[] = [];

    if (marketScope === 'india' || marketScope === 'both') {
      searchQueries.push(
        `top ${businessCategory} startups India ${currentYear} competitors`,
        `best ${businessCategory} companies India market leaders ${currentYear}`,
        `${businessCategory} India market size funding ${currentYear}`,
        `${keyProduct} India competitors analysis ${currentYear}`,
      );
    }
    if (marketScope === 'global' || marketScope === 'both') {
      searchQueries.push(
        `top ${businessCategory} companies global ${currentYear}`,
        `best ${businessCategory} startups worldwide ${currentYear}`,
        `${keyProduct} global market competitors ${currentYear}`,
        `${businessCategory} market leaders world ${currentYear}`,
      );
    }
    searchQueries.push(
      `${businessCategory} market trends ${currentYear}`,
      `${businessCategory} gaps opportunities ${currentYear}`,
    );

    console.log('[CompetitorResearch] Running', searchQueries.length, 'search queries');
    const searchResults = await searchWebMultiple(searchQueries, 4);
    console.log('[CompetitorResearch] Got', searchResults.length, 'search results');

    const searchContext = searchResults.length > 0
      ? `LIVE WEB RESEARCH DATA:\n\n${searchResults
          .slice(0, 15)
          .map((r, i) => `[Source ${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`)
          .join('\n\n')}`
      : '';

    // ── Build AI Prompt ────────────────────────────────────────────────────
    const indians = marketScope !== 'global';
    const globals = marketScope !== 'india';

    const systemPrompt = `${THINKIOR_FULL_CONTEXT}
${FOUNDER_KNOWLEDGE}

You are Thinkior's Competitor Intelligence AI — a world-class business analyst and market researcher. You provide brutally honest, deeply researched, actionable competitor analysis for founders and business owners.

Your analysis must be based on the web search results provided. Use real company names, real data, real market information. Never make up companies or statistics.

CRITICAL: Respond with ONLY valid JSON. No markdown. No explanation. Start with { and end with }.`;

    const userMessage = `Analyze competitors for this business and return comprehensive research:

Business Details:
- Name: ${businessName}
- Category/Industry: ${businessCategory}
- Target Audience: ${targetAudience}
- Key Product/Service: ${keyProduct}
- Unique Selling Point: ${usp || 'Not specified'}
- Stage: ${businessStage}
- Market Scope: ${marketScope}

${searchContext}

Return this exact JSON structure (no markdown fences):
{
  "summary": "One sentence overview of the competitive landscape",
  "marketOverview": {
    "marketSize": "string",
    "trend": "Growing | Stable | Declining",
    "trendDetails": "string",
    "competitionLevel": "Low | Medium | High | Very High",
    "entryBarrier": "Low | Medium | High",
    "keyInsight": "string"
  },
  "indianCompetitors": ${indians ? `[
    {
      "rank": 1, "name": "string", "website": "string", "type": "string",
      "threatLevel": "High | Medium | Low", "founded": "string", "userBase": "string",
      "funding": "string", "revenueEstimate": "string", "teamSize": "string",
      "marketsServed": "string", "whatTheyDo": "string",
      "strengths": ["string","string","string","string"],
      "weaknesses": ["string","string","string"],
      "keyFeatures": ["string","string","string","string","string"],
      "pricingModel": "string", "targetAudience": "string",
      "marketingStrategy": "string", "whyTheyAreThreat": "string"
    }
  ]` : '[]'},
  "globalCompetitors": ${globals ? `[
    {
      "rank": 1, "name": "string", "website": "string", "type": "string",
      "threatLevel": "High | Medium | Low", "founded": "string", "userBase": "string",
      "funding": "string", "revenueEstimate": "string", "teamSize": "string",
      "marketsServed": "string", "whatTheyDo": "string",
      "strengths": ["string","string","string","string"],
      "weaknesses": ["string","string","string"],
      "keyFeatures": ["string","string","string","string","string"],
      "pricingModel": "string", "targetAudience": "string",
      "marketingStrategy": "string", "whyTheyAreThreat": "string"
    }
  ]` : '[]'},
  "comparisonTable": [
    {
      "feature": "Pricing",
      "userBusiness": { "value": "string", "status": "strong | moderate | weak | unknown" },
      "competitor1": { "value": "string", "status": "strong | moderate | weak | unknown" },
      "competitor2": { "value": "string", "status": "strong | moderate | weak | unknown" },
      "competitor3": { "value": "string", "status": "strong | moderate | weak | unknown" }
    }
  ],
  "marketGaps": [
    {
      "title": "string", "priority": "High | Medium | Low",
      "demandLevel": "Very High | High | Medium",
      "description": "string", "whyNotDone": "string",
      "howToImplement": "string", "estimatedImpact": "string"
    }
  ],
  "differentiationStrategy": {
    "intro": "string",
    "pillars": [
      { "icon": "🎯", "title": "string", "description": "string", "actionStep": "string" }
    ]
  },
  "nextSteps": [
    { "title": "string", "description": "string", "timeline": "string" }
  ],
  "sources": [
    { "title": "string", "url": "string" }
  ]
}

Include exactly 10 rows in comparisonTable for: Pricing, Mobile App, AI Features, Customer Support, Free Plan, API Access, Language Support, India Focus, User Experience, Content Quality. Include at least 4 marketGaps and 4 nextSteps.`;

    // ── Call AI ────────────────────────────────────────────────────────────
    const aiResult = await chatWithFallback(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      { maxTokens: 4000, temperature: 0.3, feature: 'competitor-research' }
    );

    if (!aiResult.text) {
      throw new Error('Research failed to return text.');
    }

    // ── Parse AI Response ─────────────────────────────────────────────────
    let researchData: any = null;
    try {
      const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) researchData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('[CompetitorResearch] JSON parse failed:', parseError);
      throw new Error('Failed to parse research results.');
    }

    if (!researchData) {
      throw new Error('No research data returned.');
    }

    // ── Save Result ───────────────────────────────────────────────────────
    await supabase.from('activity_log').update({
      metadata: {
        status: 'completed',
        requestData: body,
        result: researchData,
        provider: aiResult.provider,
        competitorsFound: (researchData.indianCompetitors?.length || 0) + (researchData.globalCompetitors?.length || 0),
      }
    }).eq('id', jobRecord.id);

    return { researchData, provider: aiResult.provider };
  } catch (err: any) {
    console.error('[CompetitorResearch] Job failed:', err.message);
    await supabase.from('activity_log').update({
      metadata: { status: 'failed', error: err.message, requestData: body }
    }).eq('id', jobRecord.id);
    return null;
  }
};

    // Wait for the research to finish (so we don't return early and risk Vercel killing it)
    // If the client drops the connection, Node.js will still run this to completion.
    const result = await performResearch();

    if (!result) {
      return NextResponse.json({ error: 'Research failed. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.researchData,
      provider: result.provider,
      rateLimitInfo: {
        remaining: rateLimitResult.remaining,
        isWarning: rateLimitResult.isWarning,
        warningMessage: rateLimitResult.warningMessage,
      },
      jobStatus: 'completed'
    });

  } catch (fatalError: any) {
    console.error('[CompetitorResearch] Fatal error:', fatalError.message);
    return NextResponse.json({ error: 'Research service unavailable. Please try again.' }, { status: 500 });
  }
}
