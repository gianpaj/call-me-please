"use client";

/** eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import Script from "next/script";

export default function TallyForm() {
  const isDarkMode =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
  return (
    <div className="w-full sm:w-[44rem]">
      <iframe
        data-tally-src="https://tally.so/embed/wL5qAz?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        loading="lazy"
        width="100%"
        height="863"
        title="Call Me Now app waiting list"
        style={isDarkMode ? { filter: "invert(80%)" } : {}}
      />

      <Script
        src="https://tally.so/widgets/embed.js"
        // @ts-expect-error - Tally is not defined
        // onLoad={() => Tally.loadEmbeds()}
      />
    </div>
  );
}
