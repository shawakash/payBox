"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { toast } from "@/components/ui/use-toast";
import {
  AddressFormPartial,
  AddressFormPartialType,
  BACKEND_URL,
  Network,
} from "@paybox/common";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addressAtom, clientAtom, loadingAtom } from "@paybox/recoil";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Icons } from "@/components/ui/icons";
import { useRouter } from "next/navigation";

// This can come from your database or API.
const defaultValues: Partial<AddressFormPartialType> = {
  sol: "",
};

export function AddressForm() {
  const [isLoading, setIsLoading] = useRecoilState(loadingAtom);
  const [client, setClient] = useRecoilState(clientAtom);
  const [address, setAddress] = useRecoilState(addressAtom);
  const [dynamicFields, setDynamicFields] = useState<Network[]>([]);
  const form = useForm<AddressFormPartialType>({
    resolver: zodResolver(AddressFormPartial),
    defaultValues,
  });

  const addInput = () => {
    const newFieldKey = Network.Eth;
    setDynamicFields((prevFields) => [...prevFields, newFieldKey]);
    form.register(newFieldKey);
  };

  const onSubmit = async (data: AddressFormPartialType) => {
    setIsLoading(true);
    console.log(JSON.stringify(data));
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    console.log(client?.jwt);
    const response = await fetch(`${BACKEND_URL}/address/`, {
      method: "post",
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json",
        authorization: `Bearer ${client?.jwt}`,
      },
    }).then((res) => res.json());
    console.log(response);
    setAddress(data);
    toast({
      title: "Address Added",
      description: `${JSON.stringify(data)}`,
    });
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="sol"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex w-full items-center space-x-2">
                  <Badge variant={"outline"} className="text-sm py-1 h-9 px-3">
                    Solana
                  </Badge>
                  <Input
                    id="sol"
                    type="text"
                    placeholder={
                      address?.sol
                        ? address.sol
                        : `Your Sol Address Goes here ...`
                    }
                    className={cn("w-11/12")}
                    autoComplete="sol"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="eth"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex w-full items-center space-x-2">
                  <Badge variant={"outline"} className="text-sm py-1 h-9 px-3">
                    Ethereum
                  </Badge>
                  <Input
                    id="eth"
                    type="text"
                    placeholder={
                      address?.eth
                        ? address?.eth
                        : `Your Ethereum Address Goes here ...`
                    }
                    className={cn("w-11/12")}
                    autoComplete="eth"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bitcoin"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex w-full items-center space-x-2">
                  <Badge variant={"outline"} className="text-sm py-1 h-9 px-3">
                    Bitcoin
                  </Badge>
                  <Input
                    id="bitcoin"
                    type="text"
                    placeholder={
                      address?.bitcoin
                        ? address?.bitcoin
                        : `Your Bitcoin Address Goes here(optional)  ...`
                    }
                    className={cn("w-11/12")}
                    autoComplete="eth"
                    autoCorrect="off"
                    disabled={true}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                This feature is currently under production
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usdc"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex w-full items-center space-x-2">
                  <Badge variant={"outline"} className="text-sm py-1 h-9 px-3">
                    USDC
                  </Badge>
                  <Input
                    id="eth"
                    type="text"
                    placeholder={
                      address?.usdc
                        ? address?.usdc
                        : `Your USDC Address Goes here(optional) ...`
                    }
                    className={cn("w-11/12")}
                    autoComplete="eth"
                    autoCorrect="off"
                    disabled={true}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                This feature is currently under production
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Update account"
          )}{" "}
        </Button>
      </form>
    </Form>
  );
}
