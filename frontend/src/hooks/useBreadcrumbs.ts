import { useLocation } from 'react-router-dom';
import type { Crumb } from '@/components/custom/XBreadcrumb';

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  search: 'Search',
  task: 'Task',

  'ai-automation': 'AI Automation',
  template: 'Template',
  lead: 'Lead',

  settings: 'Settings',
  profile: 'Profile',
};

export function useBreadcrumbs(): Crumb[] {
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs: Crumb[] = [];

  // Only prepend Dashboard if first segment is NOT dashboard
  if (!segments[0] || segments[0] !== 'dashboard') {
    breadcrumbs.push({ label: 'Dashboard', link: '/dashboard' });
  }

  segments.forEach((segment, index) => {
    const link = '/' + segments.slice(0, index + 1).join('/');

    if (/^\d+$/.test(segment)) {
      breadcrumbs.push({ label: 'Details', link });
      return;
    }

    // Avoid duplicate if first segment is dashboard
    if (index === 0 && segment === 'dashboard' && breadcrumbs.length === 0) {
      breadcrumbs.push({ label: 'Dashboard', link });
      return;
    }

    breadcrumbs.push({
      label:
        BREADCRUMB_MAP[segment] ??
        segment
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      link,
    });
  });

  return breadcrumbs;
}
