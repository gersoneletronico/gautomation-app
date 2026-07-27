import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const AZUL = "#1E3A8A"; // azul del rei / royal blue
const AZUL_ESCURO = "#152A63";
const AZUL_CLARO = "#E8ECF9";
const CINZA_BORDA = "#C3CBEA";

const styles = StyleSheet.create({
  page: { padding: 0, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
  content: { padding: 26 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: AZUL,
    paddingBottom: 10,
    marginBottom: 0,
  },
  logo: { width: 190, height: 124, objectFit: "contain" },
  companyBlock: { textAlign: "right" },
  companyName: { fontSize: 12, fontWeight: 700, marginBottom: 2, color: AZUL_ESCURO },
  small: { fontSize: 8, color: "#4a4a4a" },

  titleBar: {
    backgroundColor: AZUL,
    color: "#fff",
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: { fontSize: 13, fontWeight: 700, letterSpacing: 0.3 },
  titleSub: { fontSize: 9, color: "#DCEBFF" },

  section: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CINZA_BORDA,
    borderRadius: 4,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: AZUL_CLARO,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: CINZA_BORDA,
  },
  sectionTitle: { fontSize: 9, fontWeight: 700, color: AZUL_ESCURO, letterSpacing: 0.5 },
  sectionBody: { padding: 8 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { fontWeight: 700, width: 92, color: "#333" },
  value: { flex: 1 },

  table: { borderWidth: 1, borderColor: CINZA_BORDA, marginBottom: 12, borderRadius: 4, overflow: "hidden" },
  tHeadRow: { flexDirection: "row", backgroundColor: AZUL },
  tRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#E7EEF8" },
  tRowAlt: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#E7EEF8", backgroundColor: "#F5F9FE" },
  th: { padding: 5, fontWeight: 700, fontSize: 8, color: "#fff" },
  td: { padding: 5, fontSize: 8 },
  colDesc: { flex: 3 },
  colFab: { flex: 1.2 },
  colUn: { flex: 0.6, textAlign: "center" },
  colQtd: { flex: 0.7, textAlign: "center" },
  colValor: { flex: 1, textAlign: "right" },

  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 14 },
  totalsBox: {
    width: 230,
    borderWidth: 1,
    borderColor: CINZA_BORDA,
    borderRadius: 4,
    overflow: "hidden",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEF8",
  },
  totalLabel: { color: "#444" },
  totalFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: AZUL,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  totalFinalLabel: { fontWeight: 700, fontSize: 10, color: "#fff" },
  totalFinalValue: { fontWeight: 700, fontSize: 11, color: "#fff" },

  footer: {
    marginTop: 6,
    fontSize: 8,
    color: "#fff",
    backgroundColor: AZUL_ESCURO,
    paddingVertical: 10,
    paddingHorizontal: 26,
  },
  footerStrong: { fontWeight: 700 },
});

type Item = {
  cod_ncm: string | null;
  descricao: string;
  fabricante: string | null;
  unidade: string | null;
  quantidade: number;
  prazo_entrega: string | null;
  valor_unitario: number;
};

export type OrcamentoPdfData = {
  numero: string;
  data_emissao: string;
  natureza: string | null;
  prazo_entrega: string | null;
  validade_proposta: string | null;
  condicoes_pagamento: string | null;
  garantia_servico: string | null;
  garantia_produto: string | null;
  desconto: number;
  escopo_servico: string | null;
  observacoes: string | null;
  empresa: {
    razao_social: string;
    cnpj: string | null;
    ie: string | null;
    endereco: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
  };
  contato: { nome: string; email: string | null; telefone: string | null } | null;
  itens: Item[];
  logoBuffer?: Buffer;
};

const currency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function OrcamentoPdf({ data }: { data: OrcamentoPdfData }) {
  const subtotal = data.itens.reduce((acc, it) => acc + it.quantidade * it.valor_unitario, 0);
  const total = Math.max(0, subtotal - (data.desconto || 0));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            {data.logoBuffer ? <Image src={data.logoBuffer} style={styles.logo} /> : <View />}
            <View style={styles.companyBlock}>
              <Text style={styles.companyName}>G AUTOMATION INDUSTRIAL LTDA</Text>
              <Text style={styles.small}>CNPJ: 45.531.455/0001-71</Text>
              <Text style={styles.small}>Rua das Acácias, 171 - Jardim Botânico, Goianinha/RN</Text>
              <Text style={styles.small}>Tel.: (81) 99131-8362 | gautomation2016@gmail.com</Text>
            </View>
          </View>

          <View style={[styles.titleBar, { marginTop: 14 }]}>
            <Text style={styles.titleText}>PROPOSTA COMERCIAL Nº {data.numero}</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.titleSub}>Emissão: {formatDate(data.data_emissao)}</Text>
              {data.natureza && <Text style={styles.titleSub}>{data.natureza}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>CLIENTE</Text>
            </View>
            <View style={styles.sectionBody}>
              <View style={styles.row}>
                <Text style={styles.label}>Razão Social:</Text>
                <Text style={styles.value}>{data.empresa.razao_social}</Text>
              </View>
              {data.empresa.cnpj && (
                <View style={styles.row}>
                  <Text style={styles.label}>CNPJ:</Text>
                  <Text style={styles.value}>{data.empresa.cnpj}</Text>
                </View>
              )}
              {data.empresa.endereco && (
                <View style={styles.row}>
                  <Text style={styles.label}>Endereço:</Text>
                  <Text style={styles.value}>
                    {data.empresa.endereco}
                    {data.empresa.bairro ? `, ${data.empresa.bairro}` : ""}
                    {data.empresa.cidade ? ` - ${data.empresa.cidade}/${data.empresa.estado || ""}` : ""}
                    {data.empresa.cep ? ` - CEP ${data.empresa.cep}` : ""}
                  </Text>
                </View>
              )}
              {data.contato && (
                <View style={styles.row}>
                  <Text style={styles.label}>Contato:</Text>
                  <Text style={styles.value}>
                    {data.contato.nome}
                    {data.contato.email ? ` — ${data.contato.email}` : ""}
                    {data.contato.telefone ? ` — ${data.contato.telefone}` : ""}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tHeadRow}>
              <Text style={[styles.th, styles.colDesc]}>DESCRIÇÃO</Text>
              <Text style={[styles.th, styles.colFab]}>FABRICANTE</Text>
              <Text style={[styles.th, styles.colUn]}>UN</Text>
              <Text style={[styles.th, styles.colQtd]}>QTDE</Text>
              <Text style={[styles.th, styles.colValor]}>VALOR UNIT.</Text>
              <Text style={[styles.th, styles.colValor]}>VALOR TOTAL</Text>
            </View>
            {data.itens.map((it, idx) => (
              <View style={idx % 2 === 1 ? styles.tRowAlt : styles.tRow} key={idx}>
                <Text style={[styles.td, styles.colDesc]}>{it.descricao}</Text>
                <Text style={[styles.td, styles.colFab]}>{it.fabricante || "-"}</Text>
                <Text style={[styles.td, styles.colUn]}>{it.unidade || "UN"}</Text>
                <Text style={[styles.td, styles.colQtd]}>{it.quantidade}</Text>
                <Text style={[styles.td, styles.colValor]}>{currency(it.valor_unitario)}</Text>
                <Text style={[styles.td, styles.colValor]}>
                  {currency(it.quantidade * it.valor_unitario)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text>{currency(subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Desconto</Text>
                <Text>{currency(data.desconto || 0)}</Text>
              </View>
              <View style={styles.totalFinalRow}>
                <Text style={styles.totalFinalLabel}>TOTAL</Text>
                <Text style={styles.totalFinalValue}>{currency(total)}</Text>
              </View>
            </View>
          </View>

          {data.escopo_servico && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>ESCOPO DO SERVIÇO</Text>
              </View>
              <View style={styles.sectionBody}>
                <Text>{data.escopo_servico}</Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>CONDIÇÕES COMERCIAIS</Text>
            </View>
            <View style={styles.sectionBody}>
              <View style={styles.row}>
                <Text style={styles.label}>Validade proposta:</Text>
                <Text style={styles.value}>{data.validade_proposta || "-"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Cond. pagamento:</Text>
                <Text style={styles.value}>{data.condicoes_pagamento || "-"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Garantia serviço/produto:</Text>
                <Text style={styles.value}>{data.garantia_servico || "-"}</Text>
              </View>
            </View>
          </View>

          {data.observacoes && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>OBSERVAÇÕES</Text>
              </View>
              <View style={styles.sectionBody}>
                <Text>{data.observacoes}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerStrong}>
            DADOS BANCÁRIOS — G AUTOMATION | CNPJ: 45.531.455/0001-71 | Sicredi 748 | Ag: 2207 | Conta: 55899-0
          </Text>
          <Text style={{ marginTop: 4 }}>
            Atenciosamente, Gerson Felipe de Sousa — G Automation Industrial Ltda.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
