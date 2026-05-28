import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from "@/firebase/client-provider";

export const metadata: Metadata = {
  title: 'AXON-AI | Emergency Intelligence Platform',
  description: 'AI-powered emergency assistance and disaster resilience platform.',
  manifest: '/manifest.json',
  themeColor: '#00BFFF',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('axon-theme') || 'dark';
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            })()
          `
        }} />
      </head>
      <body className="font-body antialiased bg-background text-foreground transition-colors duration-300">
        <FirebaseClientProvider>
          <main>{children}</main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}