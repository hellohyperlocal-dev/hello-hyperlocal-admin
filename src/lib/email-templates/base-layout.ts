interface BaseLayoutOptions {
  title: string;
  badge?: {
    text: string;
    variant?: "default" | "success" | "warning" | "danger";
  };
  contentHtml: string;
  previewText?: string;
}

export function renderBaseEmailLayout({
  title,
  badge,
  contentHtml,
  previewText,
}: BaseLayoutOptions): string {
  const badgeStyles: Record<string, string> = {
    default: "background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;",
    success: "background-color: #eaf8e5; color: #166534; border: 1px solid #bbf7d0;",
    warning: "background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a;",
    danger: "background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca;",
  };

  const currentBadgeStyle = badge ? badgeStyles[badge.variant || "default"] : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f6f8f5; }
    img { border: 0; outline: none; text-decoration: none; }
    a { color: #166534; text-decoration: underline; }
    a:hover { color: #14532d; }
  </style>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f6f8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
  ${
    previewText
      ? `<div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
          ${escapeHtml(previewText)}
        </div>`
      : ""
  }

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center">
        <!-- Main Card Wrapper (max 600px) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e9e2; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Accent Bar (Brand Spruce & Grass Green) -->
          <tr>
            <td style="background: linear-gradient(90deg, #1c472a 0%, #7ed957 100%); height: 6px; line-height: 6px; font-size: 6px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <!-- Star-13 Brand Icon + Wordmark -->
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <div style="width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #1c472a 0%, #2f6b40 100%); text-align: center; line-height: 34px;">
                            <span style="color: #7ed957; font-size: 18px; font-weight: 700;">★</span>
                          </div>
                        </td>
                        <td style="vertical-align: middle;">
                          <div style="font-size: 18px; font-weight: 800; color: #1c472a; line-height: 1.2; letter-spacing: -0.02em;">Hello Hyperlocal</div>
                          <div style="font-size: 11px; font-weight: 600; color: #7ed957; text-transform: uppercase; letter-spacing: 0.08em;">Hello Linden Community</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  ${
                    badge
                      ? `<td align="right" style="vertical-align: middle;">
                          <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 9999px; ${currentBadgeStyle}">
                            ${escapeHtml(badge.text)}
                          </span>
                        </td>`
                      : ""
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #334155;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #fcfdfb; border-top: 1px solid #f1f5f0; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #1c472a;">
                Hello Linden • Connecting neighbors, building local trust.
              </p>
              <p style="margin: 0 0 12px 0;">
                You are receiving this message regarding your account or community activity on Hello Linden.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © ${new Date().getFullYear()} Hello Hyperlocal Pty Ltd. Linden, Randburg, 2195.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderButton({
  label,
  url,
  variant = "primary",
}: {
  label: string;
  url: string;
  variant?: "primary" | "secondary";
}): string {
  const bg = variant === "primary" ? "#1c472a" : "#f1f5f9";
  const color = variant === "primary" ? "#ffffff" : "#1e293b";
  const border = variant === "primary" ? "1px solid #163d23" : "1px solid #cbd5e1";

  return `
    <table border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td align="center" style="border-radius: 8px; background-color: ${bg};">
          <a href="${escapeHtml(url)}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: ${color}; text-decoration: none; border-radius: 8px; border: ${border};">
            ${escapeHtml(label)} →
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function renderCodeBox(code: string, subtext?: string): string {
  return `
    <div style="margin: 24px 0; padding: 20px; background-color: #f8faf7; border: 1px dashed #7ed957; border-radius: 12px; text-align: center;">
      <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1c472a; font-family: monospace;">
        ${escapeHtml(code)}
      </div>
      ${
        subtext
          ? `<div style="margin-top: 8px; font-size: 12px; color: #64748b;">${escapeHtml(subtext)}</div>`
          : ""
      }
    </div>
  `;
}

export function renderCallout({
  text,
  variant = "info",
}: {
  text: string;
  variant?: "info" | "warning" | "success" | "danger";
}): string {
  const borders = {
    info: "#94a3b8",
    warning: "#f59e0b",
    success: "#22c55e",
    danger: "#ef4444",
  };
  const backgrounds = {
    info: "#f8fafc",
    warning: "#fffbeb",
    success: "#f0fdf4",
    danger: "#fef2f2",
  };
  const textColors = {
    info: "#334155",
    warning: "#92400e",
    success: "#166534",
    danger: "#991b1b",
  };

  return `
    <div style="margin: 18px 0; padding: 14px 18px; background-color: ${backgrounds[variant]}; border-left: 4px solid ${borders[variant]}; border-radius: 4px; font-size: 13px; line-height: 1.5; color: ${textColors[variant]};">
      ${escapeHtml(text)}
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
