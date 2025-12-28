import { readFileSync, existsSync } from "fs";
import { join } from "path";

export default async function handler(req, res) {
  try {
    // 1. PEGAR COOKIES
    const cookies = req.headers.cookie || "";
    const hasAuth = cookies.includes("apex_auth=true");

    if (!hasAuth) {
      return res.redirect("/admin-login");
    }

    // 2. TENTAR ENCONTRAR O ARQUIVO EM DIFERENTES CAMINHOS (Resiliência)
    // Caminho A: Baseado no processo atual
    // Caminho B: Baseado no diretório do script
    const pathA = join(process.cwd(), "p", "admin.html");
    const pathB = join(process.cwd(), "admin.html"); // Caso o arquivo esteja na raiz

    let finalPath = "";

    if (existsSync(pathA)) {
      finalPath = pathA;
    } else if (existsSync(pathB)) {
      finalPath = pathB;
    } else {
      // Se não achar em lugar nenhum, lista o que ele vê para te ajudar no log
      console.error("Diretório atual:", process.cwd());
      return res
        .status(500)
        .send(
          "Erro: O arquivo admin.html não foi encontrado na pasta /p/. Verifique se ele está lá."
        );
    }

    const htmlContent = readFileSync(finalPath, "utf8");
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(htmlContent);
  } catch (error) {
    console.error("Erro no Gatekeeper:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao processar o acesso." });
  }
}
