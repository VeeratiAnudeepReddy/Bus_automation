export type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  amount?: number;
  createdAt: string;
};

const STORAGE_KEY = 'busqr_activities';

export function getActivities(): ActivityItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as ActivityItem[];
  } catch {
    return [];
  }
}

export function addActivity(activity: Omit<ActivityItem, 'id' | 'createdAt'>): void {
  if (typeof window === 'undefined') {
    return;
  }

  const existing = getActivities();
  const next: ActivityItem[] = [
    {
      ...activity,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    },
    ...existing
  ].slice(0, 30);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

