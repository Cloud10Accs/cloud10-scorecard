import './globals.css';

export const metadata = {
  title: 'Cloud 10 Scorecard',
  description: 'Weekly performance scorecard for Cloud 10 Accounting',
  viewport: 'width=device-width, initial-scale=1',
  charset: 'utf-8',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-c10-dark text-white font-nunito">
        {children}
      </body>
    </html>
  );
}
