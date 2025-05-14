import { UserButton } from "@clerk/nextjs";
import { JournalList } from "@/app/components/journal/journal-list";
import { Footer } from "@/app/components/footer";

export default async function JournalPage() {
  return (
    <>
      <main className="max-w-[48rem] w-full mx-auto px-4">
        <header className="flex items-center justify-between w-full h-16 border-b border-gray-100">
          <h1 className="text-xl font-semibold">My Journal</h1>
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
        
        <div className="my-6">
          <JournalList />
        </div>
      </main>
      <Footer />
    </>
  );
}