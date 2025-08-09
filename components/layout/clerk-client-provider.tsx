"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type Props = React.ComponentProps<typeof ClerkProvider> & {
  children: React.ReactNode;
};

export function ClerkClientProvider({ children, ...props }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <ClerkProvider {...props}>{children}</ClerkProvider>;
}

