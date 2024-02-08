import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/util";

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log(session);

  return NextResponse.json({ user: session?.user });
}
