// This updated version uses shadcn components for improved UI and accessibility
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

export function MainHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Journal', href: '/journal', current: pathname === '/journal' },
    { name: 'Habits', href: '/habits', current: pathname === '/habits' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-black"
                >
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 12H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="ml-2 text-lg font-semibold text-gray-900">Daily Journal</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <SignedIn>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'border-black text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </SignedIn>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <SignedIn>
              <div className="flex items-center gap-4">
                {user && (
                  <span className="text-sm text-gray-600">
                    {user.firstName}
                  </span>
                )}
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-8 w-8",
                    },
                  }}
                />
              </div>
            </SignedIn>
            
            <SignedOut>
              <div className="flex items-center space-x-4">
                <Link href="/sign-in">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Sign up</Button>
                </Link>
              </div>
            </SignedOut>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <SignedIn>
              <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open main menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-md">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {navigation.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className={item.current ? 'bg-gray-50 font-semibold' : ''}>
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          userButtonAvatarBox: "h-8 w-8",
                        },
                      }}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>
            
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2">
                  Sign in
                </Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}