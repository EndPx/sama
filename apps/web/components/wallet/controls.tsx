"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { chain, localMode } from "@/lib/config";
import { shortAddress } from "@/lib/amounts";
import { usePrivyOnboarding } from "./providers";

function ExternalConnection() {
  const { address } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  if (address)
    return (
      <Button variant="ghost" onClick={() => disconnect()}>
        Disconnect
      </Button>
    );
  return (
    <div className="stack">
      <Button
        onClick={() => connectors[0] && connect({ connector: connectors[0] })}
        disabled={!connectors.length || isPending}
      >
        <Wallet data-icon="inline-start" />
        {isPending ? "Check your wallet" : "Connect browser wallet"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          Could not connect. Unlock a browser wallet that supports Ethereum and
          try again.
        </p>
      )}
    </div>
  );
}

function PrivyConnection() {
  const { ready, authenticated, login, logout, connectWallet } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { address } = useAccount();
  const { setActiveWallet } = useSetActiveWallet();
  const [error, setError] = useState(false);
  if (!ready || !walletsReady)
    return <Button disabled>Preparing wallet</Button>;
  if (!authenticated && !address)
    return (
      <Button onClick={login}>
        <Wallet data-icon="inline-start" />
        Connect or sign in
      </Button>
    );
  return (
    <div className="stack">
      <div className="cluster">
        <Button variant="outline" onClick={() => connectWallet()}>
          Connect another wallet
        </Button>
        <Button variant="ghost" onClick={() => void logout()}>
          Sign out
        </Button>
      </div>
      {wallets.length > 1 && (
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="active-wallet">Active wallet</FieldLabel>
            <Select
              value={address?.toLowerCase()}
              onValueChange={async (value) => {
                const wallet = wallets.find(
                  (w) => w.address.toLowerCase() === value,
                );
                if (wallet) {
                  try {
                    await setActiveWallet(wallet);
                    setError(false);
                  } catch {
                    setError(true);
                  }
                }
              }}
            >
              <SelectTrigger id="active-wallet" className="w-full">
                <SelectValue placeholder="Choose wallet" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {wallets.map((w) => (
                    <SelectItem key={w.address} value={w.address.toLowerCase()}>
                      {shortAddress(w.address)} · {w.walletClientType}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      )}
      {error && <p role="alert">Wallet selection failed. Please try again.</p>}
    </div>
  );
}

export function WalletControls() {
  const { address, chainId } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();
  return (
    <div className="stack">
      {address && (
        <div>
          <p className="eyebrow">Your connected wallet</p>
          <p className="safe-address mt-2">{address}</p>
        </div>
      )}
      {usePrivyOnboarding ? <PrivyConnection /> : <ExternalConnection />}
      {address && chainId !== chain.id && (
        <Alert>
          <AlertTitle>
            Switch to {localMode ? "local Anvil" : "Arbitrum Sepolia"}
          </AlertTitle>
          <AlertDescription>
            <p>
              This application cannot send transactions on your current network.
            </p>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => switchChain({ chainId: chain.id })}
            >
              {isPending ? "Check your wallet" : "Switch network"}
            </Button>
            {error && (
              <p>
                Network switch was not completed. You can select the network in
                your wallet.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
