import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR PRIVACY POLICY — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple privacy policy for my website. Here is some context:
// - Website: https://shipfa.st (replace with your actual domain)
// - Name: ShipFast (replace with your actual app name)
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster (replace with your actual app description)
// - User data collected: name, email and payment information (replace with your actual data collected)
// - Non-personal data collection: web cookies
// - Purpose of Data Collection: Order processing (replace with your actual purpose)
// - Data sharing: we do not share the data with any other parties
// - Children's Privacy: we do not collect any data from children
// - Updates to the Privacy Policy: users will be updated by email
// - Contact information: marc@shipfa.st (replace with your actual contact email)

// Please write a simple privacy policy for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: 2023-11-20

Thank you for using ${config.appName} ("we," "us," or "our"). This Privacy Policy outlines how we collect, use, and protect your personal and non-personal information when you use our website and services (collectively, the "Service").

By accessing or using the Service, you agree to the terms of this Privacy Policy. If you do not agree with the practices described in this policy, please do not use the Service.

1. Information We Collect

1.1 Personal Data

We collect the following personal information from you:

- Name: We collect your name to personalize your experience and communicate with you effectively.
- Email: We collect your email address to send you important information regarding your account, updates, and communication related to the Service.
- Payment Information: We collect payment details to process your subscription securely. Payments are processed by trusted third-party payment processors, and we do not store your full payment information on our servers.
- Usage Data: We collect information about your interactions with the Service, such as the operations you perform, the files you upload, and your usage patterns. This data is anonymized and used to improve the Service.

1.2 Non-Personal Data

We may use web cookies and similar technologies to collect non-personal information such as your IP address, browser type, device information, and browsing patterns. This information helps us to enhance your browsing experience, analyze trends, and improve our services.

2. Purpose of Data Collection

We collect and use your personal data for the following purposes:

- Account Management: To create and manage your account, provide customer support, and communicate with you about your account.
- Service Provision: To provide the core functionality of the Service, including processing your Excel files and delivering the results.
- Order Processing: To process your subscription payments and manage your subscription.
- Improvement of Service: To analyze usage patterns, identify areas for improvement, and develop new features.
- Communication: To send you important updates, newsletters, and promotional materials related to the Service. You can opt-out of marketing communications at any time.

3. Data Sharing

We do not share your personal data with any third parties except as required to provide the Service (e.g., sharing necessary information with payment processors). We do not sell, trade, or rent your personal information to others.

4. Data Security

We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. All data processing occurs within your browser, and your files are not uploaded to our servers.

5. Children's Privacy

${config.appName} is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us at the email address provided below.

6. Updates to the Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Any updates will be posted on this page, and we may notify you via email about significant changes.

7. Contact Information

If you have any questions, concerns, or requests related to this Privacy Policy, you can contact us at:

Email: support@chatexcel.org

For all other inquiries, please visit our Contact Us page on the Website.

By using ${config.appName}, you consent to the terms of this Privacy Policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
