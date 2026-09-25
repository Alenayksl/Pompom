import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pompom.software"),
  title: "pomPom | Grow Plants While You Focus - Aesthetic Pomodoro Timer",
  description:
    "Boost your productivity with pomPom. A gamified pomodoro timer where your focus sessions help you grow beautiful virtual plants. Stay off your phone and build your garden.",
  keywords: [
    "pomodoro timer",
    "plant focus app",
    "gamified productivity",
    "aesthetic study timer",
    "focus and grow plants",
    "time management",
  ],
  openGraph: {
    title: "pomPom - Gamified Plant Pomodoro",
    description:
      "Turn your focused time into a virtual garden. Start your timer and grow your plants.",
    url: "https://pompom.software",
    siteName: "pomPom",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "pomPom Aesthetic Interface with growing plants",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "pomPom | Grow Plants While You Focus",
    description:
      "A gamified pomodoro timer where your focus sessions help you grow virtual plants.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quicksand.variable} h-full antialiased`}>
      <body className="min-h-full overflow-hidden bg-cream font-sans text-soil">
        {children}
      </body>
    </html>
  );
}
