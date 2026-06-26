import Link from "next/link";
import type { Metadata } from "next";
import { LegalLayout, H2, P, ulStyle, linkStyle } from "@/components/legal-layout";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions">
      <P>By accessing thegoldenmic.in and making a booking, you agree to be bound by these Terms & Conditions. Please read them carefully before proceeding.</P>

      <H2>1. About Us</H2>
      <P>The Golden Mic is a professional recording and karaoke studio located in Pune, Maharashtra, India. We offer studio sessions including solo recording, group recording, mix sessions, karaoke, and live rehearsals.</P>
      <P>Email: thegoldenmicpune@gmail.com · Phone: +91 94227 89659</P>

      <H2>2. Booking & Payment</H2>
      <P>All bookings are subject to availability and confirmed only upon successful payment. A booking is considered confirmed once you receive a confirmation email from us. You must provide accurate personal details (name, phone, email) at the time of booking.</P>
      <P>All payments are processed securely via Razorpay. We accept UPI, debit/credit cards, and net banking. A 2% payment processing fee (transaction fee) is added to all online bookings. This fee is charged by the payment gateway and is non-refundable under any circumstances. All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.</P>
      <P>If a payment fails after being deducted from your account, the amount will be refunded within 5-7 business days by your bank. Please contact us if the issue persists beyond this period.</P>

      <H2>3. Cancellation & Refund Policy</H2>
      <P>Please refer to our full <Link href="/refund-policy" style={linkStyle}>Refund & Cancellation Policy</Link> for complete details. In summary:</P>
      <ul style={ulStyle}>
        <li>Cancellations made more than 24 hours before the slot are eligible for an 80% refund of the booking amount (excluding transaction fee).</li>
        <li>Cancellations made within 24 hours of the slot are eligible for a 50% refund of the booking amount (excluding transaction fee).</li>
        <li>No-shows (failure to arrive without cancellation) are not eligible for any refund.</li>
      </ul>

      <H2>4. Studio Rules & Conduct</H2>
      <ul style={ulStyle}>
        <li>Customers must arrive 5-10 minutes before their scheduled slot.</li>
        <li>Outside food and beverages (except water) are not permitted inside the studio.</li>
        <li>Any damage to studio equipment caused by the customer will be charged at the cost of repair/replacement.</li>
        <li>The Golden Mic reserves the right to terminate a session without refund if a customer is found to be under the influence of alcohol or substances, or engaging in disruptive behaviour.</li>
        <li>Recording of content that is illegal, defamatory, or violates any third-party intellectual property rights is strictly prohibited.</li>
      </ul>

      <H2>5. Intellectual Property</H2>
      <P>Content recorded at The Golden Mic belongs to the customer. The Golden Mic does not claim any rights over recordings made by customers on our premises. The Golden Mic&apos;s name, logo, and branding may not be used for commercial purposes without written permission.</P>

      <H2>6. Liability</H2>
      <P>The Golden Mic is not liable for any loss, damage, or injury that occurs on the premises beyond what is required by applicable law. We are not responsible for any loss of data, recordings, or files due to technical failure. Customers are advised to carry their own storage media. Our maximum liability in any dispute shall not exceed the amount paid by the customer for that specific booking.</P>

      <H2>7. Privacy</H2>
      <P>Your personal data is handled in accordance with our <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>.</P>

      <H2>8. Modifications</H2>
      <P>The Golden Mic reserves the right to modify these Terms & Conditions at any time. Changes will be posted on this page with an updated date. Continued use of our services after any changes constitutes acceptance of the new terms.</P>

      <H2>9. Governing Law</H2>
      <P>These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts in Pune, Maharashtra.</P>
    </LegalLayout>
  );
}
