import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Praxis — ODPC Compliance for Kenyan Schools',
  description: 'Register with the ODPC, generate Form DPR 1, and never miss a renewal deadline.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
