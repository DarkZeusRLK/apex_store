// api/pix.js
export default async function handler(req, res) {
  const { valor, nome_produto } = req.query;

  // CONFIGURAÇÕES DO SEU PIX
  // IMPORTANTE: Aqui vai APENAS a sua chave PIX (ex: seu CPF, seu Email ou Chave Aleatória)
  const CHAVE_PIX = "SUA_CHAVE_AQUI"; // <--- COLOQUE APENAS A CHAVE AQUI
  const NOME_RECEBEDOR = "APEX STORE";
  const CIDADE_RECEBEDOR = "RIO DE JANEIRO";

  if (!valor) return res.status(400).json({ error: "Valor não informado" });

  const f = (id, val) => id + String(val.length).padStart(2, "0") + val;
  const formatarValor = parseFloat(valor).toFixed(2);

  try {
    // Montagem do Payload conforme padrão BC
    let payload = [
      f("00", "01"),
      f("26", f("00", "br.gov.bcb.pix") + f("01", CHAVE_PIX)),
      f("52", "0000"),
      f("53", "986"),
      f("54", formatarValor),
      f("58", "BR"),
      f("59", NOME_RECEBEDOR),
      f("60", CIDADE_RECEBEDOR),
      f("62", f("05", "APEX" + Date.now().toString().slice(-4))),
    ].join("");

    payload += "6304";

    // Usando a função manual que já está no arquivo
    const crc = calcularCRC16(payload);
    const pixCompleto = payload + crc.toUpperCase();

    res.status(200).json({
      copia_e_cola: pixCompleto,
      qrcode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        pixCompleto
      )}`,
    });
  } catch (err) {
    res.status(500).json({ error: "Erro interno ao gerar PIX" });
  }
}

// Função de CRC16 manual (não precisa de biblioteca externa)
function calcularCRC16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
    }
  }
  return (crc & 0xffff).toString(16).padStart(4, "0");
}
