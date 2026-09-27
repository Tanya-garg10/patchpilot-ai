'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileCode,
  FlaskConical,
  Shield,
  Zap,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  getSession,
  saveSession,
  updateSessionStatus,
  applyAnalysis,
  applyFix,
  addActivity,
  getProjects,
} from '@/lib/store';
import { formatRelative, confidenceColor, sessionStatusLabel, sessionStatusColor } from '@/lib/utils';
import { DebugSession, Project, AnalysisResult, GeneratedFix } from '@/lib/types';
import { DemoProvider } from '@/lib/ai-provider';
import { SHOPSTACK_FILES } from '@/lib/demo-data';
import { DiffViewer } from '@/components/debug/DiffViewer';
import { FileTree } from '@/components/debug/FileTree';
import { CodeViewer } from '@/components/debug/CodeViewer';

type Stage = 'report' | 'reproduce' | 'analyze' | 'fix' | 'test' | 'verify';

const STAGES: { id: Stage; label: string; num: number }[] = [
  { id: 'report', label: 'Report', num: 1 },
  { id: 'reproduce', label: 'Reproduce', num: 2 },
  { id: 'analyze', label: 'Analyze', num: 3 },
  { id: 'fix', label: 'Fix', num: 4 },
  { id: 'test', label: 'Test', num: 5 },
  { id: 'verify', label: 'Verify', num: 6 },
];

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<DebugSession | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [stage, setStage] = useState<Stage>('report');
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingFix, setGeneratingFix] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [fixError, setFixError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const reload = useCallback(() => {
    const s = getSession(id);
    setSession(s ?? null);
    if (s) {
      const projects = getProjects();
      setProject(projects.find((p) => p.id === s.projectId) ?? null);
      // Auto-advance stage based on status
      if (s.status === 'verified') setStage('verify');
      else if (s.status === 'fix_applied' || s.status === 'testing') setStage('test');
      else if (s.status === 'fix_ready' || s.status === 'analyzed') setStage('fix');
      else if (s.status === 'analyzing') setStage('analyze');
    }
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  async function handleAnalyze() {
    if (!session) return;
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      updateSessionStatus(id, 'analyzing');
      addActivity({
        sessionId: id,
        projectId: session.projectId,
        type: 'analysis_started',
        description: 'AI analysis started',
        metadata: {},
      });
      reload();
      const provider = new DemoProvider();
      const result = await provider.analyze(session, SHOPSTACK_FILES);
      applyAnalysis(id, result);
      addActivity({
        sessionId: id,
        projectId: session.projectId,
        type: 'root_cause_identified',
        description: `Root cause identified (confidence: ${result.confidence}%)`,
        metadata: { confidence: result.confidence },
      });
      reload();
      setStage('analyze');
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
      updateSessionStatus(id, 'open');
      reload();
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleGenerateFix() {
    if (!session?.analysis) return;
    setGeneratingFix(true);
    setFixError(null);
    try {
      const provider = new DemoProvider();
      const fix = await provider.generateFix(session, session.analysis);
      const s = getSession(id)!;
      saveSession({ ...s, generatedFix: fix, status: 'fix_ready' });
      addActivity({
        sessionId: id,
        projectId: session.projectId,
        type: 'fix_generated',
        description: `Fix generated for ${fix.filesToChange.length} file(s)`,
        metadata: { files: fix.filesToChange },
      });
      reload();
      setStage('fix');
    } catch (err) {
      setFixError(err instanceof Error ? err.message : 'Fix generation failed');
    } finally {
      setGeneratingFix(false);
    }
  }

  function handleApplyFix() {
    if (!session?.generatedFix) return;
    applyFix(id, session.generatedFix);
    reload();
    setStage('test');
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner message="Loading session..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => router.push('/sessions')}>
            Sessions
          </Button>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span className="text-sm truncate font-medium" style={{ color: 'var(--text-primary)' }}>
            {session.title}
          </span>
          <span className={`text-xs font-medium ${sessionStatusColor(session.status)}`}>
            {sessionStatusLabel(session.status)}
          </span>
        </div>
        {/* Stage Nav */}
        <div className="flex items-center gap-1">
          {STAGES.map((s, i) => {
            const isActive = s.id === stage;
            const isPast =
              (s.id === 'report') ||
              (s.id === 'reproduce' && ['analyze','fix','test','verify'].includes(stage)) ||
              (s.id === 'analyze' && ['fix','test','verify'].includes(stage)) ||
              (s.id === 'fix' && ['test','verify'].includes(stage)) ||
              (s.id === 'test' && stage === 'verify');
            return (
              <button
                key={s.id}
                onClick={() => setStage(s.id)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
                style={{
                  color: isActive ? 'var(--accent)' : isPast ? 'var(--text-secondary)' : 'var(--text-muted)',
                  background: isActive ? 'var(--accent-glow)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {i > 0 && <ChevronRight size={10} style={{ opacity: 0.4 }} />}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Three-Column Workspace */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT — Bug Context */}
        <div
          className="w-72 flex-shrink-0 flex flex-col overflow-y-auto"
          style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
        >
          <BugContextPanel session={session} project={project} stage={stage} />
        </div>

        {/* CENTER — Code Intelligence */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {showDiff && session.generatedFix ? (
            <DiffPanel fix={session.generatedFix} onBack={() => setShowDiff(false)} />
          ) : (
            <CodePanel
              session={session}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
            />
          )}
        </div>

        {/* RIGHT — AI Debug Copilot */}
        <div
          className="w-80 flex-shrink-0 flex flex-col overflow-y-auto"
          style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
        >
          <AICopilotPanel
            session={session}
            stage={stage}
            analyzing={analyzing}
            generatingFix={generatingFix}
            analysisError={analysisError}
            fixError={fixError}
            onAnalyze={handleAnalyze}
            onGenerateFix={handleGenerateFix}
            onApplyFix={handleApplyFix}
            onShowDiff={() => setShowDiff(true)}
            onGoToTest={() => { setStage('test'); router.push(`/test-lab?session=${id}`); }}
            onGoToVerify={() => { setStage('verify'); router.push(`/sessions/${id}/verify`); }}
            onRetryAnalysis={() => { setAnalysisError(null); handleAnalyze(); }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Bug Context Panel ───────────────────────────────────────────

function BugContextPanel({ session, project, stage }: {
  session: DebugSession;
  project: Project | null;
  stage: Stage;
}) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
          Bug Context
        </div>
        <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{session.title}</div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {formatRelative(session.createdAt)}
        </div>
      </div>

      <Section title="Description">
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{session.bugReport}</p>
      </Section>

      {session.expectedBehavior && (
        <Section title="Expected Behavior">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{session.expectedBehavior}</p>
        </Section>
      )}

      {session.actualBehavior && (
        <Section title="Actual Behavior">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', color: '#ef4444' } as React.CSSProperties}>{session.actualBehavior}</p>
        </Section>
      )}

      {session.reproductionSteps.length > 0 && (
        <Section title="Reproduction Steps">
          <ol className="space-y-1.5">
            {session.reproductionSteps.map((step, i) => (
              <li key={i} className="flex gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex-shrink-0 font-medium" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {project && (
        <Section title="Project">
          <div className="space-y-1">
            <InfoRow label="Name" value={project.name} />
            <InfoRow label="Language" value={project.language} />
            <InfoRow label="Framework" value={project.framework} />
          </div>
        </Section>
      )}
    </div>
  );
}

// ─── Code Panel ──────────────────────────────────────────────────

function CodePanel({ session, selectedFile, onSelectFile }: {
  session: DebugSession;
  selectedFile: string | null;
  onSelectFile: (f: string) => void;
}) {
  const files = Object.keys(SHOPSTACK_FILES);
  const current = selectedFile ?? files[0] ?? '';
  const code = SHOPSTACK_FILES[current] ?? '';
  const suspicious = session.analysis?.suspiciousLines.filter(
    (l) => l.file === current
  ) ?? [];

  return (
    <div className="flex h-full">
      <FileTree
        files={files}
        selected={current}
        suspicious={session.analysis?.affectedFiles ?? []}
        onSelect={onSelectFile}
      />
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        {/* File header */}
        <div
          className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
        >
          <FileCode size={13} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs font-medium mono" style={{ color: 'var(--text-secondary)' }}>
            {current}
          </span>
          {session.analysis?.affectedFiles.includes(current) && (
            <span className="tag tag-orange ml-auto">Affected</span>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          <CodeViewer
            code={code}
            language="javascript"
            suspiciousLines={suspicious.map((l) => l.line)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Diff Panel ───────────────────────────────────────────────────

function DiffPanel({ fix, onBack }: { fix: GeneratedFix; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-3 px-4 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
      >
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} />} onClick={onBack}>
          Back to Code
        </Button>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Code Diff — {fix.filesToChange.join(', ')}
        </span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {fix.diffs.map((diff, i) => (
          <DiffViewer key={i} diff={diff} />
        ))}
      </div>
    </div>
  );
}

// ─── AI Copilot Panel ────────────────────────────────────────────

interface CopilotProps {
  session: DebugSession;
  stage: Stage;
  analyzing: boolean;
  generatingFix: boolean;
  analysisError: string | null;
  fixError: string | null;
  onAnalyze: () => void;
  onGenerateFix: () => void;
  onApplyFix: () => void;
  onShowDiff: () => void;
  onGoToTest: () => void;
  onGoToVerify: () => void;
  onRetryAnalysis: () => void;
}

function AICopilotPanel({
  session,
  stage,
  analyzing,
  generatingFix,
  analysisError,
  fixError,
  onAnalyze,
  onGenerateFix,
  onApplyFix,
  onShowDiff,
  onGoToTest,
  onGoToVerify,
  onRetryAnalysis,
}: CopilotProps) {
  const { analysis, generatedFix, fixApplied } = session;

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        AI Debug Copilot
      </div>

      {/* Status indicator */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md text-xs"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <Zap size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ color: 'var(--text-secondary)' }}>
          {analyzing ? 'Analyzing bug...' :
           generatingFix ? 'Generating fix...' :
           fixApplied ? 'Fix applied — ready for testing' :
           analysis ? 'Analysis complete' :
           'Ready to analyze'}
        </span>
        <span className="ml-auto tag tag-gray">Demo</span>
      </div>

      {/* Loading */}
      {(analyzing || generatingFix) && (
        <LoadingSpinner
          message={analyzing ? 'Running root cause analysis...' : 'Generating targeted fix...'}
        />
      )}

      {/* Analysis Error */}
      {analysisError && (
        <div
          className="flex items-start gap-2 px-3 py-2 rounded-md text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <AlertCircle size={12} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ color: '#ef4444' }}>{analysisError}</div>
            <button onClick={onRetryAnalysis} className="underline mt-1" style={{ color: 'var(--text-muted)' }}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Root Cause */}
      {analysis && !analyzing && (
        <>
          <CopilotCard
            icon={<AlertCircle size={14} />}
            title="Root Cause"
            color="#ef4444"
          >
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {analysis.rootCause}
            </p>
          </CopilotCard>

          <CopilotCard
            icon={<Info size={14} />}
            title="Why It Happens"
            color="#3b82d4"
          >
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {analysis.explanation}
            </p>
          </CopilotCard>

          <CopilotCard
            icon={<CheckCircle size={14} />}
            title="Recommended Fix"
            color="#22c55e"
          >
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {analysis.recommendedFix}
            </p>
          </CopilotCard>

          <div className="flex items-center justify-between text-xs">
            <span style={{ color: 'var(--text-muted)' }}>Confidence</span>
            <span className={`font-semibold ${confidenceColor(analysis.confidence)}`}>
              {analysis.confidence}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${analysis.confidence}%`,
                background: analysis.confidence >= 85 ? '#22c55e' : analysis.confidence >= 65 ? '#eab308' : '#ef4444',
              }}
            />
          </div>

          <CopilotCard icon={<FileCode size={14} />} title="Affected Files" color="#8b5cf6">
            {analysis.affectedFiles.map((f) => (
              <div key={f} className="text-xs mono" style={{ color: 'var(--text-secondary)' }}>{f}</div>
            ))}
          </CopilotCard>

          {analysis.risks.length > 0 && (
            <CopilotCard icon={<Shield size={14} />} title="Risks" color="#f97316">
              <ul className="space-y-1">
                {analysis.risks.map((r, i) => (
                  <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>·</span>{r}
                  </li>
                ))}
              </ul>
            </CopilotCard>
          )}

          {analysis.edgeCases.length > 0 && (
            <CopilotCard icon={<Info size={14} />} title="Edge Cases" color="#06b6d4">
              <ul className="space-y-1">
                {analysis.edgeCases.map((e, i) => (
                  <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>·</span>{e}
                  </li>
                ))}
              </ul>
            </CopilotCard>
          )}
        </>
      )}

      {/* Fix Details */}
      {generatedFix && !generatingFix && (
        <CopilotCard icon={<FileCode size={14} />} title="Generated Fix" color="#22c55e">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {generatedFix.explanation}
          </p>
          <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            Risk: {generatedFix.risk}
          </div>
        </CopilotCard>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-1">
        {!analysis && !analyzing && (
          <Button
            variant="primary"
            className="w-full"
            icon={<Zap size={13} />}
            loading={analyzing}
            onClick={onAnalyze}
          >
            Analyze Bug
          </Button>
        )}

        {analysis && !generatedFix && !generatingFix && (
          <Button
            variant="primary"
            className="w-full"
            icon={<FileCode size={13} />}
            loading={generatingFix}
            onClick={onGenerateFix}
          >
            Generate Fix
          </Button>
        )}

        {generatedFix && (
          <>
            <Button variant="secondary" className="w-full" icon={<FileCode size={13} />} onClick={onShowDiff}>
              Review Diff
            </Button>
            {!fixApplied && (
              <Button variant="success" className="w-full" icon={<CheckCircle size={13} />} onClick={onApplyFix}>
                Apply Fix
              </Button>
            )}
            {fixApplied && (
              <>
                <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-md" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <CheckCircle size={12} style={{ color: '#22c55e' }} />
                  <span style={{ color: '#22c55e' }}>Fix applied</span>
                </div>
                <Button variant="primary" className="w-full" icon={<FlaskConical size={13} />} onClick={onGoToTest}>
                  Generate Tests
                </Button>
              </>
            )}
          </>
        )}

        {analysis && (
          <Button
            variant="ghost"
            className="w-full"
            icon={<RotateCcw size={13} />}
            loading={analyzing}
            onClick={onAnalyze}
          >
            Re-analyze
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-xs mono" style={{ color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}

function CopilotCard({ title, icon, color, children }: {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-md p-3 space-y-2"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2" style={{ color }}>
        {icon}
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
