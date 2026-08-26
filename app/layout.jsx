export const metadata = { title: "DigitalOcean image pipeline", description: "Private uploads and responsive WebP variants" };

export default function RootLayout({ children }) {
  return <html lang="en"><body style={{ fontFamily: "system-ui", margin: "3rem auto", maxWidth: 720 }}>{children}</body></html>;
}
