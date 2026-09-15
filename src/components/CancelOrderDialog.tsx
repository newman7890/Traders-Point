import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Loader2, XCircle, ShieldCheck } from "lucide-react";

interface CancelOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderShortId?: string;
  totalAmount?: number;
  currency?: string;
  onSuccess?: () => void;
}

const CANCELLATION_REASONS = [
  "Changed my mind / No longer needed",
  "Ordered by mistake / duplicate order",
  "Found a better price or alternative",
  "Incorrect delivery address or details",
  "Delivery time is too long",
  "Other reason",
];

export const CancelOrderDialog = ({
  isOpen,
  onClose,
  orderId,
  orderShortId,
  totalAmount,
  currency = "GH₵",
  onSuccess,
}: CancelOrderDialogProps) => {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const displayShortId = orderShortId || orderId.slice(0, 8).toUpperCase();

  const handleConfirmCancel = async () => {
    if (!orderId) return;

    const finalReason =
      selectedReason === "Other reason" && customReason.trim()
        ? `Other: ${customReason.trim()}`
        : selectedReason;

    setSubmitting(true);
    try {
      // 1. Try invoking the process-refund Edge Function (handles Paystack Refund API + cancellation)
      const { data: fnData, error: fnError } = await supabase.functions.invoke("process-refund", {
        body: {
          orderId,
          reason: finalReason,
        },
      });

      if (!fnError && fnData?.success) {
        toast.success(
          fnData.message || `Order #${displayShortId} has been cancelled successfully.`
        );
        onSuccess?.();
        onClose();
        return;
      }

      if (fnError && fnData?.error) {
        throw new Error(fnData.error);
      }

      // 2. Fallback: call cancel_customer_order RPC directly
      const { data, error } = await (supabase.rpc as any)("cancel_customer_order", {
        _order_id: orderId,
        _reason: finalReason,
      });

      if (error) {
        throw error;
      }

      toast.success(`Order #${displayShortId} has been cancelled successfully.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      toast.error(
        err.message ||
          "Failed to cancel order. It may have already been dispatched by the rider."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !submitting && !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto sm:mx-0">
            <XCircle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold font-plus-jakarta text-foreground">
            Cancel Order #{displayShortId}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to cancel this order?
            {totalAmount !== undefined && (
              <span className="block mt-1 font-semibold text-foreground">
                Order Value: {currency} {totalAmount.toFixed(2)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Refund Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Buyer Protection:</strong> If you paid online via Mobile Money or Card, a full refund will be processed back to your original payment channel.
            </span>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reason for Cancellation
            </Label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {CANCELLATION_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                    selectedReason === reason
                      ? "border-destructive bg-destructive/5 text-foreground ring-1 ring-destructive/30"
                      : "border-border bg-secondary/20 hover:bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellation_reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-destructive w-4 h-4"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason Textarea if selected "Other reason" */}
          {selectedReason === "Other reason" && (
            <div className="space-y-1.5">
              <Label htmlFor="custom-reason" className="text-xs font-medium">
                Please provide more details (optional)
              </Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Why do you want to cancel this order?"
                className="text-xs sm:text-sm resize-none h-20 rounded-xl"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto rounded-xl"
          >
            Keep Order
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmCancel}
            disabled={submitting}
            className="w-full sm:w-auto rounded-xl gap-2 shadow-md shadow-destructive/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Confirm Cancellation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
