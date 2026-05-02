const https = require('https');
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SENTRY_ORG = process.env.SENTRY_ORG;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT;

async function getSentryIssues() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'sentry.io',
      path: `/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?query=is:unresolved&limit=5`,
      headers: { 'Authorization': `Bearer ${SENTRY_AUTH_TOKEN}` }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function analyzeAndFix(issue) {
  const body = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: `Analyser denne Sentry-feilen og foreslå en fix i JSON-format med feltene: analysis, fix, filename, priority (high/medium/low).\n\nFeil: ${issue.title}\nKulprit: ${issue.culprit}\nAntall: ${issue.count}` }]
  });
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const response = JSON.parse(data);
        const text = response.content[0].text;
        try { resolve(JSON.parse(text)); } catch { resolve({ analysis: text, fix: null, priority: 'low' }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function createGithubIssue(sentryIssue, aiAnalysis) {
  const bodyData = JSON.stringify({
    title: `[AI-Agent] Fix: ${sentryIssue.title}`,
    body: `## Sentry Issue\n**Feil:** ${sentryIssue.title}\n**Antall krasjer:** ${sentryIssue.count}\n**Prioritet:** ${aiAnalysis.priority}\n\n## AI Analyse\n${aiAnalysis.analysis}\n\n## Foreslått Fix\n\`\`\`\n${aiAnalysis.fix || 'Ingen automatisk fix'}\n\`\`\`\n\n*Automatisk generert av Sentry AI Agent*`,
    labels: ['ai-fix', 'bug']
  });
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/Tvenge-AI/Hundeparken/issues',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'User-Agent': 'Hundeparken-AI-Agent', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyData) }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(bodyData);
    req.end();
  });
}

async function main() {
  console.log('🤖 Hundeparken AI Agent starter...');
  const issues = await getSentryIssues();
  console.log(`📊 Fant ${issues.length} issues`);
  for (const issue of issues) {
    console.log(`🔍 Analyserer: ${issue.title}`);
    const aiAnalysis = await analyzeAndFix(issue);
    if (aiAnalysis.priority === 'high' || aiAnalysis.priority === 'medium') {
      const ghIssue = await createGithubIssue(issue, aiAnalysis);
      console.log(`📝 GitHub issue: ${ghIssue.html_url}`);
    }
  }
  console.log('🎉 Ferdig!');
}

main().catch(console.error);
