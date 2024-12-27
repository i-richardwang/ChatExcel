import ButtonAccount from "@/components/ButtonAccount";
import { ChatExcelSection } from "@/components/chatexcel/ChatExcelSection";
import Link from "next/link";
import Image from "next/image";
import logo from "@/app/icon.svg";
import config from "@/config";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              className="flex items-center gap-3 shrink-0"
              href="/"
              title={`${config.appName} homepage`}
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-8 h-8"
                priority={true}
                width={32}
                height={32}
              />
              <span className="font-bold text-xl">{config.appName}</span>
            </Link>
            
            <ButtonAccount />
          </div>
        </div>
      </header>
      <ChatExcelSection />
    </main>
  );
}
