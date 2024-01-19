"use client";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function APITestPage() {
  const [name, setName] = useState<string>();
  const se = getSession()
  /**
   * Either by useSession or fetch the api
   */
  const session = useSession();
  const router = useRouter();
  console.log(session, "client");
  // useEffect(() => {
  //   fetch("/api/whoami", 
  //   {     cache: "no-store", 
  //       next: { revalidate: 10 }})
  //     .then((res) => res.json())
  //     .then((data) => setName(data.name));
  // }, [session]);
  console.log(session, "friom client")
  return (
    <div>
      <div>
        API Route From <span className="font-bold underline">Client</span>
      </div>
      <div onClick={() => router.push("/fromServer")}>Name: {name}</div>
    </div>
  );
}