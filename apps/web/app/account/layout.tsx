import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | PayBox",
  description: "Account | PayBox",
};

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <>
      <div className="flex-1 lg:max-w-2xl">{children}</div>
    </>
  );
}
