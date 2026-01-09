import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "CodeCraft - Learn Programming Through Play",
  description: "A modern educational platform for learning programming through visual block-based coding and text-based programming. Perfect for students and adults of all ages.",
  keywords: ["programming", "education", "coding", "scratch", "learning", "block coding", "visual programming"],
  authors: [{ name: "CodeCraft Team" }],
  creator: "CodeCraft",
  publisher: "CodeCraft",
  metadataBase: new URL("https://codecraft.dev"),
  openGraph: {
    title: "CodeCraft - Learn Programming Through Play",
    description: "Learn programming through visual block-based coding and text-based programming",
    type: "website",
    locale: "tr_TR",
    siteName: "CodeCraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeCraft - Learn Programming Through Play",
    description: "Learn programming through visual block-based coding and text-based programming",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "verification_token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
