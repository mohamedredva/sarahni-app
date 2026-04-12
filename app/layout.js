import "./globals.css";

export const metadata = {
  title: "سِرّي - استقبل رسائل بسرية",
  description: "استقبل رسائل من أصدقائك بسرية تامة، وتعرف على من يهتم بك.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body>
        <div className="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
