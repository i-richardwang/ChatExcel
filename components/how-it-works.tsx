import Features from "@/components/features-vertical";
import Section from "@/components/section";
import { FileSpreadsheet, MessageSquare, Sparkles } from "lucide-react";

const data = [
  {
    id: 1,
    title: "1. Import Your Excel Files",
    content:
      "Drag and drop your files into the browser. Everything stays local - no data ever leaves your device.",
    image: "/dashboard.png",
    icon: <FileSpreadsheet className="w-6 h-6 text-green-500" />,
  },
  {
    id: 2,
    title: "2. Describe Your Need",
    content:
      "Tell us what you want in plain English. From VLOOKUPs to pivot tables - just ask naturally.",
    image: "/dashboard.png",
    icon: <MessageSquare className="w-6 h-6 text-green-500" />,
  },
  {
    id: 3,
    title: "3. Get Instant Results",
    content:
      "Watch your Excel tasks complete in seconds. Clean, accurate results ready for analysis.",
    image: "/dashboard.png",
    icon: <Sparkles className="w-6 h-6 text-green-500" />,
  },
];

export default function Component() {
  return (
    <Section 
      title="How it works" 
      subtitle="Three Simple Steps to Excel Freedom"
      description="Transform hours of manual Excel work into seconds - no technical skills required."
    >
      <Features data={data} />
    </Section>
  );
}
