// api/pix.js
import { crc16ccitt } from "crc"; // Precisaremos instalar essa dependência ou usar uma função manual

export default async function handler(req, res) {
  const { valor, nome_produto } = req.query;

  // CONFIGURAÇÕES DO SEU PIX
  const CHAVE_PIX =
    "00020101021126330014br.gov.bcb.pix0111114434889765204000053039865802BR5919JOAO P F DE ALMEIDA6008IVAIPORA62070503***63040C59"; // Pode ser CPF, Email, Telefone ou Aleatória
  const NOME_RECEBEDOR = "APEX STORE LTDA";
  const CIDADE_RECEBEDOR = "Rio de Janeiro";

  if (!valor) return res.status(400).json({ error: "Valor não informado" });

  // Função para formatar o campo do PIX (EMV)
  const f = (id, val) => id + String(val.length).padStart(2, "0") + val;

  const formatarValor = parseFloat(valor).toFixed(2);

  // Montagem do Payload conforme Banco Central
  let payload = [
    f("00", "01"), // Payload Format Indicator
    f("26", f("00", "br.gov.bcb.pix") + f("01", CHAVE_PIX)),
    f("52", "0000"), // Merchant Category Code
    f("53", "986"), // Currency (BRL)
    f("54", formatarValor),
    f("58", "BR"), // Country Code
    f("59", NOME_RECEBEDOR),
    f("60", CIDADE_RECEBEDOR),
    f("62", f("05", "APEX" + Date.now().toString().slice(-4))), // ID da Transação
  ].join("");

  payload += "6304"; // CRC16 Indicator

  // Cálculo do CRC16 (Ajustado para não precisar de biblioteca externa se preferir)
  const crc = calcularCRC16(payload);
  const pixCompleto = payload + crc.toUpperCase();

  res.status(200).json({
    copia_e_cola: pixCompleto,
    qrcode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      pixCompleto
    )}`,
  });
}

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
