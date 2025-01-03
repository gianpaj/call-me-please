import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@acme/ui";
import { ThemeProvider, ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { env } from "~/env";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://call-me-pls.vercel.app"
      : "http://localhost:3000",
  ),
  title:
    "WakeCall - Schedule personalized AI voice calls with your favorite characters",
  description:
    "WakeCall: AI voice calls with Santa, Arnold & more! Easy scheduling, recurring calls. Make mornings exciting!",
  openGraph: {
    title:
      "WakeCall app - Schedule personalized AI voice calls with your favorite characters",
    description:
      "WakeCall: AI voice calls with Santa, Arnold & more! Easy scheduling, recurring calls. Make mornings exciting!",
    url: "https://call-me-pls.vercel.app",
    siteName: "WakeCall",
  },
  twitter: {
    card: "summary_large_image",
    site: "@gianpaj",
    creator: "@gianpaj",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-gray-50 font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>{props.children}</TRPCReactProvider>
          <div className="absolute bottom-4 right-4">
            <ThemeToggle />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
