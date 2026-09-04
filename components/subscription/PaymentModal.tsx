"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function PaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/subscription/activate", { method: "POST" });
    await update();
    setLoading(false);
    setStep("success");
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setStep("form"), 300);
    router.refresh();
  };

  return (
    <Modal open={open} onClose={handleClose} className="w-full max-w-sm p-6">
      {step === "form" ? (
        <>
          <h2 className="text-lg font-semibold mb-1">Оформление PRO</h2>
          <p className="text-xs text-text-muted mb-5">
            Демо-оплата — реальное списание не происходит.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Номер карты"
              placeholder="0000 0000 0000 0000"
              required
              maxLength={19}
              value={card}
              onChange={(e) => setCard(e.target.value)}
            />
            <div className="flex gap-3">
              <Input
                label="Срок действия"
                placeholder="ММ/ГГ"
                required
                maxLength={5}
                className="flex-1"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
              <Input
                label="CVC"
                placeholder="000"
                required
                maxLength={3}
                className="flex-1"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
              />
            </div>
            <Button type="submit" variant="accent" className="w-full mt-2" disabled={loading}>
              {loading ? "Обрабатываем…" : "Оплатить 199 ₽"}
            </Button>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <span className="text-4xl">✓</span>
          <h2 className="text-lg font-semibold">PRO активирован</h2>
          <p className="text-sm text-text-secondary">
            Тебе доступны все модели, SHAP и безлимитные запуски.
          </p>
          <Button variant="accent" onClick={handleClose}>
            Отлично
          </Button>
        </div>
      )}
    </Modal>
  );
}
