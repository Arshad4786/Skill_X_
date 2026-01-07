import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-secondary">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );
}
