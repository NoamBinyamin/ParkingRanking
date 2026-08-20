import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "נקודות חניה — חנו ותרוויחו",
  description: "אפליקציית חניה מגיימת: דווחו איפה חניתם, צברו נקודות, והתחרו על מקום בלוח הדירוג.",
  // iOS Safari ignores the web manifest's "display: standalone" -- it only
  // reads these apple-specific tags to launch without browser chrome when
  // added to the home screen. The manifest.ts file still matters for
  // Android/Chrome installability.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "נקודות חניה",
  },
  // Next only emits the modern "mobile-web-app-capable" tag (Apple added
  // support for it in iOS 17.4+); the legacy prefixed one covers older
  // iOS versions too.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#7c5cff",
  // Lets the page draw under the notch/home-indicator area instead of
  // leaving black bars there once running fullscreen from the home screen.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${openSans.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
