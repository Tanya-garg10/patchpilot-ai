'use client';

import { Suspense } from 'react';
import TestLabContent from './TestLabClient';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function TestLabPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading Test Lab..." />}>
      <TestLabContent />
    </Suspense>
  );
}
