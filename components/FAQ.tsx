"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "How does ChatExcel protect my data privacy?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          Your data security is our top priority. All Excel operations are performed directly in your browser - your files never leave your device. The AI only reads column headers to generate commands, ensuring complete privacy of your sensitive data.
        </p>
      </div>
    ),
  },
  {
    question: "What types of Excel operations can I perform?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>You can perform a wide range of operations, including but not limited to:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Data aggregation and analysis</li>
          <li>VLOOKUP and complex formulas</li>
          <li>Pivot table creation</li>
          <li>Data visualization and charts</li>
          <li>Multi-sheet operations</li>
          <li>Data cleaning and transformation</li>
        </ul>
      </div>
    ),
  },
  {
    question: "What's the difference between regular AI operations and multi-step Agent operations?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          Regular AI operations are perfect for single-step tasks like creating a pivot table or performing a VLOOKUP. Multi-step Agent operations are designed for more complex scenarios that require multiple steps or logic, such as cleaning data across multiple sheets and then creating a summary visualization.
        </p>
      </div>
    ),
  },
  {
    question: "Do I need to know Excel formulas to use ChatExcel?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          No! That's the beauty of ChatExcel. Simply describe what you want to achieve in plain English, and we'll handle the technical details. For example, instead of writing complex VLOOKUP formulas, just say "find matching values from sheet 2 and add them to sheet 1."
        </p>
      </div>
    ),
  },
  {
    question: "What about refunds and trials?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          We provide 5 free operations for all new users to try out ChatExcel before making a purchase. This allows you to thoroughly test our service and ensure it meets your needs. Due to the nature of our AI-powered service and the computational costs involved, we generally don't offer refunds after purchase. We encourage you to make full use of the free trial to evaluate our service.
        </p>
      </div>
    ),
  },
  {
    question: "Is there a limit to the file size I can process?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          Since all processing happens in your browser, the file size limit depends on your device's capabilities. Generally, ChatExcel works smoothly with Excel files up to 10MB. For larger files, we recommend splitting them into smaller chunks for optimal performance.
        </p>
      </div>
    ),
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-white" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-green-500 mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Frequently Asked Questions
          </p>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
