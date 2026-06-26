import type { Metadata } from "next";
import { LegalLayout, H2, P, ulStyle, Table } from "@/components/legal-layout";

export const metadata: Metadata = { title: "Refund & Cancellation Policy" };

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund & Cancellation Policy">
      <P>We understand that plans change. The Golden Mic offers a fair refund policy based on how far in advance a cancellation is made.</P>

      <H2>Cancellation & Refund Tiers</H2>
      <Table rows={[
        ["More than 24 hours before the slot", "80% of booking amount"],
        ["Within 24 hours of the slot", "50% of booking amount"],
        ["No-show (no cancellation made)", "No refund"],
      ]} />
      <P style={{ fontSize: 13.5, fontStyle: "italic" } as React.CSSProperties}>
        Note: The 2% payment processing/transaction fee is non-refundable in all cases, as it is charged by the payment gateway (Razorpay) and cannot be recovered by us.
      </P>

      <H2>How to Request a Cancellation</H2>
      <P>You can cancel directly from your <a href="/profile" style={{ color: "oklch(0.75 0.15 85)", textDecoration: "underline" }}>profile page</a> under &quot;Upcoming Bookings&quot; — your refund amount is calculated automatically. Alternatively:</P>
      <ul style={ulStyle}>
        <li>Email us at thegoldenmicpune@gmail.com with your full name, booking date and time slot</li>
        <li>Or call/WhatsApp us at +91 94227 89659</li>
      </ul>

      <H2>Refund Processing</H2>
      <ul style={ulStyle}>
        <li>Approved refunds are processed within 5-7 business days.</li>
        <li>Refunds are credited back to the original payment method (UPI, card, net banking) used at the time of booking.</li>
        <li>You will receive an email confirmation once the refund is initiated.</li>
      </ul>

      <H2>Rescheduling</H2>
      <P>We offer free rescheduling subject to studio availability, provided the request is made more than 24 hours before the original slot. Rescheduling requests within 24 hours of the slot are treated as cancellations and the refund policy above applies. To reschedule, contact us via email or phone with your booking details.</P>

      <H2>Special Circumstances</H2>
      <P>In rare cases (technical failure, studio unavailability due to unforeseen circumstances on our end), The Golden Mic will offer a full 100% refund or priority rescheduling at no extra charge.</P>

      <H2>Non-Refundable Cases</H2>
      <P>The following are not eligible for any refund:</P>
      <ul style={ulStyle}>
        <li>No-show without prior cancellation</li>
        <li>Session terminated due to violation of studio rules (as outlined in our Terms & Conditions)</li>
        <li>Dissatisfaction with personal performance/recording output (our studio equipment and staff perform to the best of their ability)</li>
      </ul>
    </LegalLayout>
  );
}
