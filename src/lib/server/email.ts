import "server-only";

// Envoi du lien magique via Resend (https://resend.com).
//   RESEND_API_KEY=re_…   EMAIL_FROM="One Day <bonjour@ton-domaine.fr>"
// Sans clé : le lien est affiché dans la console du serveur (et à l'écran en développement).

export const emailConfigured = () => !!process.env.RESEND_API_KEY;

export async function sendMagicLink(to: string, link: string) {
  if (!emailConfigured()) {
    console.log(`\n[One Day] Lien de connexion pour ${to} :\n${link}\n`);
    return;
  }
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:460px;margin:auto;padding:32px;color:#17122B">
    <p style="font-size:22px;font-weight:800;margin:0 0 8px">Ton lien One Day ☀️</p>
    <p style="font-size:15px;line-height:1.5;color:#6B6480">Clique pour te connecter. Le lien est valable 20 minutes et ne marche qu'une fois.</p>
    <p style="margin:28px 0">
      <a href="${link}" style="background:#FF6A1A;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px;display:inline-block">Me connecter</a>
    </p>
    <p style="font-size:12px;color:#6B6480">Tu n'as rien demandé ? Ignore simplement cet email.</p>
  </div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "One Day <onboarding@resend.dev>",
      to,
      subject: "Ton lien de connexion One Day",
      html,
      text: `Ton lien de connexion One Day (valable 20 min) : ${link}`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
