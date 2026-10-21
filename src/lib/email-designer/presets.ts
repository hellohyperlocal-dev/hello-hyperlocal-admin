import {
  EmailDocument,
  EmailRow,
  EmailColumn,
  EmailBlock,
  BlockType,
  RowLayout,
} from "./types";

export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createDefaultBlock(type: BlockType): EmailBlock {
  const id = generateId("block");
  switch (type) {
    case "title":
      return {
        id,
        type: "title",
        content: {
          text: "Headline Title",
          level: "h1",
          align: "left",
          color: "#1C472A",
          fontSize: 26,
          lineHeight: 1.3,
          fontWeight: "bold",
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 16,
          paddingRight: 16,
        },
      };

    case "paragraph":
      return {
        id,
        type: "paragraph",
        content: {
          text: "Write your newsletter copy here. Share news, upcoming community announcements, and neighborhood highlights.",
          align: "left",
          color: "#374151",
          fontSize: 15,
          lineHeight: 1.6,
          fontWeight: "normal",
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
        },
      };

    case "list":
      return {
        id,
        type: "list",
        content: {
          items: [
            "Weekly farmers market this Saturday at 09:00",
            "Ward 99 community infrastructure progress update",
            "Local Linden artisan cafe feature",
          ],
          listType: "bullet",
          color: "#374151",
          fontSize: 14,
          lineHeight: 1.5,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
        },
      };

    case "image":
      return {
        id,
        type: "image",
        content: {
          url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
          alt: "Hello Linden Community",
          linkUrl: "https://hellolinden.co.za",
          widthPercent: 100,
          align: "center",
          borderRadius: 6,
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 16,
          paddingRight: 16,
        },
      };

    case "button":
      return {
        id,
        type: "button",
        content: {
          text: "Explore What's Happening",
          url: "https://hellolinden.co.za",
          backgroundColor: "#1C472A",
          textColor: "#ffffff",
          align: "center",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: "600",
          fullWidth: false,
          paddingVertical: 12,
          paddingHorizontal: 24,
          paddingTop: 14,
          paddingBottom: 14,
        },
      };

    case "divider":
      return {
        id,
        type: "divider",
        content: {
          height: 1,
          style: "solid",
          color: "#e5e7eb",
          widthPercent: 100,
          align: "center",
          paddingTop: 12,
          paddingBottom: 12,
        },
      };

    case "spacer":
      return {
        id,
        type: "spacer",
        content: {
          height: 24,
        },
      };

    case "social":
      return {
        id,
        type: "social",
        content: {
          networks: [
            { network: "website", url: "https://hellolinden.co.za" },
            { network: "facebook", url: "https://facebook.com/hellolinden" },
            { network: "instagram", url: "https://instagram.com/hellolinden" },
            { network: "whatsapp", url: "https://chat.whatsapp.com" },
          ],
          align: "center",
          iconSize: 28,
          iconStyle: "color",
          spacing: 12,
          paddingTop: 16,
          paddingBottom: 16,
        },
      };

    case "html":
      return {
        id,
        type: "html",
        content: {
          code: `<div style="padding: 12px; background: #e2f6d5; border-radius: 6px; color: #1c472a; font-weight: 500; font-size: 13px; text-align: center;">💡 Hyperlocal Tip: Support local Linden small businesses!</div>`,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
        },
      };

    case "video":
      return {
        id,
        type: "video",
        content: {
          thumbnailUrl: "",
          videoUrl: "https://youtube.com",
          title: "Watch: A Walk Through Linden",
          align: "center",
          paddingTop: 12,
          paddingBottom: 12,
        },
      };

    case "icons":
      return {
        id,
        type: "icons",
        content: {
          networks: [
            { network: "website", url: "https://hellolinden.co.za" },
            { network: "instagram", url: "https://instagram.com/hellolinden" },
          ],
          align: "center",
          iconSize: 24,
          iconStyle: "color",
          spacing: 16,
          paddingTop: 12,
          paddingBottom: 12,
        },
      };

    case "menu":
      return {
        id,
        type: "menu",
        content: {
          items: [
            { label: "Community", url: "https://hellolinden.co.za" },
            { label: "Local Businesses", url: "https://hellolinden.co.za/listings" },
            { label: "Ward Updates", url: "https://hellolinden.co.za/ward-updates" },
            { label: "Contact", url: "https://hellolinden.co.za/contact" },
          ],
          align: "center",
          fontSize: 13,
          color: "#1C472A",
          paddingTop: 12,
          paddingBottom: 12,
        },
      };

    case "table":
      return {
        id,
        type: "table",
        content: {
          rows: [
            ["Event", "Date", "Location"],
            ["Linden Market Day", "Saturday 09:00", "Linden Park"],
            ["Ward Councillor Q&A", "Tuesday 18:30", "Community Hall"],
            ["Pothole Repair Drive", "Thursday 08:00", "4th Avenue"],
          ],
          hasHeader: true,
          borderColor: "#e5e7eb",
          textColor: "#374151",
          paddingTop: 12,
          paddingBottom: 12,
        },
      };

    default:
      return {
        id,
        type: "paragraph",
        content: {
          text: "Content block",
          align: "left",
          color: "#374151",
          fontSize: 15,
          lineHeight: 1.6,
          fontWeight: "normal",
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
        },
      };
  }
}

export function createDefaultRow(layout: RowLayout = "1-col"): EmailRow {
  const rowId = generateId("row");
  const rowSettings = {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 0,
    paddingRight: 0,
  };

  const colSettings = {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
    verticalAlign: "top" as const,
  };

  switch (layout) {
    case "1-col":
      return {
        id: rowId,
        layout,
        settings: rowSettings,
        columns: [
          {
            id: generateId("col"),
            widthPercent: 100,
            settings: colSettings,
            blocks: [],
          },
        ],
      };

    case "2-col-equal":
      return {
        id: rowId,
        layout,
        settings: rowSettings,
        columns: [
          {
            id: generateId("col"),
            widthPercent: 50,
            settings: colSettings,
            blocks: [],
          },
          {
            id: generateId("col"),
            widthPercent: 50,
            settings: colSettings,
            blocks: [],
          },
        ],
      };

    case "2-col-33-67":
      return {
        id: rowId,
        layout,
        settings: rowSettings,
        columns: [
          {
            id: generateId("col"),
            widthPercent: 33,
            settings: colSettings,
            blocks: [],
          },
          {
            id: generateId("col"),
            widthPercent: 67,
            settings: colSettings,
            blocks: [],
          },
        ],
      };

    case "2-col-67-33":
      return {
        id: rowId,
        layout,
        settings: rowSettings,
        columns: [
          {
            id: generateId("col"),
            widthPercent: 67,
            settings: colSettings,
            blocks: [],
          },
          {
            id: generateId("col"),
            widthPercent: 33,
            settings: colSettings,
            blocks: [],
          },
        ],
      };

    case "2-col-25-75":
      return {
        id: rowId,
        layout,
        settings: rowSettings,
        columns: [
          {
            id: generateId("col"),
            widthPercent: 25,
            settings: colSettings,
            blocks: [],
          },
          {
            id: generateId("col"),
            widthPercent: 75,
            settings: colSettings,
            blocks: [],
          },
        ],
      };

    case "2-col-75-25":
      return {
        id: rowId,
        layout,
        settings: rowSettings,
        columns: [
          {
            id: generateId("col"),
            widthPercent: 75,
            settings: colSettings,
            blocks: [],
          },
          {
            id: generateId("col"),
            widthPercent: 25,
            settings: colSettings,
            blocks: [],
          },
        ],
      };

    case "3-col-equal":
      return {
        id: rowId,
        layout,
        settings: rowSettings,
        columns: [
          {
            id: generateId("col"),
            widthPercent: 33,
            settings: colSettings,
            blocks: [],
          },
          {
            id: generateId("col"),
            widthPercent: 34,
            settings: colSettings,
            blocks: [],
          },
          {
            id: generateId("col"),
            widthPercent: 33,
            settings: colSettings,
            blocks: [],
          },
        ],
      };

    case "4-col-equal":
      return {
        id: rowId,
        layout,
        settings: rowSettings,
        columns: [
          { id: generateId("col"), widthPercent: 25, settings: colSettings, blocks: [] },
          { id: generateId("col"), widthPercent: 25, settings: colSettings, blocks: [] },
          { id: generateId("col"), widthPercent: 25, settings: colSettings, blocks: [] },
          { id: generateId("col"), widthPercent: 25, settings: colSettings, blocks: [] },
        ],
      };
  }
}

export const STARTER_TEMPLATES: EmailDocument[] = [
  {
    id: "starter-blank",
    name: "Blank Canvas",
    description: "Start completely fresh with an empty canvas and build your email row-by-row.",
    category: "blank",
    subject: "Hello Linden Community Update",
    preheader: "Stay connected with what is happening in Linden.",
    settings: {
      contentWidth: 600,
      contentAlign: "center",
      backgroundColor: "#f4f4f7",
      contentBackgroundColor: "#ffffff",
      defaultFont: "Arial, Helvetica, sans-serif",
      linkColor: "#1C472A",
      language: "en",
    },
    rows: [
      createDefaultRow("1-col"),
    ],
  },
  {
    id: "starter-community-newsletter",
    name: "Linden Community Newsletter",
    description: "Curated weekly community newsletter featuring a hero story, updates, and CTA button.",
    category: "newsletter",
    subject: "Your Weekly Linden Community Newsletter 🌳",
    preheader: "Here's what happened in Linden this week.",
    settings: {
      contentWidth: 600,
      contentAlign: "center",
      backgroundColor: "#f4f4f7",
      contentBackgroundColor: "#ffffff",
      defaultFont: "Arial, Helvetica, sans-serif",
      linkColor: "#1C472A",
      language: "en",
    },
    rows: [
      {
        id: "row-header",
        layout: "1-col",
        settings: {
          backgroundColor: "#1C472A",
          contentBackgroundColor: "#1C472A",
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 0,
          paddingRight: 0,
        },
        columns: [
          {
            id: "col-header",
            widthPercent: 100,
            settings: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, verticalAlign: "middle" },
            blocks: [
              {
                id: "b-header-title",
                type: "title",
                content: {
                  text: "Hello Linden",
                  level: "h1",
                  align: "center",
                  color: "#ffffff",
                  fontSize: 24,
                  lineHeight: 1.2,
                  fontWeight: "bold",
                  paddingTop: 8,
                  paddingBottom: 4,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
              {
                id: "b-header-sub",
                type: "paragraph",
                content: {
                  text: "Hyperlocal Community News & Updates",
                  align: "center",
                  color: "#7ED957",
                  fontSize: 13,
                  lineHeight: 1.4,
                  fontWeight: "500",
                  paddingTop: 0,
                  paddingBottom: 8,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
            ],
          },
        ],
      },
      {
        id: "row-hero",
        layout: "1-col",
        settings: { paddingTop: 16, paddingBottom: 8, paddingLeft: 0, paddingRight: 0 },
        columns: [
          {
            id: "col-hero",
            widthPercent: 100,
            settings: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, verticalAlign: "top" },
            blocks: [
              {
                id: "b-hero-img",
                type: "image",
                content: {
                  url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
                  alt: "Linden Park & Community",
                  linkUrl: "https://hellolinden.co.za",
                  widthPercent: 100,
                  align: "center",
                  borderRadius: 6,
                  paddingTop: 4,
                  paddingBottom: 12,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
              {
                id: "b-hero-title",
                type: "title",
                content: {
                  text: "Linden Community Market Day Returns!",
                  level: "h2",
                  align: "left",
                  color: "#1C472A",
                  fontSize: 22,
                  lineHeight: 1.3,
                  fontWeight: "bold",
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
              {
                id: "b-hero-text",
                type: "paragraph",
                content: {
                  text: "Join your neighbors this Saturday for fresh local produce, artisan bakery goods, and family-friendly activities. Support our local vendors and celebrate what makes Linden a wonderful neighborhood.",
                  align: "left",
                  color: "#4b5563",
                  fontSize: 15,
                  lineHeight: 1.6,
                  fontWeight: "normal",
                  paddingTop: 4,
                  paddingBottom: 12,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
              {
                id: "b-hero-cta",
                type: "button",
                content: {
                  text: "View Full Schedule & Vendors",
                  url: "https://hellolinden.co.za",
                  backgroundColor: "#1C472A",
                  textColor: "#ffffff",
                  align: "center",
                  borderRadius: 6,
                  fontSize: 15,
                  fontWeight: "600",
                  fullWidth: false,
                  paddingVertical: 12,
                  paddingHorizontal: 28,
                  paddingTop: 12,
                  paddingBottom: 16,
                },
              },
            ],
          },
        ],
      },
      {
        id: "row-divider",
        layout: "1-col",
        settings: { paddingTop: 4, paddingBottom: 4, paddingLeft: 0, paddingRight: 0 },
        columns: [
          {
            id: "col-divider",
            widthPercent: 100,
            settings: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, verticalAlign: "top" },
            blocks: [
              {
                id: "b-div-1",
                type: "divider",
                content: {
                  height: 1,
                  style: "solid",
                  color: "#e5e7eb",
                  widthPercent: 100,
                  align: "center",
                  paddingTop: 8,
                  paddingBottom: 8,
                },
              },
            ],
          },
        ],
      },
      {
        id: "row-events",
        layout: "1-col",
        settings: { paddingTop: 8, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
        columns: [
          {
            id: "col-events",
            widthPercent: 100,
            settings: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, verticalAlign: "top" },
            blocks: [
              {
                id: "b-events-title",
                type: "title",
                content: {
                  text: "Key Dates This Month",
                  level: "h3",
                  align: "left",
                  color: "#1C472A",
                  fontSize: 18,
                  lineHeight: 1.3,
                  fontWeight: "600",
                  paddingTop: 8,
                  paddingBottom: 6,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
              {
                id: "b-events-list",
                type: "list",
                content: {
                  items: [
                    "Saturday 09:00 — Linden Market in the Park",
                    "Tuesday 18:00 — Ward 99 Infrastructure Briefing",
                    "Next Friday — Neighborhood Tree Planting Drive",
                  ],
                  listType: "bullet",
                  color: "#374151",
                  fontSize: 14,
                  lineHeight: 1.6,
                  paddingTop: 4,
                  paddingBottom: 8,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
            ],
          },
        ],
      },
      {
        id: "row-footer",
        layout: "1-col",
        settings: {
          backgroundColor: "#f9fafb",
          contentBackgroundColor: "#f9fafb",
          paddingTop: 24,
          paddingBottom: 24,
          paddingLeft: 0,
          paddingRight: 0,
        },
        columns: [
          {
            id: "col-footer",
            widthPercent: 100,
            settings: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, verticalAlign: "top" },
            blocks: [
              {
                id: "b-footer-social",
                type: "social",
                content: {
                  networks: [
                    { network: "website", url: "https://hellolinden.co.za" },
                    { network: "facebook", url: "https://facebook.com/hellolinden" },
                    { network: "instagram", url: "https://instagram.com/hellolinden" },
                  ],
                  align: "center",
                  iconSize: 26,
                  iconStyle: "color",
                  spacing: 12,
                  paddingTop: 4,
                  paddingBottom: 12,
                },
              },
              {
                id: "b-footer-text",
                type: "paragraph",
                content: {
                  text: "You are receiving this email because you are a registered resident or business in Hello Linden.\nHello Hyperlocal • Linden, Johannesburg, South Africa",
                  align: "center",
                  color: "#9ca3af",
                  fontSize: 12,
                  lineHeight: 1.5,
                  fontWeight: "normal",
                  paddingTop: 4,
                  paddingBottom: 4,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "starter-business-spotlight",
    name: "Linden Business Spotlight",
    description: "Showcase a local business, special offers, opening hours, and contact information.",
    category: "business",
    subject: "Local Business Spotlight: Meet Linden's Favorite Artisans ⭐",
    preheader: "Support local business right here in our neighborhood.",
    settings: {
      contentWidth: 600,
      contentAlign: "center",
      backgroundColor: "#f4f4f7",
      contentBackgroundColor: "#ffffff",
      defaultFont: "Arial, Helvetica, sans-serif",
      linkColor: "#1C472A",
      language: "en",
    },
    rows: [
      {
        id: "row-biz-head",
        layout: "1-col",
        settings: {
          backgroundColor: "#1C472A",
          contentBackgroundColor: "#1C472A",
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 0,
          paddingRight: 0,
        },
        columns: [
          {
            id: "col-biz-head",
            widthPercent: 100,
            settings: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, verticalAlign: "middle" },
            blocks: [
              {
                id: "b-biz-head",
                type: "title",
                content: {
                  text: "LINDEN BUSINESS SPOTLIGHT",
                  level: "h1",
                  align: "center",
                  color: "#ffffff",
                  fontSize: 20,
                  lineHeight: 1.2,
                  fontWeight: "bold",
                  paddingTop: 6,
                  paddingBottom: 4,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
            ],
          },
        ],
      },
      {
        id: "row-biz-body",
        layout: "1-col",
        settings: { paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
        columns: [
          {
            id: "col-biz-body",
            widthPercent: 100,
            settings: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, verticalAlign: "top" },
            blocks: [
              {
                id: "b-biz-img",
                type: "image",
                content: {
                  url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
                  alt: "Local Linden Cafe",
                  linkUrl: "https://hellolinden.co.za/listings",
                  widthPercent: 100,
                  align: "center",
                  borderRadius: 6,
                  paddingTop: 4,
                  paddingBottom: 12,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
              {
                id: "b-biz-title",
                type: "title",
                content: {
                  text: "The Linden Roastery & Bakery",
                  level: "h2",
                  align: "left",
                  color: "#1C472A",
                  fontSize: 22,
                  lineHeight: 1.3,
                  fontWeight: "bold",
                  paddingTop: 6,
                  paddingBottom: 6,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
              {
                id: "b-biz-desc",
                type: "paragraph",
                content: {
                  text: "Discover freshly roasted specialty coffee and artisan sourdough pastries baked daily in the heart of 4th Avenue. Hello Linden app users get 10% off when presenting this email!",
                  align: "left",
                  color: "#4b5563",
                  fontSize: 15,
                  lineHeight: 1.6,
                  fontWeight: "normal",
                  paddingTop: 4,
                  paddingBottom: 12,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
              {
                id: "b-biz-btn",
                type: "button",
                content: {
                  text: "View Business Profile & Directions",
                  url: "https://hellolinden.co.za/listings",
                  backgroundColor: "#7ED957",
                  textColor: "#0E0F0C",
                  align: "center",
                  borderRadius: 6,
                  fontSize: 15,
                  fontWeight: "bold",
                  fullWidth: false,
                  paddingVertical: 12,
                  paddingHorizontal: 28,
                  paddingTop: 12,
                  paddingBottom: 12,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "starter-ward-notice",
    name: "Ward & Municipal Notice",
    description: "Official resident briefings, municipal infrastructure updates, and councillor contacts.",
    category: "notice",
    subject: "Ward 99 Resident Briefing & Service Notice 📢",
    preheader: "Important municipal updates and community briefing details for Linden.",
    settings: {
      contentWidth: 600,
      contentAlign: "center",
      backgroundColor: "#f4f4f7",
      contentBackgroundColor: "#ffffff",
      defaultFont: "Arial, Helvetica, sans-serif",
      linkColor: "#1C472A",
      language: "en",
    },
    rows: [
      {
        id: "row-notice-head",
        layout: "1-col",
        settings: {
          backgroundColor: "#1C472A",
          contentBackgroundColor: "#1C472A",
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 0,
          paddingRight: 0,
        },
        columns: [
          {
            id: "col-notice-head",
            widthPercent: 100,
            settings: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, verticalAlign: "middle" },
            blocks: [
              {
                id: "b-notice-head",
                type: "title",
                content: {
                  text: "WARD 99 COMMUNITY BRIEFING",
                  level: "h1",
                  align: "center",
                  color: "#ffffff",
                  fontSize: 20,
                  lineHeight: 1.2,
                  fontWeight: "bold",
                  paddingTop: 6,
                  paddingBottom: 4,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
            ],
          },
        ],
      },
      {
        id: "row-notice-body",
        layout: "1-col",
        settings: { paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0 },
        columns: [
          {
            id: "col-notice-body",
            widthPercent: 100,
            settings: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, verticalAlign: "top" },
            blocks: [
              {
                id: "b-notice-title",
                type: "title",
                content: {
                  text: "Scheduled Power & Water Maintenance Notice",
                  level: "h2",
                  align: "left",
                  color: "#1C472A",
                  fontSize: 20,
                  lineHeight: 1.3,
                  fontWeight: "bold",
                  paddingTop: 6,
                  paddingBottom: 6,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
              {
                id: "b-notice-p",
                type: "paragraph",
                content: {
                  text: "Please take note of upcoming municipal infrastructure maintenance scheduled for next Tuesday between 08:00 and 16:00 affecting 3rd and 4th Avenue. City Power and Johannesburg Water teams will be on site.",
                  align: "left",
                  color: "#4b5563",
                  fontSize: 15,
                  lineHeight: 1.6,
                  fontWeight: "normal",
                  paddingTop: 4,
                  paddingBottom: 12,
                  paddingLeft: 16,
                  paddingRight: 16,
                },
              },
              {
                id: "b-notice-btn",
                type: "button",
                content: {
                  text: "View Full Service Schedule",
                  url: "https://hellolinden.co.za/ward-updates",
                  backgroundColor: "#1C472A",
                  textColor: "#ffffff",
                  align: "center",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: "600",
                  fullWidth: false,
                  paddingVertical: 10,
                  paddingHorizontal: 24,
                  paddingTop: 10,
                  paddingBottom: 12,
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
