import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/util"

export default async function Page({ params, children }: { params: { id: string }, children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    console.log(params)
    return (
        <div>
            {children}
        </div>
    );
}
