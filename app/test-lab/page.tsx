import { Suspense } from 'react';
import TestLabClient from './TestLabClient';

export default function TestLabPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full p-16">
        <div className="animate-spin rounded-full w-6 h-6 border-2" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    }>
      <TestLabClient />
    </Suspense>
  );
}
