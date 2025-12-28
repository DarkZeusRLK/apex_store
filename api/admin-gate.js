import { readFileSync, existsSync } from "fs";
import { join } from "path";

export default async function handler(req, res) {
  try {
    const cookies = req.headers.cookie || "";
    const hasAuth = cookies.includes("apex_auth=true");

    if (!hasAuth) {
      return res.redirect("/admin-login");
    }

    // LISTA DE CAMINHOS POSSÍVEIS (Adicionamos o 'public')
    const caminhos = [
      join(process.cwd(), "public", "p", "admin.html"), // Caminho atual (public/p/admin.html)
      join(process.cwd(), "p", "admin.html"), // Caso você mova para fora da public
      join(process.cwd(), "admin.html"), // Caso esteja na raiz
    ];

    let finalPath = "";
    for (const caminho of caminhos) {
      if (existsSync(caminho)) {
        finalPath = caminho;
        break;
      }
    }

    if (!finalPath) {
      console.error("Arquivo não encontrado em nenhum dos locais:", caminhos);
      return res
        .status(500)
        .send(
          "Erro: O arquivo admin.html não foi encontrado. Verifique se ele está em /public/p/admin.html"
        );
    }

    const htmlContent = readFileSync(finalPath, "utf8");
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(htmlContent);
  } catch (error) {
    console.error("Erro no Gatekeeper:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}
