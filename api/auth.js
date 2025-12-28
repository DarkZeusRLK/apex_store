export default async function handler(req, res) {
  const { code } = req.query;

  // Ajustado para usar BOT_TOKEN como você definiu
  const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    BOT_TOKEN,
    GUILD_ID,
    CEO_ROLE_ID,
  } = process.env;

  if (!code) {
    return res.redirect(
      `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        DISCORD_REDIRECT_URI
      )}&response_type=code&scope=identify`
    );
  }

  try {
    // 1. Troca o código pelo Token do Usuário
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

    // DIAGNÓSTICO: Se não veio o access_token, vamos ver o porquê
    if (!tokenData.access_token) {
      return res.status(400).json({
        erro: "O Discord recusou o código de login.",
        motivo_real: tokenData, // Aqui o Discord dirá se é o Secret ou a URI
        ajuda:
          "Verifique se a DISCORD_REDIRECT_URI na Vercel é IDENTICA à do Discord Portal.",
      });
    }

    // 2. Pega o ID do Usuário
    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    // 3. Verifica o Membro (Usando BOT_TOKEN)
    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userData.id}`,
      {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      }
    );

    const memberData = await memberRes.json();

    if (memberRes.status !== 200) {
      return res
        .status(memberRes.status)
        .json({ erro: "Membro não encontrado", detalhes: memberData });
    }

    const isCEO = memberData.roles.includes(CEO_ROLE_ID);

    if (isCEO) {
      res.setHeader(
        "Set-Cookie",
        "apex_auth=true; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict"
      );
      return res.redirect("/p/admin");
    } else {
      return res.send(
        '<script>alert("Acesso Negado: Você não é CEO."); window.location.href="/p/login";</script>'
      );
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
