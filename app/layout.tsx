import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Script from "next/script";
import { Metadata } from "next";
import localFont from "next/font/local";
import { MainHeader } from "./components/layout/main-header";

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <ClerkProvider
        appearance={{
          variables: { colorPrimary: "#000000" },
          elements: {
            formButtonPrimary:
              "bg-black border border-black border-solid hover:bg-white hover:text-black",
            socialButtonsBlockButton:
              "bg-white border-gray-200 hover:bg-transparent hover:border-black text-gray-600 hover:text-black",
            socialButtonsBlockButtonText: "font-semibold",
            formButtonReset:
              "bg-white border border-solid border-gray-200 hover:bg-transparent hover:border-black text-gray-500 hover:text-black",
            membersPageInviteButton:
              "bg-black border border-black border-solid hover:bg-white hover:text-black",
            card: "bg-[#fafafa]",
          },
        }}
      >
        <body className={`min-h-screen flex flex-col antialiased bg-gray-50`}>
          <MainHeader />
          <div className="flex-grow">
            {children}
          </div>
          <footer className="py-6 bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  © {new Date().getFullYear()} Daily Journal. All rights reserved.
                </div>
                <div className="flex space-x-6">
                  <a href="https://clerk.com/docs" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                    Docs
                  </a>
                  <a href="https://github.com/clerk/nextjs-auth-starter-template" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </body>
      </ClerkProvider>

      <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js" />
      <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js" />
    </html>
  );
}