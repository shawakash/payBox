import { headers } from "next/headers";

export default async function FromServer() {
  const res = await fetch("http://localhost:3000/api/whoami", {
    method: "GET",
    headers: headers(),
  }).then(res => res.json());
  return (
    <div>
      <div>
        API Route From <span className="font-bold underline">Server</span>
      </div>
      <div>Name: {res?.name}</div>
    </div>
  );
}