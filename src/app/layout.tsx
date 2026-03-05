import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InstaAgent | AI Content Creator',
  description: 'AI-powered Instagram content generation from your performance analytics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="container animate-in">
          {children}
        </main>
      </body>
    </html>
  );
}
