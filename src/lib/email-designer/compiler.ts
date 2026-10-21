import {
  EmailDocument,
  EmailRow,
  EmailColumn,
  EmailBlock,
  TitleBlockContent,
  ParagraphBlockContent,
  ListBlockContent,
  ImageBlockContent,
  ButtonBlockContent,
  DividerBlockContent,
  SpacerBlockContent,
  SocialBlockContent,
  HtmlBlockContent,
  VideoBlockContent,
  MenuBlockContent,
  TableBlockContent,
} from "./types";

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderBlock(block: EmailBlock, defaultFont: string): string {
  switch (block.type) {
    case "title": {
      const c = block.content as TitleBlockContent;
      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="${c.align || "left"}" style="padding: ${c.paddingTop ?? 10}px ${c.paddingRight ?? 15}px ${c.paddingBottom ?? 10}px ${c.paddingLeft ?? 15}px; font-family: ${defaultFont};">
              <h1 style="margin: 0; font-size: ${c.fontSize || 24}px; line-height: ${c.lineHeight || 1.3}; font-weight: ${c.fontWeight || "bold"}; color: ${c.color || "#1C472A"}; text-align: ${c.align || "left"};">
                ${escapeHtml(c.text || "")}
              </h1>
            </td>
          </tr>
        </table>
      `;
    }

    case "paragraph": {
      const c = block.content as ParagraphBlockContent;
      const formatted = (c.text || "")
        .split("\n")
        .map((p) => escapeHtml(p))
        .join("<br />");
      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="${c.align || "left"}" style="padding: ${c.paddingTop ?? 8}px ${c.paddingRight ?? 15}px ${c.paddingBottom ?? 8}px ${c.paddingLeft ?? 15}px; font-family: ${defaultFont};">
              <p style="margin: 0; font-size: ${c.fontSize || 15}px; line-height: ${c.lineHeight || 1.6}; font-weight: ${c.fontWeight || "normal"}; color: ${c.color || "#374151"}; text-align: ${c.align || "left"};">
                ${formatted}
              </p>
            </td>
          </tr>
        </table>
      `;
    }

    case "list": {
      const c = block.content as ListBlockContent;
      const tag = c.listType === "numbered" ? "ol" : "ul";
      const itemsHtml = (c.items || [])
        .map(
          (item) =>
            `<li style="margin-bottom: 6px; font-size: ${c.fontSize || 15}px; line-height: ${c.lineHeight || 1.5}; color: ${c.color || "#374151"};">${escapeHtml(item)}</li>`
        )
        .join("");
      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: ${c.paddingTop ?? 8}px ${c.paddingRight ?? 15}px ${c.paddingBottom ?? 8}px ${c.paddingLeft ?? 15}px; font-family: ${defaultFont};">
              <${tag} style="margin: 0; padding-left: 24px;">
                ${itemsHtml}
              </${tag}>
            </td>
          </tr>
        </table>
      `;
    }

    case "image": {
      const c = block.content as ImageBlockContent;
      if (!c.url) {
        return `
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="${c.align || "center"}" style="padding: ${c.paddingTop ?? 10}px ${c.paddingRight ?? 15}px ${c.paddingBottom ?? 10}px ${c.paddingLeft ?? 15}px;">
                <div style="background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; padding: 32px 16px; text-align: center; color: #6b7280; font-family: ${defaultFont}; font-size: 13px;">
                  Image placeholder
                </div>
              </td>
            </tr>
          </table>
        `;
      }
      const imgTag = `<img src="${c.url}" alt="${escapeHtml(c.alt || "Email Image")}" border="0" style="display: block; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; max-width: 100%; width: ${c.widthPercent || 100}%; border-radius: ${c.borderRadius || 0}px; margin: ${c.align === "center" ? "0 auto" : c.align === "right" ? "0 0 0 auto" : "0"};" />`;
      const linkedImg = c.linkUrl ? `<a href="${c.linkUrl}" target="_blank" style="text-decoration: none;">${imgTag}</a>` : imgTag;

      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="${c.align || "center"}" style="padding: ${c.paddingTop ?? 10}px ${c.paddingRight ?? 15}px ${c.paddingBottom ?? 10}px ${c.paddingLeft ?? 15}px;">
              ${linkedImg}
            </td>
          </tr>
        </table>
      `;
    }

    case "button": {
      const c = block.content as ButtonBlockContent;
      const btnBg = c.backgroundColor || "#1C472A";
      const btnColor = c.textColor || "#ffffff";
      const btnRadius = c.borderRadius ?? 6;
      const btnPadV = c.paddingVertical ?? 12;
      const btnPadH = c.paddingHorizontal ?? 24;
      const btnText = escapeHtml(c.text || "Click Here");
      const btnUrl = c.url || "#";

      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="${c.align || "center"}" style="padding: ${c.paddingTop ?? 12}px 15px ${c.paddingBottom ?? 12}px 15px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${btnUrl}" style="height:${btnPadV * 2 + (c.fontSize || 16)}px;v-text-anchor:middle;width:${c.fullWidth ? "100%" : "220px"};" arcsize="${Math.round((btnRadius / 30) * 100)}%" stroke="f" fillcolor="${btnBg}">
                <w:anchorlock/>
                <center style="color:${btnColor};font-family:${defaultFont};font-size:${c.fontSize || 16}px;font-weight:${c.fontWeight || "bold"};">${btnText}</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="${c.fullWidth ? "width: 100%;" : ""}">
                <tr>
                  <td align="center" bgcolor="${btnBg}" style="border-radius: ${btnRadius}px; background-color: ${btnBg};">
                    <a href="${btnUrl}" target="_blank" style="display: inline-block; padding: ${btnPadV}px ${btnPadH}px; font-family: ${defaultFont}; font-size: ${c.fontSize || 15}px; font-weight: ${c.fontWeight || "600"}; color: ${btnColor}; text-decoration: none; border-radius: ${btnRadius}px; text-align: center; ${c.fullWidth ? "display: block;" : ""}">
                      ${btnText}
                    </a>
                  </td>
                </tr>
              </table>
              <!--<![endif]-->
            </td>
          </tr>
        </table>
      `;
    }

    case "divider": {
      const c = block.content as DividerBlockContent;
      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="${c.align || "center"}" style="padding: ${c.paddingTop ?? 12}px 15px ${c.paddingBottom ?? 12}px 15px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${c.widthPercent || 100}%" style="border-top: ${c.height || 1}px ${c.style || "solid"} ${c.color || "#e5e7eb"}; margin: ${c.align === "center" ? "0 auto" : c.align === "right" ? "0 0 0 auto" : "0"};">
                <tr><td height="1" style="font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    }

    case "spacer": {
      const c = block.content as SpacerBlockContent;
      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td height="${c.height || 24}" style="height: ${c.height || 24}px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          </tr>
        </table>
      `;
    }

    case "social": {
      const c = block.content as SocialBlockContent;
      const networks = c.networks || [];
      const iconSize = c.iconSize || 24;
      const spacing = c.spacing || 12;

      const networkIcons: Record<string, { label: string; bg: string; iconText: string }> = {
        facebook: { label: "Facebook", bg: "#1877F2", iconText: "f" },
        instagram: { label: "Instagram", bg: "#E4405F", iconText: "ig" },
        x: { label: "X", bg: "#000000", iconText: "X" },
        whatsapp: { label: "WhatsApp", bg: "#25D366", iconText: "wa" },
        website: { label: "Website", bg: "#1C472A", iconText: "web" },
        linkedin: { label: "LinkedIn", bg: "#0A66C2", iconText: "in" },
      };

      const iconsHtml = networks
        .map((net) => {
          const info = networkIcons[net.network] || { label: net.network, bg: "#1C472A", iconText: "•" };
          return `
            <td style="padding: 0 ${spacing / 2}px;">
              <a href="${net.url || "#"}" target="_blank" style="text-decoration: none; display: inline-block;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-radius: 50%; background-color: ${info.bg}; width: ${iconSize}px; height: ${iconSize}px;">
                  <tr>
                    <td align="center" valign="middle" style="color: #ffffff; font-family: ${defaultFont}; font-size: ${Math.round(iconSize * 0.45)}px; font-weight: bold; line-height: 1;">
                      ${info.iconText}
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          `;
        })
        .join("");

      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="${c.align || "center"}" style="padding: ${c.paddingTop ?? 10}px 15px ${c.paddingBottom ?? 10}px 15px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  ${iconsHtml}
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    }

    case "html": {
      const c = block.content as HtmlBlockContent;
      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: ${c.paddingTop ?? 10}px ${c.paddingRight ?? 15}px ${c.paddingBottom ?? 10}px ${c.paddingLeft ?? 15}px; font-family: ${defaultFont};">
              ${c.code || ""}
            </td>
          </tr>
        </table>
      `;
    }

    case "video": {
      const c = block.content as VideoBlockContent;
      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="${c.align || "center"}" style="padding: ${c.paddingTop ?? 10}px 15px ${c.paddingBottom ?? 10}px 15px;">
              <a href="${c.videoUrl || "#"}" target="_blank" style="text-decoration: none; display: inline-block; position: relative;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 50%; width: 48px; height: 48px;">
                        <tr>
                          <td align="center" valign="middle" style="color: #1C472A; font-size: 20px; line-height: 1; padding-left: 3px;">
                            ▶
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 12px 0 0; color: #ffffff; font-family: ${defaultFont}; font-size: 14px; font-weight: bold;">
                        ${escapeHtml(c.title || "Watch Video")}
                      </p>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
        </table>
      `;
    }

    case "menu": {
      const c = block.content as MenuBlockContent;
      const linksHtml = (c.items || [])
        .map(
          (item) =>
            `<td style="padding: 0 12px;"><a href="${item.url || "#"}" target="_blank" style="font-family: ${defaultFont}; font-size: ${c.fontSize || 14}px; color: ${c.color || "#1C472A"}; text-decoration: none; font-weight: 500;">${escapeHtml(item.label)}</a></td>`
        )
        .join("");
      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="${c.align || "center"}" style="padding: ${c.paddingTop ?? 12}px 15px ${c.paddingBottom ?? 12}px 15px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  ${linksHtml}
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    }

    case "table": {
      const c = block.content as TableBlockContent;
      const rows = c.rows || [["Item", "Details"]];
      const tableRows = rows
        .map((row, rIdx) => {
          const isHeader = rIdx === 0 && c.hasHeader;
          const cellTag = isHeader ? "th" : "td";
          const cells = row
            .map(
              (cell) =>
                `<${cellTag} style="padding: 8px 12px; border: 1px solid ${c.borderColor || "#e5e7eb"}; font-family: ${defaultFont}; font-size: 14px; color: ${c.textColor || "#374151"}; text-align: left; ${isHeader ? "background-color: #f9fafb; font-weight: bold;" : ""}">${escapeHtml(cell)}</${cellTag}>`
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");

      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: ${c.paddingTop ?? 10}px 15px ${c.paddingBottom ?? 10}px 15px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid ${c.borderColor || "#e5e7eb"};">
                ${tableRows}
              </table>
            </td>
          </tr>
        </table>
      `;
    }

    default:
      return "";
  }
}

function renderColumn(col: EmailColumn, defaultFont: string): string {
  const blocksHtml = col.blocks.map((b) => renderBlock(b, defaultFont)).join("");
  const s = col.settings || { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, verticalAlign: "top" };
  const bgStyle = s.backgroundColor ? `background-color: ${s.backgroundColor};` : "";

  return `
    <td class="col-stack" width="${col.widthPercent}%" valign="${s.verticalAlign || "top"}" style="width: ${col.widthPercent}%; ${bgStyle} padding: ${s.paddingTop || 0}px ${s.paddingRight || 0}px ${s.paddingBottom || 0}px ${s.paddingLeft || 0}px;">
      ${blocksHtml || `&nbsp;`}
    </td>
  `;
}

function renderRow(row: EmailRow, contentWidth: number, defaultFont: string): string {
  const rowSettings = row.settings || { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 };
  const colsHtml = row.columns.map((col) => renderColumn(col, defaultFont)).join("");
  const rowBg = rowSettings.backgroundColor ? `background-color: ${rowSettings.backgroundColor};` : "";
  const contentBg = rowSettings.contentBackgroundColor ? `background-color: ${rowSettings.contentBackgroundColor};` : "";

  return `
    <!-- ROW START -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="${rowBg}">
      <tr>
        <td align="center" style="padding: ${rowSettings.paddingTop || 0}px ${rowSettings.paddingRight || 0}px ${rowSettings.paddingBottom || 0}px ${rowSettings.paddingLeft || 0}px;">
          <!--[if mso]>
          <table role="presentation" width="${contentWidth}" border="0" cellpadding="0" cellspacing="0" align="center">
            <tr>
              <td style="${contentBg}">
          <![endif]-->
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="container-table" style="max-width: ${contentWidth}px; margin: 0 auto; ${contentBg}">
            <tr>
              ${colsHtml}
            </tr>
          </table>
          <!--[if mso]>
              </td>
            </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
    <!-- ROW END -->
  `;
}

export function compileEmailDocumentToHtml(doc: EmailDocument): string {
  const settings = doc.settings || {
    contentWidth: 600,
    contentAlign: "center",
    backgroundColor: "#f4f4f7",
    contentBackgroundColor: "#ffffff",
    defaultFont: "Arial, Helvetica, sans-serif",
    linkColor: "#1C472A",
    language: "en",
  };

  const font = settings.defaultFont || "Arial, Helvetica, sans-serif";
  const rowsHtml = doc.rows.map((row) => renderRow(row, settings.contentWidth, font)).join("");

  const preheaderHtml = doc.preheader
    ? `
      <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
        ${escapeHtml(doc.preheader)}
        ${"&nbsp;&zwnj;".repeat(40)}
      </div>
    `
    : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${settings.language || "en"}" xml:lang="${settings.language || "en"}">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <!--<![endif]-->
  <title>${escapeHtml(doc.subject || doc.name || "Email")}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${settings.backgroundColor}; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    @media only screen and (max-width: 620px) {
      .container-table { width: 100% !important; max-width: 100% !important; }
      .col-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }
      .mobile-center { text-align: center !important; }
    }
  </style>
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${settings.backgroundColor}; font-family: ${font}; color: #374151;">
  ${preheaderHtml}
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${settings.backgroundColor}">
    <tr>
      <td align="${settings.contentAlign || "center"}" valign="top" style="padding: 24px 8px;">
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="container-table" style="max-width: ${settings.contentWidth}px; margin: 0 auto; background-color: ${settings.contentBackgroundColor}; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td valign="top">
              ${rowsHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
