export default async function handler(req, res) {
  const { code } = req.query;

  // Puxa as configurações do .env da Vercel
  const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const GUILD_ID = process.env.GUILD_ID;
  const CEO_ROLE_ID = process.env.CEO_ROLE_ID;

  // URL de Login do Discord (caso o usuário tente acessar a API direto sem código)
  const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify`;

  if (!code) {
    return res.redirect(DISCORD_AUTH_URL);
  }

  try {
    // 1. Trocar o código pelo Access Token do Usuário
    const tokenResponse = await fetch(
      "https://discord.com/api/v10/oauth2/token",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI,
        }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) throw new Error("Falha ao obter access_token");

    // 2. Buscar o ID do usuário logado
    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    // 3. Buscar informações do membro no seu servidor usando o BOT TOKEN
    // Isso é necessário porque o token do usuário não tem permissão para ver os próprios cargos de forma segura
    const memberResponse = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userData.id}`,
      {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      }
    );

    if (memberResponse.status !== 200) {
      return res.send(
        '<script>alert("Você não foi encontrado no servidor da Apex Store."); window.location.href="/admin-login";</script>'
      );
    }

    const memberData = await memberResponse.json();

    // 4. Verificar se o ID do cargo de CEO está na lista de cargos (roles) do usuário
    const isCEO = memberData.roles.includes(CEO_ROLE_ID);

    if (isCEO) {
      // Define o cookie que a trava do admin.html vai procurar
      res.setHeader(
        "Set-Cookie",
        "apex_auth=true; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict"
      );
      // Redireciona para o painel administrativo "criptografado"
      return res.redirect("/p/admin-dash-77");
    } else {
      return res.send(
        '<script>alert("Acesso Negado: Você não possui o cargo de CEO."); window.location.href="/p/login.html";</script>'
      );
    }
  } catch (error) {
    console.error("Erro no Auth:", error);
    return res.status(500).json({ error: "Erro interno na autenticação" });
  }
}
