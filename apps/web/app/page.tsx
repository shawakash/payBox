import { getServerSession } from 'next-auth';
import Image from 'next/image'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession();

  return (
    <>
      {session?.user?.name ? (
        <div>{session?.user?.name}</div>
      ) : (
        <div>Not logged in</div>
      )}
    </>
  )
}
