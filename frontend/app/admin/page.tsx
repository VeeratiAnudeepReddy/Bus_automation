'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { useUser } from '@clerk/nextjs';
import { apiService } from '@/lib/api';

type Analytics = {
  totalTicketsSold: number;
  totalTicketsUsed: number;
  dailyStats: { _id: string; sold: number; used: number }[];
};

export default function AdminPage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanResult, setScanResult] = useState('');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState('');

  const loadAnalytics = async (clerkUserId: string) => {
    const data = await apiService.getAdminAnalytics(clerkUserId);
    setAnalytics(data);
  };

  useEffect(() => {
    const init = async () => {
      if (!isLoaded) return;
      if (!user) {
        router.replace('/');
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
          router.replace('/dashboard');
          return;
        }

        await loadAnalytics(user.id);
      } catch {
        setError('Admin access denied or analytics unavailable');
      }
    };

    void init();

    return () => {
      if (scanner) {
        void scanner.stop().catch(() => undefined);
      }
    };
  }, [isLoaded, user, router, scanner]);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode('admin-qr-reader');
      setScanner(html5QrCode);
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (!user) return;
          await html5QrCode.stop();
          setScanning(false);

          const response = await apiService.scanTicket(user.id, decodedText);
          setScanResult(response.result);
          await loadAnalytics(user.id);
        },
        () => undefined
      );
      setScanning(true);
      setError('');
    } catch {
      setError('Unable to start scanner. Check camera permissions.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>

        {analytics && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-orange-200 p-5 bg-orange-50">
              <p className="text-sm text-gray-600">Total Tickets Sold</p>
              <p className="text-4xl font-bold text-orange-600">{analytics.totalTicketsSold}</p>
            </div>
            <div className="rounded-xl border border-orange-200 p-5 bg-orange-50">
              <p className="text-sm text-gray-600">Total Tickets Used</p>
              <p className="text-4xl font-bold text-orange-600">{analytics.totalTicketsUsed}</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">QR Scanner</h2>
          {!scanning ? (
            <button
              onClick={() => void startScanner()}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
            >
              Start Scanner
            </button>
          ) : (
            <div id="admin-qr-reader" className="rounded-lg overflow-hidden border border-orange-300" />
          )}

          {scanResult && (
            <p
              className={`text-sm font-semibold ${
                scanResult === 'VALID'
                  ? 'text-green-600'
                  : scanResult === 'REJECT'
                  ? 'text-orange-600'
                  : 'text-red-600'
              }`}
            >
              Scan Result: {scanResult}
            </p>
          )}
        </div>

        {analytics && (
          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Daily Stats (Last 7 Days)</h2>
            {analytics.dailyStats.length === 0 ? (
              <p className="text-sm text-gray-500">No ticket activity in the last 7 days.</p>
            ) : (
              <div className="space-y-2">
                {analytics.dailyStats.map((day) => (
                  <div key={day._id} className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-700">{day._id}</span>
                    <span className="text-sm text-gray-700">
                      Sold: <strong>{day.sold}</strong> | Used: <strong>{day.used}</strong>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
