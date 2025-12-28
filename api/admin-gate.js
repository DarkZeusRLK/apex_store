import { readFileSync } from "fs";
import { join } from "path";

export default async function handler(req, res) {
  try {
    // 1. PEGAR COOKIES MANUALMENTE (Correção do Erro 500)
    const cookies = req.headers.cookie || "";
    const hasAuth = cookies.includes("apex_auth=true");

    // 2. VERIFICAÇÃO DE SEGURANÇA
    if (!hasAuth) {
      console.log("Acesso negado: Cookie apex_auth não encontrado.");
      return res.redirect("/admin-login");
    }

    // 3. CAMINHO DO ARQUIVO (Ajustado para Vercel)
    // Tentamos encontrar o admin.html na pasta /p/
    const filePath = join(process.cwd(), "p", "admin.html");

    try {
      const htmlContent = readFileSync(filePath, "utf8");
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(htmlContent);
    } catch (fsError) {
      console.error("Erro ao ler arquivo admin.html:", fsError);
      return res
        .status(500)
        .send("Erro: Arquivo admin.html não encontrado no servidor.");
    }
  } catch (error) {
    console.error("Erro Geral no Gatekeeper:", error);
    return res
      .status(500)
      .json({ error: "Erro interno no servidor de autenticação." });
  }
}
