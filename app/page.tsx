import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"
import "./home.css"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-[75rem] w-full mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Personal Journal App</h1>
          <p className="text-xl mb-8 text-gray-600">
            Record your thoughts, track your moods, and reflect on your journey.
          </p>
          
          <div className="flex gap-4 justify-center mb-12">
            <SignedIn>
              <Link 
                href="/journal" 
                className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Go to Journal
              </Link>
              <Link 
                href="/dashboard" 
                className="border border-black px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                My Dashboard
              </Link>
            </SignedIn>
            
            <SignedOut>
              <Link 
                href="/sign-in" 
                className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/sign-up" 
                className="border border-black px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Sign Up
              </Link>
            </SignedOut>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-semibold mb-2">Daily Reflections</h3>
              <p className="text-gray-600">
                Capture your thoughts, experiences, and feelings in a private, secure space.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-3">😊</div>
              <h3 className="text-lg font-semibold mb-2">Mood Tracking</h3>
              <p className="text-gray-600">
                Track your emotional state over time with our simple mood recording system.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Private & Secure</h3>
              <p className="text-gray-600">
                Your journal entries are private and protected with secure authentication.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}