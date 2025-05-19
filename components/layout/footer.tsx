"use client";

import Link from 'next/link';
import { Github, Linkedin, Code2, Heart, MessageSquare } from "lucide-react";
import { useTheme } from 'next-themes';

export function Footer() {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Top section with description and links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About the app */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                <Code2 className="h-5 w-5 text-primary" />
                <span>LifeOS</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Your personal life operating system for tracking habits, journaling, and building consistency in your daily routines.
              </p>
            </div>
            
            {/* Connect */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://linkedin.com/in/jabril-mahamud/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary text-sm flex items-center gap-2 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>Jabril Mahamud</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com/Jabril-Mahamud/LifeOS" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary text-sm flex items-center gap-2 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section with copyright and additional links */}
          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              &copy; {currentYear} LifeOS. Created with <Heart className="h-3 w-3 inline text-red-500 fill-red-500" /> by Jabril Mahamud.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Feedback
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}