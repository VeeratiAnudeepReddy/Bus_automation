'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowDownLeft,
  BarChart3,
  Bus,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Download,
  FileText,
  Filter,
  Fuel,
  MapPin,
  PieChart,
  Receipt,
  RefreshCcw,
  Search,
  Settings2,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  type LucideIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { apiService, BusItem, FareRuleItem } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { useAppRole } from '@/lib/useAppRole';

type ModuleKind =
  | 'finance'
  | 'payments'
  | 'refunds'
  | 'pricing'
  | 'pricingHistory'
  | 'pricingNew'
  | 'pricingSimulator'
  | 'coupons'
  | 'couponNew'
  | 'couponDetail'
  | 'reports'
  | 'audit'
  | 'fleet'
  | 'superAdmin'
  | 'paymentNew'
  | 'paymentDetail';

type Metric = { label: string; value: string | number; hint?: string; icon: LucideIcon; tone?: string };
type Row = { id: string; title: string; subtitle?: string; amount?: number; status?: string; href?: string; metadata?: string };
type ModuleData = {
  title: string;
  eyebrow: string;
  description: string;
  metrics: Metric[];
  rows: Row[];
  chart: { label: string; value: number }[];
  secondary: Row[];
  mapLabel?: string;
};

const toneClass: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-sky-50 text-sky-700 border-sky-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  gray: 'bg-zinc-100 text-zinc-700 border-zinc-200'
};

function statusTone(status?: string) {
  const value = String(status || '').toLowerCase();
  if (['captured', 'completed', 'active', 'approved', 'success', 'processed'].includes(value)) return 'green';
  if (['running', 'authorized', 'published'].includes(value)) return 'blue';
  if (['pending', 'created', 'requested', 'draft'].includes(value)) return 'yellow';
  if (['maintenance', 'processing', 'overdue'].includes(value)) return 'orange';
  if (['failed', 'rejected', 'cancelled', 'suspended'].includes(value)) return 'red';
  return 'gray';
}

function valueOf(item: unknown, key: string): unknown {
  return item && typeof item === 'object' ? (item as Record<string, unknown>)[key] : undefined;
}

function stringOf(item: unknown, key: string, fallback = '') {
  const value = valueOf(item, key);
  return value == null ? fallback : String(value);
}

function numberOf(item: unknown, key: string, fallback = 0) {
  const value = Number(valueOf(item, key));
  return Number.isFinite(value) ? value : fallback;
}

function MiniAreaChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  const points = data.map((item, index) => {
    const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
    const y = 100 - (item.value / max) * 82 - 8;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-950">Trend</h2>
        <BarChart3 size={18} className="text-zinc-500" />
      </div>
      <svg viewBox="0 0 100 100" className="mt-4 h-48 w-full overflow-visible">
        <polyline points={`0,100 ${points} 100,100`} fill="rgba(24,24,27,0.08)" stroke="none" />
        <polyline points={points} fill="none" stroke="#18181b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => (
          <g key={`${item.label}-${index}`}>
            <rect x={index * (100 / Math.max(1, data.length)) + 1} y={100 - (item.value / max) * 75} width={Math.max(4, 70 / Math.max(1, data.length))} height={(item.value / max) * 75} rx="2" fill="rgba(24,24,27,0.16)" />
          </g>
        ))}
      </svg>
      <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-zinc-500">
        {data.slice(0, 4).map((item) => <span key={item.label}>{item.label}</span>)}
      </div>
    </div>
  );
}

function DonutChart({ data }: { data: { label: string; value: number }[] }) {
  const total = Math.max(1, data.reduce((sum, item) => sum + item.value, 0));
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-950">Distribution</h2>
        <PieChart size={18} className="text-zinc-500" />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="flex h-44 w-44 items-center justify-center rounded-full bg-[conic-gradient(#18181b_0_40%,#71717a_40%_68%,#d4d4d8_68%_100%)]">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-lg font-semibold">{total}</div>
        </div>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm"><span>{item.label}</span><strong>{Math.round((item.value / total) * 100)}%</strong></div>
              <div className="mt-1 h-2 rounded-full bg-zinc-100"><div className="h-2 rounded-full bg-zinc-950" style={{ width: `${(item.value / total) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapCard({ label = 'Live operations map' }: { label?: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between p-5">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">{label}</h2>
          <p className="text-sm text-zinc-500">Google Maps embed with route, bus, stop, and ETA context when backend data is available.</p>
        </div>
        <MapPin size={18} className="text-zinc-500" />
      </div>
      <iframe title={label} src="https://www.google.com/maps?q=Hyderabad%20bus%20routes&z=12&output=embed" className="h-72 w-full border-0" loading="lazy" />
    </div>
  );
}

function EnterpriseTable({ rows, title }: { rows: Row[]; title: string }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => rows
    .filter((row) => status === 'all' || row.status === status)
    .filter((row) => `${row.title} ${row.subtitle || ''} ${row.status || ''}`.toLowerCase().includes(query.toLowerCase())), [query, rows, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const visible = filtered.slice((page - 1) * 8, page * 8);
  const statuses = Array.from(new Set(rows.map((row) => row.status).filter(Boolean))) as string[];

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
            <p className="text-sm text-zinc-500">Search, filter, paginate, export, and inspect records.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2">
              <Search size={16} className="text-zinc-500" />
              <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search table" className="w-44 bg-transparent text-sm outline-none" />
            </div>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
              <option value="all">All statuses</option>
              {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm"><Filter size={16} /> Columns</button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm"><Download size={16} /> Export</button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="sticky top-0 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Record</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Metadata</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-t border-zinc-100">
                <td className="px-5 py-4">
                  <p className="font-medium text-zinc-950">{row.title}</p>
                  {row.subtitle ? <p className="text-xs text-zinc-500">{row.subtitle}</p> : null}
                </td>
                <td className="px-5 py-4"><span className={`rounded-full border px-2 py-1 text-xs ${toneClass[statusTone(row.status)]}`}>{row.status || 'open'}</span></td>
                <td className="px-5 py-4">{row.amount != null ? formatCurrency(row.amount) : '—'}</td>
                <td className="px-5 py-4 text-zinc-500">{row.metadata || 'Live backend record'}</td>
                <td className="px-5 py-4 text-right">{row.href ? <Link href={row.href} className="font-medium text-zinc-950">View</Link> : <button className="font-medium text-zinc-950">Open drawer</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visible.length ? <div className="p-8 text-center"><p className="font-medium text-zinc-950">No matching records</p><p className="mt-1 text-sm text-zinc-500">Adjust filters or create/import data from the module action bar.</p></div> : null}
      <div className="flex items-center justify-between border-t border-zinc-200 p-4 text-sm">
        <span className="text-zinc-500">Page {page} of {pages}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-lg border border-zinc-200 px-3 py-1">Prev</button>
          <button onClick={() => setPage((prev) => Math.min(pages, prev + 1))} className="rounded-lg border border-zinc-200 px-3 py-1">Next</button>
        </div>
      </div>
    </section>
  );
}

function DetailDrawer({ row }: { row?: Row | null }) {
  return (
    <aside className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Details drawer</h2>
      {row ? (
        <div className="mt-4 space-y-3 text-sm">
          <p className="rounded-2xl bg-zinc-50 p-3"><strong>{row.title}</strong><br />{row.subtitle}</p>
          <p className="rounded-2xl bg-zinc-50 p-3">Timeline, history, documents, audit, and notes appear here when opened.</p>
          <button className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white">Open full details</button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">Select a record to view timeline, receipt, invoice, approval, documents, or audit data.</p>
      )}
    </aside>
  );
}

async function loadModuleData(kind: ModuleKind, token: string): Promise<ModuleData> {
  if (kind === 'finance') {
    const finance = await apiService.getFinanceDashboard(token);
    const stats = finance.stats || {};
    return {
      eyebrow: 'Finance',
      title: 'Finance Overview',
      description: 'Revenue, collections, wallet, gateway, refunds, settlements, invoices, and reconciliation.',
      metrics: [
        { label: 'Revenue', value: formatCurrency(stats.revenue || stats.ledgerRevenue || 0), icon: TrendingUp, tone: 'green' },
        { label: 'Gateway', value: formatCurrency(stats.gatewayRevenue || 0), icon: CircleDollarSign, tone: 'blue' },
        { label: 'Wallet', value: formatCurrency(stats.walletRevenue || stats.walletBalance || 0), icon: Wallet, tone: 'yellow' },
        { label: 'Refunds', value: formatCurrency(stats.refunds || stats.refundLedger || 0), icon: RefreshCcw, tone: 'red' }
      ],
      rows: finance.recentPayments.map((payment) => ({ id: payment._id, title: payment.razorpayOrderId, subtitle: payment.razorpayPaymentId || payment.paymentMethod, amount: payment.amount, status: payment.status, href: `/payments/${payment._id}`, metadata: payment.currency })),
      chart: Object.entries(stats).slice(0, 6).map(([label, value]) => ({ label, value: Number(value) || 0 })),
      secondary: finance.topRoutes.map(([route, amount]) => ({ id: route, title: route, amount, status: 'completed' })),
      mapLabel: 'Collection geography'
    };
  }

  if (kind === 'payments' || kind === 'paymentDetail') {
    const { payments } = await apiService.listPayments(token);
    return {
      eyebrow: 'Payments',
      title: 'Payment Center',
      description: 'Gateway, wallet, booking, receipt, invoice, refund, status timeline, and reconciliation center.',
      metrics: [
        { label: "Today's payments", value: payments.length, icon: Receipt, tone: 'blue' },
        { label: 'Successful', value: payments.filter((p) => p.status === 'captured').length, icon: CheckCircle2, tone: 'green' },
        { label: 'Pending', value: payments.filter((p) => ['pending', 'created', 'authorized'].includes(p.status)).length, icon: Clock, tone: 'yellow' },
        { label: 'Failed', value: payments.filter((p) => p.status === 'failed').length, icon: AlertTriangle, tone: 'red' }
      ],
      rows: payments.map((payment) => ({ id: payment._id, title: payment.razorpayOrderId, subtitle: payment.bookingId || payment.paymentMethod, amount: payment.amount, status: payment.status, href: `/payments/${payment._id}`, metadata: payment.razorpayPaymentId || payment.currency })),
      chart: payments.slice(0, 8).map((payment, index) => ({ label: `P${index + 1}`, value: payment.amount || 0 })),
      secondary: payments.filter((p) => p.status !== 'captured').map((payment) => ({ id: payment._id, title: payment.razorpayOrderId, amount: payment.amount, status: payment.status })),
      mapLabel: 'Payment locations'
    };
  }

  if (kind === 'refunds') {
    const { refunds } = await apiService.listRefunds(token);
    const rows = refunds.map((refund, index) => ({ id: stringOf(refund, '_id', String(index)), title: stringOf(refund, 'refundId', 'Refund'), subtitle: stringOf(refund, 'bookingId', 'Booking'), amount: numberOf(refund, 'amount'), status: stringOf(refund, 'status', 'requested'), metadata: stringOf(refund, 'reason', 'Refund workflow') }));
    return {
      eyebrow: 'Refunds',
      title: 'Refund Management',
      description: 'Refund queue, approvals, notes, average time, wallet/gateway returns, and timeline.',
      metrics: [
        { label: 'Pending', value: rows.filter((r) => ['requested', 'processing'].includes(String(r.status))).length, icon: Clock, tone: 'yellow' },
        { label: 'Approved', value: rows.filter((r) => r.status === 'approved').length, icon: ShieldCheck, tone: 'blue' },
        { label: 'Completed', value: rows.filter((r) => ['completed', 'processed'].includes(String(r.status))).length, icon: CheckCircle2, tone: 'green' },
        { label: 'Total value', value: formatCurrency(rows.reduce((sum, row) => sum + (row.amount || 0), 0)), icon: ArrowDownLeft, tone: 'red' }
      ],
      rows,
      chart: rows.slice(0, 8).map((row, index) => ({ label: `R${index + 1}`, value: row.amount || 0 })),
      secondary: rows.filter((row) => row.status !== 'completed')
    };
  }

  if (['pricing', 'pricingHistory', 'pricingNew', 'pricingSimulator'].includes(kind)) {
    const [{ rules }, history] = await Promise.all([
      apiService.listPricing(token).catch(() => ({ rules: [] as FareRuleItem[] })),
      apiService.getPricingHistory(token).catch(() => ({ history: [], approvals: [] }))
    ]);
    return {
      eyebrow: 'Pricing',
      title: kind === 'pricingSimulator' ? 'Fare Calculator' : kind === 'pricingNew' ? 'Pricing Rule Builder' : 'Fare Matrix',
      description: 'Zone pricing, peak rules, holiday pricing, discounts, coupons, student/senior pricing, and live previews.',
      metrics: [
        { label: 'Rules', value: rules.length, icon: Settings2, tone: 'blue' },
        { label: 'Published', value: rules.filter((r) => r.status === 'published').length, icon: CheckCircle2, tone: 'green' },
        { label: 'Pending approvals', value: history.approvals.length, icon: Clock, tone: 'yellow' },
        { label: 'History events', value: history.history.length, icon: FileText, tone: 'gray' }
      ],
      rows: rules.map((rule) => ({ id: rule._id, title: rule.name, subtitle: `${rule.passengerType} · ${rule.ruleType}`, amount: rule.value, status: rule.status, metadata: rule.approvalStatus })),
      chart: rules.map((rule) => ({ label: rule.name.slice(0, 8), value: rule.value || 0 })),
      secondary: history.approvals.map((approval, index) => ({ id: String(index), title: stringOf(approval, 'status', 'Approval'), subtitle: stringOf(approval, 'reason', 'Pricing approval'), status: stringOf(approval, 'status', 'pending') })),
      mapLabel: 'Fare zones and route heatmap'
    };
  }

  if (['coupons', 'couponNew', 'couponDetail'].includes(kind)) {
    const { coupons } = await apiService.listCoupons(token);
    return {
      eyebrow: 'Coupons',
      title: kind === 'couponNew' ? 'Coupon Campaign Builder' : 'Coupon Campaigns',
      description: 'Discount campaigns, usage limits, expiry, customer targeting, and redemption analytics.',
      metrics: [
        { label: 'Campaigns', value: coupons.length, icon: Receipt, tone: 'blue' },
        { label: 'Active', value: coupons.filter((c) => c.status === 'active').length, icon: CheckCircle2, tone: 'green' },
        { label: 'Usage', value: coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0), icon: TrendingUp, tone: 'yellow' },
        { label: 'Archived', value: coupons.filter((c) => c.status === 'archived').length, icon: FileText, tone: 'gray' }
      ],
      rows: coupons.map((coupon) => ({ id: coupon._id, title: coupon.code, subtitle: coupon.name, amount: coupon.discountValue, status: coupon.status, href: `/admin/coupons/${coupon._id}`, metadata: `${coupon.discountType} · used ${coupon.usedCount}` })),
      chart: coupons.map((coupon) => ({ label: coupon.code, value: coupon.usedCount || coupon.discountValue || 0 })),
      secondary: coupons.filter((coupon) => coupon.status === 'active').map((coupon) => ({ id: coupon._id, title: coupon.name, status: coupon.status, amount: coupon.discountValue }))
    };
  }

  if (kind === 'reports') {
    const { reports } = await apiService.getReports(token);
    return {
      eyebrow: 'Reports',
      title: 'Enterprise Analytics Center',
      description: 'Revenue, passengers, trips, fleet, fuel, maintenance, refunds, payments, occupancy, exports, and heatmaps.',
      metrics: reports.slice(0, 4).map((report, index) => ({ label: report.metric, value: report.value, icon: [BarChart3, Users, Bus, Wallet][index] || BarChart3, tone: ['blue', 'green', 'yellow', 'gray'][index] })),
      rows: reports.map((report) => ({ id: report.metric, title: report.metric, amount: report.value, status: 'completed', href: `/reports/${report.metric}` })),
      chart: reports.map((report) => ({ label: report.metric, value: report.value })),
      secondary: reports.map((report) => ({ id: `export-${report.metric}`, title: `${report.metric} export`, status: 'ready', metadata: 'CSV / Excel / PDF' }))
    };
  }

  if (kind === 'audit') {
    const { logs } = await apiService.getAuditLogs(token);
    const rows = logs.map((log, index) => ({ id: stringOf(log, '_id', String(index)), title: stringOf(log, 'action', 'Audit event'), subtitle: stringOf(valueOf(log, 'actorId'), 'email', 'System'), status: 'completed', metadata: stringOf(log, 'createdAt') }));
    return {
      eyebrow: 'Audit',
      title: 'Audit Logs',
      description: 'Actor activity, security-sensitive changes, exports, filters, and timeline review.',
      metrics: [
        { label: 'Events', value: rows.length, icon: FileText, tone: 'blue' },
        { label: 'Actors', value: new Set(rows.map((r) => r.subtitle)).size, icon: Users, tone: 'green' },
        { label: 'Exports', value: 'CSV', icon: Download, tone: 'gray' },
        { label: 'Review queue', value: rows.filter((r) => r.title.includes('delete')).length, icon: AlertTriangle, tone: 'red' }
      ],
      rows,
      chart: rows.slice(0, 8).map((row, index) => ({ label: `A${index + 1}`, value: index + 1 })),
      secondary: rows.slice(0, 6)
    };
  }

  if (kind === 'fleet') {
    const [buses, drivers, conductors, maintenance, fuel] = await Promise.all([
      apiService.listBuses(token, { status: 'all', limit: 100 }).catch(() => ({ items: [] as BusItem[], pagination: { page: 1, limit: 100, total: 0, pages: 0 } })),
      apiService.listDrivers(token, { limit: 100 }).catch(() => ({ items: [], pagination: { page: 1, limit: 100, total: 0, pages: 0 } })),
      apiService.listConductors(token, { limit: 100 }).catch(() => ({ items: [], pagination: { page: 1, limit: 100, total: 0, pages: 0 } })),
      apiService.listMaintenance(token, { limit: 100 }).catch(() => ({ items: [], pagination: { page: 1, limit: 100, total: 0, pages: 0 } })),
      apiService.listFuel(token, { limit: 100 }).catch(() => ({ items: [], pagination: { page: 1, limit: 100, total: 0, pages: 0 } }))
    ]);
    return {
      eyebrow: 'Fleet',
      title: 'Fleet Command Center',
      description: 'Fleet health, availability, GPS status, fuel, maintenance, driver assignment, documents, and live alerts.',
      metrics: [
        { label: 'Vehicles', value: buses.items.length, icon: Bus, tone: 'blue' },
        { label: 'Drivers', value: drivers.items.length, icon: Users, tone: 'green' },
        { label: 'Maintenance', value: maintenance.items.length, icon: Wrench, tone: 'orange' },
        { label: 'Fuel logs', value: fuel.items.length, icon: Fuel, tone: 'yellow' }
      ],
      rows: buses.items.map((bus) => ({ id: bus._id, title: bus.busNumber, subtitle: bus.registrationNumber, status: bus.status, metadata: `${bus.vehicleType} · ${bus.capacity} seats` })),
      chart: [
        { label: 'Buses', value: buses.items.length },
        { label: 'Drivers', value: drivers.items.length },
        { label: 'Conductors', value: conductors.items.length },
        { label: 'Repairs', value: maintenance.items.length },
        { label: 'Fuel', value: fuel.items.length }
      ],
      secondary: maintenance.items.slice(0, 8).map((item) => ({ id: item._id, title: item.title, subtitle: item.type, status: item.status, amount: item.cost })),
      mapLabel: 'Fleet GPS and depot map'
    };
  }

  if (kind === 'superAdmin') {
    const [finance, reports, audit] = await Promise.all([
      apiService.getFinanceDashboard(token).catch(() => ({ stats: {}, routeRevenue: {}, topRoutes: [], recentPayments: [] })),
      apiService.getReports(token).catch(() => ({ reports: [] })),
      apiService.getAuditLogs(token).catch(() => ({ logs: [] }))
    ]);
    const stats = finance.stats as Record<string, number>;
    return {
      eyebrow: 'Platform',
      title: 'Super Admin Console',
      description: 'Platform oversight across organizations, users, payments, operations, audit, and support.',
      metrics: [
        { label: 'Revenue', value: formatCurrency(stats.revenue || 0), icon: TrendingUp, tone: 'green' },
        { label: 'Payments', value: finance.recentPayments?.length || 0, icon: Receipt, tone: 'blue' },
        { label: 'Reports', value: reports.reports.length, icon: BarChart3, tone: 'yellow' },
        { label: 'Audit events', value: audit.logs.length, icon: ShieldCheck, tone: 'gray' }
      ],
      rows: finance.recentPayments.map((payment) => ({ id: payment._id, title: payment.razorpayOrderId, amount: payment.amount, status: payment.status, href: `/payments/${payment._id}` })),
      chart: reports.reports.map((report) => ({ label: report.metric, value: report.value })),
      secondary: audit.logs.slice(0, 8).map((log, index) => ({ id: stringOf(log, '_id', String(index)), title: stringOf(log, 'action', 'Audit'), status: 'completed' })),
      mapLabel: 'Platform coverage map'
    };
  }

  return {
    eyebrow: 'Module',
    title: 'Enterprise Workspace',
    description: 'Restored enterprise module connected to existing APIs.',
    metrics: [],
    rows: [],
    chart: [],
    secondary: []
  };
}

export function RestoredModulePage({ kind }: { kind: ModuleKind }) {
  const { isLoaded, user, getToken } = useAppRole();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ModuleData | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user) return;
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Missing token');
        setData(await loadModuleData(kind, token));
      } catch {
        toast.error('Unable to load module data');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [getToken, isLoaded, kind, user]);

  return (
    <PageShell showTabs={false}>
      {loading ? (
        <>
          <LoadingSkeleton className="h-48" />
          <LoadingSkeleton className="h-28" />
          <LoadingSkeleton className="h-80" />
        </>
      ) : data ? (
        <>
          <section className="overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-sm">
            <div className="bg-[url('https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center">
              <div className="bg-black/65 p-6">
                <p className="text-sm font-medium uppercase text-white/60">{data.eyebrow}</p>
                <h1 className="mt-2 text-3xl font-semibold">{data.title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">{data.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href="/search" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950">Search</Link>
                  <button className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white">Export</button>
                  <button className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white">Open drawer</button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-4">
            {data.metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase text-zinc-500">{metric.label}</p>
                    <Icon size={18} className="text-zinc-500" />
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-zinc-950">{metric.value}</p>
                  {metric.hint ? <p className="mt-1 text-xs text-zinc-500">{metric.hint}</p> : null}
                </div>
              );
            })}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <MiniAreaChart data={data.chart.length ? data.chart : [{ label: 'No data', value: 0 }]} />
                <DonutChart data={data.chart.length ? data.chart.slice(0, 5) : [{ label: 'No data', value: 1 }]} />
              </div>
              {data.mapLabel ? <MapCard label={data.mapLabel} /> : null}
              <EnterpriseTable rows={data.rows} title={`${data.title} Table`} />
            </div>
            <div className="space-y-4">
              <DetailDrawer row={selected || data.rows[0]} />
              <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-950">Activity and queue</h2>
                <div className="mt-4 space-y-3">
                  {(data.secondary.length ? data.secondary : data.rows).slice(0, 6).map((row) => (
                    <button key={row.id} onClick={() => setSelected(row)} className="w-full rounded-2xl border border-zinc-200 p-3 text-left text-sm hover:bg-zinc-50">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-zinc-950">{row.title}</span>
                        <span className={`rounded-full border px-2 py-1 text-xs ${toneClass[statusTone(row.status)]}`}>{row.status || 'open'}</span>
                      </div>
                      {row.subtitle ? <p className="mt-1 text-xs text-zinc-500">{row.subtitle}</p> : null}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-zinc-950">Module unavailable</p>
          <p className="mt-1 text-sm text-zinc-500">Retry or contact support if this module cannot load.</p>
        </section>
      )}
    </PageShell>
  );
}

export function RestoredActionPage({ kind }: { kind: ModuleKind }) {
  const { getToken } = useAppRole();
  const [form, setForm] = useState({
    name: '',
    code: '',
    amount: '100',
    baseFare: '20',
    passengerType: 'adult',
    couponCode: '',
    value: '10',
    discountValue: '10'
  });
  const [result, setResult] = useState('');

  const title = kind === 'couponNew' ? 'Coupon Campaign Builder' : kind === 'paymentNew' ? 'Payment Intent Workspace' : kind === 'pricingSimulator' ? 'Fare Calculator' : 'Pricing Rule Builder';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing token');
      if (kind === 'pricingSimulator') {
        const response = await apiService.simulatePricing(token, { baseFare: Number(form.baseFare), count: 1, passengerType: form.passengerType, couponCode: form.couponCode || undefined });
        setResult(`Fare preview: ${formatCurrency(response.totalAmount)}`);
      } else if (kind === 'pricingNew') {
        const response = await apiService.createPricingRule(token, { name: form.name, passengerType: form.passengerType as FareRuleItem['passengerType'], ruleType: 'fixed_discount', value: Number(form.value), minFare: 0, priority: 100, status: 'draft' });
        setResult(`Draft pricing rule created: ${response.rule.name}`);
      } else if (kind === 'couponNew') {
        const response = await apiService.createCoupon(token, { code: form.code, name: form.name || form.code, discountType: 'flat', discountValue: Number(form.discountValue), status: 'active' });
        setResult(`Campaign created: ${response.coupon.code}`);
      } else if (kind === 'paymentNew') {
        const response = await apiService.createPaymentOrder(token, { amount: Number(form.amount), paymentMethod: 'gateway' });
        setResult(`Payment order created: ${response.order.id}`);
      }
      toast.success('Action completed');
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm">
        <p className="text-sm uppercase text-white/60">Action workspace</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/70">Guided action surface with preview, validation, audit context, and backend submission using existing APIs.</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <form onSubmit={(event) => void submit(event)} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            {Object.keys(form).map((field) => (
              <label key={field} className="text-xs font-medium uppercase text-zinc-500">
                {field.replace(/([A-Z])/g, ' $1')}
                <input value={form[field as keyof typeof form]} onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))} className="mt-1 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm normal-case outline-none focus:border-zinc-950" />
              </label>
            ))}
          </div>
          <ActionButton className="mt-5" type="submit">Submit</ActionButton>
          {result ? <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{result}</p> : null}
        </form>
        <DetailDrawer row={{ id: 'preview', title, subtitle: 'Preview and timeline', status: 'draft', metadata: 'Right-side drawer pattern' }} />
      </section>
    </PageShell>
  );
}

export function RestoredDetailPage({ kind }: { kind: ModuleKind }) {
  const params = useParams<{ id: string }>();
  const { isLoaded, user, getToken } = useAppRole();
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user || !params.id) return;
      const token = await getToken();
      if (!token) return;
      try {
        if (kind === 'couponDetail') {
          const { coupon } = await apiService.getCoupon(token, params.id);
          setRow({ id: coupon._id, title: coupon.code, subtitle: coupon.name, amount: coupon.discountValue, status: coupon.status, metadata: `${coupon.discountType} · used ${coupon.usedCount}` });
        } else {
          const { payment } = await apiService.getPayment(token, params.id);
          setRow({ id: payment._id, title: payment.razorpayOrderId, subtitle: payment.razorpayPaymentId || payment.bookingId || '', amount: payment.amount, status: payment.status, metadata: payment.currency });
        }
      } catch {
        toast.error('Unable to load detail');
      }
    };
    void load();
  }, [getToken, isLoaded, kind, params.id, user]);

  return (
    <PageShell showTabs={false}>
      <section className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm">
        <p className="text-sm uppercase text-white/60">Detail page</p>
        <h1 className="mt-2 text-3xl font-semibold">{row?.title || 'Loading record'}</h1>
        <p className="mt-2 text-sm text-white/70">{row?.subtitle || params.id}</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <EnterpriseTable rows={row ? [row] : []} title="Record detail" />
          <MiniAreaChart data={row ? [{ label: 'Amount', value: row.amount || 1 }, { label: 'Timeline', value: 1 }] : [{ label: 'Loading', value: 1 }]} />
        </div>
        <DetailDrawer row={row} />
      </section>
    </PageShell>
  );
}
