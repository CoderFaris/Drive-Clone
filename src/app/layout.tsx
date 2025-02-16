import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider as PHProvider } from './_providers/posthog-provider'

export const metadata: Metadata = {
  title: "Drive v2",
  description: "Drive version 2.0",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
       
        <html lang="en" className={`${GeistSans.variable}`}>
          
          <body>
           <PHProvider>
            {children}
            </PHProvider>
          </body>
          
        </html>
      
    </ClerkProvider>
  );
}
