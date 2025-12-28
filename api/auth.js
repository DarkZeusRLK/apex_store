export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    // Redireciona para o login do Discord se não houver código
    return res.redirect("URL_DO_SEU_OAUTH_DISCORD");
  }

  try {
    // 1. Trocar o código pelo Access Token do Usuário (Discord API)
    // 2. Buscar o perfil e os cargos do usuário no seu servidor
    // 3. Verificar se o ID do cargo de CEO está presente

    const isCEO = true; // Aqui entrará a lógica real de validação com o Bot

    if (isCEO) {
      // Define um cookie de autenticação simples para o navegador
      res.setHeader(
        "Set-Cookie",
        "apex_auth=true; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict"
      );
      // Redireciona para o painel
      return res.redirect("/p/admin-dash-77");
    } else {
      return res.send(
        '<script>alert("Acesso Negado: Você não possui o cargo de CEO."); window.location.href="/admin-login";</script>'
      );
    }
  } catch (error) {
    return res.status(500).json({ error: "Erro na autenticação" });
  }
}
