"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { AlertCircle, ShoppingBag, Store, XCircle } from "lucide-react";
import { isAddress, type Address } from "viem";

import {
  marketplaceAbi,
  currencyAbi,
  kiraAbi,
  registryAbi,
} from "@sama/chain/abi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { WalletControls } from "@/components/wallet/controls";
import { TransactionStatus } from "@/components/transaction-status";
import {
  formatAmount,
  parseAmount,
  quoteFill,
  shortAddress,
} from "@/lib/amounts";
import { publicClient, readMarket } from "@/lib/chain-client";
import {
  chain,
  configured,
  configurationError,
  contracts,
  networkBadge,
} from "@/lib/config";
import { useTransaction } from "@/hooks/use-transaction";
import { useOffering } from "@/hooks/use-offering";

const ACTIVE = 1;

function operationError(action: () => bigint): bigint | undefined {
  try {
    return action();
  } catch {
    return undefined;
  }
}

/** Testnet-only marketplace; all write paths are receipt-verified by useTransaction. */
export function MarketplacePanel() {
  const { address, chainId } = useAccount();
  const offering = useOffering();
  const transaction = useTransaction();
  const [beforeId, setBeforeId] = useState<bigint | undefined>();
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [buyAmounts, setBuyAmounts] = useState<Record<string, string>>({});
  const [recipients, setRecipients] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | undefined>();
  const market = useQuery({
    queryKey: [
      "market",
      chain.id,
      contracts.marketplace ?? null,
      beforeId?.toString() ?? null,
    ],
    queryFn: () => readMarket(beforeId),
    enabled: configured,
    refetchInterval: 15_000,
  });
  const wrongChain = !!address && chainId !== chain.id;
  const staleReads = offering.isError || market.isError;
  const amountBase = useMemo(
    () => operationError(() => parseAmount(amount, 18)),
    [amount],
  );
  const priceBase = useMemo(
    () => operationError(() => parseAmount(price, 6)),
    [price],
  );

  if (!configured)
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Marketplace is not configured</AlertTitle>
        <AlertDescription>
          {configurationError ??
            "Contract addresses are unavailable. No balances or listings are shown."}
        </AlertDescription>
      </Alert>
    );

  const approve = async (token: Address, spender: Address, value: bigint) =>
    transaction.execute({
      simulation: {
        address: token,
        abi: token === contracts.kira ? kiraAbi : currencyAbi,
        functionName: "approve",
        args: [spender, value],
      },
    });
  const create = async () => {
    if (!amountBase || !priceBase || !contracts.kira || !contracts.marketplace)
      return;
    const approval = await approve(
      contracts.kira,
      contracts.marketplace,
      amountBase,
    );
    if (approval.stage !== "confirmed") return;
    await transaction.execute({
      simulation: {
        address: contracts.marketplace,
        abi: marketplaceAbi,
        functionName: "createListing",
        args: [amountBase, priceBase],
      },
    });
  };
  const buy = async (id: bigint, available: bigint, remainingPrice: bigint) => {
    if (!contracts.currency || !contracts.marketplace) return;
    const quantity = operationError(() =>
      parseAmount(buyAmounts[id.toString()] ?? "", 18),
    );
    if (!quantity || quantity > available) return;
    const cost = operationError(() =>
      quoteFill(available, remainingPrice, quantity),
    );
    if (!cost) return;
    const approval = await approve(
      contracts.currency,
      contracts.marketplace,
      cost,
    );
    if (approval.stage !== "confirmed") return;
    await transaction.execute({
      simulation: {
        address: contracts.marketplace,
        abi: marketplaceAbi,
        functionName: "buy",
        args: [id, quantity, cost],
      },
    });
  };
  const cancel = async (id: bigint, seller: Address) => {
    if (!contracts.marketplace || !contracts.registry) return;
    const candidate = recipients[id.toString()] || seller;
    if (!isAddress(candidate)) {
      setActionError("Enter a valid eligible recipient address.");
      return;
    }
    try {
      const eligible = await publicClient.readContract({
        address: contracts.registry,
        abi: registryAbi,
        functionName: "isEligible",
        args: [candidate],
      });
      if (!eligible) {
        setActionError("The cancellation recipient is not eligible for KIRA.");
        return;
      }
      setActionError(undefined);
      await transaction.execute({
        simulation: {
          address: contracts.marketplace,
          abi: marketplaceAbi,
          functionName: "cancelListing",
          args: [id, candidate],
        },
      });
    } catch {
      setActionError(
        "Recipient eligibility could not be verified. Try again when RPC access recovers.",
      );
    }
  };

  return (
    <section aria-labelledby="marketplace-title" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Secondary exchange</p>
          <h2
            id="marketplace-title"
            className="text-3xl font-semibold tracking-tight"
          >
            KIRA marketplace
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            KIRA and SAMA demoUSDC are testnet-only simulated assets with no
            monetary value. This interface is not investment advice.
          </p>
        </div>
        <Badge variant="secondary">{networkBadge}</Badge>
      </div>
      <Alert>
        <AlertCircle />
        <AlertTitle>Pricing and escrow disclosure</AlertTitle>
        <AlertDescription>
          Listings escrow KIRA. Partial-fill quotes use current remaining
          amounts and a ceiling calculation; the submitted maximum cost is the
          displayed quote, so stale prices cannot charge more.
        </AlertDescription>
      </Alert>
      {!address || wrongChain ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {wrongChain ? "Wrong network" : "Connect a wallet to trade"}
            </CardTitle>
            <CardDescription>
              Browsing remains read-only until a connected wallet is on the
              configured testnet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletControls />
          </CardContent>
        </Card>
      ) : null}
      {offering.isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Wallet reads are unavailable</AlertTitle>
          <AlertDescription>
            No balance or eligibility fallback is shown. Retry when the RPC
            connection recovers.
          </AlertDescription>
        </Alert>
      )}
      {market.isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Listings could not be loaded</AlertTitle>
          <AlertDescription>
            Network data is unavailable; no empty-market conclusion is being
            made.
          </AlertDescription>
        </Alert>
      )}
      {actionError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Marketplace action unavailable</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}
      <TransactionStatus
        state={transaction.state}
        onRecheck={() => void transaction.recheckUnknown()}
      />
      <Card>
        <CardHeader>
          <CardTitle>Create a listing</CardTitle>
          <CardDescription>
            Enter exact token amounts. KIRA approval is a separate
            receipt-confirmed transaction before listing escrow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="listing-kira">KIRA amount</FieldLabel>
              <Input
                id="listing-kira"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.0"
                aria-invalid={!!amount && !amountBase}
              />
              <FieldDescription>Up to 18 decimal places.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="listing-usdc">
                Total price in SAMA demoUSDC
              </FieldLabel>
              <Input
                id="listing-usdc"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.00"
                aria-invalid={!!price && !priceBase}
              />
              <FieldDescription>
                Up to 6 decimal places; this is not real USDC.
              </FieldDescription>
            </Field>
            <FieldError>
              {(amount && !amountBase) || (price && !priceBase)
                ? "Enter positive exact amounts within token precision."
                : undefined}
            </FieldError>
            <Button
              disabled={
                !address ||
                wrongChain ||
                staleReads ||
                !offering.data?.eligible ||
                !amountBase ||
                !priceBase ||
                transaction.busy ||
                !!market.data?.paused ||
                !!offering.data?.tokenPaused
              }
              aria-busy={transaction.busy}
              onClick={() => void create()}
            >
              <Store />
              {market.data?.paused
                ? "Marketplace paused"
                : offering.data?.tokenPaused
                  ? "KIRA transfers paused"
                  : "Approve KIRA and create listing"}
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Active listings</h3>
        {market.isFetching ? (
          <span className="text-sm text-muted-foreground">
            Refreshing listings…
          </span>
        ) : null}
      </div>
      {market.isLoading ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground"
        >
          Loading up to 50 listings…
        </p>
      ) : null}
      {market.data &&
      market.data.listings.filter((listing) => listing.status === ACTIVE)
        .length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No active listings appear in this page.
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {market.data?.listings
          .filter((listing) => listing.status === ACTIVE)
          .map((listing) => {
            const mine =
              address?.toLowerCase() === listing.seller.toLowerCase();
            const quantity = operationError(() =>
              parseAmount(buyAmounts[listing.id.toString()] ?? "", 18),
            );
            const quote = quantity
              ? operationError(() =>
                  quoteFill(
                    listing.remainingAmount,
                    listing.remainingPrice,
                    quantity,
                  ),
                )
              : undefined;
            const recipient =
              recipients[listing.id.toString()] ?? listing.seller;
            return (
              <Card key={listing.id.toString()}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>Listing #{listing.id.toString()}</CardTitle>
                    <Badge variant="outline">
                      {shortAddress(listing.seller)}
                    </Badge>
                  </div>
                  <CardDescription>
                    {formatAmount(listing.remainingAmount, 18, 6)} KIRA
                    remaining · {formatAmount(listing.remainingPrice, 6, 6)}{" "}
                    demoUSDC remaining
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mine ? (
                    <>
                      <Field>
                        <FieldLabel htmlFor={`recipient-${listing.id}`}>
                          Cancellation recipient
                        </FieldLabel>
                        <Input
                          id={`recipient-${listing.id}`}
                          value={recipient}
                          onChange={(event) =>
                            setRecipients((current) => ({
                              ...current,
                              [listing.id.toString()]: event.target.value,
                            }))
                          }
                          aria-invalid={!isAddress(recipient)}
                        />
                        <FieldDescription>
                          Must be an eligible address. Cancellation remains
                          available if the marketplace is paused; a KIRA pause
                          blocks transfers.
                        </FieldDescription>
                        <FieldError>
                          {!isAddress(recipient)
                            ? "Enter an eligible recipient address."
                            : undefined}
                        </FieldError>
                      </Field>
                      <Button
                        variant="outline"
                        disabled={
                          wrongChain ||
                          staleReads ||
                          transaction.busy ||
                          !isAddress(recipient) ||
                          !!offering.data?.tokenPaused
                        }
                        onClick={() => void cancel(listing.id, listing.seller)}
                      >
                        <XCircle />
                        Cancel and return unsold KIRA
                      </Button>
                    </>
                  ) : (
                    <>
                      <Field>
                        <FieldLabel htmlFor={`buy-${listing.id}`}>
                          KIRA to buy
                        </FieldLabel>
                        <Input
                          id={`buy-${listing.id}`}
                          inputMode="decimal"
                          value={buyAmounts[listing.id.toString()] ?? ""}
                          onChange={(event) =>
                            setBuyAmounts((current) => ({
                              ...current,
                              [listing.id.toString()]: event.target.value,
                            }))
                          }
                          placeholder="0.0"
                          aria-invalid={
                            !!buyAmounts[listing.id.toString()] && !quote
                          }
                        />
                        <FieldDescription>
                          {quote
                            ? `Maximum cost: ${formatAmount(quote, 6, 6)} SAMA demoUSDC`
                            : "Quote is calculated with ceiling rounding from the current remaining price."}
                        </FieldDescription>
                      </Field>
                      <Button
                        disabled={
                          !address ||
                          wrongChain ||
                          staleReads ||
                          !offering.data?.eligible ||
                          transaction.busy ||
                          !!market.data?.paused ||
                          !!offering.data?.tokenPaused ||
                          !quote
                        }
                        onClick={() =>
                          void buy(
                            listing.id,
                            listing.remainingAmount,
                            listing.remainingPrice,
                          )
                        }
                      >
                        <ShoppingBag />
                        Approve exact cost and buy
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
      {market.data ? (
        <div className="flex flex-wrap justify-between gap-3">
          <Button
            variant="outline"
            disabled={!market.data.nextBeforeId || transaction.busy}
            onClick={() => setBeforeId(market.data?.nextBeforeId)}
          >
            Older listings
          </Button>
          <Button
            variant="ghost"
            disabled={!beforeId || transaction.busy}
            onClick={() => setBeforeId(undefined)}
          >
            Newest listings
          </Button>
        </div>
      ) : null}
    </section>
  );
}
