import { getServerSession } from 'next-auth';
import Image from 'next/image'
import Link from 'next/link'
import { authOptions } from './api/auth/[...nextauth]/util';

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <>
    
      {//@ts-ignore
      session?.user?.firstname ? (
        <div>{session?.user?.email}</div>
      ) : (
        <div>Not logged in</div>
      )}
    </>
  )
}
