import './globals.css'

export const metadata = {
  title: 'Shipfolio · Your Product Portfolio',
  description: 'The portfolio built for people who ship products.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}