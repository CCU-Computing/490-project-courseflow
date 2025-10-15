import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'CourseFlow',
    description: 'V1',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
                {/* Set initial theme before hydration to avoid flash */}
                <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme'); if(!t){t=window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'} if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();` }} />
            </head>
            <body className="font-body antialiased">{children}</body>
        </html>
    );
}
