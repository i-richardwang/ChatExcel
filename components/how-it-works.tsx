import Features from "@/components/features-vertical";
import Section from "@/components/section";
import { FileSpreadsheet, MessageSquare, Sparkles, Table2, Download } from "lucide-react";

const data = [
  {
    id: 1,
    title: "1. Select Your Excel Files",
    content:
      "Simply drop your files into the browser. Everything stays local - no data ever leaves your device.",
    demo: (
      <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4">
        <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
          <FileSpreadsheet className="w-16 h-16 text-gray-400" />
          <p className="text-base text-gray-500">Drop your Excel files here</p>
          <div className="w-full space-y-2">
            <div className="w-full bg-green-50 rounded p-3 text-sm text-green-700 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              sales_2023.xlsx
            </div>
            <div className="w-full bg-green-50 rounded p-3 text-sm text-green-700 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              customer_data.xlsx
            </div>
          </div>
        </div>
      </div>
    ),
    icon: <FileSpreadsheet className="w-6 h-6 text-green-500" />,
  },
  {
    id: 2,
    title: "2. Describe Your Need",
    content:
      "Tell us what you want in plain English. From VLOOKUPs to pivot tables - just ask naturally.",
    demo: (
      <div className="w-full h-full flex flex-col justify-center gap-4 p-4">
        <div className="flex gap-3 items-start max-w-[90%]">
          <div className="p-2 rounded-full bg-gray-100">
            <MessageSquare className="w-4 h-4 text-gray-500" />
          </div>
          <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 text-sm">
            Match customer data with sales records using email, then create a monthly revenue summary by customer segment
          </div>
        </div>
        <div className="flex gap-3 items-start max-w-[90%] self-end">
          <div className="bg-green-50 rounded-2xl rounded-tr-none p-4 text-sm text-green-700">
            <div className="space-y-2">
              <p>I'll help you with that. Here's what I'll do:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Perform VLOOKUP to match customer segments</li>
                <li>Create pivot table for monthly analysis</li>
                <li>Generate summary visualization</li>
              </ol>
            </div>
          </div>
          <div className="p-2 rounded-full bg-green-100">
            <Table2 className="w-4 h-4 text-green-500" />
          </div>
        </div>
      </div>
    ),
    icon: <MessageSquare className="w-6 h-6 text-green-500" />,
  },
  {
    id: 3,
    title: "3. Get Instant Results",
    content:
      "Watch your Excel tasks complete in seconds. Clean, accurate results ready for analysis.",
    demo: (
      <div className="w-full h-full flex flex-col justify-center p-4">
        <div className="bg-green-50/50 rounded-2xl p-6">
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-medium text-green-800">Analysis Result</span>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-base font-medium hover:bg-green-600 transition-colors">
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
            <div className="w-full bg-white rounded-xl p-6">
              <div className="space-y-8">
                <div className="text-lg font-medium text-green-800">Monthly Revenue by Segment</div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-600">Basic</div>
                    <div className="flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden">
                      <div className="w-[40%] h-full bg-green-500/20 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-600">Pro</div>
                    <div className="flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden">
                      <div className="w-[65%] h-full bg-green-500/20 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-600">Enterprise</div>
                    <div className="flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden">
                      <div className="w-[90%] h-full bg-green-500/20 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    icon: <Sparkles className="w-6 h-6 text-green-500" />,
  },
];

export default function Component() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-8 md:py-16">
      <div className="text-center mb-12">
        <p className="text-sm font-semibold tracking-wider text-green-500 mb-4">
          HOW IT WORKS
        </p>
        <h2 className="font-extrabold text-4xl md:text-5xl tracking-tight mb-6">
          Three Simple Steps to Excel Freedom
        </h2>
        <p className="max-w-xl mx-auto text-lg opacity-90 leading-relaxed">
          Transform hours of manual Excel work into seconds - no technical skills required.
        </p>
      </div>
      <Features data={data} />
    </section>
  );
}
