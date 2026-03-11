import './globals.css';

export const metadata = {
  title: 'Pro PDF Mate',
  description: 'Full-stack PDF toolkit'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
