// api/admin-gate.js
import { readFileSync } from "fs";
import { join } from "path";

export default async function handler(req, res) {
  const authCookie = req.cookies.apex_auth;

  // CAMADA 1: Verifica o cookie HttpOnly (Gerado no auth.js)
  if (!authCookie || authCookie !== "true") {
    return res.redirect("/admin-login");
  }

  try {
    // CAMADA 2: Se o cookie existe, o servidor lê o arquivo HTML e envia para o navegador
    // O arquivo admin.html deve estar na pasta /p/
    const filePath = join(process.cwd(), "p", "admin.html");
    const htmlContent = readFileSync(filePath, "utf8");

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(htmlContent);
  } catch (err) {
    return res.status(500).send("Erro ao carregar o painel administrativo.");
  }
}
