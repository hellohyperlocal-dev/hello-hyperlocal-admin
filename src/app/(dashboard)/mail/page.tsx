import { Mail } from "./components/mail"
import { accounts, type Mail as MailType } from "./data"
import { getRegistrations, REGISTRATION_ROLES, type RegistrationDetail } from "@/lib/registrations"

function registrationToMail(reg: RegistrationDetail): MailType {
  const name =
    reg.full_name ||
    [reg.first_name, reg.last_name].filter(Boolean).join(" ") ||
    reg.business_name ||
    reg.email;

  const roleObj = REGISTRATION_ROLES.find((r) => r.id === reg.primaryRole);
  const roleLabel = roleObj?.label ?? "Registration";

  let subject = `New Registration: ${roleLabel} - ${name}`;
  if (reg.business_name) {
    subject = `Founding Business Application: ${reg.business_name}`;
  } else if (reg.primaryRole === "founding_neighbour") {
    subject = `Founding Neighbour Sign-up: ${name}`;
  } else if (reg.primaryRole === "partner_interest") {
    subject = `Partner Interest Enquiry: ${name}`;
  } else if (reg.primaryRole === "general_enquiry") {
    subject = `General Enquiry from ${name}`;
  }

  const detailsObj =
    reg.details && typeof reg.details === "object"
      ? (reg.details as Record<string, unknown>)
      : null;
  const customMessage =
    detailsObj && typeof detailsObj.message === "string"
      ? detailsObj.message
      : null;

  const infoLines: string[] = [];
  if (customMessage) {
    infoLines.push(customMessage);
    infoLines.push("");
    infoLines.push("--------------------------------------------------");
    infoLines.push("REGISTRATION SUMMARY");
  } else {
    infoLines.push(`New ${roleLabel.toLowerCase()} registration submitted on Hello Linden.`);
    infoLines.push("");
    infoLines.push("--------------------------------------------------");
    infoLines.push("REGISTRATION SUMMARY");
  }

  infoLines.push(`Applicant: ${name}`);
  infoLines.push(`Email: ${reg.email}`);
  if (reg.mobile) infoLines.push(`Mobile: ${reg.mobile}`);
  infoLines.push(`Category: ${roleLabel}`);
  if (reg.suburb) infoLines.push(`Suburb: ${reg.suburb}`);
  if (reg.business_name) infoLines.push(`Business: ${reg.business_name}`);
  if (reg.business_address) infoLines.push(`Address: ${reg.business_address}`);
  if (reg.interests && reg.interests.length > 0) {
    infoLines.push(`Interests: ${reg.interests.join(", ")}`);
  }
  if (reg.wants_window_sticker !== undefined) {
    infoLines.push(`Wants Window Sticker: ${reg.wants_window_sticker ? "Yes" : "No"}`);
  }
  if (reg.claimed_at) {
    infoLines.push(`Status: Claimed (${new Date(reg.claimed_at).toLocaleDateString()})`);
  } else {
    infoLines.push("Status: Unclaimed / Pending");
  }
  if (reg.source) infoLines.push(`Source: ${reg.source}`);
  infoLines.push(`Submitted: ${new Date(reg.created_at).toLocaleString()}`);

  const labels: string[] = [roleLabel];
  if (reg.suburb) labels.push(reg.suburb);
  if (reg.wants_window_sticker) labels.push("Window Sticker");

  return {
    id: reg.id,
    name,
    email: reg.email,
    subject,
    text: infoLines.join("\n"),
    date: reg.created_at,
    read: Boolean(reg.claimed_at),
    labels,
    category: reg.primaryRole,
  };
}

export default async function MailPage() {
  const { categories, byId } = await getRegistrations();
  const registrationCounts = {
    founding_neighbour: categories.find((c) => c.id === "founding_neighbour")?.count ?? 0,
    founding_business: categories.find((c) => c.id === "founding_business")?.count ?? 0,
    partner_interest: categories.find((c) => c.id === "partner_interest")?.count ?? 0,
    general_enquiry: categories.find((c) => c.id === "general_enquiry")?.count ?? 0,
  };

  const realMails: MailType[] = Array.from(byId.values()).map(registrationToMail);

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Mail
        accounts={accounts}
        mails={realMails}
        registrationCounts={registrationCounts}
      />
    </div>
  );
}
