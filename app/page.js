import dynamic from 'next/dynamic'

const EarthGlobe = dynamic(() => import('./components/EarthGlobe'), { ssr: false })

export default function Home() {
  return (
    <main className="flex min-h-screen h-screen w-screen flex-col items-center justify-between p-0">
      <EarthGlobe />
    </main>
  )
}