import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET(
  _request: Request,
  context: { params: Promise<{ tool: string }> },
) {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DISABLE_REACT_DEVTOOLS === "1"
  )
    return new Response(null, { status: 404 });
  const { tool } = await context.params;
  const assets: Record<string, string> = {
    grab: "react-grab/dist/index.global.js",
    scan: "react-scan/dist/auto.global.js",
  };
  if (!Object.hasOwn(assets, tool)) return new Response(null, { status: 404 });
  const source = await readFile(
    path.join(process.cwd(), "node_modules", assets[tool]),
    "utf8",
  );
  return new Response(source, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store",
    },
  });
}
