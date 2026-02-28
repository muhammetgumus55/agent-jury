import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = 'https://agent-jury.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Agent Jury – AI-Powered Idea Evaluation',
    template: '%s | Agent Jury',
  },
  description:
    'Let AI agents judge your hackathon idea. Three autonomous agents evaluate feasibility, innovation, and risk — then deliver a final verdict on-chain.',
  keywords: ['AI', 'evaluation', 'hackathon', 'agents', 'Monad', 'Web3', 'product feedback'],
  authors: [{ name: 'Agent Jury Team' }],
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: 'Agent Jury – AI-Powered Idea Evaluation',
    description:
      'Three AI agents evaluate your hackathon idea and deliver a verifiable on-chain verdict.',
    siteName: 'Agent Jury',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Jury – AI-Powered Idea Evaluation',
    description: 'Let AI agents judge your hackathon idea and save the verdict on Monad Testnet.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
