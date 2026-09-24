"use client";

import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { txUrl } from "@/lib/config";
import type { TransactionState } from "@/lib/transaction";

const titles = {
  idle: "",
  preparing: "Checking the transaction",
  signing: "Confirm in your wallet",
  pending: "Submitted · waiting for confirmation",
  confirmed: "Confirmed onchain",
  reverted: "Transaction reverted",
  rejected: "Transaction not completed",
  unknown: "Confirmation unavailable",
};

export function TransactionStatus({
  state,
  label,
  onReset,
  onRecheck,
}: {
  state: TransactionState;
  label?: string;
  onReset?: () => void;
  onRecheck?: () => void;
}) {
  if (state.stage === "idle") return null;
  const busy = ["preparing", "signing", "pending"].includes(state.stage);
  const hash = state.replacementHash ?? state.hash;
  const link = hash && txUrl(hash);
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      <Alert
        variant={
          state.stage === "reverted" || state.stage === "rejected"
            ? "destructive"
            : "default"
        }
      >
        {busy ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : state.stage === "confirmed" ? (
          <CheckCircle2 aria-hidden="true" />
        ) : (
          <CircleAlert aria-hidden="true" />
        )}
        <AlertTitle>
          {label ? `${label}: ` : ""}
          {titles[state.stage]}
        </AlertTitle>
        <AlertDescription>
          {state.message && <p>{state.message}</p>}
          {state.stage === "pending" && (
            <p>
              A transaction hash is not a success receipt. Keep this page open.
            </p>
          )}
          {state.stage === "unknown" && (
            <p>
              Do not submit the same action again until this hash has been
              checked. A network outage does not mean the transaction failed.
            </p>
          )}
          {hash &&
            (link ? (
              <a
                className="text-link safe-address"
                href={link}
                target="_blank"
                rel="noreferrer"
              >
                View transaction {hash}
              </a>
            ) : (
              <p className="safe-address">Local transaction: {hash}</p>
            ))}
          {state.stage === "unknown" && onReset && (
            <Button variant="outline" onClick={onReset}>
              I have checked the transaction
            </Button>
          )}
          {state.stage === "unknown" && onRecheck && (
            <Button variant="outline" onClick={onRecheck}>
              Recheck receipt
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
