export const metadata = {
  title: 'Minimal Test App',
  description: 'A minimal test app with no dependencies on Supabase',
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