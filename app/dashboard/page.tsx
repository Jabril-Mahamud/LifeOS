import { UserDetails } from "../components/user-details";
import { UserButton } from "@clerk/nextjs";
import { CodeSwitcher } from "../components/code-switcher";
import { Footer } from "../components/footer";
import { PostsList } from "../components/posts-list";
import Link from "next/link";

import { DASHBOARD_CARDS } from "../consts/cards";

export default async function DashboardPage() {
  return (
    <>
      <main className="max-w-[75rem] w-full mx-auto">
        <div className="grid grid-cols-[1fr_20.5rem] gap-10 pb-10">
          <div>
            <header className="flex items-center justify-between w-full h-16 gap-4">
              <div className="flex gap-4">
                <Link
                  href="/journal"
                  className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
                >
                  Go to Journal
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "size-6",
                    },
                  }}
                />
              </div>
            </header>
            <UserDetails />
            
            {/* Posts Section */}
            <div className="mt-8">
              <PostsList />
            </div>
          </div>
          <div className="pt-[3.5rem]">
            <CodeSwitcher />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}