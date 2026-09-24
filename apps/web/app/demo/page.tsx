import type { Metadata } from "next";
import { DemoEntry } from "@/components/demo/demo-entry";
import "./demo.css";

export const metadata: Metadata = {
  title: "Open the SAMA demo",
  description:
    "Explore the SAMA round workspace, reference auction, sample portfolio, and illustrative marketplace with mock data.",
};

export default function DemoPage() {
  return (
    <div className="demo-entry">
      <DemoEntry />
    </div>
  );
}
