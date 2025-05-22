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
          <body className="min-h-screen flex flex-col antialiased">
            <MainHeader />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
            <Toaster />
          </body>
        </ThemeProvider>
      </ClerkProvider>
    </html>
  );
}