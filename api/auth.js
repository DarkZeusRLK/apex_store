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

  // Se não houver código, manda para o Discord
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
    if (!tokenData.access_token)
      throw new Error("Falha ao obter Token do Discord");

    // 2. Pega o ID do Usuário logado
    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    // 3. Verifica o Membro no Servidor (Usando o Bot Token)
    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userData.id}`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
      }
    );

    const memberData = await memberRes.json();

    // Se o bot não encontrar o membro ou der erro de permissão
    if (memberRes.status !== 200) {
      return res.status(memberRes.status).json({
        erro: "Membro não verificado no servidor.",
        detalhes: memberData,
      });
    }

    // 4. Validação do Cargo de CEO
    const isCEO = memberData.roles.includes(CEO_ROLE_ID);

    if (isCEO) {
      // Cria o Cookie de Sessão (Dura 24h)
      res.setHeader(
        "Set-Cookie",
        "apex_auth=true; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict"
      );
      // Redireciona para o Dash (usando a rota do vercel.json)
      return res.redirect("/p/admin-dash-77");
    } else {
      // Se não for CEO, alerta e volta para o login
      return res.send(
        '<script>alert("Acesso Negado: Você não possui o cargo de CEO."); window.location.href="/admin-login";</script>'
      );
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
