"use client";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { RocketIcon } from "@radix-ui/react-icons";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Address,
  BACKEND_URL,
  BitcoinToken,
  Client,
  ClientWithJwt,
  EthToken,
  Network,
  SolToken,
  Token,
  TxnSendQuery,
  capitiliaze,
} from "@paybox/common";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadingAtom } from "@paybox/recoil";
import { useRecoilState } from "recoil";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { ClusterCombo } from "@/components/ui/cluster-combobox";

export function PaymentCard({
  address,
  client,
}: {
  address: Partial<Address>;
  client: ClientWithJwt;
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useRecoilState(loadingAtom);
  const [network, setNetwork] = useState<Network>(Network.Sol);

  const form = useForm<z.infer<typeof TxnSendQuery>>({
    resolver: zodResolver(TxnSendQuery),
    defaultValues: {
      amount: 0,
      //@ts-ignore
    },
  });

  async function onSubmit(values: z.infer<typeof TxnSendQuery>) {
    setIsLoading(true);
    console.log(JSON.stringify(values));
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
    const url = `${BACKEND_URL}/txn/send?from=${values.from}&to=${values.to}&network=${values.network}&amount=${values.amount}&cluster=${values.cluster}`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-type": "application/json",
        authorization: `Bearer ${client?.jwt}`,
      },
    }).then((res) => res.json());
    toast({
      title: `Transaction Successful`,
      description: network == Network.Sol ? `Transaction Hash: ${response.signature.transaction.signatures[0]}` : `Transaction Hash: ${response.hash}`,
    });
    router.push("/txn");
    setIsLoading(false);
  }

  useEffect(() => {
    form.setValue("network", network);
    if (client.address) {
      form.setValue("from", client.address[network] as string);
    }
    form.setValue("to", address[network] as string);
  }, [network]);
  return (
    <Card className="w-[600px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
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
                  onClick={(_) => setNetwork(Network.Sol)}
                />
                <Label
                  htmlFor="sol"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <img
                    className="mb-3 h-6 w-6"
                    src={
                      theme == "light"
                        ? `/network/solDark.svg`
                        : `/network/solWhite.svg`
                    }
                  />
                  Solana
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="eth"
                  id="eth"
                  className="peer sr-only"
                  onClick={(_) => setNetwork(Network.Eth)}
                />
                <Label
                  htmlFor="eth"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <img
                    className="mb-3 h-6 w-6"
                    src={
                      theme == "light"
                        ? `/network/ethDark.svg`
                        : `/network/ethWhite.svg`
                    }
                  />
                  Ethereum
                </Label>
              </div>
              <HoverCard>
                <HoverCardTrigger>
                  <div>
                    <RadioGroupItem
                      value="bitcoin"
                      id="bitcoin"
                      className="peer sr-only"
                      disabled
                      onClick={(_) => setNetwork(Network.Bitcoin)}
                    />
                    <Label
                      htmlFor="bitcoin"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <img
                        className="mb-3 h-6 w-6"
                        src={
                          theme == "light"
                            ? `/network/bitcoinWhite.svg`
                            : `/network/bitcoinDark.svg`
                        }
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
              <Input id="name" placeholder={`${client.firstname}`} />

            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem className="grid">
                    <Label htmlFor="text">
                      Your {capitiliaze(network)} Address
                    </Label>
                    <FormControl>
                      <Input
                        id="from"
                        //@ts-ignore
                        placeholder={`${client.address[network]}`}
                        type="text"
                        autoCorrect="off"
                        disabled
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem className="grid">
                    <Label htmlFor="text">
                      To {capitiliaze(network)} Address
                    </Label>
                    <FormControl>
                      <Input
                        id="to"
                        placeholder={`${address[network]}`}
                        type="text"
                        autoCorrect="off"
                        disabled
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-x-5 items-center">
              <div className="grid grid-flow-col gap-x-5 w-2/3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="grid">
                      <Label htmlFor="number">Amount</Label>
                      <FormControl>
                        <Input
                          id="amount"
                          placeholder="You are sending..."
                          type="number"
                          autoCorrect="off"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="cluster"
                render={({ field }) => (
                  <FormItem className="grid mt-5">
                    <FormControl>
                      <ClusterCombo
                        network={network}
                        selectCluster={(cluster) => {
                          console.log(cluster)
                          form.setValue("cluster", cluster);
                        }
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem className="grid">
                    <FormControl>
                      <Button
                        id="network"
                        type="button"
                        autoCorrect="off"
                        disabled={isLoading}
                        {...field}
                        className="mt-5 w-12 bg-white text-black"
                      >
                        {network}
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              onSubmit={(_) => setIsLoading(true)}
              className="w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              Pay
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
