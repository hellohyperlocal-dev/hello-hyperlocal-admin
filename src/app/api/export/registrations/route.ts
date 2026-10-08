import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPreviewMode } from "@/lib/preview-mode";

interface RegistrationExportRow {
  id: string;
  email: string;
  roles: string[] | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  mobile: string | null;
  suburb: string | null;
  interests: string[] | null;
  business_name: string | null;
  business_address: string | null;
  wants_window_sticker: boolean | null;
  details: Record<string, unknown> | null;
  consent_at: string | null;
  source: string | null;
  created_at: string;
  claimed_profile_id: string | null;
  claimed_at: string | null;
}

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // If the string contains double quotes, commas, or line breaks, wrap in quotes and escape quotes
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    str = `"${str.replace(/"/g, '""')}"`;
  } else {
    str = `"${str}"`;
  }
  return str;
}

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Please sign in again." }, { status: 401 });
    }

    let rows: RegistrationExportRow[] = [];

    if (isPreviewMode) {
      rows = [
        {
          id: "preview-1",
          email: "naledi@example.com",
          roles: ["resident", "founding_neighbour"],
          first_name: "Naledi",
          last_name: "Khumalo",
          full_name: "Naledi Khumalo",
          mobile: "+27 82 000 0000",
          suburb: "Linden",
          interests: ["events", "marketplace"],
          business_name: null,
          business_address: null,
          wants_window_sticker: true,
          details: { message: "Linden resident excited to join!" },
          consent_at: new Date().toISOString(),
          source: "website",
          created_at: new Date().toISOString(),
          claimed_profile_id: null,
          claimed_at: null,
        },
        {
          id: "preview-2",
          email: "corner@example.com",
          roles: ["business", "founding_business"],
          first_name: "Thabo",
          last_name: "Molefe",
          full_name: "Thabo Molefe",
          mobile: "+27 83 111 2222",
          suburb: "Linden",
          interests: ["business", "food"],
          business_name: "Corner Cafe Linden",
          business_address: "12 4th Avenue, Linden",
          wants_window_sticker: true,
          details: { message: "Corner bakery & coffee" },
          consent_at: new Date().toISOString(),
          source: "website",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          claimed_profile_id: "demo-claim",
          claimed_at: new Date().toISOString(),
        },
      ];
    } else {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("registrations")
        .select(
          "id, email, roles, first_name, last_name, full_name, mobile, suburb, interests, business_name, business_address, wants_window_sticker, details, consent_at, source, created_at, claimed_profile_id, claimed_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[export:registrations] Database error:", error);
        return NextResponse.json({ error: "Failed to fetch registrations for export" }, { status: 500 });
      }

      rows = (data as RegistrationExportRow[]) || [];
    }

    const headers = [
      "ID",
      "Full Name",
      "Email Address",
      "Mobile Number",
      "Primary Role",
      "All Assigned Roles",
      "Suburb",
      "Business Name",
      "Business Address",
      "Wants Window Sticker",
      "Interests",
      "Additional Info / Message",
      "Marketing Consent",
      "Registration Source",
      "Registered Date (UTC)",
      "Claimed Status",
    ];

    const csvLines = [headers.map(escapeCsvField).join(",")];

    for (const r of rows) {
      const name =
        r.full_name ||
        [r.first_name, r.last_name].filter(Boolean).join(" ") ||
        r.business_name ||
        r.email;

      const rolesArray = Array.isArray(r.roles) ? r.roles : [];
      const primaryRole = rolesArray.includes("founding_business")
        ? "Founding Business"
        : rolesArray.includes("founding_neighbour")
        ? "Founding Neighbour"
        : rolesArray.includes("partner_interest")
        ? "Partner Interest"
        : rolesArray[0] || "General Enquiry";

      const interestsStr = Array.isArray(r.interests) ? r.interests.join(", ") : "";

      let additionalInfo = "";
      if (r.details && typeof r.details === "object") {
        const d = r.details as Record<string, unknown>;
        if (typeof d.message === "string") additionalInfo = d.message;
        else if (typeof d.organisation === "string") additionalInfo = `Org: ${d.organisation}`;
        else additionalInfo = JSON.stringify(d);
      }

      const rowValues = [
        r.id,
        name,
        r.email,
        r.mobile || "",
        primaryRole,
        rolesArray.join(", "),
        r.suburb || "Linden",
        r.business_name || "",
        r.business_address || "",
        r.wants_window_sticker ? "Yes" : "No",
        interestsStr,
        additionalInfo,
        r.consent_at ? "Yes" : "No",
        r.source || "website",
        r.created_at ? new Date(r.created_at).toISOString().replace("T", " ").substring(0, 19) : "",
        r.claimed_at ? `Claimed (${new Date(r.claimed_at).toLocaleDateString()})` : "Unclaimed",
      ];

      csvLines.push(rowValues.map(escapeCsvField).join(","));
    }

    // Prepend UTF-8 Byte Order Mark (\uFEFF) so Excel opens UTF-8 text perfectly
    const csvContent = "\uFEFF" + csvLines.join("\r\n");
    const today = new Date().toISOString().split("T")[0];

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="hello-linden-registrations-${today}.csv"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: unknown) {
    console.error("[export:registrations] Error:", err);
    return NextResponse.json({ error: "Failed to generate Excel export file." }, { status: 500 });
  }
}
