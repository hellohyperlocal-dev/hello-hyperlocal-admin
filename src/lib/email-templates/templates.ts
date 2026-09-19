import { EmailTemplateDefinition } from "./types";
import { renderBaseEmailLayout, renderButton, renderCodeBox, renderCallout } from "./base-layout";

export const EMAIL_TEMPLATES: EmailTemplateDefinition[] = [
  // 1. Admin Team Invite
  {
    id: "admin-invite",
    title: "Admin Team Invite",
    category: "invites",
    description: "Invitation sent when granting an administrator access to the Hello Linden Admin Portal.",
    defaultSubject: "You've been invited as an Administrator on Hello Linden",
    variables: [
      { key: "name", label: "Recipient Name", type: "text", defaultValue: "Alex Morgan" },
      { key: "inviterName", label: "Invited By", type: "text", defaultValue: "Lambert Van Sittert" },
      { key: "inviteUrl", label: "Invite URL", type: "url", defaultValue: "https://admin.hellohyperlocal.co.za/invite/demo-token-12345" },
    ],
    renderHtml: (vars) =>
      renderBaseEmailLayout({
        title: "Admin Team Invitation",
        previewText: `${vars.inviterName} has invited you to join the Hello Linden admin team.`,
        badge: { text: "Admin Access", variant: "success" },
        contentHtml: `
          <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1c472a;">Welcome to the Team, ${vars.name}</h1>
          <p style="margin: 0 0 16px 0;">
            <strong>${vars.inviterName}</strong> has invited you to join the <strong>Hello Linden</strong> administration team.
          </p>
          <p style="margin: 0 0 16px 0;">
            As an administrator, you'll have access to review community posts, triage resident registrations, manage municipal updates, and coordinate local directory listings.
          </p>
          ${renderButton({ label: "Accept Invitation & Set Password", url: vars.inviteUrl })}
          ${renderCallout({ text: "For security, this invitation link will expire in 7 days. If you did not expect this invite, please contact your administrator.", variant: "info" })}
        `,
      }),
    renderPlainText: (vars) => `
Hi ${vars.name},

${vars.inviterName} has invited you to join the Hello Linden administration team.

Accept your invite and set your password here:
${vars.inviteUrl}

This link expires in 7 days.

Hello Linden Team
    `.trim(),
  },

  // 2. Councillor Mobile Invite
  {
    id: "councillor-invite",
    title: "Ward Councillor Invite",
    category: "invites",
    description: "Invitation sent to civic representatives to connect their Ward on the mobile app.",
    defaultSubject: "You've been invited as Ward Councillor on Hello Linden",
    variables: [
      { key: "name", label: "Councillor Name", type: "text", defaultValue: "Cllr. Nicole van Dyk" },
      { key: "ward", label: "Ward Number", type: "text", defaultValue: "Ward 99" },
      { key: "inviteUrl", label: "Mobile Invite Link", type: "url", defaultValue: "hello-hyperlocal://invite/councillor-token-99" },
    ],
    renderHtml: (vars) =>
      renderBaseEmailLayout({
        title: "Ward Councillor Invitation",
        previewText: `You've been designated as the civic representative for ${vars.ward}.`,
        badge: { text: vars.ward, variant: "default" },
        contentHtml: `
          <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1c472a;">Civic Partnership: ${vars.ward}</h1>
          <p style="margin: 0 0 16px 0;">Dear <strong>${vars.name}</strong>,</p>
          <p style="margin: 0 0 16px 0;">
            You have been officially invited as the designated Ward Councillor for <strong>${vars.ward}</strong> on the <strong>Hello Hyperlocal</strong> network.
          </p>
          <p style="margin: 0 0 16px 0;">
            With your verified councillor account, you can broadcast urgent service delivery bulletins, scheduled maintenance alerts, and load-shedding updates directly to residents' mobile feeds.
          </p>
          ${renderButton({ label: "Open in Hello Hyperlocal App", url: vars.inviteUrl })}
          ${renderCallout({ text: "Please ensure you have the Hello Hyperlocal app installed on your phone before tapping the link. This activation link expires in 7 days.", variant: "warning" })}
        `,
      }),
    renderPlainText: (vars) => `
Dear ${vars.name},

You have been invited as the designated Ward Councillor for ${vars.ward} on Hello Hyperlocal.

Open this link on your smartphone to activate your civic profile:
${vars.inviteUrl}

Hello Linden Civic Team
    `.trim(),
  },

  // 3. 2FA / Login OTP Verification
  {
    id: "login-otp",
    title: "Login OTP Verification",
    category: "security",
    description: "One-time code dispatched during first-time admin sign-in or two-factor verification.",
    defaultSubject: "Your Hello Linden Admin Verification Code",
    variables: [
      { key: "name", label: "Recipient Name", type: "text", defaultValue: "Admin" },
      { key: "code", label: "6-Digit Code", type: "text", defaultValue: "482915" },
      { key: "expiryMinutes", label: "Expiry Minutes", type: "number", defaultValue: "10" },
    ],
    renderHtml: (vars) =>
      renderBaseEmailLayout({
        title: "One-Time Verification Code",
        previewText: `Your verification code is ${vars.code}. It expires in ${vars.expiryMinutes} minutes.`,
        badge: { text: "Security Check", variant: "warning" },
        contentHtml: `
          <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1c472a;">Sign-in Verification</h1>
          <p style="margin: 0 0 16px 0;">
            We received a sign-in request for your Hello Linden administrator account.
          </p>
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569;">
            Enter the following one-time code to complete verification:
          </p>
          ${renderCodeBox(vars.code, `Expires in ${vars.expiryMinutes} minutes`)}
          ${renderCallout({ text: "Never share this code with anyone. Hello Hyperlocal staff will never ask for your verification code.", variant: "danger" })}
          <p style="margin: 16px 0 0 0; font-size: 13px; color: #64748b;">
            If you didn't request this verification code, please ignore this email or review your account credentials immediately.
          </p>
        `,
      }),
    renderPlainText: (vars) => `
Your Hello Linden admin verification code is:

${vars.code}

This code expires in ${vars.expiryMinutes} minutes. Never share this code with anyone.

Hello Linden Security Team
    `.trim(),
  },

  // 4. Password Reset / Recovery
  {
    id: "password-reset",
    title: "Password Reset Request",
    category: "security",
    description: "Account recovery email containing a single-use secure reset link (compatible with Supabase Auth).",
    defaultSubject: "Reset your Hello Linden password",
    variables: [
      { key: "email", label: "Account Email", type: "text", defaultValue: "operator@hellolinden.co.za" },
      { key: "resetUrl", label: "Reset URL", type: "url", defaultValue: "https://admin.hellohyperlocal.co.za/reset-password" },
    ],
    renderHtml: (vars) =>
      renderBaseEmailLayout({
        title: "Reset Password",
        previewText: "Follow this link to reset the password for your Hello Linden account.",
        badge: { text: "Password Recovery", variant: "default" },
        contentHtml: `
          <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1c472a;">Reset Your Password</h1>
          <p style="margin: 0 0 16px 0;">
            We received a request to reset the password for <strong>${vars.email}</strong>.
          </p>
          <p style="margin: 0 0 16px 0;">
            Click the button below to choose a new password. This link is valid for 1 hour and can only be used once.
          </p>
          ${renderButton({ label: "Reset Password", url: vars.resetUrl })}
          ${renderCallout({ text: "If you did not request a password reset, no further action is required. Your account remains secure.", variant: "info" })}
        `,
      }),
    renderPlainText: (vars) => `
Reset your Hello Linden password:

Follow this link to choose a new password:
${vars.resetUrl}

If you did not request this, you can safely ignore this email.

Hello Linden Security Team
    `.trim(),
  },

  // 5. Content Approved
  {
    id: "content-approved",
    title: "Content Approved",
    category: "moderation",
    description: "Notice sent to residents or business owners when their post or listing is approved by moderators.",
    defaultSubject: "Your post on Hello Linden is now live!",
    variables: [
      { key: "name", label: "Author Name", type: "text", defaultValue: "Sarah Jenkins" },
      { key: "itemTitle", label: "Post/Listing Title", type: "text", defaultValue: "Linden Community Garden Workshop this Saturday" },
      { key: "category", label: "Category", type: "text", defaultValue: "Community Posts" },
      { key: "viewUrl", label: "Post URL", type: "url", defaultValue: "https://hellohyperlocal.co.za/posts/linden-garden-workshop" },
    ],
    renderHtml: (vars) =>
      renderBaseEmailLayout({
        title: "Content Approved",
        previewText: `Your post "${vars.itemTitle}" has been approved and published.`,
        badge: { text: "Approved", variant: "success" },
        contentHtml: `
          <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1c472a;">Good news, ${vars.name}!</h1>
          <p style="margin: 0 0 16px 0;">
            Your submission <strong>"${vars.itemTitle}"</strong> in <em>${vars.category}</em> has been reviewed and approved by our neighborhood moderation team.
          </p>
          <p style="margin: 0 0 16px 0;">
            It is now visible to all verified neighbors in Linden on their mobile feeds and neighborhood directory.
          </p>
          ${renderButton({ label: "View Your Post", url: vars.viewUrl })}
          ${renderCallout({ text: "Thank you for contributing to our neighborhood community and helping keep Linden connected!", variant: "success" })}
        `,
      }),
    renderPlainText: (vars) => `
Hi ${vars.name},

Your submission "${vars.itemTitle}" in ${vars.category} has been approved and is now live on Hello Linden.

View your post:
${vars.viewUrl}

Thank you for contributing to our community!

Hello Linden Moderation Team
    `.trim(),
  },

  // 6. Content Rejected / Feedback
  {
    id: "content-rejected",
    title: "Content Needs Revision",
    category: "moderation",
    description: "Constructive feedback sent when a post or listing does not meet neighborhood guidelines.",
    defaultSubject: "Update regarding your Hello Linden submission",
    variables: [
      { key: "name", label: "Author Name", type: "text", defaultValue: "John Doe" },
      { key: "itemTitle", label: "Post Title", type: "text", defaultValue: "Commercial Solar Bulk Sale" },
      { key: "category", label: "Category", type: "text", defaultValue: "Marketplace" },
      { key: "reason", label: "Moderator Reason", type: "textarea", defaultValue: "Please list pricing in ZAR and verify your business address in the Linden directory before posting commercial specials." },
    ],
    renderHtml: (vars) =>
      renderBaseEmailLayout({
        title: "Content Needs Revision",
        previewText: `Feedback regarding your submission "${vars.itemTitle}".`,
        badge: { text: "Needs Revision", variant: "danger" },
        contentHtml: `
          <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1c472a;">Hi ${vars.name},</h1>
          <p style="margin: 0 0 16px 0;">
            Thank you for sharing your submission <strong>"${vars.itemTitle}"</strong> in <em>${vars.category}</em>.
          </p>
          <p style="margin: 0 0 16px 0;">
            During review, our moderation team found that it does not currently meet our neighborhood posting guidelines:
          </p>
          ${renderCallout({ text: vars.reason, variant: "warning" })}
          <p style="margin: 16px 0 16px 0;">
            You are welcome to update your submission in the mobile app according to the note above and submit it for review again.
          </p>
          ${renderButton({ label: "Review Community Guidelines", url: "https://hellohyperlocal.co.za/guidelines", variant: "secondary" })}
        `,
      }),
    renderPlainText: (vars) => `
Hi ${vars.name},

Regarding your submission "${vars.itemTitle}" on Hello Linden:

Our moderation team was unable to publish it due to the following reason:
"${vars.reason}"

Please update your submission in the app and re-submit.

Hello Linden Moderation Team
    `.trim(),
  },

  // 7. Ward Municipal Broadcast
  {
    id: "ward-broadcast",
    title: "Ward Municipal Alert",
    category: "municipal",
    description: "High-priority service delivery bulletin from Ward Councillor or municipal authorities.",
    defaultSubject: "[Ward 99 Alert] Urgent Water Outage Notice: 4th Avenue Linden",
    variables: [
      { key: "ward", label: "Ward", type: "text", defaultValue: "Ward 99" },
      { key: "headline", label: "Alert Headline", type: "text", defaultValue: "Emergency Water Outage Notice — 4th Avenue & 7th Street" },
      { key: "severity", label: "Severity Level", type: "text", defaultValue: "URGENT SERVICE BULLETIN" },
      { key: "details", label: "Incident Details", type: "textarea", defaultValue: "Johannesburg Water is attending to a burst 200mm main line on 4th Avenue. Water tankers have been stationed at Linden Library. Estimated restoration: 18:00 today." },
    ],
    renderHtml: (vars) =>
      renderBaseEmailLayout({
        title: "Municipal Alert",
        previewText: `${vars.headline} — ${vars.ward}`,
        badge: { text: vars.severity, variant: "danger" },
        contentHtml: `
          <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #991b1b;">${vars.headline}</h1>
          <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b; font-weight: 600;">
            Official Bulletin from ${vars.ward} Civic Desk
          </p>
          ${renderCallout({ text: vars.details, variant: "danger" })}
          <p style="margin: 16px 0 16px 0;">
            For real-time updates, community status reports, and water tanker schedules, check your Hello Linden feed.
          </p>
          ${renderButton({ label: "Open Live Incident Thread", url: "https://hellohyperlocal.co.za/ward-updates" })}
        `,
      }),
    renderPlainText: (vars) => `
[${vars.ward}] ${vars.headline}

${vars.details}

Official Bulletin from ${vars.ward} Civic Desk.
    `.trim(),
  },

  // 8. Welcome / Founding Neighbor
  {
    id: "welcome-resident",
    title: "Welcome New Resident",
    category: "community",
    description: "Warm welcome message sent to newly registered neighbors in Linden.",
    defaultSubject: "Welcome to Hello Linden! Your neighborhood is waiting",
    variables: [
      { key: "name", label: "Resident Name", type: "text", defaultValue: "David" },
      { key: "neighborhood", label: "Neighborhood", type: "text", defaultValue: "Linden" },
      { key: "appStoreUrl", label: "App Download Link", type: "url", defaultValue: "https://hellohyperlocal.co.za/download" },
    ],
    renderHtml: (vars) =>
      renderBaseEmailLayout({
        title: "Welcome to Hello Linden",
        previewText: `Welcome to ${vars.neighborhood}! Connect with verified local neighbors.`,
        badge: { text: "Welcome", variant: "success" },
        contentHtml: `
          <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #1c472a;">Welcome to the neighborhood, ${vars.name}!</h1>
          <p style="margin: 0 0 16px 0;">
            We're thrilled to welcome you to <strong>Hello ${vars.neighborhood}</strong> — your dedicated neighborhood network built to foster real-world connections, safety, and local business support.
          </p>
          <p style="margin: 0 0 12px 0; font-weight: 600; color: #1c472a;">
            What you can do right away:
          </p>
          <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;">Discover verified local businesses and exclusive <strong>Love Local</strong> discounts.</li>
            <li style="margin-bottom: 8px;">Stay informed with real-time municipal updates directly from your Ward Councillor.</li>
            <li style="margin-bottom: 8px;">Share recommendations, neighborhood alerts, and buy/sell locally.</li>
          </ul>
          ${renderButton({ label: "Explore Hello Linden", url: vars.appStoreUrl })}
          ${renderCallout({ text: "Hello Hyperlocal is private and address-verified. Your personal data is never sold or used for intrusive ad-tracking.", variant: "success" })}
        `,
      }),
    renderPlainText: (vars) => `
Welcome to Hello ${vars.neighborhood}, ${vars.name}!

We're thrilled to welcome you to your local neighborhood network.

Explore Hello Linden:
${vars.appStoreUrl}

Warm regards,
The Hello Linden Team
    `.trim(),
  },
];
