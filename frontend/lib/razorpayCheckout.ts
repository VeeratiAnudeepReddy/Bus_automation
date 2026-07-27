'use client';

type RazorpayPaymentResult = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayWindow = Window & {
  Razorpay?: new (options: Record<string, unknown>) => {
    open: () => void;
    on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
  };
};

export type CheckoutOrder = {
  keyId?: string | null;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
};

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if ((window as RazorpayWindow).Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-busqr-razorpay="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean((window as RazorpayWindow).Razorpay)), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.busqrRazorpay = 'true';
    script.onload = () => resolve(Boolean((window as RazorpayWindow).Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openHostedCheckout(options: {
  order: CheckoutOrder;
  name?: string;
  description?: string;
  prefill?: { email?: string; name?: string; contact?: string };
  onSuccess: (payment: RazorpayPaymentResult) => void | Promise<void>;
  onDismiss?: () => void;
}): Promise<void> {
  const ready = await loadRazorpayScript();
  if (!ready) throw new Error('Razorpay checkout unavailable');

  const key = options.order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!key) throw new Error('Missing Razorpay key id');

  const Razorpay = (window as RazorpayWindow).Razorpay;
  if (!Razorpay) throw new Error('Razorpay checkout unavailable');

  const checkout = new Razorpay({
    key,
    amount: options.order.order.amount,
    currency: options.order.order.currency || 'INR',
    name: options.name || 'BusQR',
    description: options.description || 'Payment',
    order_id: options.order.order.id,
    prefill: options.prefill || {},
    handler: (payment: RazorpayPaymentResult) => {
      void Promise.resolve(options.onSuccess(payment));
    },
    modal: {
      ondismiss: () => options.onDismiss?.()
    }
  });

  checkout.on('payment.failed', (response) => {
    throw new Error(response?.error?.description || 'Payment failed');
  });

  checkout.open();
}
