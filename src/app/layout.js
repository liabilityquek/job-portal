import '../../styles/globals.css';

export const metadata = {
  title: 'HAR ORA Job Portal',
  description: 'Your one-stop job portal!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
