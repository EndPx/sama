"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatUnits, type Address, type Hex } from "viem";
import { currencyAbi, demoAccessAbi, offeringAbi } from "@sama/chain/abi";
import { Download, RefreshCw, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletControls } from "@/components/wallet/controls";
import { TransactionStatus } from "@/components/transaction-status";
import { useOffering } from "@/hooks/use-offering";
import { useTransaction } from "@/hooks/use-transaction";
import { formatAmount, parseAmount, parseFdv, stageOf } from "@/lib/amounts";
import {
  backupCommitment,
  createBackup,
  downloadBackup,
  isSubmittedCommitment,
  isSubmissionProvenFailed,
  loadBackupState,
  persistBackup,
  restoreBackup,
  validateBackupContext,
  type BidBackup,
} from "@/lib/bid-backup";
import { orderedReveals, type OfferingState } from "@/lib/chain-client";
import {
  addressUrl,
  chain,
  configured,
  contracts,
  localMode,
  networkName,
} from "@/lib/config";
import type { ContractWrite } from "@/lib/transaction";
import type { TransactionState } from "@/lib/transaction";

export function utcDate(timestamp: bigint) {
  const date = new Date(Number(timestamp) * 1000);
  return Number.isNaN(date.getTime())
    ? `Unix time ${timestamp}`
    : date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

export function OfferingPanel({ portfolio = false }: { portfolio?: boolean }) {
  const { address } = useAccount();
  const offering = useOffering();
  return (
    <div className="stack">
      <Card>
        <CardHeader>
          <CardTitle>
            {portfolio ? "Your testnet account" : "Take part in the demo"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WalletControls />
        </CardContent>
      </Card>
      {!configured ? (
        <Alert>
          <AlertTitle>Deployment not connected yet</AlertTitle>
          <AlertDescription>
            The application has no configured contract deployment. Fixed terms
            are available above; live balances and transaction controls will
            appear only after a deployment is connected.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {offering.isPending && (
            <div className="stack" role="status">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
              <span className="sr-only">Reading the offering</span>
            </div>
          )}
          {offering.isError && (
            <Alert variant="destructive">
              <AlertTitle>Could not refresh onchain state</AlertTitle>
              <AlertDescription>
                <p>
                  {offering.data
                    ? "The last snapshot below may be stale. Transactions are disabled until a fresh read succeeds."
                    : "Balances are unavailable, not zero. Please retry the connection."}
                </p>
                <Button
                  variant="outline"
                  onClick={() => void offering.refetch()}
                >
                  Retry connection
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {offering.data && (
            <>
              <OfferingSnapshot
                data={offering.data}
                refresh={() => void offering.refetch()}
                refreshing={offering.isFetching}
              />
              {address ? (
                <Participant
                  key={`${chain.id}:${contracts.offering}:${address}`}
                  address={address}
                  data={offering.data}
                  stale={offering.isError}
                  portfolio={portfolio}
                />
              ) : (
                <Alert>
                  <AlertTitle>A wallet makes this personal</AlertTitle>
                  <AlertDescription>
                    Connect to see your deposit, claimable balances, and demo
                    access. Reading the offering does not require a wallet.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function OfferingSnapshot({
  data,
  refresh,
  refreshing,
}: {
  data: OfferingState;
  refresh: () => void;
  refreshing: boolean;
}) {
  const url = contracts.offering && addressUrl(contracts.offering);
  return (
    <Card>
      <CardHeader>
        <div className="cluster justify-between">
          <Badge variant="secondary">
            {stageOf(data.phase, data.timestamp, data.revealEnd)}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh offering"
            disabled={refreshing}
            onClick={refresh}
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
          </Button>
        </div>
        <CardTitle>Offering snapshot</CardTitle>
      </CardHeader>
      <CardContent className="stack">
        <dl className="terms">
          <div>
            <dt>Committed deposits · demoUSDC</dt>
            <dd>{formatAmount(data.totalCommitted, 6, 6)}</dd>
          </div>
          <div>
            <dt>Accepted capital · demoUSDC</dt>
            <dd>{formatAmount(data.acceptedTotal, 6, 6)}</dd>
          </div>
          <div>
            <dt>Clearing FDV · demoUSDC</dt>
            <dd>
              {data.clearingFdv > 0n
                ? formatAmount(data.clearingFdv, 6, 6)
                : "Not set"}
            </dd>
          </div>
          <div>
            <dt>Read at block</dt>
            <dd>{data.block.toString()}</dd>
          </div>
        </dl>
        <p className="text-sm text-muted-foreground">
          Committed deposits are public escrow, not valid demand or a completed
          raise.
        </p>
        <Separator />
        <dl className="schedule-list">
          <div>
            <dt>Commit opens</dt>
            <dd>{utcDate(data.commitStart)}</dd>
          </div>
          <div>
            <dt>Commit closes / reveal opens</dt>
            <dd>{utcDate(data.commitEnd)}</dd>
          </div>
          <div>
            <dt>Reveal closes / settlement opens</dt>
            <dd>{utcDate(data.revealEnd)}</dd>
          </div>
        </dl>
        {url && (
          <a
            className="text-link text-sm"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            Inspect the offering contract
          </a>
        )}
        {data.paused && (
          <Alert>
            <AlertTitle>Offering paused</AlertTitle>
            <AlertDescription>
              Commit, reveal, and settlement are temporarily blocked. Available
              refunds remain claimable.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

type Runner = ReturnType<typeof useTransaction>;
type Send = (
  label: string,
  simulation: ContractWrite,
) => ReturnType<Runner["execute"]>;

function Participant({
  address,
  data,
  stale,
  portfolio,
}: {
  address: Address;
  data: OfferingState;
  stale: boolean;
  portfolio: boolean;
}) {
  const { chainId } = useAccount();
  const transaction = useTransaction();
  const [label, setLabel] = useState("");
  const [actionError, setActionError] = useState("");
  const [sorting, setSorting] = useState(false);
  const [storedBackup] = useState(() =>
    loadBackupState(chain.id, contracts.offering!, address),
  );
  const [backup, setBackup] = useState<BidBackup | null>(storedBackup.backup);
  const [backupCorrupted, setBackupCorrupted] = useState(
    storedBackup.corrupted,
  );
  const storeBackup = (next: BidBackup) => {
    setBackup(next);
    setBackupCorrupted(false);
  };
  const blocked =
    stale ||
    chainId !== chain.id ||
    transaction.busy ||
    sorting ||
    transaction.state.stage === "unknown" ||
    data.ethBalance === 0n;
  const send: Send = async (nextLabel, simulation) => {
    setActionError("");
    setLabel(nextLabel);
    return transaction.execute({ simulation });
  };
  const settle = async () => {
    setSorting(true);
    setActionError("");
    try {
      const ordered = await orderedReveals();
      await send("Settlement", {
        address: contracts.offering!,
        abi: offeringAbi,
        functionName: "settle",
        args: [ordered],
      });
    } catch {
      setActionError(
        "Could not build the complete bidder list. No settlement was submitted. Refresh and try again.",
      );
    } finally {
      setSorting(false);
    }
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your balances</CardTitle>
        </CardHeader>
        <CardContent className="stack">
          <dl className="terms">
            <div>
              <dt>Available demoUSDC</dt>
              <dd>{formatAmount(data.currencyBalance, 6, 6)}</dd>
            </div>
            <div>
              <dt>KIRA holdings</dt>
              <dd>{formatAmount(data.kiraBalance, 18, 6)}</dd>
            </div>
            <div>
              <dt>Committed demoUSDC</dt>
              <dd>{formatAmount(data.bid.amount, 6, 6)}</dd>
            </div>
            <div>
              <dt>Accepted demoUSDC</dt>
              <dd>{formatAmount(data.bid.accepted, 6, 6)}</dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground">
            {networkName} ETH for gas: {formatAmount(data.ethBalance, 18, 8)}.
            These assets carry no real monetary or equity rights.
          </p>
          {data.ethBalance === 0n && (
            <Alert>
              <AlertTitle>You need {networkName} ETH for gas</AlertTitle>
              <AlertDescription>
                {localMode ? (
                  "Fund this wallet from the local Anvil fixture."
                ) : (
                  <p>
                    Send only Arbitrum Sepolia ETH to the connected wallet.{" "}
                    <a
                      className="text-link"
                      href="https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info"
                      target="_blank"
                      rel="noreferrer"
                    >
                      See official network and faucet guidance.
                    </a>{" "}
                    Never send mainnet funds.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
          <div className="cluster">
            <Badge variant={data.eligible ? "secondary" : "outline"}>
              {data.eligible ? "Demo access enabled" : "Not enrolled"}
            </Badge>
            {!data.eligible && (
              <Button
                variant="outline"
                disabled={blocked}
                onClick={() =>
                  void send("Demo enrollment", {
                    address: contracts.demoAccess!,
                    abi: demoAccessAbi,
                    functionName: "join",
                  })
                }
              >
                Enable demo access
              </Button>
            )}
            <Button
              variant="outline"
              disabled={blocked || data.timestamp < data.nextClaimAt}
              onClick={() =>
                void send("Demo faucet", {
                  address: contracts.currency!,
                  abi: currencyAbi,
                  functionName: "claim",
                })
              }
            >
              Get 250,000 demoUSDC
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Open enrollment is simulation access, not KYC. The valueless faucet
            is available once per address every 24 hours.
            {data.timestamp < data.nextClaimAt &&
              ` Next claim: ${utcDate(data.nextClaimAt)}.`}
          </p>
        </CardContent>
      </Card>
      <TransactionStatus
        state={transaction.state}
        label={label}
        onRecheck={() => void transaction.recheckUnknown()}
      />
      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}
      {data.phase === 1 && data.bid.amount === 0n && !portfolio && (
        <CommitForm
          address={address}
          data={data}
          backup={backup}
          backupCorrupted={backupCorrupted}
          setBackupCorrupted={setBackupCorrupted}
          setBackup={storeBackup}
          transactionState={transaction.state}
          send={send}
          blocked={blocked || data.paused || !data.eligible}
        />
      )}
      {data.bid.amount > 0n && data.phase < 3 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {data.bid.revealed
                ? "Your bid is revealed"
                : "Your deposit is committed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="stack">
            <p>
              {data.bid.revealed
                ? "Your valuation is now public. The final allocation is determined at settlement."
                : "Keep your backup safe and return before the reveal window closes. Unrevealed deposits cannot win an allocation; they become refundable after finalization or cancellation."}
            </p>
            <RevealForm
              address={address}
              data={data}
              backup={backup}
              setBackup={storeBackup}
              send={send}
              blocked={blocked || data.paused}
            />
          </CardContent>
        </Card>
      )}
      {data.phase === 2 && data.timestamp >= data.revealEnd && (
        <Card>
          <CardHeader>
            <CardTitle>Ready for a result</CardTitle>
          </CardHeader>
          <CardContent className="stack">
            <p>
              The reveal window has closed. Anyone can submit the complete,
              sorted bidder list; the contract checks the list and every
              allocation.
            </p>
            <Button
              disabled={blocked || data.paused}
              onClick={() => void settle()}
            >
              {sorting ? "Reading revealed bids" : "Settle the offering"}
            </Button>
          </CardContent>
        </Card>
      )}
      {data.phase >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {data.phase === 3 ? "Your settlement" : "Your refund"}
            </CardTitle>
          </CardHeader>
          <CardContent className="stack">
            <dl className="terms">
              <div>
                <dt>Claimable KIRA</dt>
                <dd className="break-words">
                  {formatAmount(
                    data.bid.tokenClaimed ? 0n : data.allocation,
                    18,
                    18,
                  )}
                </dd>
              </div>
              <div>
                <dt>Claimable demoUSDC</dt>
                <dd>{formatAmount(data.refund, 6, 6)}</dd>
              </div>
            </dl>
            <div className="cluster">
              <Button
                disabled={
                  blocked ||
                  !data.eligible ||
                  data.tokenPaused ||
                  data.phase !== 3 ||
                  data.allocation === 0n ||
                  data.bid.tokenClaimed
                }
                onClick={() =>
                  void send("KIRA claim", {
                    address: contracts.offering!,
                    abi: offeringAbi,
                    functionName: "claimTokens",
                  })
                }
              >
                {data.bid.tokenClaimed ? "KIRA already claimed" : "Claim KIRA"}
              </Button>
              <Button
                variant="outline"
                disabled={
                  blocked || data.refund === 0n || data.bid.refundClaimed
                }
                onClick={() =>
                  void send("Refund", {
                    address: contracts.offering!,
                    abi: offeringAbi,
                    functionName: "claimRefund",
                  })
                }
              >
                {data.bid.refundClaimed
                  ? "Refund already claimed"
                  : "Claim refund"}
              </Button>
            </div>
            {data.tokenPaused && (
              <p className="text-sm">
                KIRA transfers are paused. Token claims resume after unpause;
                demoUSDC refunds are independent.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Claims are separate transactions. Zero claimable balance is normal
              for a losing bid, an already claimed amount, or a bid without a
              refund.
            </p>
          </CardContent>
        </Card>
      )}
      {portfolio && data.bid.amount === 0n && (
        <Alert>
          <AlertTitle>No deposit from this wallet</AlertTitle>
          <AlertDescription>
            Your connected wallet has not committed to this offering.{" "}
            <Link className="text-link" href="/startups/kirana-ai#participate">
              Visit Kirana AI to participate.
            </Link>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

function CommitForm({
  address,
  data,
  backup,
  backupCorrupted,
  setBackupCorrupted,
  setBackup,
  transactionState,
  send,
  blocked,
}: {
  address: Address;
  data: OfferingState;
  backup: BidBackup | null;
  backupCorrupted: boolean;
  setBackupCorrupted: (corrupted: boolean) => void;
  setBackup: (b: BidBackup) => void;
  transactionState: TransactionState;
  send: Send;
  blocked: boolean;
}) {
  const [amount, setAmount] = useState("100000");
  const [fdv, setFdv] = useState("5000000");
  const [exported, setExported] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState(false);
  const [submittedCommitment, setSubmittedCommitment] = useState<Hex>();
  const [submittedHash, setSubmittedHash] = useState<Hex>();
  const prepare = () => {
    setError("");
    try {
      const stored = loadBackupState(chain.id, contracts.offering!, address);
      if (backupCorrupted || stored.corrupted) {
        setBackupCorrupted(true);
        throw new Error(
          "A stored reveal backup is unreadable. Do not prepare a replacement; restore your exported backup before committing.",
        );
      }
      const prepared =
        stored.backup ??
        createBackup(
          chain.id,
          contracts.offering!,
          address,
          parseAmount(amount, 6),
          parseFdv(fdv),
        );
      validateBackupContext(prepared, chain.id, contracts.offering!, address);
      persistBackup(prepared);
      setBackup(prepared);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not prepare your backup. No bid was sent.",
      );
    }
  };
  const restoreFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 16_384) throw new Error();
      const restored = restoreBackup(
        await file.text(),
        chain.id,
        contracts.offering!,
        address,
      );
      setBackup(restored);
      setError("");
    } catch {
      setError(
        "Backup could not be restored. Use the JSON file for this wallet, chain, and offering. Your stored draft was not replaced.",
      );
    }
  };
  const exportFile = () => {
    if (!backup) return;
    try {
      persistBackup(backup);
      downloadBackup(backup);
      setExported(true);
      setError("");
    } catch {
      setError(
        "Could not export your backup. No bid was sent. Check your browser storage and download settings.",
      );
    }
  };
  const commit = async () => {
    if (!backup || !acknowledged || !exported) return;
    // This is the only user action that releases a historically failed lock.
    // Derivation below keeps unknown/pending/confirmed submissions fail-closed.
    if (isSubmissionProvenFailed(submittedHash, transactionState)) {
      setSubmittedCommitment(undefined);
      setSubmittedHash(undefined);
    }
    setError("");
    try {
      validateBackupContext(backup, chain.id, contracts.offering!, address);
      persistBackup(backup);
      const result = await send("Bid commitment", {
        address: contracts.offering!,
        abi: offeringAbi,
        functionName: "commitBid",
        args: [backupCommitment(backup), BigInt(backup.amountUSDC)],
      });
      if (
        (result.stage === "confirmed" || result.stage === "unknown") &&
        result.hash
      ) {
        setSubmittedCommitment(backupCommitment(backup));
        setSubmittedHash(result.hash);
      }
      if (result.hash) {
        const recorded = { ...backup, transactionHash: result.hash };
        try {
          persistBackup(recorded);
          setBackup(recorded);
        } catch {
          setError(
            "Your original reveal backup is still valid. Saving the transaction reference failed; keep the displayed hash and downloaded file.",
          );
        }
      }
    } catch {
      setError(
        "Backup validation failed. No new bid was sent. Keep your existing backup.",
      );
    }
  };
  const deposit = backup ? BigInt(backup.amountUSDC) : 0n;
  const submissionLocked =
    isSubmittedCommitment(backup, submittedCommitment) &&
    !isSubmissionProvenFailed(submittedHash, transactionState);
  return (
    <Card>
      <CardHeader>
        <p className="eyebrow">01 / Commit</p>
        <CardTitle>Define your valuation limit</CardTitle>
      </CardHeader>
      <CardContent className="stack">
        {!backup ? (
          <>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="bid-deposit">
                  Deposit · demoUSDC
                </FieldLabel>
                <Input
                  id="bid-deposit"
                  inputMode="decimal"
                  autoComplete="off"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <FieldDescription>
                  Positive amount, up to six decimal places. Your entire deposit
                  is escrowed.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="bid-fdv">
                  Maximum company valuation · demoUSDC
                </FieldLabel>
                <Input
                  id="bid-fdv"
                  inputMode="decimal"
                  autoComplete="off"
                  value={fdv}
                  onChange={(e) => setFdv(e.target.value)}
                />
                <FieldDescription>
                  Between 4,000,000 and 6,000,000. This is the company
                  valuation, not the token price.
                </FieldDescription>
              </Field>
            </FieldGroup>
            {backupCorrupted && (
              <Field>
                <FieldLabel htmlFor="commit-restore">
                  Restore your saved reveal backup
                </FieldLabel>
                <Input
                  id="commit-restore"
                  type="file"
                  accept=".json,application/json"
                  onChange={(event) => void restoreFile(event)}
                />
                <FieldDescription>
                  A stored draft is unreadable. Import its private JSON backup
                  here before continuing; a new nonce will not replace it.
                </FieldDescription>
              </Field>
            )}
            <Button
              variant="outline"
              disabled={blocked || backupCorrupted}
              onClick={prepare}
            >
              Prepare reveal backup
            </Button>
          </>
        ) : (
          <>
            <dl className="terms">
              <div>
                <dt>Locked deposit · demoUSDC</dt>
                <dd>{formatAmount(deposit, 6, 6)}</dd>
              </div>
              <div>
                <dt>Maximum FDV · demoUSDC</dt>
                <dd>{formatAmount(BigInt(backup.maxFDV), 6, 6)}</dd>
              </div>
            </dl>
            <Alert>
              <ShieldCheck />
              <AlertTitle>Save the file before you sign</AlertTitle>
              <AlertDescription>
                This backup contains your secret nonce. Store it privately,
                never upload it to a support service. SAMA cannot recover it for
                you. This draft stays locked to avoid replacing a backup for a
                pending commitment.
              </AlertDescription>
            </Alert>
            <Button variant="outline" onClick={exportFile}>
              <Download data-icon="inline-start" />
              Download reveal backup
            </Button>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-5 accent-primary"
                checked={acknowledged}
                disabled={!exported}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
              <span>
                I saved the file, understand the deposit is public, and will
                return before {utcDate(data.revealEnd)}. This is a valueless
                testnet demo.
              </span>
            </label>
            {deposit > data.currencyBalance && (
              <p className="text-sm text-destructive">
                Your available demoUSDC is below this deposit. Claim faucet
                tokens before continuing.
              </p>
            )}
            {submissionLocked ? (
              <p role="status" className="text-sm text-muted-foreground">
                This draft has been submitted. Refreshing the offering will show
                its onchain commitment; do not submit it again.
              </p>
            ) : data.allowance < deposit ? (
              <Button
                disabled={
                  blocked ||
                  !acknowledged ||
                  !exported ||
                  deposit > data.currencyBalance
                }
                onClick={() =>
                  void send("demoUSDC approval", {
                    address: contracts.currency!,
                    abi: currencyAbi,
                    functionName: "approve",
                    args: [contracts.offering!, deposit],
                  })
                }
              >
                Approve exactly {formatAmount(deposit, 6, 6)} demoUSDC
              </Button>
            ) : (
              <>
                <Button
                  disabled={
                    blocked ||
                    !acknowledged ||
                    !exported ||
                    deposit > data.currencyBalance
                  }
                  onClick={() => setReview(true)}
                >
                  Review commitment
                </Button>
                {review && (
                  <div className="rounded-lg border p-5 stack">
                    <p className="font-semibold">
                      Escrow {formatAmount(deposit, 6, 6)} demoUSDC?
                    </p>
                    <p className="text-sm">
                      This commits your locked valuation limit. The nonce is not
                      sent now. You cannot edit or withdraw this bid before
                      finalization or cancellation.
                    </p>
                    <div className="cluster">
                      <Button
                        disabled={
                          blocked ||
                          !acknowledged ||
                          !exported ||
                          deposit > data.currencyBalance
                        }
                        onClick={() => void commit()}
                      >
                        Confirm commitment
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={blocked}
                        onClick={() => setReview(false)}
                      >
                        Go back
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {!data.eligible && (
          <p className="text-sm">
            Enable demo access above before preparing a bid.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RevealForm({
  address,
  data,
  backup,
  setBackup,
  send,
  blocked,
}: {
  address: Address;
  data: OfferingState;
  backup: BidBackup | null;
  setBackup: (b: BidBackup) => void;
  send: Send;
  blocked: boolean;
}) {
  const [error, setError] = useState("");
  let matches = false;
  if (backup) {
    try {
      validateBackupContext(
        backup,
        chain.id,
        contracts.offering!,
        address,
        data.bid.commitment,
      );
      matches = true;
    } catch {
      /* Never display nonce-bearing input. */
    }
  }
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 16_384) throw new Error("Backup file is too large.");
      const imported = restoreBackup(
        await file.text(),
        chain.id,
        contracts.offering!,
        address,
        data.bid.commitment,
      );
      setBackup(imported);
      setError("");
    } catch {
      setError(
        "Backup could not be imported. Use the JSON file for this wallet, chain, offering, and onchain commitment.",
      );
    }
  };
  const reveal = async () => {
    if (!backup || !matches) return;
    validateBackupContext(
      backup,
      chain.id,
      contracts.offering!,
      address,
      data.bid.commitment,
    );
    await send("Bid reveal", {
      address: contracts.offering!,
      abi: offeringAbi,
      functionName: "revealBid",
      args: [BigInt(backup.amountUSDC), BigInt(backup.maxFDV), backup.nonce],
    });
  };
  return (
    <div className="stack">
      {!data.bid.revealed && (
        <>
          <Badge variant={matches ? "secondary" : "outline"}>
            {matches
              ? "Backup matches your commitment"
              : "A matching backup is required"}
          </Badge>
          {matches && backup && (
            <p className="text-sm">
              Reveal {formatUnits(BigInt(backup.amountUSDC), 6)} demoUSDC at a
              maximum FDV of {formatUnits(BigInt(backup.maxFDV), 6)} demoUSDC.
            </p>
          )}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="reveal-import">
                Restore reveal backup
              </FieldLabel>
              <Input
                id="reveal-import"
                type="file"
                accept=".json,application/json"
                onChange={(event) => void importFile(event)}
                disabled={blocked}
              />
              <FieldDescription>
                Read locally in this browser. Only a matching backup is
                accepted; the nonce is never shown on this page.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button
            disabled={
              blocked ||
              !matches ||
              data.phase !== 2 ||
              data.timestamp >= data.revealEnd
            }
            onClick={() => void reveal()}
          >
            Reveal my bid
          </Button>
          <p className="text-xs text-muted-foreground">
            Revealing publishes your maximum valuation and nonce onchain. The
            window ends exclusively at {utcDate(data.revealEnd)}.
          </p>
        </>
      )}
      {backup && matches && (
        <Button
          variant="outline"
          onClick={() => {
            try {
              downloadBackup(backup);
            } catch {
              setError(
                "Backup export failed. Check your browser download settings.",
              );
            }
          }}
        >
          <Download data-icon="inline-start" />
          Export backup again
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
