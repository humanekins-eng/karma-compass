// Simple email collection endpoint
// Phase 1: Logs subscribers (retrieve via Vercel function logs)
// Phase 2: Connect to Mailchimp/Brevo/ConvertKit API
// Phase 3: Add to Vercel KV or database

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, name, lang } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  // Rate limit: basic check via header
  const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";

  // Log the subscriber (visible in Vercel function logs)
  console.log(JSON.stringify({
    type: "NEW_SUBSCRIBER",
    email,
    name: name || "",
    lang: lang || "en",
    ip: ip.split(",")[0].trim(),
    timestamp: new Date().toISOString(),
  }));

  // ─── PHASE 2: Uncomment to connect to Mailchimp ───
  // const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
  // const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
  // const MAILCHIMP_DC = MAILCHIMP_API_KEY?.split("-").pop();
  //
  // if (MAILCHIMP_API_KEY && MAILCHIMP_LIST_ID) {
  //   try {
  //     await fetch(`https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `apikey ${MAILCHIMP_API_KEY}`,
  //       },
  //       body: JSON.stringify({
  //         email_address: email,
  //         status: "subscribed",
  //         merge_fields: { FNAME: name || "", LANG: lang || "en" },
  //         tags: ["karma-compass", `lang-${lang}`],
  //       }),
  //     });
  //   } catch (e) {
  //     console.error("Mailchimp error:", e.message);
  //   }
  // }

  return res.status(200).json({ ok: true });
}
