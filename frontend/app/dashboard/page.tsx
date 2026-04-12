'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { apiService, TicketItem } from '@/lib/api';

const TICKET_PRICE = 20;

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [count, setCount] = useState('1');
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const totalAmount = useMemo(() => {
    const n = Number(count);
    return Number.isInteger(n) && n > 0 ? n * TICKET_PRICE : 0;
  }, [count]);

  const loadDashboard = useCallback(async (clerkUserId: string) => {
    const userData = await apiService.syncUser({
      clerkUserId,
      name: user?.fullName || 'Bus User',
      email: user?.primaryEmailAddress?.emailAddress || '',
      phone: user?.primaryPhoneNumber?.phoneNumber
    });

    if (userData.role === 'admin') {
      router.replace('/admin');
      return;
    }

    const myTickets = await apiService.getMyTickets(clerkUserId);
    setBalance(myTickets.balance ?? userData.balance);
    setTickets(myTickets.tickets);
  }, [router, user]);

  useEffect(() => {
    const init = async () => {
      if (!isLoaded) return;
      if (!user) {
        router.replace('/');
        return;
      }

      try {
        await loadDashboard(user.id);
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [isLoaded, user, router, loadDashboard]);

  const handleAddBalance = async () => {
    if (!user) return;

    const addAmount = Number(amount);
    if (!Number.isFinite(addAmount) || addAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    try {
      setError('');
      const response = await apiService.addBalance(user.id, addAmount);
      setBalance(response.balance);
      setAmount('');
    } catch {
      setError('Failed to add balance');
    }
  };

  const handleBookTickets = async () => {
    if (!user) return;

    const n = Number(count);
    if (!Number.isInteger(n) || n <= 0) {
      setError('Ticket count must be a positive integer');
      return;
    }

    if (balance < n * TICKET_PRICE) {
      setError('Insufficient balance for this booking');
      return;
    }

    try {
      setBooking(true);
      setError('');
      const response = await apiService.bookTickets(user.id, n);
      setBalance(response.balance);
      setTickets((prev) => [...response.tickets, ...prev]);
    } catch {
      setError('Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>

        <div className="rounded-xl border border-orange-200 p-5 bg-orange-50">
          <p className="text-gray-700">Wallet Balance</p>
          <p className="text-4xl font-bold text-orange-600">₹{balance}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Add Balance</h2>
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                onClick={() => void handleAddBalance()}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
              >
                Add
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Book Tickets</h2>
            <p className="text-sm text-gray-600 mt-1">Ticket Price: ₹{TICKET_PRICE}</p>
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                min={1}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                placeholder="No. of tickets"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
              <button
                onClick={() => void handleBookTickets()}
                disabled={booking}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
              >
                {booking ? 'Booking...' : `Pay ₹${totalAmount}`}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">My QR Tickets</h2>
          {tickets.length === 0 ? (
            <p className="text-gray-500">No tickets yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((ticket) => (
                <div key={ticket.ticketId} className="rounded-xl border border-gray-200 p-4 bg-white">
                  <Image
                    src={ticket.qr}
                    alt={`Ticket ${ticket.ticketId}`}
                    width={300}
                    height={300}
                    className="w-full aspect-square object-contain bg-gray-50 rounded-lg border border-gray-100"
                    unoptimized
                  />
                  <p className="mt-3 text-xs font-mono break-all text-gray-700">{ticket.ticketId}</p>
                  <p
                    className={`mt-2 text-xs font-semibold ${
                      ticket.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {ticket.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
