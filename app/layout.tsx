import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "The Single-Sentence Manifesto — Written $1 at a Time",
  description: "The longest democratic sentence in human history, written $1 at a time. Words cannot be undone, only vetoed or redacted.",
  openGraph: {
    title: "The Single-Sentence Manifesto",
    description: "The longest democratic sentence in human history, written $1 at a time.",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "The Single-Sentence Manifesto Live Dispatch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Single-Sentence Manifesto",
    description: "The longest democratic sentence in human history, written $1 at a time.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-stamp-red selection:text-paper-50 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
