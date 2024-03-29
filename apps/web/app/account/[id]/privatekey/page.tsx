import { AlertMsg } from "./components/alert-msg";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { EyeOff } from 'lucide-react';
import { RocketIcon } from "lucide-react"
import PrivateKeyFrom from "./components/private-key-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/util";

const getEncryptedPrivateKeys = async () => {

}

export default async function Page({ params }: { params: { id: string } }) {
    console.log(params);
    const session = await getServerSession(authOptions);

    return (
        <>
            <div className="flex flex-col gap-y-4 p-5">
                <Card className="min-w-56 max-w-[500px]">
                    <CardHeader>
                        {/* <CardTitle>Private key</CardTitle> */}
                        <Alert variant={"default"}>
                            <RocketIcon className="h-4 w-4" color="#ff4545" />
                            <AlertTitle className="text-[#ff4545]">Heads up!</AlertTitle>
                            <AlertDescription>Your private is the only way to retreive your wallet!</AlertDescription>
                        </Alert>
                        <Alert variant={"default"}>
                            <EyeOff className="h-4 w-4" color="#ff4545" />
                            <AlertTitle className="text-[#ff4545]">Caution!</AlertTitle>
                            <AlertDescription>Don't let anyone see your private keys.</AlertDescription>
                        </Alert>
                    </CardHeader>
                    <PrivateKeyFrom
                        accountId={params.id}
                        key={params.id}
                        //@ts-ignore
                        jwt={session?.user.jwt}
                    />
                </Card>
            </div>


        </>
    );

}