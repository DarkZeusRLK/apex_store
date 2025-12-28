// /api/auth.js
export default async function handler(req, res) {
  const { code } = req.query;

  if (code) {
    // 1. Troca o código pelo Token do Usuário
    // 2. Busca o perfil do usuário no Discord
    // 3. Usa o BOT_TOKEN para ver se o usuário tem o cargo em GUILD_ID
    // 4. Se sim, redireciona para /admin/dashboard com um Token temporário
    // (Por segurança, esta lógica deve ser processada no lado do servidor)

    // Simulação de redirecionamento após validação:
    res.redirect("/p/admin-dash-77");
  }
}
