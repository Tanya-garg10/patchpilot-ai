import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SessionStatus, TestStatus, VerificationStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function sessionStatusLabel(status: SessionStatus): string {
  const map: Record<SessionStatus, string> = {
    open: 'Open',
    analyzing: 'Analyzing',
    analyzed: 'Analyzed',
    fix_ready: 'Fix Ready',
    fix_applied: 'Fix Applied',
    testing: 'Testing',
    verified: 'Verified',
    closed: 'Closed',
  };
  return map[status] ?? status;
}

export function sessionStatusColor(status: SessionStatus): string {
  switch (status) {
    case 'open': return 'text-yellow-400';
    case 'analyzing': return 'text-blue-400';
    case 'analyzed': return 'text-cyan-400';
    case 'fix_ready': return 'text-purple-400';
    case 'fix_applied': return 'text-orange-400';
    case 'testing': return 'text-blue-300';
    case 'verified': return 'text-green-400';
    case 'closed': return 'text-gray-500';
    default: return 'text-gray-400';
  }
}

export function testStatusLabel(status: TestStatus): string {
  const map: Record<TestStatus, string> = {
    suggested: 'Suggested',
    ready: 'Ready',
    executed: 'Executed',
    passed: 'Passed',
    failed: 'Failed',
    needs_verification: 'Needs Verification',
  };
  return map[status] ?? status;
}

export function testStatusColor(status: TestStatus): string {
  switch (status) {
    case 'suggested': return 'text-gray-400';
    case 'ready': return 'text-blue-400';
    case 'executed': return 'text-cyan-400';
    case 'passed': return 'text-green-400';
    case 'failed': return 'text-red-400';
    case 'needs_verification': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
}

export function verificationStatusLabel(status: VerificationStatus | null): string {
  if (!status) return 'Pending';
  const map: Record<VerificationStatus, string> = {
    verified: 'Verified',
    partially_verified: 'Partially Verified',
    needs_verification: 'Needs Verification',
    failed: 'Failed',
  };
  return map[status];
}

export function verificationStatusColor(status: VerificationStatus | null): string {
  switch (status) {
    case 'verified': return 'text-green-400';
    case 'partially_verified': return 'text-yellow-400';
    case 'needs_verification': return 'text-orange-400';
    case 'failed': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function confidenceColor(confidence: number): string {
  if (confidence >= 85) return 'text-green-400';
  if (confidence >= 65) return 'text-yellow-400';
  return 'text-red-400';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}
