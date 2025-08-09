import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MainHeader } from "@/components/layout/main-header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/layout/theme/theme-provider";
import { PWAInstallPrompt } from "@/components/pwa/install-prompt";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://clerk-next-app.vercel.app/"),
  title: "LifeOS - Personal Life Operating System",
  description:
    "Track your daily thoughts, moods, and habits in one place to build better routines and gain insights into your well-being.",
  openGraph: {
    images: ["/og.png"],
    title: "LifeOS - Personal Life Operating System",
    description:
      "Track your daily thoughts, moods, and habits in one place to build better routines and gain insights into your well-being.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeOS - Personal Life Operating System",
    description:
      "Track your daily thoughts, moods, and habits in one place to build better routines and gain insights into your well-being.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeOS",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8b5cf6" },
    { media: "(prefers-color-scheme: dark)", color: "#8b5cf6" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7469416625946338"
          crossOrigin="anonymous" strategy="afterInteractive"
        />
        {/* PWA Meta Tags */}
        <meta name="application-name" content="LifeOS" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LifeOS" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple Touch Icons - CORRECTED PATHS */}
        <link rel="apple-touch-icon" href="/icons/ios/192.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/ios/152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/ios/180.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/ios/167.png"
        />

        {/* Favicon - CORRECTED PATHS */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/ios/32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/ios/16.png"
        />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Splash Screens for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-2048-2732.jpg"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1668-2224.jpg"
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1536-2048.jpg"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1125-2436.jpg"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1242-2208.jpg"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-750-1334.jpg"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-640-1136.jpg"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ClerkProvider
          appearance={{
            variables: { colorPrimary: "#000000" },
            elements: {
              formButtonPrimary:
                "bg-card border border-black border-solid hover:bg-card hover:text-black",
              socialButtonsBlockButton:
                "bg-card border-gray-200 hover:bg-transparent hover:border-black text-gray-600 hover:text-black",
              socialButtonsBlockButtonText: "font-semibold",
              formButtonReset:
                "bg-card border border-solid border-gray-200 hover:bg-transparent hover:border-black text-gray-500 hover:text-black",
              membersPageInviteButton:
                "bg-card border border-black border-solid hover:bg-card hover:text-black",
            },
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <MainHeader />
            <div className="flex-grow">{children}</div>
            <Footer />
            <Toaster />
            <PWAInstallPrompt />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
