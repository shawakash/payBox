"use client";
import { Nav } from "@/components/ui/nav";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import { loadingAtom } from "@paybox/recoil";
import { useRecoilValue } from "recoil";

export default function RootChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoading = useRecoilValue(loadingAtom);
  return (
    <>
      {/* <Progress value={33} className="absolute top-0 bg-transparent" /> */}
      <Nav />
      <main className="flex min-h-screen py-5 flex-col w-full justify-center">
        {children}
      </main>
      <Toaster />
    </>
  );
}
