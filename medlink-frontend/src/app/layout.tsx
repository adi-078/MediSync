import "./globals.css";

export const metadata = {
  title: "MedLink AI",
  description: "AI Powered Healthcare & Clinical Trial Platform"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">

      <body>

        {children}

      </body>

    </html>
  );

}