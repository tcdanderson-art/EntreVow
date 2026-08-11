import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const title = "Entrevow — The Guest List, Timeline, and Whole Day. All in One Tap.";
const description =
  "Entrevow is the digital hub for your wedding weekend. Give your guests and bridal party a live itinerary, transport details, and maps — no more lost paper schedules.";

export const metadata: Metadata = {
  metadataBase: new URL("https://entrevow.com"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://entrevow.com",
    siteName: "Entrevow",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Entrevow" }],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
