"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  LoaderCircle,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PrimitiveShowcase() {
  const [busy, setBusy] = useState(false);
  return (
    <div className="page-shell page-section stack">
      <div className="page-intro">
        <p className="eyebrow">SAMA / component workshop</p>
        <h1>Clear by design.</h1>
        <p className="lede">
          Reusable states before live transactions. This is a local interface
          test, not onchain evidence.
        </p>
      </div>
      <div className="cluster">
        <Badge>Testnet only</Badge>
        <Badge variant="secondary">Confirmed</Badge>
        <Badge variant="outline">Awaiting wallet</Badge>
        <Badge variant="destructive">Reverted</Badge>
      </div>
      <div className="showcase-grid">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Every state has a readable label.</CardDescription>
          </CardHeader>
          <CardContent className="stack">
            <div className="cluster">
              <Button onClick={() => setBusy(!busy)} aria-busy={busy}>
                {busy ? (
                  <LoaderCircle data-icon="inline-start" />
                ) : (
                  <ArrowRight data-icon="inline-start" />
                )}
                {busy ? "Waiting for receipt" : "Preview pending state"}
              </Button>
              <Button variant="outline">Secondary</Button>
              <Button variant="secondary">Save backup</Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Unavailable</Button>
            </div>
            <Alert role="status">
              <ShieldCheck />
              <AlertTitle>Keep your reveal backup</AlertTitle>
              <AlertDescription>
                Only your browser stores this material. A transaction hash alone
                is not confirmation.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Transaction not confirmed</AlertTitle>
              <AlertDescription>
                Check the explorer before attempting the same action again.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Nothing in this workshop opens a wallet.
            </p>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bid inputs</CardTitle>
            <CardDescription>
              Precision is explicit, never rounded silently.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="show-amount">
                  Amount in demoUSDC
                </FieldLabel>
                <Input
                  id="show-amount"
                  inputMode="decimal"
                  placeholder="100000"
                  aria-describedby="show-amount-help"
                />
                <FieldDescription id="show-amount-help">
                  Up to six decimal places. No monetary value.
                </FieldDescription>
              </Field>
              <Field data-invalid>
                <FieldLabel htmlFor="show-invalid">Maximum FDV</FieldLabel>
                <Input
                  id="show-invalid"
                  defaultValue="7000000"
                  aria-invalid
                  aria-describedby="show-error"
                />
                <FieldError id="show-error">
                  Enter an FDV between 4,000,000 and 6,000,000.
                </FieldError>
              </Field>
              <Field data-disabled>
                <FieldLabel htmlFor="show-disabled">Disabled input</FieldLabel>
                <Input
                  id="show-disabled"
                  value="Awaiting configuration"
                  disabled
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="show-select">Demo network</FieldLabel>
                <Select defaultValue="sepolia">
                  <SelectTrigger id="show-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="sepolia">Arbitrum Sepolia</SelectItem>
                      <SelectItem value="local">Local development</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Review amount</Button>
          </CardFooter>
        </Card>
      </div>
      <Tabs defaultValue="empty">
        <TabsList>
          <TabsTrigger value="empty">Empty</TabsTrigger>
          <TabsTrigger value="loading">Loading</TabsTrigger>
          <TabsTrigger value="long">Long content</TabsTrigger>
        </TabsList>
        <TabsContent value="empty">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Wallet />
              </EmptyMedia>
              <EmptyTitle>No bid for this wallet</EmptyTitle>
              <EmptyDescription>
                Participating wallets will see their allocation and refund here
                after settlement.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline">Explore the demo</Button>
            </EmptyContent>
          </Empty>
        </TabsContent>
        <TabsContent value="loading">
          <div
            role="status"
            aria-label="Loading offering"
            className="stack py-8"
          >
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full" />
            <span className="sr-only">Loading offering</span>
          </div>
        </TabsContent>
        <TabsContent value="long">
          <p className="safe-address py-8">
            0x1111111111111111111111111111111111111111111111111111111111111111
          </p>
        </TabsContent>
      </Tabs>
      <Separator />
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-fit" variant="outline">
            Preview confirmation dialog
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review your action</DialogTitle>
            <DialogDescription>
              This is a component preview. No transaction will be sent.
            </DialogDescription>
          </DialogHeader>
          <p>100,000 demoUSDC · Arbitrum Sepolia</p>
          <DialogFooter showCloseButton>
            <Button disabled>
              <Check data-icon="inline-start" />
              Preview only
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
