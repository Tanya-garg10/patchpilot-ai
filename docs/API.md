# PatchPilot API Reference

## AI Provider API

### AIProvider Interface

```typescript
interface AIProvider {
  name: string;
  analyze(session: DebugSession, sourceFiles: Record<string, string>): Promise<AnalysisResult>;
  generateFix(session: DebugSession, analysis: AnalysisResult): Promise<GeneratedFix>;
}
```

### AnalysisResult

```typescript
interface AnalysisResult {
  rootCause: string;          // Human-readable root cause
  confidence: number;         // 0–100 confidence score
  affectedFiles: string[];    // Files implicated in the bug
  suspiciousLines: SuspiciousLine[];  // Specific lines with reasons
  explanation: string;        // Detailed explanation
  recommendedFix: string;     // High-level fix description
  risks: string[];            // Risk factors
  edgeCases: string[];        // Edge cases to consider
}
```

### GeneratedFix

```typescript
interface GeneratedFix {
  problem: string;
  rootCause: string;
  filesToChange: string[];
  explanation: string;
  risk: string;
  edgeCases: string[];
  verificationPlan: string[];
  diffs: FileDiff[];         // Before/after for each changed file
}
```

### FileDiff

```typescript
interface FileDiff {
  file: string;
  before: string;
  after: string;
  explanation: string;
}
```

---

## Store API (lib/store.ts)

All functions operate on browser `localStorage`. Client-side only.

### Projects

```typescript
getProjects(): Project[]
saveProject(project: Project): void
deleteProject(id: string): void
```

### Debug Sessions

```typescript
getSessions(): DebugSession[]
getSession(id: string): DebugSession | undefined
saveSession(session: DebugSession): void
createSession(
  projectId: string,
  title: string,
  bugReport: string,
  expectedBehavior: string,
  actualBehavior: string,
  reproductionSteps: string[]
): DebugSession
updateSessionStatus(id: string, status: SessionStatus): void
applyAnalysis(id: string, analysis: AnalysisResult): void
applyFix(id: string, fix: GeneratedFix): void
setVerification(id: string, status: VerificationStatus): void
```

### Test Cases

```typescript
getTestCases(sessionId?: string): TestCase[]
saveTestCase(tc: TestCase): void
createTestCase(
  sessionId: string,
  name: string,
  description: string,
  code: string
): TestCase
executeTestCase(id: string, passed: boolean, result: string): void
```

### Activity

```typescript
getActivity(sessionId?: string): ActivityEvent[]
addActivity(event: Omit<ActivityEvent, 'id' | 'createdAt'>): ActivityEvent
```

### Metrics

```typescript
getMetrics(sessionId?: string): WorkflowMetric[]
saveMetric(metric: WorkflowMetric): void
```

### Utility

```typescript
clearAll(): void  // Wipes all localStorage data
```

---

## Demo Data API (lib/demo-data.ts)

Constants used by the ShopStack demo:

```typescript
SHOPSTACK_PROJECT_ID: string        // 'shopstack-demo-001'
SHOPSTACK_PROJECT: Project          // ShopStack project fixture
SHOPSTACK_FILES: Record<string, string>  // Source files keyed by path
DEMO_BUG_SESSION_ID: string         // Fixed session ID for demo
DEMO_BUG_REPORT: Omit<DebugSession, 'id'>  // Bug report fixture
DEMO_ANALYSIS: AnalysisResult       // DemoProvider analysis result
DEMO_FIX: GeneratedFix              // DemoProvider generated fix
DEMO_TEST_CASES: Array<{name, description, code}>  // 6 test scenarios
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_PROVIDER` | No | `demo` (default) or `external` |
| `AI_PROVIDER_API_KEY` | When `external` | API key for external AI provider |
| `AI_PROVIDER_ENDPOINT` | When `external` | Endpoint URL |
| `AI_PROVIDER_MODEL` | When `external` | Model identifier |

> Never commit `.env.local` to source control. Secret values are never displayed in the UI.

---

## Data Models

See `lib/types.ts` for complete TypeScript definitions of all core models:

- `Project`
- `DebugSession`
- `TestCase`
- `ActivityEvent`
- `WorkflowMetric`
- `AnalysisResult`
- `GeneratedFix`
- `FileDiff`
- `SuspiciousLine`

Status enums: `SessionStatus`, `TestStatus`, `VerificationStatus`, `ActivityEventType`
