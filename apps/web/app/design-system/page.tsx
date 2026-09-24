import { notFound } from "next/navigation";
import { PrimitiveShowcase } from "@/components/primitive-showcase";

export default function DesignSystemPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <PrimitiveShowcase />;
}
