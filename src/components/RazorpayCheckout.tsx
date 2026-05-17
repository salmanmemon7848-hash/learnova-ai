'use client';

import { useState } from 'react';

interface RazorpayCheckoutProps {
  plan: string;
  role: string;
  planLabel: string;
  onSuccess: () => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckout({
  plan, role, planLabel, onSuccess, onClose
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Detect mode from key
  const isTestMode = !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('your_key_here')
    || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith('rzp_test_');
  const mode = isTestMode ? 'test' : 'live';

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise(resolve => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, role, mode }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || orderData.error) {
        setError(orderData.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      // Load Razorpay script
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError('Failed to load payment gateway. If you are using Brave or an Adblocker extension, please disable Brave Shields or pause Adblock for "http://localhost:3000" to allow the payment gateway to load.');
        setLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Thinkior AI',
        description: `${planLabel} — Monthly Plan`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
                role,
                mode,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              onSuccess();
            } else {
              setError('Payment verification failed. Contact support.');
            }
          } catch (err) {
            setError('Payment verified but activation failed. Contact support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#7c3aed',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onClose();
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error('[Razorpay] Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, padding: '10px 14px',
          color: '#ef4444', fontSize: '0.875rem', marginBottom: 12,
        }}>
          ⚠️ {error}
        </div>
      )}
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: '100%', padding: '14px',
          borderRadius: 10,
          background: loading ? 'rgba(124,58,237,0.5)' : '#7c3aed',
          border: 'none', color: '#fff',
          fontWeight: 600, fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {loading ? '⏳ Processing...' : `Pay ${planLabel}`}
      </button>
      {mode === 'test' && (
        <p style={{ fontSize: '0.72rem', opacity: 0.4, textAlign: 'center', marginTop: 8 }}>
          🧪 Test mode — use card 4111 1111 1111 1111
        </p>
      )}
    </div>
  );
}
