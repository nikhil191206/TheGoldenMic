import type { Metadata } from "next";
import { LegalLayout, H2, P, ulStyle, Table } from "@/components/legal-layout";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <P>The Golden Mic (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding it when you use thegoldenmic.in.</P>

      <H2>1. Information We Collect</H2>
      <P><strong>Information you provide</strong> when booking: full name, gender, age, phone number, email address, group size, music preference, booking details, and payment transaction reference.</P>
      <P><strong>Automatically collected:</strong> Google account info (name, email, photo) if you sign in with Google — used only for authentication. Basic usage data via Vercel — no personally identifiable information.</P>
      <P><strong>Payment information:</strong> We never store your card number, CVV, or UPI PIN. All payments are processed by Razorpay (PCI-DSS compliant). We only store the transaction reference for booking confirmation.</P>

      <H2>2. How We Use Your Information</H2>
      <Table rows={[
        ["Booking & confirmation", "Name, phone, email, booking details"],
        ["Updates & support", "Email, phone (SMS)"],
        ["Fraud prevention", "Phone, email, transaction ID"],
        ["Service improvement", "Aggregated, anonymised usage data"],
      ]} />
      <P>We do not use your data for advertising, sell it to third parties, or share it with anyone outside of what is necessary to operate our service.</P>

      <H2>3. Data Sharing</H2>
      <P>We share your data only with:</P>
      <ul style={ulStyle}>
        <li>Razorpay — for payment processing</li>
        <li>Supabase — our database and authentication provider</li>
        <li>Resend — for transactional email delivery</li>
        <li>Fast2SMS — for SMS notifications</li>
      </ul>

      <H2>4. Data Storage & Security</H2>
      <ul style={ulStyle}>
        <li>Your data is stored securely on Supabase servers with HTTPS encryption for all transmission.</li>
        <li>Access to your booking data is restricted to authorised studio staff only.</li>
        <li>Payment screenshots/details are stored in a private, access-controlled storage bucket.</li>
      </ul>

      <H2>5. Data Retention</H2>
      <P>Booking records are retained for 2 years for accounting and legal compliance. If you request deletion of your account, your personal data will be removed within 30 days, except where retention is required by law.</P>

      <H2>6. Your Rights</H2>
      <P>You have the right to access, correct, or request deletion of your personal data, and to opt out of SMS/email communications. To exercise any of these rights, email us at thegoldenmicpune@gmail.com.</P>

      <H2>7. Cookies</H2>
      <P>Our website uses minimal cookies — only authentication cookies to keep you logged in (via Supabase Auth). No advertising or tracking cookies are used.</P>

      <H2>8. Children&apos;s Privacy</H2>
      <P>Our services are not directed at children under 13. We do not knowingly collect personal information from children under 13.</P>

      <H2>9. Changes to This Policy</H2>
      <P>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.</P>

      <H2>10. Contact</H2>
      <P>The Golden Mic — Email: thegoldenmicpune@gmail.com · Phone: +91 94227 89659</P>
    </LegalLayout>
  );
}
