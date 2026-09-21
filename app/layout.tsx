import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Sumahora Transport | West Africa Express Travel & Cargo',
  description: 'Professional modern West Africa cross-border passenger transportation and parcel logistics system with real-time tracking, secure authentication, and automated billing.',
  openGraph: {
    title: 'Sumahora Transport | West Africa Express Travel & Cargo',
    description: 'Professional modern West Africa cross-border passenger transportation and parcel logistics system with real-time tracking, secure authentication, and automated billing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sumahora Transport | West Africa Express Travel & Cargo',
    description: 'Professional modern West Africa cross-border passenger transportation and parcel logistics system with real-time tracking, secure authentication, and automated billing.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
