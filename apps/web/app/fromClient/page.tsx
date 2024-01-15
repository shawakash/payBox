"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function APITestPage() {
  const [name, setName] = useState<string>();
  /**
   * Either by useSession or fetch the api
   */
  const {data: session} = useSession();

  useEffect(() => {
    fetch("/api/whoami", 
    {     cache: "no-store", 
        next: { revalidate: 10 }})
      .then((res) => res.json())
      .then((data) => setName(data.name));
  }, [session]);
  console.log(session)
  return (
    <div>
      <div>
        API Route From <span className="font-bold underline">Client</span>
      </div>
      <div>Name: {name}</div>
    </div>
  );
}