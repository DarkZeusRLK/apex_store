export default async function handler(req, res) {
  const { code } = req.query;

  const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    DISCORD_BOT_TOKEN,
    GUILD_ID,
    CEO_ROLE_ID,
  } = process.env;

  if (!code)
    return res.redirect(
      `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        DISCORD_REDIRECT_URI
      )}&response_type=code&scope=identify`
    );

  try {
    // 1. Token Exchange
    const tokenResponse = await fetch(
      "https://discord.com/api/v10/oauth2/token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: DISCORD_REDIRECT_URI,
        }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    const tokenData = await tokenResponse.json();

    // 2. Get User ID
    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    // 3. Verificação Crucial (O Diagnóstico)
    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userData.id}`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
      }
    );

    const memberData = await memberRes.json();

    // Se der erro, vamos mostrar o que o Discord disse
    if (memberRes.status !== 200) {
      return res.status(memberRes.status).json({
        erro: "O Discord recusou a verificação do membro.",
        causa_provavel:
          memberRes.status === 404
            ? "Bot não está no servidor ou GUILD_ID errado."
            : "Token do Bot ou permissões inválidas.",
        detalhes_do_discord: memberData,
      });
    }

    const isCEO = memberData.roles.includes(CEO_ROLE_ID);

    if (isCEO) {
      res.setHeader(
        "Set-Cookie",
        "apex_auth=true; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict"
      );
      return res.redirect("/p/admin-dash-77");
    } else {
      return res.send(
        '<script>alert("Acesso Negado: Você não é CEO."); window.location.href="/admin-login";</script>'
      );
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
