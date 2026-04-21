import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "BusQR - Smart Bus Ticketing",
  description: "QR Code-based Public Bus Ticketing System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <ClerkProvider>
          {children}
          <Toaster position="top-center" />
        </ClerkProvider>
      </body>
    </html>
  );
}
