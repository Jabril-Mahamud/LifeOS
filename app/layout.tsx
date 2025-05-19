import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Script from "next/script";
import { Metadata } from "next";
import localFont from "next/font/local";
import { MainHeader } from "@/components/layout/main-header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/layout/theme/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://clerk-next-app.vercel.app/"),
  title: "Personal Journal & Habit Tracker",
  description:
    "Track your daily thoughts, moods, and habits in one place to build better routines and gain insights into your well-being.",
  openGraph: { images: ["/og.png"] },
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
      <head />
      <body className="min-h-screen flex flex-col antialiased">
        <ClerkProvider
          appearance={{
            variables: { colorPrimary: "#000000" },
            elements: {
              formButtonPrimary:
                "bg-card border border-black border-solid hover:bg-card hover:text-green",
              socialButtonsBlockButton:
                "bg-card border-gray-200 hover:bg-transparent hover:border-black text-green-600 hover:text-green",
              socialButtonsBlockButtonText: "font-semibold",
              formButtonReset:
                "bg-card border border-solid border-gray-200 hover:bg-transparent hover:border-black text-green-500 hover:text-green",
              membersPageInviteButton:
                "bg-card border border-black border-solid hover:bg-card hover:text-green",
            },
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <MainHeader />
            <div className="flex-grow">{children}</div>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
