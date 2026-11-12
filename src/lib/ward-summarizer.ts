import crypto from "crypto";

export interface WardSummarizerResult {
  category: "water" | "load-shedding" | "refuse" | "road-closure" | "safety" | "notice";
  title: string;
  push_summary: string;
  is_political: boolean;
  should_send_push: boolean;
}

/**
 * Fast rule-based + Gemini Flash fallback summarizer.
 * Preserves 100% of raw text for the dedicated ward feed,
 * but generates a punchy lock-screen title & 1-sentence summary for mobile push notifications.
 */
export async function summarizeWardPost(rawText: string): Promise<WardSummarizerResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // If Gemini API Key is available, use structured generation
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an automated alert processor for a South African hyperlocal neighbourhood app (Hello Linden, covering Ward 99 and Ward 87).
A ward councillor posted the following message on their WhatsApp broadcast channel.

Analyze the message and return ONLY a JSON object matching this schema:
{
  "category": "water" | "load-shedding" | "refuse" | "road-closure" | "safety" | "notice",
  "title": string, // Max 40 chars, clear and objective (e.g. "Urgent Water Supply Disruption", "Pikitup Collection Delayed")
  "push_summary": string, // Max 100 chars, concise 1-sentence synopsis for a mobile phone lock-screen notification
  "is_political": boolean, // true ONLY if this is party campaigning, election rallies, internal volunteer/party agent recruitment
  "should_send_push": boolean // true for genuine utility/municipal disruptions (water, power, refuse, emergency road closure). False for political rallying, generic greetings, or minor commentary.
}

Raw message:
"""${rawText}"""`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          const parsed = JSON.parse(candidate);
          return {
            category: parsed.category || "notice",
            title: parsed.title || "Ward 99 Update",
            push_summary: parsed.push_summary || parsed.title || "New update from Ward Councillor",
            is_political: Boolean(parsed.is_political),
            should_send_push: Boolean(parsed.should_send_push),
          };
        }
      }
    } catch (err) {
      console.error("[WardSummarizer] Gemini call failed, falling back to heuristic parser:", err);
    }
  }

  // Fallback heuristic extraction if Gemini is unreachable or no API key is provided
  return fallbackHeuristicParser(rawText);
}

function fallbackHeuristicParser(rawText: string): WardSummarizerResult {
  const upper = rawText.toUpperCase();
  const firstLine = rawText.split("\n")[0].replace(/[*_#]/g, "").trim().slice(0, 45);

  const isPolitical =
    upper.includes("ELECTION") ||
    upper.includes("PARTY AGENT") ||
    upper.includes("COUNTING AGENT") ||
    upper.includes("50% + 1") ||
    upper.includes("DA REGALIA") ||
    upper.includes("VOLUNTEER");

  let category: WardSummarizerResult["category"] = "notice";
  let title = firstLine || "Ward 99 Notice";
  let shouldSendPush = false;

  if (upper.includes("WATER") || upper.includes("RAND WATER") || upper.includes("BURST PIPE") || upper.includes("RESERVOIR")) {
    category = "water";
    title = firstLine.includes("WATER") ? firstLine : "Ward 99 Water Disruption";
    shouldSendPush = !isPolitical;
  } else if (upper.includes("PIKITUP") || upper.includes("REFUSE") || upper.includes("BIN")) {
    category = "refuse";
    title = firstLine.includes("PIKITUP") ? firstLine : "Pikitup Refuse Collection Update";
    shouldSendPush = !isPolitical;
  } else if (upper.includes("CITY POWER") || upper.includes("SUBSTATION") || upper.includes("FEEDER") || upper.includes("OUTAGE") || upper.includes("LOAD-SHEDDING")) {
    category = "load-shedding";
    title = firstLine.includes("POWER") ? firstLine : "Power Outage Alert";
    shouldSendPush = !isPolitical;
  } else if (upper.includes("POTHOLE") || upper.includes("TAR") || upper.includes("ROAD") || upper.includes("CLOSURE")) {
    category = "road-closure";
    title = firstLine.includes("ROAD") ? firstLine : "Road Maintenance / Closure";
    shouldSendPush = !isPolitical;
  } else if (upper.includes("SAPS") || upper.includes("CPF") || upper.includes("SECURITY") || upper.includes("CRIME")) {
    category = "safety";
    title = firstLine || "Public Safety Notice";
  }

  // Clean push summary: take first meaningful sentence under 100 chars
  const cleanBody = rawText.replace(/[*_#]/g, "").trim();
  const firstSentence = cleanBody.split("\n").filter(Boolean)[1] || cleanBody.split(".")[0];
  const pushSummary = (firstSentence || title).slice(0, 100);

  return {
    category,
    title,
    push_summary: pushSummary,
    is_political: isPolitical,
    should_send_push: shouldSendPush,
  };
}

export function generateDedupHash(text: string): string {
  // Normalize whitespace to prevent minor spacing changes from causing duplicates
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}
