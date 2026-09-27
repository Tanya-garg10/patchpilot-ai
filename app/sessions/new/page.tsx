'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { createSession, getProjects, saveProject } from '@/lib/store';
import { SHOPSTACK_PROJECT } from '@/lib/demo-data';

export default function NewSessionPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [bugReport, setBugReport] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [steps, setSteps] = useState(['']);
  const [submitting, setSubmitting] = useState(false);

  function addStep() { setSteps([...steps, '']); }
  function removeStep(i: number) { setSteps(steps.filter((_, idx) => idx !== i)); }
  function updateStep(i: number, v: string) {
    const s = [...steps]; s[i] = v; setSteps(s);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !bugReport.trim()) return;
    setSubmitting(true);
    try {
      let projects = getProjects();
      if (!projects.find((p) => p.id === SHOPSTACK_PROJECT.id)) {
        saveProject(SHOPSTACK_PROJECT);
        projects = getProjects();
      }
      const projectId = projects[0]?.id ?? SHOPSTACK_PROJECT.id;
      const session = createSession(
        projectId,
        title.trim(),
        bugReport.trim(),
        expectedBehavior.trim(),
        actualBehavior.trim(),
        steps.filter((s) => s.trim())
      );
      router.push(`/sessions/${session.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text-primary)',
    padding: '8px 12px',
    fontSize: 13,
    width: '100%',
    outline: 'none',
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => router.back()}>
          Back
        </Button>
      </div>
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>New Debug Session</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Describe the bug to start the debug workflow.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader title="Bug Report" />
          <CardBody className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Title *
              </label>
              <input
                style={inputStyle}
                placeholder="e.g. Cart total becomes negative after removing the last item"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Bug Description *
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                placeholder="Describe the bug in detail..."
                value={bugReport}
                onChange={(e) => setBugReport(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Expected Behavior
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                placeholder="What should happen?"
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Actual Behavior
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                placeholder="What actually happens?"
                value={actualBehavior}
                onChange={(e) => setActualBehavior(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Reproduction Steps"
            actions={
              <Button variant="ghost" size="sm" icon={<Plus size={13} />} type="button" onClick={addStep}>
                Add Step
              </Button>
            }
          />
          <CardBody className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs flex-shrink-0 w-5 text-right" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder={`Step ${i + 1}`}
                  value={step}
                  onChange={(e) => updateStep(i, e.target.value)}
                />
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(i)} style={{ color: 'var(--text-muted)' }}>
                    <Minus size={13} />
                  </button>
                )}
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            Create Session
          </Button>
        </div>
      </form>
    </div>
  );
}
