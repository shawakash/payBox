"use client"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Address, Network } from "@paybox/common"
import { useTheme } from "next-themes"
import { useState } from "react"
import { Target } from "lucide-react"

export function PaymentCard({
    address
}: { address: Partial<Address> }) {
    const { theme } = useTheme();
    const [network, setNetwork] = useState<Network>(Network.Sol);
    console.log(network)
    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>
                    Add a new payment method to your account.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <RadioGroup defaultValue="card" className="grid grid-cols-3 gap-4">
                    <div>
                        <RadioGroupItem
                            value="sol"
                            id="sol"
                            className="peer sr-only"
                            defaultChecked
                            onClick={_ => setNetwork(Network.Sol)}
                        />
                        <Label
                            htmlFor="sol"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <img
                                className="mb-3 h-6 w-6"
                                src={theme == 'light' ? `/network/solDark.svg` : `/network/solWhite.svg`}
                            />
                            Solana
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem
                            value="eth"
                            id="eth"
                            className="peer sr-only"
                            onClick={_ => setNetwork(Network.Eth)}
                        />
                        <Label
                            htmlFor="eth"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <img
                                className="mb-3 h-6 w-6"
                                src={theme == 'light' ? `/network/ethDark.svg` : `/network/ethWhite.svg`}
                            />
                            Ethereum
                        </Label>
                    </div>
                    {/* <div>
                        <RadioGroupItem
                            value="usdc"
                            id="usdc"
                            className="peer sr-only"
                        />
                        <Label
                            htmlFor="usdc"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <img
                                className="mb-3 h-6 w-6"
                                src={theme == 'light' ? `/network/usdcWhite.svg` : `/network/usdcDark.svg`}
                            />
                            USDC
                        </Label>
                    </div> */}
                    <HoverCard>
                        <HoverCardTrigger>
                            <div>
                                <RadioGroupItem
                                    value="bitcoin"
                                    id="bitcoin"
                                    className="peer sr-only"
                                    disabled
                                    onClick={_ => setNetwork(Network.Bitcoin)}
                                />
                                <Label
                                    htmlFor="bitcoin"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <img
                                        className="mb-3 h-6 w-6"
                                        src={theme == 'light' ? `/network/bitcoinWhite.svg` : `/network/bitcoinDark.svg`}
                                    />
                                    Bitcoin
                                </Label>
                            </div>
                        </HoverCardTrigger>
                        <HoverCardContent>
                            The Bitcoin Part of the app is currently under Production.😊
                        </HoverCardContent>
                    </HoverCard>


                </RadioGroup>
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="First Last" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="number">Amount</Label>
                    <Input id="number" placeholder="" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="month">Expires</Label>
                        <Select>
                            <SelectTrigger id="month">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">January</SelectItem>
                                <SelectItem value="2">February</SelectItem>
                                <SelectItem value="3">March</SelectItem>
                                <SelectItem value="4">April</SelectItem>
                                <SelectItem value="5">May</SelectItem>
                                <SelectItem value="6">June</SelectItem>
                                <SelectItem value="7">July</SelectItem>
                                <SelectItem value="8">August</SelectItem>
                                <SelectItem value="9">September</SelectItem>
                                <SelectItem value="10">October</SelectItem>
                                <SelectItem value="11">November</SelectItem>
                                <SelectItem value="12">December</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="year">Year</Label>
                        <Select>
                            <SelectTrigger id="year">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => (
                                    <SelectItem key={i} value={`${new Date().getFullYear() + i}`}>
                                        {new Date().getFullYear() + i}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="CVC" />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <AlertDialog>
                    <AlertDialogTrigger className="w-full">
                        <Button className="w-full">Continue</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure to pay?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </CardFooter>
        </Card>
    )
}