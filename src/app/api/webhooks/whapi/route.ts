import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { summarizeWardPost, generateDedupHash } from "@/lib/ward-summarizer";

// Whapi Webhook Payload Types
interface WhapiMessage {
  id: string;
  chat_id: string; // e.g. "0029Vb71aiD3LdQbV5JCzy08@newsletter"
  from_name?: string;
  timestamp: number;
  type: "text" | "image" | "video" | "document";
  text?: {
    body?: string;
  };
  image?: {
    link?: string;
    caption?: string;
  };
  video?: {
    link?: string;
    caption?: string;
  };
}

interface WhapiWebhookPayload {
  messages?: WhapiMessage[];
  event?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Optional Webhook Secret Verification
    const authHeader = req.headers.get("authorization") || req.nextUrl.searchParams.get("token");
    const expectedSecret = process.env.WHAPI_WEBHOOK_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}` && authHeader !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json()) as WhapiWebhookPayload;
    const messages = payload.messages || [];

    if (!messages.length) {
      return NextResponse.json({ ok: true, message: "No messages to process" });
    }

    const supabase = createAdminClient();
    const results = [];

    for (const msg of messages) {
      // Extract raw text (or image/video caption)
      const rawText = msg.text?.body || msg.image?.caption || msg.video?.caption || "";
      const imageUrl = msg.image?.link || null;

      if (!rawText.trim()) {
        continue;
      }

      // Compute deduplication hash
      const dedupHash = generateDedupHash(rawText);

      // Check if this post has already been ingested
      const { data: existing } = await supabase
        .from("ward_updates")
        .select("id")
        .eq("dedup_hash", dedupHash)
        .maybeSingle();

      if (existing) {
        results.push({ id: existing.id, status: "duplicate_skipped" });
        continue;
      }

      // Generate AI summary for push notification while keeping 100% of rawText for the body
      const summaryResult = await summarizeWardPost(rawText);

      // Find or assign councillor ID for Ward 99 (Cllr Hendrik Bodenstein if exists)
      const { data: councillor } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "councillor")
        .ilike("full_name", "%Bodenstein%")
        .maybeSingle();

      // Insert into ward_updates
      const { data: inserted, error: insertError } = await supabase
        .from("ward_updates")
        .insert({
          title: summaryResult.title,
          category: summaryResult.category,
          ward: "Ward 99",
          body: rawText, // 100% of the raw, unedited councillor rant!
          summary: summaryResult.push_summary, // Compact 1-sentence synopsis for lock screen
          image_url: imageUrl,
          is_pinned: summaryResult.category === "water" || summaryResult.category === "load-shedding",
          is_auto_ingested: true,
          is_political: summaryResult.is_political,
          source_name: "Joburg Ward 99 WhatsApp",
          dedup_hash: dedupHash,
          councillor_id: councillor?.id || null,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("[WhapiWebhook] Failed to insert ward update:", insertError);
        continue;
      }

      // Dispatch Mobile Push Notification if applicable
      if (summaryResult.should_send_push && !summaryResult.is_political) {
        await dispatchExpoPushNotification(supabase, {
          ward: "Ward 99",
          title: `🚨 ${summaryResult.title}`,
          body: summaryResult.push_summary,
          updateId: inserted.id,
        });
      }

      results.push({ id: inserted.id, status: "ingested", category: summaryResult.category });
    }

    return NextResponse.json({ ok: true, processed: results });
  } catch (err: any) {
    console.error("[WhapiWebhook] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * Dispatch free background push notification via Expo Push API to residents of that ward
 */
async function dispatchExpoPushNotification(
  supabase: ReturnType<typeof createAdminClient>,
  alert: { ward: string; title: string; body: string; updateId: string }
) {
  try {
    const { data: users } = await supabase
      .from("profiles")
      .select("expo_push_token")
      .or(`ward.eq.${alert.ward},ward.eq.All`)
      .not("expo_push_token", "is", null);

    if (!users || users.length === 0) return;

    const messages = users.map((u: any) => ({
      to: u.expo_push_token,
      sound: "default",
      title: alert.title,
      body: alert.body,
      data: {
        screen: "WardUpdatesDetail",
        updateId: alert.updateId,
      },
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.error("[ExpoPush] Failed to send push notifications:", err);
  }
}
