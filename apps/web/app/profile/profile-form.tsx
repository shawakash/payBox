"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useRecoilState } from "recoil"
import { clientAtom, loadingAtom } from "@paybox/recoil"
import { ClientWithJwt, MetadataUpdateForm, MetadataUpdateFormType } from "@paybox/common"
import { Badge } from "@/components/ui/badge"



export function ProfileForm({ me }: { me: ClientWithJwt | null }) {
  const [client, setClient] = useRecoilState(clientAtom);
  const [isLoading, setIsLoading] = useRecoilState(loadingAtom);

  useEffect(() => {
    if (me) {
      setClient(me);
    }
  }, [me]);

  const form = useForm<MetadataUpdateFormType>({
    resolver: zodResolver(MetadataUpdateForm),
    defaultValues: {
      firstname: client?.firstname,
      lastname: client?.lastname,
      mobile: client?.mobile,
      bio: "Paybox changed my life.",
      address: client?.address
    },
    mode: "onChange",
  })

  // const { fields, append } = useFieldArray({
  //   name: "urls",
  //   control: form.control,
  // });


  function onSubmit(data: MetadataUpdateFormType) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Firstname</FormLabel>
                <FormControl>
                  <Input
                    id="firstname"
                    placeholder={me?.firstname}
                    type="text"
                    autoCapitalize="words"
                    autoComplete="name"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Keep it real.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lastname</FormLabel>
                <FormControl>
                  <Input
                    id="lastname"
                    placeholder={me?.lastname}
                    type="text"
                    autoCapitalize="words"
                    autoComplete="name"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Also this one.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile</FormLabel>
                <FormControl>
                  <Input
                    id="mobile"
                    placeholder={me?.mobile}
                    type="text"
                    autoCapitalize="words"
                    autoComplete="name"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a valid mobile number for otp validation.
                  Should be similar to the wallet account.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    id="bio"
                    placeholder={"Tell us a little bit about yourself"}
                    autoCapitalize="none"
                    autoComplete="bio"
                    autoCorrect="off"
                    disabled={isLoading}
                    spellCheck="false"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  You can <Badge variant="outline">@mention</Badge>
                  other users and organizations to
                  link to them.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="m@example.com">m@example.com</SelectItem>
                    <SelectItem value="m@google.com">m@google.com</SelectItem>
                    <SelectItem value="m@support.com">m@support.com</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  You can manage verified email addresses in your{" "}
                  <Link href="/profile/forms">email settings</Link>.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <Button type="submit">Update profile</Button>
        </form>
      </Form>
    </div>
  )
}