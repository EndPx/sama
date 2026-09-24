"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

type VisualKind = "investor" | "founder" | "token" | "auction";

type Block = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: string;
  fill: string;
};

const scenes: Record<
  VisualKind,
  {
    title: string;
    index: string;
    caption: string;
    foot: string;
    blocks: Block[];
  }
> = {
  investor: {
    title: "Bidder's view",
    index: "S / 01",
    caption: "The same limit travels from your wallet to a verifiable result.",
    foot: "Deposit visible · limit sealed until reveal",
    blocks: [
      {
        x: 30,
        y: 170,
        width: 125,
        height: 68,
        label: "DEPOSIT",
        value: "PUBLIC",
        fill: "#d9e2d2",
      },
      {
        x: 174,
        y: 126,
        width: 125,
        height: 68,
        label: "MAX VALUE",
        value: "SEALED",
        fill: "#b2c9ae",
      },
      {
        x: 318,
        y: 82,
        width: 125,
        height: 68,
        label: "RESULT",
        value: "4.8M",
        fill: "#dcae86",
      },
    ],
  },
  founder: {
    title: "Issuer's view",
    index: "S / 02",
    caption: "Terms are fixed before demand is known.",
    foot: "One fictional startup round",
    blocks: [
      {
        x: 72,
        y: 182,
        width: 150,
        height: 66,
        label: "ALLOCATION",
        value: "10%",
        fill: "#d9e2d2",
      },
      {
        x: 232,
        y: 139,
        width: 150,
        height: 66,
        label: "VALUE RANGE",
        value: "4–6M",
        fill: "#b2c9ae",
      },
      {
        x: 152,
        y: 53,
        width: 150,
        height: 66,
        label: "MINIMUM",
        value: "400K",
        fill: "#dcae86",
      },
    ],
  },
  token: {
    title: "KIRA custody path",
    index: "S / 03",
    caption:
      "A claim, an escrowed listing, and a buyer are separate onchain steps.",
    foot: "Capped at 1,000,000 demo KIRA",
    blocks: [
      {
        x: 28,
        y: 154,
        width: 126,
        height: 70,
        label: "01",
        value: "CLAIM",
        fill: "#c7d8bc",
      },
      {
        x: 174,
        y: 111,
        width: 126,
        height: 70,
        label: "02",
        value: "ESCROW",
        fill: "#83aa95",
      },
      {
        x: 320,
        y: 68,
        width: 126,
        height: 70,
        label: "03",
        value: "BUY",
        fill: "#dcae86",
      },
    ],
  },
  auction: {
    title: "Reference settlement",
    index: "S / 04",
    caption: "Five revealed bids. One 4.8M company value.",
    foot: "480K accepted · 220K refundable",
    blocks: [
      {
        x: 22,
        y: 170,
        width: 92,
        height: 62,
        label: "E",
        value: "150K",
        fill: "#c7d8bc",
      },
      {
        x: 118,
        y: 143,
        width: 92,
        height: 62,
        label: "D",
        value: "200K",
        fill: "#b2c9ae",
      },
      {
        x: 214,
        y: 116,
        width: 92,
        height: 62,
        label: "C",
        value: "100K",
        fill: "#83aa95",
      },
      {
        x: 310,
        y: 89,
        width: 92,
        height: 62,
        label: "B",
        value: "30K",
        fill: "#dcae86",
      },
      {
        x: 406,
        y: 62,
        width: 68,
        height: 62,
        label: "A",
        value: "0",
        fill: "#d3d1c5",
      },
    ],
  },
};

function BlockShape({ block }: { block: Block }) {
  const { x, y, width, height, label, value, fill } = block;
  return (
    <g data-assemble-block>
      <path
        d={`M${x} ${y}l18 -14h${width}l-18 14Z`}
        fill="#fff9ec"
        stroke="#315c4c"
        strokeWidth="1.5"
      />
      <path
        d={`M${x + width} ${y}l18 -14v${height}l-18 14Z`}
        fill="#6b947d"
        stroke="#315c4c"
        strokeWidth="1.5"
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="2"
        fill={fill}
        stroke="#315c4c"
        strokeWidth="1.5"
      />
      <circle cx={x + width - 15} cy={y + 14} r="3" fill="#315c4c" />
      <text x={x + 13} y={y + 24} className="education-diagram-small">
        {label}
      </text>
      <text x={x + 13} y={y + height - 13} className="education-diagram-value">
        {value}
      </text>
    </g>
  );
}

export function EducationVisual({ kind }: { kind: VisualKind }) {
  const root = useRef<HTMLDivElement>(null);
  const scene = scenes[kind];

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const blocks = gsap.utils.toArray<SVGGElement>(
          "[data-assemble-block]",
          root.current,
        );
        gsap.from(blocks, {
          y: -78,
          x: (index) => (index % 2 === 0 ? -18 : 18),
          rotation: (index) => (index % 2 === 0 ? -3 : 3),
          opacity: 0,
          stagger: 0.15,
          duration: 0.85,
          ease: "back.out(1.3)",
          scrollTrigger: {
            trigger: root.current,
            start: "top 88%",
            once: true,
          },
        });
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={`education-blueprint education-blueprint-${kind}`}
    >
      <div className="education-art-kicker">
        <span>{scene.title}</span>
        <span>{scene.index}</span>
      </div>
      <svg
        className="education-blueprint-svg"
        viewBox="0 0 500 280"
        role="img"
        aria-label={scene.caption}
      >
        <defs>
          <pattern
            id={`grid-${kind}`}
            width="25"
            height="25"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 25 0 L 0 0 0 25"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.24"
            />
          </pattern>
        </defs>
        <rect width="500" height="280" fill={`url(#grid-${kind})`} />
        <path
          d="M16 255H484"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.45"
        />
        {scene.blocks.map((block) => (
          <BlockShape key={block.label} block={block} />
        ))}
      </svg>
      <div className="education-blueprint-copy">
        <p>{scene.caption}</p>
      </div>
      <div className="education-art-footer">
        <span>{scene.foot}</span>
        <span>TESTNET / SAMA</span>
      </div>
    </div>
  );
}
