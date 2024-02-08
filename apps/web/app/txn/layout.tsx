import { Metadata } from "next";
import Image from "next/image";

import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/app/profile/components/sidebar-nav";

export const metadata: Metadata = {
  title: "Txn | PayBox",
  description: "Transaction Details | PayBox",
};

interface TxnLayoutProps {
  children: React.ReactNode;
}

export default function TxnLayout({ children }: TxnLayoutProps) {
  return (
    <>
      <div className="flex-1 lg:max-w-2xl">{children}</div>
    </>
  );
}
