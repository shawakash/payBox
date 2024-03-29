import { CopyIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { useRecoilValue } from "recoil";
import { accountPrivateKeysAtom } from "@paybox/recoil";

export function PrivateKeyDialogBox({
    open,
    setOpen,
    // keys,
}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    // keys: { network: string, privateKey: string }[]
}) {
    const keys = useRecoilValue(accountPrivateKeysAtom);
    const [copyText, setCopyText] = React.useState<string>("Copy")

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="">
                <Tabs defaultValue={keys[0].network} className="">
                    <DialogHeader>
                        <DialogTitle>
                            <TabsList className="grid w-2/3 grid-cols-2">
                                {keys.map((key, index) => (
                                    <TabsTrigger key={index} value={key.network}>
                                        {key.network}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                        </DialogTitle>
                        <DialogDescription>

                        </DialogDescription>
                    </DialogHeader>

                    {keys.map((key, index) => (
                        <TabsContent value={key.network} key={index}>
                            <Card className="rounded-b-none">
                                <CardHeader>
                                    <Alert variant={"default"}>
                                        <AlertTriangle className="h-4 w-4" color="#ff4545" />
                                        <AlertTitle className="text-[#ff4545]">Caution!</AlertTitle>
                                        <AlertDescription className="text-[#ff4545]">Do not share your private keys. Indiviual bearing this has full control on this account!</AlertDescription>
                                    </Alert>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex flex-col items-center gap-y-4">
                                        <div className="w-full">
                                            <Label htmlFor="key" className="sr-only">
                                                Key
                                            </Label>
                                            <Textarea
                                                id="key"
                                                defaultValue={key.privateKey}
                                                readOnly
                                                className="min-w-max resize-none w-full"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className="px-3 flex gap-x-2 font-semibold"
                                            onClick={() => {
                                                navigator.clipboard.writeText(key.privateKey)
                                                setCopyText("Copied!")
                                                setTimeout(() => {
                                                    setCopyText("Copy")
                                                }, 5000)
                                            }}
                                        >
                                            <CopyIcon className="h-4 w-4" />
                                            <div className="">
                                                {copyText}
                                            </div>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" className="w-full rounded-t-none">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
