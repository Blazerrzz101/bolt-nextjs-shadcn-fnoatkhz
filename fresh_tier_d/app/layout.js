export const metadata = {
  title: 'Tier\'d - Product Ranking Platform',
  description: 'A platform for ranking and voting on products with real-time features',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
} 