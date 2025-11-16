import { useEffect, useState } from 'react';

declare global {
  interface Window {
    snap: any;
  }
}

interface UseMidtransReturn {
  isLoaded: boolean;
  isLoading: boolean;
}

export const useMidtrans = (): UseMidtransReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    
    const midtransScriptUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    // Cek apakah script sudah ada
    let scriptTag = document.querySelector(
      `script[src="${midtransScriptUrl}"]`
    ) as HTMLScriptElement;

    if (!scriptTag) {
      // Buat script tag baru
      scriptTag = document.createElement('script');
      scriptTag.src = midtransScriptUrl;
      scriptTag.setAttribute('data-client-key', clientKey || '');
      
      scriptTag.onload = () => {
        setIsLoaded(true);
        setIsLoading(false);
        console.log('✅ Midtrans script loaded');
      };
      
      scriptTag.onerror = () => {
        console.error('❌ Failed to load Midtrans script');
        setIsLoading(false);
      };
      
      document.body.appendChild(scriptTag);
    } else {
      // Script sudah ada, langsung set loaded
      setIsLoaded(true);
      setIsLoading(false);
    }

    return () => {
      // Cleanup jika perlu
    };
  }, []);

  return { isLoaded, isLoading };
};