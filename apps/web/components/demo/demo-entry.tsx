"use client";

import React, {
  Suspense,
  lazy,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useLogin,
  useLoginWithEmail,
  useLoginWithOAuth,
  usePrivy,
} from "@privy-io/react-auth";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  ArrowLeft,
  ArrowUpRight,
  Gavel,
  LayoutGrid,
  LogOut,
  Store,
  Wallet,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shortAddress } from "@/lib/amounts";
import { docsUrl, localMode, networkBadge, privyAppId } from "@/lib/config";
import { usePrivyOnboarding } from "@/components/wallet/providers";
import { AppleIcon, GoogleIcon } from "./provider-icons";

type DemoView = "round" | "portfolio" | "market";
type OAuthProvider = "google" | "apple";

const OfferingPanel = lazy(() =>
  import("@/components/offering-panel").then((module) => ({
    default: module.OfferingPanel,
  })),
);
const MarketplacePanel = lazy(() =>
  import("@/components/marketplace-panel").then((module) => ({
    default: module.MarketplacePanel,
  })),
);

const views = [
  { id: "round", label: "The round", icon: Gavel },
  { id: "portfolio", label: "My portfolio", icon: LayoutGrid },
  { id: "market", label: "Marketplace", icon: Store },
] as const;

const introductions: Record<DemoView, { title: string; description: string }> =
  {
    round: {
      title: "One round, from bid to outcome.",
      description:
        "Prepare a test bid, save your reveal backup, and follow the result from the same place.",
    },
    portfolio: {
      title: "Your place in the round.",
      description:
        "See what this wallet committed, what can be claimed, and what has already been confirmed.",
    },
    market: {
      title: "A market for the demo token.",
      description:
        "Explore listings or trade simulated tokens after the round. Every quote uses current onchain amounts.",
    },
  };

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`demo-wordmark${light ? " demo-wordmark-light" : ""}`}
      aria-label="SAMA home"
    >
      <Image src="/brand/sama-mark.png" alt="" width={40} height={40} />
      <span>
        sama<span className="demo-wordmark-dot">.</span>
      </span>
    </Link>
  );
}

function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <section className="demo-auth" aria-label="SAMA demo access">
      <div className="demo-auth-story">
        <div className="demo-auth-story-top">
          <Wordmark light />
          <span className="demo-auth-story-label">The open round</span>
        </div>
        <div className="demo-auth-art" aria-hidden="true">
          <span className="demo-auth-art-orbit" />
          <Image
            src="/brand/sama-confluence-footer.png"
            alt=""
            width={1254}
            height={1254}
            sizes="(max-width: 767px) 75vw, 40vw"
            priority
          />
        </div>
        <div className="demo-auth-story-bottom">
          <span className="demo-auth-story-rule" aria-hidden="true" />
          <p>Take part in a round you can follow all the way through.</p>
          <span>SAMA on Arbitrum Sepolia</span>
        </div>
      </div>
      <div className="demo-auth-form-panel">
        <Link href="/" className="demo-back-link">
          <ArrowLeft aria-hidden="true" /> Back to the site
        </Link>
        <div className="demo-auth-form-wrap">{children}</div>
        <p className="demo-auth-footnote">
          Signing in does not send a transaction. All assets in this demo are
          testnet assets.
        </p>
      </div>
    </section>
  );
}

function AuthHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="demo-auth-heading">
      <p className="demo-auth-kicker">Your SAMA workspace</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function DemoWorkspace({
  onSignOut,
  signingOut = false,
  statusError,
}: {
  onSignOut: () => void;
  signingOut?: boolean;
  statusError?: string;
}) {
  const [view, setView] = useState<DemoView>("round");
  const { address } = useAccount();
  const intro = introductions[view];

  return (
    <section className="demo-workspace" aria-label="SAMA demo workspace">
      <header className="demo-workspace-header">
        <Wordmark />
        <div className="demo-workspace-header-actions">
          <Badge variant="outline">{networkBadge}</Badge>
          <span className="demo-account-pill">
            <Wallet aria-hidden="true" />
            {address ? shortAddress(address) : "Preparing wallet"}
          </span>
          <Button
            type="button"
            variant="ghost"
            onClick={onSignOut}
            disabled={signingOut}
          >
            <LogOut data-icon="inline-start" />
            {signingOut ? "Signing out" : "Sign out"}
          </Button>
        </div>
      </header>
      {statusError && (
        <p role="alert" className="demo-workspace-error">
          {statusError}
        </p>
      )}
      <div className="demo-workspace-body">
        <aside className="demo-workspace-rail">
          <div className="demo-rail-inner">
            <p className="demo-rail-label">Workspace</p>
            <nav className="demo-view-nav" aria-label="Demo views">
              {views.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  onClick={() => setView(id)}
                >
                  <Icon aria-hidden="true" />
                  {label}
                </button>
              ))}
            </nav>
            <div className="demo-rail-help">
              <p>A working testnet prototype</p>
              <span>
                Demo currency and tokens have no monetary value. Nothing here
                represents a real company share.
              </span>
              <a href={docsUrl}>
                Read the docs <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </aside>
        <div className="demo-workspace-main">
          <div className="demo-workspace-intro">
            <p className="demo-auth-kicker">SAMA demo</p>
            <h1>{intro.title}</h1>
            <p>{intro.description}</p>
          </div>
          <Suspense
            fallback={
              <p role="status" className="demo-panel-loading">
                Loading your workspace
              </p>
            }
          >
            {view === "round" && (
              <div className="demo-round-layout">
                <div className="demo-round-primary">
                  <OfferingPanel />
                </div>
                <aside
                  className="demo-round-context"
                  aria-label="How the round works"
                >
                  <p className="demo-round-context-label">The path</p>
                  <ol>
                    <li>
                      <span>01</span>
                      <div>
                        <strong>Get ready</strong>
                        <p>
                          Connect a wallet, enable demo access, and collect test
                          currency.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span>02</span>
                      <div>
                        <strong>Make your bid</strong>
                        <p>
                          Choose a deposit and the highest company value you
                          would accept.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span>03</span>
                      <div>
                        <strong>See the result</strong>
                        <p>
                          Reveal your limit, then follow settlement, claims, and
                          refunds.
                        </p>
                      </div>
                    </li>
                  </ol>
                </aside>
              </div>
            )}
            {view === "portfolio" && <OfferingPanel portfolio />}
            {view === "market" && <MarketplacePanel />}
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function PrivyDemoEntry() {
  const { ready, authenticated, logout } = usePrivy();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [providerBusy, setProviderBusy] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const { login } = useLogin({
    onError: () => setError("Wallet sign in was not completed. Try again."),
  });
  const { sendCode, loginWithCode, state: emailState } = useLoginWithEmail();
  const { initOAuth, loading: oauthLoading } = useLoginWithOAuth();
  const emailBusy =
    emailState.status === "sending-code" ||
    emailState.status === "submitting-code";
  const busy = emailBusy || oauthLoading || providerBusy !== null;

  async function beginOAuth(provider: OAuthProvider) {
    setError("");
    setProviderBusy(provider);
    try {
      await initOAuth({ provider });
    } catch {
      setError(
        `${provider === "google" ? "Google" : "Apple"} sign in was not completed. Use email or try again.`,
      );
    } finally {
      setProviderBusy(null);
    }
  }

  async function requestEmailCode() {
    setError("");
    try {
      await sendCode({ email: email.trim() });
      setCode("");
      setCodeSent(true);
    } catch {
      setError(
        "We could not send a code. Check your email address and try again.",
      );
    }
  }

  async function sendEmailCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestEmailCode();
  }

  async function verifyEmailCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await loginWithCode({ code: code.trim() });
    } catch {
      setError(
        "That code could not be verified. Check it or request a new one.",
      );
    }
  }

  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      await logout();
    } catch {
      setError("Sign out could not be completed. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  if (!ready)
    return (
      <AuthFrame>
        <div role="status" className="demo-auth-loading">
          <span className="demo-loading-mark" aria-hidden="true" />
          <AuthHeading
            title="Preparing your space."
            description="Checking your sign in status before opening the demo."
          />
        </div>
      </AuthFrame>
    );

  if (authenticated)
    return (
      <DemoWorkspace
        onSignOut={() => void signOut()}
        signingOut={signingOut}
        statusError={error}
      />
    );

  return (
    <AuthFrame>
      {codeSent ? (
        <div className="demo-auth-stage" key="code">
          <AuthHeading
            title="Check your inbox."
            description={`Enter the code sent to ${email.trim()} to continue.`}
          />
          <form
            onSubmit={(event) => void verifyEmailCode(event)}
            className="demo-auth-form"
          >
            <label htmlFor="demo-email-code">Email code</label>
            <Input
              id="demo-email-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter your code"
              required
              autoFocus
              disabled={busy}
            />
            <Button
              type="submit"
              disabled={busy || !code.trim()}
              aria-busy={emailBusy}
            >
              {emailState.status === "submitting-code"
                ? "Checking code"
                : "Continue to demo"}
            </Button>
          </form>
          <div className="demo-code-actions">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setCodeSent(false);
                setCode("");
                setError("");
              }}
            >
              Use another email
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void requestEmailCode()}
            >
              Resend code
            </button>
          </div>
        </div>
      ) : (
        <div className="demo-auth-stage" key="entry">
          <AuthHeading
            title="Sign in to SAMA."
            description="Choose how you would like to enter the demo."
          />
          <div className="demo-social-actions">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void beginOAuth("google")}
            >
              <GoogleIcon />
              {providerBusy === "google"
                ? "Opening Google"
                : "Continue with Google"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void beginOAuth("apple")}
            >
              <AppleIcon />
              {providerBusy === "apple"
                ? "Opening Apple"
                : "Continue with Apple"}
            </Button>
          </div>
          <div className="demo-auth-divider">
            <span>or use email</span>
          </div>
          <form
            onSubmit={(event) => void sendEmailCode(event)}
            className="demo-auth-form"
          >
            <label htmlFor="demo-email">Email address</label>
            <Input
              id="demo-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              disabled={busy}
            />
            <Button
              type="submit"
              disabled={busy || !email.trim()}
              aria-busy={emailBusy}
            >
              {emailState.status === "sending-code"
                ? "Sending code"
                : "Continue with email"}
            </Button>
          </form>
          <button
            type="button"
            className="demo-wallet-option"
            disabled={busy}
            onClick={() => login({ loginMethods: ["wallet"] })}
          >
            <Wallet aria-hidden="true" /> Continue with a wallet
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="demo-auth-error">
          {error}
        </p>
      )}
    </AuthFrame>
  );
}

function LocalDemoEntry() {
  const { address } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  if (address) return <DemoWorkspace onSignOut={() => disconnect()} />;
  return (
    <AuthFrame>
      <div className="demo-auth-stage">
        <AuthHeading
          title="Open the local demo."
          description="Connect a browser wallet to enter the local acceptance workspace."
        />
        <Button
          type="button"
          className="demo-local-connect"
          disabled={!connectors.length || isPending}
          onClick={() => connectors[0] && connect({ connector: connectors[0] })}
        >
          <Wallet data-icon="inline-start" />
          {isPending ? "Check your wallet" : "Connect browser wallet"}
        </Button>
        {error && (
          <p role="alert" className="demo-auth-error">
            Wallet connection did not complete. Try again.
          </p>
        )}
      </div>
    </AuthFrame>
  );
}

export function DemoEntry() {
  if (localMode) return <LocalDemoEntry />;
  if (!privyAppId || !usePrivyOnboarding)
    return (
      <AuthFrame>
        <div className="demo-auth-stage">
          <AuthHeading
            title="Demo sign in is unavailable."
            description="The public Privy App ID has not been configured for this preview."
          />
          <Alert>
            <AlertTitle>Setup needed</AlertTitle>
            <AlertDescription>
              Add the public App ID to the web environment, then reload this
              page. No secret key is needed in the browser.
            </AlertDescription>
          </Alert>
          <Button asChild variant="outline">
            <Link href="/">Return to SAMA</Link>
          </Button>
        </div>
      </AuthFrame>
    );
  return <PrivyDemoEntry />;
}
