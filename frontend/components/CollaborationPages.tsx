'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import ActionButton from '@/components/ActionButton';
import { apiService, PostItem, SupportTicketItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';
import { isPostManagerRole } from '@/lib/roles';

export function PostsPageContent() {
  const { isLoaded, ready, user, role, getToken } = useAppRole();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [search, setSearch] = useState('');
  const canManagePosts = isPostManagerRole(role);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !ready || !user) return;
      const token = await getToken();
      if (!token) return;
      const data = await apiService.listPosts(token, {
        search: search || undefined,
        status: canManagePosts ? undefined : 'published'
      });
      setPosts(data.posts);
    };
    void load();
  }, [canManagePosts, getToken, isLoaded, ready, search, user]);

  return (
    <PageShell showTabs={false}>
      <PageHeader
        title={canManagePosts ? 'Posts & Announcements' : 'Announcements'}
        description={canManagePosts ? 'Create, pin, schedule, moderate, and publish organization updates.' : 'Published organization announcements and offers.'}
        actions={canManagePosts ? [{ href: '/posts/new', label: 'New Post' }] : undefined}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Search announcements..." />
      {canManagePosts ? (
        <section className="grid gap-2 md:grid-cols-4">
          <MetricCard label="Posts" value={posts.length} />
          <MetricCard label="Pinned" value={posts.filter((p) => p.pinned).length} />
          <MetricCard label="Drafts" value={posts.filter((p) => p.status === 'draft').length} />
          <MetricCard label="Urgent" value={posts.filter((p) => p.priority === 'urgent').length} />
        </section>
      ) : null}
      <section className="grid gap-3">
        {posts.length ? posts.map((post) => (
          <Link key={post._id} href={`/posts/${post._id}`} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase text-zinc-500">{post.category} / {post.priority}</p>
                <h2 className="mt-1 font-semibold text-zinc-900">{post.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{post.body}</p>
              </div>
              {post.pinned ? <span className="rounded-full bg-black px-2 py-1 text-xs text-white">PINNED</span> : null}
            </div>
          </Link>
        )) : <EmptyState title="No announcements" description={canManagePosts ? 'Create the first announcement for your organization.' : 'No announcements are published yet.'} actionHref={canManagePosts ? '/posts/new' : undefined} actionLabel={canManagePosts ? 'New Post' : undefined} />}
      </section>
    </PageShell>
  );
}

export function NewPostPageContent() {
  const { user, role, getToken } = useAppRole();
  const [form, setForm] = useState({ title: '', body: '', category: 'announcement', priority: 'normal', tags: '' });
  const canManagePosts = isPostManagerRole(role);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !canManagePosts) return;
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing token');
      await apiService.createPost(token, {
        title: form.title,
        body: form.body,
        category: form.category,
        priority: form.priority as 'low' | 'normal' | 'high' | 'urgent',
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        visibility: 'organization',
        status: 'published'
      });
      toast.success('Post published');
    } catch {
      toast.error('Failed to publish post');
    }
  };
  if (!canManagePosts) {
    return (
      <PageShell showTabs={false}>
        <EmptyState title="You don't have permission to view this." description="Post creation is limited to administrators and organization owners." />
      </PageShell>
    );
  }
  return (
    <PageShell showTabs={false}>
      <PageHeader title="New Post" description="Publish an announcement with tags, priority, and role visibility." />
      <form onSubmit={(event) => void submit(event)} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        {(['title', 'body', 'category', 'priority', 'tags'] as const).map((field) => (
          <input key={field} value={form[field]} onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))} placeholder={field} className="mb-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black" required={field === 'title' || field === 'body'} />
        ))}
        <ActionButton type="submit">Publish</ActionButton>
      </form>
    </PageShell>
  );
}

export function PostDetailPageContent() {
  const params = useParams<{ id: string }>();
  const { isLoaded, ready, user, role, getToken } = useAppRole();
  const [post, setPost] = useState<PostItem | null>(null);
  const [comment, setComment] = useState('');
  const canManagePosts = isPostManagerRole(role);
  const load = useCallback(async () => {
    const token = await getToken();
    if (!token || !params.id) return;
    setPost((await apiService.getPost(token, params.id)).post);
  }, [getToken, params.id]);
  useEffect(() => {
    const run = async () => {
      if (isLoaded && ready && user) await load();
    };
    void run();
  }, [isLoaded, load, ready, user]);
  const addComment = async () => {
    const token = await getToken();
    if (!token || !params.id) return;
    await apiService.addPostComment(token, params.id, comment);
    setComment('');
    await load();
  };
  return (
    <PageShell showTabs={false}>
      <PageHeader title={post?.title || 'Post'} description={post?.category || 'Announcement'} />
      {post ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-700">{post.body}</p>
          {canManagePosts ? <div className="mt-4 flex gap-2"><ActionButton onClick={() => void addComment()}>Comment</ActionButton><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment..." className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm" /></div> : null}
          <div className="mt-4 space-y-2">{post.comments?.map((item) => <p key={item._id} className="rounded-xl bg-zinc-100 p-3 text-sm">{item.body}</p>)}</div>
        </section>
      ) : <EmptyState title="Post not found" description="The post may have been deleted or hidden." />}
    </PageShell>
  );
}

export function SupportListPageContent() {
  const { isLoaded, ready, user, getToken } = useAppRole();
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [search, setSearch] = useState('');
  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !ready || !user) return;
      const token = await getToken();
      if (!token) return;
      setTickets((await apiService.listSupportTickets(token, { search: search || undefined })).tickets);
    };
    void load();
  }, [getToken, isLoaded, ready, search, user]);
  return (
    <PageShell showTabs={false}>
      <PageHeader title="Support Desk" description="Ticket creation, replies, assignment, escalation, SLA timers, and history." actions={[{ href: '/support/new', label: 'New Ticket' }]} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search support tickets..." />
      <section className="grid gap-2 md:grid-cols-4"><MetricCard label="Tickets" value={tickets.length} /><MetricCard label="Open" value={tickets.filter((t) => t.status === 'open').length} /><MetricCard label="Escalated" value={tickets.filter((t) => t.status === 'escalated').length} /><MetricCard label="Urgent" value={tickets.filter((t) => t.priority === 'urgent').length} /></section>
      <section className="grid gap-3">{tickets.length ? tickets.map((ticket) => <Link key={ticket._id} href={`/support/${ticket._id}`} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><p className="text-xs text-zinc-500">{ticket.ticketNumber} / {ticket.status}</p><h2 className="font-semibold text-zinc-900">{ticket.title}</h2><p className="text-sm text-zinc-600">{ticket.description}</p></Link>) : <EmptyState title="No support tickets" description="Create a support request or wait for incoming customer issues." actionHref="/support/new" actionLabel="New Ticket" />}</section>
    </PageShell>
  );
}

export function NewSupportTicketPageContent() {
  const { user, getToken } = useAppRole();
  const [form, setForm] = useState({ title: '', description: '', category: 'general', priority: 'normal' });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing token');
      await apiService.createSupportTicket(token, {
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority as 'low' | 'normal' | 'high' | 'urgent'
      });
      toast.success('Support ticket created');
    } catch {
      toast.error('Failed to create ticket');
    }
  };
  return (
    <PageShell showTabs={false}>
      <PageHeader title="New Support Ticket" description="Create a support request with priority and category." />
      <form onSubmit={(event) => void submit(event)} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        {(['title', 'description', 'category', 'priority'] as const).map((field) => <input key={field} value={form[field]} onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))} placeholder={field} className="mb-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black" required={field === 'title' || field === 'description'} />)}
        <ActionButton type="submit">Create Ticket</ActionButton>
      </form>
    </PageShell>
  );
}

export function SupportDetailPageContent() {
  const params = useParams<{ id: string }>();
  const { isLoaded, ready, user, getToken } = useAppRole();
  const [ticket, setTicket] = useState<SupportTicketItem | null>(null);
  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !ready || !user || !params.id) return;
      const token = await getToken();
      if (!token) return;
      setTicket((await apiService.getSupportTicket(token, params.id)).ticket);
    };
    void load();
  }, [getToken, isLoaded, params.id, ready, user]);
  return <PageShell showTabs={false}><PageHeader title={ticket?.title || 'Support Ticket'} description={ticket ? `${ticket.ticketNumber} / ${ticket.status}` : 'Loading'} />{ticket ? <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><p className="text-sm text-zinc-700">{ticket.description}</p></section> : <EmptyState title="Ticket not found" description="This ticket is unavailable." />}</PageShell>;
}
