'use client';

import { useEffect, useState } from 'react';
import PageShell from '@/components/PageShell';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';
import { apiService } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function ReportModulePage({ moduleName }: { moduleName: string }) {
  const { isLoaded, ready, user, getToken } = useAppRole();
  const [rows, setRows] = useState<{ metric: string; value: number }[]>([]);
  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !ready || !user) return;
      const token = await getToken();
      if (!token) return;
      setRows((await apiService.getModuleReport(token, moduleName)).reports);
    };
    void load();
  }, [getToken, isLoaded, moduleName, ready, user]);
  return (
    <PageShell showTabs={false}>
      <PageHeader title={`${moduleName} report`} description="KPIs, filters, chart-ready rows, and CSV-compatible export endpoint." actions={[{ href: `/api/reports/${moduleName}?format=csv`, label: 'Export CSV' }]} />
      <section className="grid gap-2 md:grid-cols-4">{rows.map((row) => <MetricCard key={row.metric} label={row.metric} value={row.value} />)}</section>
    </PageShell>
  );
}
