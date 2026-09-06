import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "The Single-Sentence Manifesto — Written $1 at a Time",
  description: "The longest democratic sentence in human history, written $1 at a time. Words cannot be undone, only vetoed or redacted.",
  openGraph: {
    title: "The Single-Sentence Manifesto",
    description: "The longest democratic sentence in human history, written $1 at a time.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Single-Sentence Manifesto",
    description: "The longest democratic sentence in human history, written $1 at a time.",
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
