import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { summarizeWardPost, generateDedupHash } from "@/lib/ward-summarizer";

/**
 * WAHA (WhatsApp HTTP API) Webhook Handler
 * Documentation: https://waha.devlike.pro/docs/how-to/webhooks/
 */
interface WahaMessagePayload {
  event: string; // "message" or "message.any"
  session: string;
  payload: {
    id: string;
    timestamp: number;
    from: string; // e.g. "0029Vb71aiD3LdQbV5JCzy08@newsletter"
    body?: string;
    hasMedia?: boolean;
    mediaUrl?: string;
    _data?: {
      caption?: string;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WahaMessagePayload;

    // WAHA sends different events: we only care about message events
    if (!body || !body.payload) {
      return NextResponse.json({ ok: true, message: "Ignored non-message payload" });
    }

    const { from, body: messageBody, mediaUrl, _data } = body.payload;

    // 1. Filter: Only process messages from newsletters / channels (@newsletter)
    if (!from || !from.includes("@newsletter")) {
      return NextResponse.json({ ok: true, message: "Ignored non-newsletter chat" });
    }

    // 2. Extract text (body or media caption)
    const rawText = (messageBody || _data?.caption || "").trim();
    if (!rawText) {
      return NextResponse.json({ ok: true, message: "No text content in post" });
    }

    // 3. Prevent duplicate ingestion
    const dedupHash = generateDedupHash(rawText);
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("ward_updates")
      .select("id")
      .eq("dedup_hash", dedupHash)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, message: "Duplicate post skipped", id: existing.id });
    }

    // 4. Summarize for mobile lock screen & classify (keeps 100% of raw text for body)
    const summaryResult = await summarizeWardPost(rawText);

    // 5. Look up sitting Ward 99 councillor for attribution (fallback to null/civic)
    const { data: councillor } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "councillor")
      .ilike("full_name", "%Bodenstein%")
      .maybeSingle();

    // 6. Insert into Supabase `ward_updates`
    const { data: inserted, error: insertError } = await supabase
      .from("ward_updates")
      .insert({
        title: summaryResult.title,
        category: summaryResult.category,
        ward: "Ward 99",
        body: rawText, // 100% authentic, unedited councillor rant!
        summary: summaryResult.push_summary, // 1-sentence lock-screen synopsis
        image_url: mediaUrl || null,
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
      console.error("[WahaWebhook] Error inserting ward update:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 7. Dispatch Expo Push Notification to residents for genuine municipal alerts
    if (summaryResult.should_send_push && !summaryResult.is_political) {
      await dispatchExpoPushNotification(supabase, {
        ward: "Ward 99",
        title: `🚨 ${summaryResult.title}`,
        body: summaryResult.push_summary,
        updateId: inserted.id,
      });
    }

    return NextResponse.json({
      ok: true,
      ingested: true,
      id: inserted.id,
      category: summaryResult.category,
      title: summaryResult.title,
    });
  } catch (err: any) {
    console.error("[WahaWebhook] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

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
    console.error("[ExpoPush] Error broadcasting notifications:", err);
  }
}
