"use client";

import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

const RegisterCircleInputClient = z.object({
    circle_image: z.string(),
    });

function getImageData(event: ChangeEvent<HTMLInputElement>) {
  // FileList is immutable, so we need to create a new one
  const dataTransfer = new DataTransfer();

  // Add newly uploaded images
  Array.from(event.target.files!).forEach((image) =>
    dataTransfer.items.add(image)
  );

  const files = dataTransfer.files;
  const displayUrl = URL.createObjectURL(event.target.files![0]);

  return { files, displayUrl };
}

export function RegisterForm() {
  const [preview, setPreview] = useState("");
  const form = useForm<z.infer<typeof RegisterCircleInputClient>>({
    mode: "onSubmit",
    resolver: zodResolver(RegisterCircleInputClient),
  });

  function submitCircleRegistration(value: z.infer<typeof RegisterCircleInputClient>) {
    console.log({ value });
  }

  return (
    <>
      <Form {...form}>
        <form
          className="space-y-8"
          onSubmit={form.handleSubmit(submitCircleRegistration)}
        >
          
        </form>
      </Form>
    </>
  );
}