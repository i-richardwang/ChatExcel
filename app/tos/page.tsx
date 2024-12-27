import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: November 28, 2023

Welcome to ChatExcel!

These Terms of Service ("Terms") govern your use of the ChatExcel website at https://chatexcel.org ("Website") and the services provided by ChatExcel. By using our Website and services, you agree to these Terms.

1. Description of ChatExcel

ChatExcel is a browser-based platform that allows users to perform Excel operations using natural language commands. It leverages AI to simplify tasks such as data analysis, visualization, and manipulation of spreadsheets. All processing is done locally within the user's browser, ensuring data privacy and security.

2. User Data and Privacy

ChatExcel is committed to protecting your privacy. We do not collect or store any personal data or files uploaded by users. All data processing occurs within your browser, and no information is transmitted to our servers.

3. Non-Personal Data Collection

We do not collect any non-personal data. ChatExcel operates entirely client-side, and no cookies or tracking mechanisms are used to collect user information.

4. Service Usage

ChatExcel offers both free and paid subscription tiers. Guest users and free tier users have limited access to basic operations. Paid subscribers have access to advanced features, including pro mode operations and increased usage quotas. Details of the subscription plans and their respective features are available on our pricing page.

5. Intellectual Property

The ChatExcel platform, including its design, code, and functionality, is the intellectual property of ChatExcel and its creators. Users are granted a non-exclusive, non-transferable license to use the service for their personal or internal business purposes.

6. Limitation of Liability

ChatExcel is provided "as is" without any warranties, express or implied. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your use or inability to use the service; (b) any unauthorized access to or use of our service; (c) any interruption or cessation of transmission to or from our service; (d) any bugs, viruses, trojan horses, or the like that may be transmitted to or through our service by any third party; (e) any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available through the service; and/or (f) user content or the defamatory, offensive, or illegal conduct of any third party.

7. Governing Law

These Terms are governed by the laws of the jurisdiction in which ChatExcel's creators are based, without regard to its conflict of law provisions.

8. Updates to the Terms

We may update these Terms from time to time. Users will be notified of any significant changes through our Website or, if applicable, via email.

For any questions or concerns regarding these Terms of Service, please contact us at support@chatexcel.org.

Thank you for using ChatExcel!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
