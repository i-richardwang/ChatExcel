import ButtonAccount from "@/components/ButtonAccount";
import { ChatExcelSection } from "@/components/chatexcel/ChatExcelSection";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  return (
    <main className="min-h-screen">
      <div className="flex justify-end p-4">
        <ButtonAccount />
      </div>
      <ChatExcelSection />
    </main>
  );
}
