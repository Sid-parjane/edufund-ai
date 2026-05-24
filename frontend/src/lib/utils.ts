import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    DEAD_LEAD: 'bg-gray-100 text-gray-500',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function getLeadCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    HIGH_QUALITY: 'bg-emerald-100 text-emerald-700',
    MEDIUM_QUALITY: 'bg-amber-100 text-amber-700',
    LOW_QUALITY: 'bg-red-100 text-red-700',
    UNSCORED: 'bg-gray-100 text-gray-600',
  };
  return colors[category] || 'bg-gray-100 text-gray-600';
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 45) return 'text-amber-600';
  return 'text-red-600';
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    DEAD_LEAD: 'Dead Lead',
  };
  return labels[status] || status;
}

export function getLeadCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    HIGH_QUALITY: 'High Quality',
    MEDIUM_QUALITY: 'Medium Quality',
    LOW_QUALITY: 'Low Quality',
    UNSCORED: 'Not Scored',
  };
  return labels[category] || category;
}
