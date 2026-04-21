'use client';

import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { Html5Qrcode } from 'html5-qrcode';
import { Flashlight, ScanLine } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import ScannerCard from '@/components/ScannerCard';
import { apiService, ScanResult } from '@/lib/api';
import { addActivity } from '@/lib/activity';

type Analytics = {
  totalScannedTickets: number;
  dailyScannedStats: { _id: string; scanned: number }[];
};

const scannerId = 'admin-busqr-scanner';

export default function AdminPage() {
  const { isLoaded, user } = useUser();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [data, setData] = useState<Analytics | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user) {
        return;
      }

      try {
        const appUser = await apiService.syncUser({
          clerkUserId: user.id,
          name: user.fullName || 'Bus User',
          email: user.primaryEmailAddress?.emailAddress || '',
          phone: user.primaryPhoneNumber?.phoneNumber
        });
        if (appUser.role !== 'admin') {
          setAllowed(false);
          return;
        }
        setAllowed(true);
        setData(await apiService.getAdminAnalytics(user.id));
      } catch {
        setAllowed(false);
      }
    };

    void load();

    return () => {
      if (scannerRef.current) {
        void scannerRef.current.stop().catch(() => undefined);
      }
    };
  }, [isLoaded, user]);

  const validateTicket = async (payload: string) => {
    if (!user) {
      return;
    }
    try {
      const response = await apiService.scanTicket(user.id, payload);
      setResult(response);
      setData(await apiService.getAdminAnalytics(user.id));
      addActivity({
        title: `Admin Scan ${response.result}`,
        subtitle: response.ticket?.ticketId || payload
      });
    } catch {
      toast.error('Validation failed');
    }
  };

  const startScanner = async () => {
    if (!user) {
      return;
    }
    try {
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          await validateTicket(decodedText);
        },
        () => undefined
      );
      setScanning(true);
      toast.success('Scanner started');
    } catch {
      toast.error('Unable to start scanner');
    }
  };

  const submitManual = async () => {
    if (!manual.trim()) {
      return;
    }
    await validateTicket(manual.trim());
  };

  return (
    <PageShell showTabs={false}>
      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-zinc-900">Admin Scanner Dashboard</h1>
        {!allowed ? (
          <p className="mt-2 text-sm text-zinc-500">Admin access required.</p>
        ) : (
          <div className="mt-3 space-y-3 text-sm">
            <div className="rounded-xl border border-zinc-200 p-3">
              Tickets Scanned by You: <strong>{data?.totalScannedTickets ?? 0}</strong>
            </div>
            <div className="rounded-xl border border-zinc-200 p-3">
              Last 7 Days: <strong>{data?.dailyScannedStats.reduce((n, day) => n + day.scanned, 0) ?? 0}</strong>
            </div>
          </div>
        )}
      </section>

      {allowed ? (
        <>
          <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Scanner Reference Image</p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200">
              <Image
                src="/scanner-reference.png"
                alt="BusQR scanner reference"
                width={1024}
                height={768}
                className="h-auto w-full"
                priority
              />
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Live Camera Scanner</h2>
            {!scanning ? (
              <ActionButton className="mt-3 w-full" onClick={() => void startScanner()}>
                <span className="inline-flex items-center gap-2">
                  <ScanLine size={16} /> Start Scanner
                </span>
              </ActionButton>
            ) : null}

            <div className="relative mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
              <div id={scannerId} className="overflow-hidden rounded-xl" />
              {scanning ? (
                <div className="pointer-events-none absolute inset-0 m-8 rounded-2xl border-2 border-black/60" />
              ) : null}
            </div>
            <button className="mt-2 inline-flex items-center gap-2 rounded-lg text-sm text-zinc-600">
              <Flashlight size={16} /> Flash
            </button>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-zinc-900">Manual input fallback</p>
            <div className="mt-3 flex gap-2">
              <input
                value={manual}
                onChange={(event) => setManual(event.target.value)}
                placeholder="Enter Ticket ID"
                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <ActionButton onClick={() => void submitManual()}>Validate</ActionButton>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Daily Scan Analytics</p>
            <div className="mt-3 space-y-2 text-sm">
              {data?.dailyScannedStats.length ? (
                data.dailyScannedStats.map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3">
                    <span className="text-zinc-600">{item._id}</span>
                    <span className="font-semibold text-zinc-900">{item.scanned} scans</span>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500">No scans in the last 7 days.</p>
              )}
            </div>
          </section>
        </>
      ) : null}

      {result ? <ScannerCard result={result} /> : null}
    </PageShell>
  );
}
