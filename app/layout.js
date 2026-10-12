import { Poppins } from 'next/font/google';
import Script from 'next/script';
import 'lenis/dist/lenis.css';
import './tailwind.css';
import './globals.css';
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, OG_IMAGE, ogBase } from './seo';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600'], display: 'swap', variable: '--font' });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: '%s · Hassan Khan' },
  description: SITE_DESCRIPTION,
  applicationName: 'Hassan Khan Portfolio',
  authors: [{ name: 'Muhammad Hassan Khan', url: SITE_URL }],
  creator: 'Muhammad Hassan Khan',
  publisher: 'Muhammad Hassan Khan',
  keywords: [
    'Hassan Khan', 'Muhammad Hassan Khan', 'frontend developer', 'creative developer', 'React developer',
    'Next.js developer', 'GSAP animation', 'web developer Karachi', 'frontend developer Pakistan',
    'animated websites', 'UI developer', 'freelance web developer', 'portfolio',
  ],
  category: 'technology',
  alternates: { canonical: '/' },
  openGraph: { ...ogBase, url: '/', title: SITE_TITLE, description: SITE_DESCRIPTION, images: [OG_IMAGE] },
  twitter: { card: 'summary_large_image', title: SITE_TITLE, description: SITE_DESCRIPTION, images: [OG_IMAGE.url] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport = { themeColor: '#0c0b0a', colorScheme: 'dark' };

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: the inline script below adds `intro-lock` to <html> before React loads.
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        {/* Reloads always start at the top (the intro plays there); runs before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: "history.scrollRestoration='manual';scrollTo(0,0);" }} />
      </head>
      {/* Extensions (e.g. ColorZilla) inject attributes into <body> before hydration; ignore those. */}
      <body suppressHydrationWarning>
        {/* Runs before the page is interactive: start every load at the top and lock scrolling until the intro is done. */}
        <Script id="intro-lock" strategy="beforeInteractive">
          {"history.scrollRestoration='manual';window.scrollTo(0,0);if(location.pathname==='/'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('intro-lock');window.__introBlock||(window.__introBlock=function(e){if(e.type==='keydown'&&(e.target.closest('input,textarea')||!/^(Space|PageUp|PageDown|ArrowUp|ArrowDown|Home|End)$/.test(e.code)))return;e.preventDefault()});['wheel','touchmove','keydown'].forEach(function(t){addEventListener(t,window.__introBlock,{passive:false})})}"}
        </Script>
        {children}
      </body>
    </html>
  );
}
