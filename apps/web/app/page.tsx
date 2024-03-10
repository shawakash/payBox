import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]/util";
import { SparklesCore } from "@/components/ui/sparklecore";
import Sparkles from "./components/Client/sparkle";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <>
      <div className="flex items-center justify-center">
        <Sparkles
          classname="flex flex-col items-center justify-center overflow-hidden rounded-md"
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleColor="#FFFFFF"
          body="PayBox"
        />
      </div>
    </>
  );
}
