import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { ContinuePaymentContent } from "./continuePaymentPage";

// 3. Buat Wrapper Baru di paling bawah
export default function ContinuePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        </div>
      }
    >
      <ContinuePaymentContent />
    </Suspense>
  );
}
