'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit3,
  MailPlus,
  Power,
  Search,
  Settings,
  Trash2,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import ActionButton from '@/components/ActionButton';
import PageShell from '@/components/PageShell';
import {
  apiService,
  AppUser,
  OrganizationDashboard,
  OrganizationInvite,
  OrganizationItem,
  OrganizationMember
} from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { isOrganizationManagerRole } from '@/lib/roles';
import { useAppRole } from '@/lib/useAppRole';

type TabKey = 'overview' | 'profile' | 'members' | 'invites' | 'settings';

type OrganizationForm = {
  name: string;
  slug: string;
  city: string;
  legalName: string;
  gstNumber: string;
  registrationNumber: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  billingName: string;
  billingEmail: string;
  billingPhone: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  pincode: string;
  country: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  timezone: string;
  currency: string;
  ticketPrefix: string;
  allowPublicBooking: boolean;
};

const tabs: { key: TabKey; label: string; icon: typeof Building2 }[] = [
  { key: 'overview', label: 'Overview', icon: Building2 },
  { key: 'profile', label: 'Profile', icon: Edit3 },
  { key: 'members', label: 'Members', icon: Users },
  { key: 'invites', label: 'Invites', icon: MailPlus },
  { key: 'settings', label: 'Settings', icon: Settings }
];

const roleOptions: AppUser['role'][] = [
  'org_admin',
  'operations_manager',
  'fleet_manager',
  'finance_manager',
  'price_manager',
  'dispatcher',
  'scheduler',
  'bus_manager',
  'driver',
  'conductor',
  'support',
  'customer'
];

const emptyForm: OrganizationForm = {
  name: '',
  slug: '',
  city: 'Hyderabad',
  legalName: '',
  gstNumber: '',
  registrationNumber: '',
  website: '',
  contactEmail: '',
  contactPhone: '',
  supportEmail: '',
  billingName: '',
  billingEmail: '',
  billingPhone: '',
  addressLine1: '',
  addressLine2: '',
  addressCity: 'Hyderabad',
  addressState: 'Telangana',
  pincode: '',
  country: 'India',
  logoUrl: '',
  primaryColor: '#111827',
  secondaryColor: '#f59e0b',
  accentColor: '#0f766e',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  ticketPrefix: 'BUS',
  allowPublicBooking: true
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function asInput(value?: string | null) {
  return value || '';
}

function formFromOrganization(org: OrganizationItem): OrganizationForm {
  return {
    name: org.name,
    slug: org.slug,
    city: org.city,
    legalName: asInput(org.businessDetails?.legalName),
    gstNumber: asInput(org.businessDetails?.gstNumber),
    registrationNumber: asInput(org.businessDetails?.registrationNumber),
    website: asInput(org.businessDetails?.website),
    contactEmail: asInput(org.contact?.email),
    contactPhone: asInput(org.contact?.phone),
    supportEmail: asInput(org.contact?.supportEmail),
    billingName: asInput(org.billingContact?.name),
    billingEmail: asInput(org.billingContact?.email),
    billingPhone: asInput(org.billingContact?.phone),
    addressLine1: asInput(org.address?.line1),
    addressLine2: asInput(org.address?.line2),
    addressCity: asInput(org.address?.city) || 'Hyderabad',
    addressState: asInput(org.address?.state) || 'Telangana',
    pincode: asInput(org.address?.pincode),
    country: asInput(org.address?.country) || 'India',
    logoUrl: asInput(org.branding?.logoUrl),
    primaryColor: org.branding?.primaryColor || '#111827',
    secondaryColor: org.branding?.secondaryColor || '#f59e0b',
    accentColor: org.branding?.accentColor || '#0f766e',
    timezone: org.settings?.timezone || 'Asia/Kolkata',
    currency: org.settings?.currency || 'INR',
    ticketPrefix: org.settings?.ticketPrefix || 'BUS',
    allowPublicBooking: org.settings?.allowPublicBooking ?? true
  };
}

function payloadFromForm(form: OrganizationForm) {
  return {
    name: form.name.trim(),
    slug: slugify(form.slug || form.name),
    city: form.city.trim() || 'Hyderabad',
    businessDetails: {
      legalName: form.legalName,
      gstNumber: form.gstNumber,
      registrationNumber: form.registrationNumber,
      website: form.website
    },
    contact: {
      email: form.contactEmail,
      phone: form.contactPhone,
      supportEmail: form.supportEmail
    },
    billingContact: {
      name: form.billingName,
      email: form.billingEmail,
      phone: form.billingPhone
    },
    address: {
      line1: form.addressLine1,
      line2: form.addressLine2,
      city: form.addressCity,
      state: form.addressState,
      pincode: form.pincode,
      country: form.country
    },
    branding: {
      logoUrl: form.logoUrl,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      accentColor: form.accentColor
    },
    settings: {
      timezone: form.timezone,
      currency: form.currency,
      ticketPrefix: form.ticketPrefix,
      allowPublicBooking: form.allowPublicBooking
    }
  };
}

function statusClass(status: string) {
  if (status === 'active' || status === 'ACTIVE') return 'bg-emerald-50 text-emerald-700';
  if (status === 'pending') return 'bg-amber-50 text-amber-700';
  if (status === 'PENDING' || status === 'INVITED') return 'bg-amber-50 text-amber-700';
  if (status === 'suspended' || status === 'SUSPENDED' || status === 'DEACTIVATED') return 'bg-red-50 text-red-700';
  return 'bg-zinc-100 text-zinc-600';
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-zinc-600">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-black"
      />
    </label>
  );
}

export default function OrganizationPage() {
  const { isLoaded, ready, user, appUser, role, getToken } = useAppRole();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [dashboard, setDashboard] = useState<OrganizationDashboard | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [memberPage, setMemberPage] = useState(1);
  const [memberPages, setMemberPages] = useState(1);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRole, setMemberRole] = useState('all');
  const [memberStatus, setMemberStatus] = useState('all');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppUser['role']>('conductor');
  const [orgSearch, setOrgSearch] = useState('');
  const [orgStatus, setOrgStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [createForm, setCreateForm] = useState<OrganizationForm>(emptyForm);
  const [editForm, setEditForm] = useState<OrganizationForm>(emptyForm);

  const canManage = isOrganizationManagerRole(role);
  const isSuperAdmin = role === 'super_admin';
  const selectedOrg = useMemo(
    () => organizations.find((org) => org._id === selectedOrgId) || dashboard?.organization || null,
    [dashboard, organizations, selectedOrgId]
  );

  const getAuthToken = useCallback(async () => {
    const authToken = await getToken();
    if (!authToken) throw new Error('Missing Clerk token');
    return authToken;
  }, [getToken]);

  const loadOrganizations = useCallback(async () => {
    if (!user) return;
    const authToken = await getAuthToken();
    const data = await apiService.listOrganizations(authToken, {
      search: orgSearch || undefined,
      status: orgStatus === 'all' ? undefined : orgStatus,
      limit: 20
    });
    setOrganizations(data.organizations);
    const preferred = selectedOrgId || appUser?.organizationId || data.organizations[0]?._id || '';
    if (preferred) setSelectedOrgId(preferred);
  }, [appUser?.organizationId, getAuthToken, orgSearch, orgStatus, selectedOrgId, user]);

  const loadOrganizationDetail = useCallback(
    async (organizationId: string) => {
      const authToken = await getAuthToken();
      const [dashboardData, memberData] = await Promise.all([
        apiService.getOrganizationDashboard(authToken, organizationId),
        apiService.listOrganizationMembers(authToken, organizationId, {
          search: memberSearch || undefined,
          role: memberRole,
          status: memberStatus,
          page: memberPage,
          limit: 8
        })
      ]);
      setDashboard(dashboardData);
      setMembers(memberData.members);
      setMemberPages(memberData.pagination.pages);
      if (canManage) {
        const inviteData = await apiService.listOrganizationInvites(authToken, organizationId);
        setInvites(inviteData.invites);
      } else {
        setInvites([]);
      }
      setEditForm(formFromOrganization(dashboardData.organization));
    },
    [canManage, getAuthToken, memberPage, memberRole, memberSearch, memberStatus]
  );

  const reload = useCallback(async () => {
    if (!isLoaded || !ready || !user) return;
    setLoading(true);
    setError('');
    try {
      await loadOrganizations();
    } catch {
      setError('Unable to load organization workspace.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, loadOrganizations, ready, user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!selectedOrgId || !user) return;
    setLoading(true);
    setError('');
    loadOrganizationDetail(selectedOrgId)
      .catch(() => setError('Unable to load organization details.'))
      .finally(() => setLoading(false));
  }, [loadOrganizationDetail, selectedOrgId, user]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      const response = await apiService.createOrganization(authToken, payloadFromForm(createForm));
      toast.success(response.message);
      setShowCreate(false);
      setCreateForm(emptyForm);
      setSelectedOrgId(response.organization._id);
      await loadOrganizations();
    } catch {
      toast.error('Failed to create organization');
    } finally {
      setSaving(false);
    }
  };

  const onUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedOrgId) return;
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      await apiService.updateOrganization(authToken, selectedOrgId, payloadFromForm(editForm));
      toast.success('Organization updated');
      setEditing(false);
      await loadOrganizationDetail(selectedOrgId);
      await loadOrganizations();
    } catch {
      toast.error('Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  const onArchive = async () => {
    if (!selectedOrgId) return;
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      await apiService.archiveOrganization(authToken, selectedOrgId);
      toast.success('Organization archived');
      setConfirmArchive(false);
      setSelectedOrgId('');
      setDashboard(null);
      await loadOrganizations();
    } catch {
      toast.error('Failed to archive organization');
    } finally {
      setSaving(false);
    }
  };

  const onLifecycleChange = async (action: 'approve' | 'suspend') => {
    if (!selectedOrgId) return;
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      const response =
        action === 'approve'
          ? await apiService.approveOrganization(authToken, selectedOrgId)
          : await apiService.suspendOrganization(authToken, selectedOrgId);
      toast.success(response.message);
      await loadOrganizationDetail(selectedOrgId);
      await loadOrganizations();
    } catch {
      toast.error(action === 'approve' ? 'Failed to approve organization' : 'Failed to suspend organization');
    } finally {
      setSaving(false);
    }
  };

  const onSwitch = async (organizationId: string) => {
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      await apiService.switchOrganization(authToken, organizationId);
      setSelectedOrgId(organizationId);
      toast.success('Organization selected');
    } catch {
      toast.error('Unable to switch organization');
    } finally {
      setSaving(false);
    }
  };

  const onInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedOrgId) return;
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      const response = await apiService.createOrganizationInvite(authToken, selectedOrgId, {
        email: inviteEmail,
        role: inviteRole
      });
      setInviteEmail('');
      toast.success(response.message);
      if (response.invite.acceptLink) {
        await navigator.clipboard.writeText(response.invite.acceptLink);
        toast.success('Invite link copied');
      }
      const inviteData = await apiService.listOrganizationInvites(authToken, selectedOrgId);
      setInvites(inviteData.invites);
      await loadOrganizationDetail(selectedOrgId);
    } catch {
      toast.error('Failed to create invite');
    } finally {
      setSaving(false);
    }
  };

  const onCancelInvite = async (inviteId: string) => {
    if (!selectedOrgId) return;
    setSaving(true);
    try {
      const authToken = await getAuthToken();
      await apiService.cancelOrganizationInvite(authToken, selectedOrgId, inviteId);
      toast.success('Invite cancelled');
      const inviteData = await apiService.listOrganizationInvites(authToken, selectedOrgId);
      setInvites(inviteData.invites);
    } catch {
      toast.error('Failed to cancel invite');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !ready) {
    return <PageShell showTabs={false} />;
  }

  if (!user) {
    return (
      <PageShell showTabs={false}>
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h1 className="text-base font-semibold text-zinc-900">Organization Management</h1>
          <p className="mt-2 text-sm text-zinc-600">Sign in to manage your bus operator workspace.</p>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">Organization Management</h1>
            <p className="mt-1 text-sm text-zinc-600">Manage operator profile, members, settings, and invites.</p>
          </div>
          <div className="grid gap-2">
            <ActionButton onClick={() => setShowCreate(true)}>Create</ActionButton>
            <Link href="/organization/users" className="rounded-xl border border-zinc-200 px-3 py-2 text-center text-sm">
              Users
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 text-zinc-400" size={16} />
            <input
              value={orgSearch}
              onChange={(event) => setOrgSearch(event.target.value)}
              placeholder="Search organizations"
              className="w-full rounded-xl border border-zinc-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-black"
            />
          </label>
          <select
            value={orgStatus}
            onChange={(event) => setOrgStatus(event.target.value)}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="mt-3 grid gap-2">
          {organizations.length ? (
            organizations.map((org) => (
              <button
                key={org._id}
                type="button"
                onClick={() => void onSwitch(org._id)}
                className={`flex items-center justify-between rounded-xl border p-3 text-left text-sm ${
                  selectedOrgId === org._id ? 'border-black bg-zinc-50' : 'border-zinc-200 bg-white'
                }`}
              >
                <span>
                  <span className="block font-medium text-zinc-900">{org.name}</span>
                  <span className="block text-xs text-zinc-500">{org.slug}</span>
                </span>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(org.status)}`}>
                  {org.status}
                </span>
              </button>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
              No organizations found. Create one to begin operator setup.
            </p>
          )}
        </div>
      </section>

      {loading ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500 shadow-sm">
          Loading organization workspace...
        </section>
      ) : null}

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {error}
        </section>
      ) : null}

      {selectedOrg ? (
        <>
          <section className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
            <div className="grid grid-cols-5 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`grid min-h-14 place-items-center rounded-xl px-1 text-xs ${
                      activeTab === tab.key ? 'bg-zinc-900 text-white' : 'text-zinc-600'
                    }`}
                    title={tab.label}
                  >
                    <Icon size={17} />
                    <span className="mt-1">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {activeTab === 'overview' ? (
            <>
              <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">{selectedOrg.name}</h2>
                    <p className="text-sm text-zinc-500">{selectedOrg.city}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(selectedOrg.status)}`}>
                    {selectedOrg.status}
                  </span>
                </div>
                <div
                  className="mt-4 h-2 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${selectedOrg.branding?.primaryColor || '#111827'}, ${
                      selectedOrg.branding?.secondaryColor || '#f59e0b'
                    }, ${selectedOrg.branding?.accentColor || '#0f766e'})`
                  }}
                />
                {isSuperAdmin ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={saving || selectedOrg.status !== 'pending'}
                      onClick={() => void onLifecycleChange('approve')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-sm text-emerald-700 disabled:opacity-40"
                    >
                      <Check size={15} /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={saving || selectedOrg.status === 'suspended'}
                      onClick={() => void onLifecycleChange('suspend')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700 disabled:opacity-40"
                    >
                      <Power size={15} /> Suspend
                    </button>
                  </div>
                ) : null}
              </section>

              <section className="grid grid-cols-2 gap-2">
                {[
                  ['Members', dashboard?.stats.members ?? 0],
                  ['Routes', dashboard?.stats.routes ?? 0],
                  ['Active Routes', dashboard?.stats.activeRoutes ?? 0],
                  ['Tickets', dashboard?.stats.tickets ?? 0],
                  ['Revenue', formatCurrency(dashboard?.stats.revenue ?? 0)],
                  ['Pending Invites', dashboard?.stats.pendingInvites ?? 0]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-xs text-zinc-500">{label}</p>
                    <p className="mt-1 text-lg font-semibold text-zinc-900">{value}</p>
                  </div>
                ))}
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-zinc-900">Recent Activity</h2>
                <div className="mt-3 grid gap-2">
                  {dashboard?.recentActivity.length ? (
                    dashboard.recentActivity.map((item) => (
                      <div key={item._id} className="rounded-xl border border-zinc-200 p-3 text-sm">
                        <p className="font-medium text-zinc-900">{item.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-zinc-500">
                          {item.actorId?.name || item.actorId?.email || 'System'} ·{' '}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
                      No activity recorded yet.
                    </p>
                  )}
                </div>
              </section>
            </>
          ) : null}

          {activeTab === 'profile' || activeTab === 'settings' ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-zinc-900">
                  {activeTab === 'profile' ? 'Organization Profile' : 'Branding and Settings'}
                </h2>
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setEditForm(formFromOrganization(selectedOrg));
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-700"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                ) : null}
              </div>
              {activeTab === 'profile' ? (
                <div className="mt-3 grid gap-2 text-sm">
                  <InfoRow label="Legal name" value={selectedOrg.businessDetails?.legalName} />
                  <InfoRow label="GST" value={selectedOrg.businessDetails?.gstNumber} />
                  <InfoRow label="Registration" value={selectedOrg.businessDetails?.registrationNumber} />
                  <InfoRow label="Website" value={selectedOrg.businessDetails?.website} />
                  <InfoRow label="Contact email" value={selectedOrg.contact?.email} />
                  <InfoRow label="Contact phone" value={selectedOrg.contact?.phone} />
                  <InfoRow
                    label="Address"
                    value={[
                      selectedOrg.address?.line1,
                      selectedOrg.address?.line2,
                      selectedOrg.address?.city,
                      selectedOrg.address?.state,
                      selectedOrg.address?.pincode
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  />
                </div>
              ) : (
                <div className="mt-3 grid gap-2 text-sm">
                  <InfoRow label="Logo URL" value={selectedOrg.branding?.logoUrl} />
                  <InfoRow label="Ticket prefix" value={selectedOrg.settings?.ticketPrefix} />
                  <InfoRow label="Timezone" value={selectedOrg.settings?.timezone} />
                  <InfoRow label="Currency" value={selectedOrg.settings?.currency} />
                  <InfoRow
                    label="Public booking"
                    value={selectedOrg.settings?.allowPublicBooking ? 'Enabled' : 'Disabled'}
                  />
                  <div className="flex gap-2">
                    {['primaryColor', 'secondaryColor', 'accentColor'].map((key) => (
                      <span
                        key={key}
                        className="h-9 flex-1 rounded-xl border border-zinc-200"
                        style={{ backgroundColor: selectedOrg.branding?.[key as keyof OrganizationItem['branding']] || '#fff' }}
                        title={key}
                      />
                    ))}
                  </div>
                </div>
              )}
              {canManage ? (
                <button
                  type="button"
                  onClick={() => setConfirmArchive(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm text-red-700"
                >
                  <Trash2 size={15} /> Archive Organization
                </button>
              ) : null}
            </section>
          ) : null}

          {activeTab === 'members' ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">Organization Members</h2>
              <div className="mt-3 grid gap-2">
                <input
                  value={memberSearch}
                  onChange={(event) => {
                    setMemberSearch(event.target.value);
                    setMemberPage(1);
                  }}
                  placeholder="Search members"
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={memberRole}
                    onChange={(event) => {
                      setMemberRole(event.target.value);
                      setMemberPage(1);
                    }}
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  >
                    <option value="all">All roles</option>
                    {roleOptions.map((item) => (
                      <option key={item} value={item}>
                        {item.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={memberStatus}
                    onChange={(event) => {
                      setMemberStatus(event.target.value);
                      setMemberPage(1);
                    }}
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  >
                    <option value="all">All statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="INVITED">Invited</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                {members.length ? (
                  members.map((member) => (
                    <div key={member._id} className="rounded-xl border border-zinc-200 p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-zinc-900">{member.name}</p>
                          <p className="text-xs text-zinc-500">{member.email}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs ${statusClass(member.status)}`}>
                          {member.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-zinc-500">{member.role.replace(/_/g, ' ')}</p>
                        <Link href={`/organization/users/${member._id}`} className="text-xs font-medium text-zinc-900">
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
                    No members match the current filters.
                  </p>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  disabled={memberPage <= 1}
                  onClick={() => setMemberPage((page) => Math.max(page - 1, 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span className="text-xs text-zinc-500">
                  Page {memberPage} of {memberPages}
                </span>
                <button
                  type="button"
                  disabled={memberPage >= memberPages}
                  onClick={() => setMemberPage((page) => Math.min(page + 1, memberPages))}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </section>
          ) : null}

          {activeTab === 'invites' ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">Invite Members</h2>
              {!canManage ? <p className="mt-2 text-sm text-zinc-500">Manager access is required.</p> : null}
              {canManage ? (
                <form className="mt-3 grid gap-2" onSubmit={(event) => void onInvite(event)}>
                  <input
                    required
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="member@example.com"
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  <select
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value as AppUser['role'])}
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
                  >
                    {roleOptions.map((item) => (
                      <option key={item} value={item}>
                        {item.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <ActionButton type="submit" disabled={saving}>
                    <span className="inline-flex items-center gap-2">
                      <MailPlus size={16} /> Send Invite
                    </span>
                  </ActionButton>
                </form>
              ) : null}
              <div className="mt-4 grid gap-2">
                {invites.length ? (
                  invites.map((invite) => (
                    <div key={invite._id} className="rounded-xl border border-zinc-200 p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-zinc-900">{invite.email}</p>
                          <p className="text-xs text-zinc-500">
                            {invite.role.replace(/_/g, ' ')} · expires {new Date(invite.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs ${statusClass(invite.status)}`}>
                          {invite.status}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {invite.acceptLink ? (
                          <button
                            type="button"
                            onClick={() => {
                              void navigator.clipboard.writeText(invite.acceptLink || '');
                              toast.success('Invite link copied');
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-xs"
                          >
                            <Copy size={13} /> Copy
                          </button>
                        ) : null}
                        {invite.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => void onCancelInvite(invite._id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"
                          >
                            <Power size={13} /> Cancel
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
                    No invites have been created for this organization.
                  </p>
                )}
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      {showCreate ? (
        <OrganizationDialog
          title="Create Organization"
          form={createForm}
          saving={saving}
          onClose={() => setShowCreate(false)}
          onSubmit={(event) => void onCreate(event)}
          onChange={setCreateForm}
          submitLabel="Create Organization"
        />
      ) : null}

      {editing ? (
        <OrganizationDialog
          title="Edit Organization"
          form={editForm}
          saving={saving}
          onClose={() => setEditing(false)}
          onSubmit={(event) => void onUpdate(event)}
          onChange={setEditForm}
          submitLabel="Save Changes"
        />
      ) : null}

      {confirmArchive ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <section className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl">
            <h2 className="text-base font-semibold text-zinc-900">Archive organization?</h2>
            <p className="mt-2 text-sm text-zinc-600">
              This removes the organization from active operations and cancels pending invites.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmArchive(false)}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void onArchive()}
                className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                Archive
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-900">{value || 'Not set'}</p>
    </div>
  );
}

function OrganizationDialog({
  title,
  form,
  saving,
  submitLabel,
  onClose,
  onSubmit,
  onChange
}: {
  title: string;
  form: OrganizationForm;
  saving: boolean;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onChange: (form: OrganizationForm) => void;
}) {
  const update = (field: keyof OrganizationForm, value: string | boolean) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={onSubmit}
        className="mx-auto my-4 grid w-full max-w-md gap-4 rounded-2xl bg-white p-4 shadow-xl"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-200 px-2 py-1 text-xs">
            Close
          </button>
        </div>

        <section className="grid gap-2">
          <h3 className="text-xs font-semibold uppercase text-zinc-500">Identity</h3>
          <Field label="Name" required value={form.name} onChange={(value) => update('name', value)} />
          <Field
            label="Slug"
            required
            value={form.slug}
            onChange={(value) => update('slug', slugify(value))}
          />
          <Field label="City" value={form.city} onChange={(value) => update('city', value)} />
        </section>

        <section className="grid gap-2">
          <h3 className="text-xs font-semibold uppercase text-zinc-500">Business</h3>
          <Field label="Legal name" value={form.legalName} onChange={(value) => update('legalName', value)} />
          <Field label="GST number" value={form.gstNumber} onChange={(value) => update('gstNumber', value.toUpperCase())} />
          <Field
            label="Registration number"
            value={form.registrationNumber}
            onChange={(value) => update('registrationNumber', value)}
          />
          <Field label="Website" value={form.website} onChange={(value) => update('website', value)} />
        </section>

        <section className="grid gap-2">
          <h3 className="text-xs font-semibold uppercase text-zinc-500">Contact</h3>
          <Field label="Contact email" type="email" value={form.contactEmail} onChange={(value) => update('contactEmail', value)} />
          <Field label="Contact phone" value={form.contactPhone} onChange={(value) => update('contactPhone', value)} />
          <Field label="Support email" type="email" value={form.supportEmail} onChange={(value) => update('supportEmail', value)} />
          <Field label="Billing name" value={form.billingName} onChange={(value) => update('billingName', value)} />
          <Field label="Billing email" type="email" value={form.billingEmail} onChange={(value) => update('billingEmail', value)} />
          <Field label="Billing phone" value={form.billingPhone} onChange={(value) => update('billingPhone', value)} />
        </section>

        <section className="grid gap-2">
          <h3 className="text-xs font-semibold uppercase text-zinc-500">Address</h3>
          <Field label="Address line 1" value={form.addressLine1} onChange={(value) => update('addressLine1', value)} />
          <Field label="Address line 2" value={form.addressLine2} onChange={(value) => update('addressLine2', value)} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="City" value={form.addressCity} onChange={(value) => update('addressCity', value)} />
            <Field label="State" value={form.addressState} onChange={(value) => update('addressState', value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Pincode" value={form.pincode} onChange={(value) => update('pincode', value)} />
            <Field label="Country" value={form.country} onChange={(value) => update('country', value)} />
          </div>
        </section>

        <section className="grid gap-2">
          <h3 className="text-xs font-semibold uppercase text-zinc-500">Branding</h3>
          <Field label="Logo URL" value={form.logoUrl} onChange={(value) => update('logoUrl', value)} />
          <div className="grid grid-cols-3 gap-2">
            <Field label="Primary" type="color" value={form.primaryColor} onChange={(value) => update('primaryColor', value)} />
            <Field label="Secondary" type="color" value={form.secondaryColor} onChange={(value) => update('secondaryColor', value)} />
            <Field label="Accent" type="color" value={form.accentColor} onChange={(value) => update('accentColor', value)} />
          </div>
        </section>

        <section className="grid gap-2">
          <h3 className="text-xs font-semibold uppercase text-zinc-500">Settings</h3>
          <Field label="Timezone" value={form.timezone} onChange={(value) => update('timezone', value)} />
          <Field label="Currency" value={form.currency} onChange={(value) => update('currency', value.toUpperCase())} />
          <Field
            label="Ticket prefix"
            value={form.ticketPrefix}
            onChange={(value) => update('ticketPrefix', value.toUpperCase())}
          />
          <label className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-sm">
            <span className="text-zinc-700">Allow public booking</span>
            <input
              type="checkbox"
              checked={form.allowPublicBooking}
              onChange={(event) => update('allowPublicBooking', event.target.checked)}
            />
          </label>
        </section>

        <ActionButton type="submit" disabled={saving}>
          <span className="inline-flex items-center gap-2">
            <Check size={16} /> {saving ? 'Saving...' : submitLabel}
          </span>
        </ActionButton>
      </form>
    </div>
  );
}
