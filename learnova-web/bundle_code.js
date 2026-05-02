const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'interview', 'page.tsx');
const routePath = path.join(__dirname, 'src', 'app', 'api', 'interview', 'route.ts');
const outPath = path.join(__dirname, 'mock_interview_code.md');

const pageContent = fs.readFileSync(pagePath, 'utf8');
const routeContent = fs.readFileSync(routePath, 'utf8');

const md = `# Mock Interview Complete Code

## Frontend Component (src/app/(dashboard)/interview/page.tsx)
\`\`\`tsx
${pageContent}
\`\`\`

## API Route (src/app/api/interview/route.ts)
\`\`\`typescript
${routeContent}
\`\`\`
`;

fs.writeFileSync(outPath, md, 'utf8');
console.log('SUCCESS: Written to mock_interview_code.md');
