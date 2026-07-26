# G Automation — App Web

Site institucional + área de administrador para gerar orçamentos em PDF.

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000

- Página inicial: institucional (sobre, serviços, contato)
- Área do administrador: http://localhost:3000/admin

**Login padrão (definido na primeira execução):**
- usuário: `admin`
- senha: `gautomation2016`

> Troque usuário/senha padrão criando um arquivo `.env.local` com
> `ADMIN_DEFAULT_USER` e `ADMIN_DEFAULT_PASSWORD` **antes** da primeira execução
> (o usuário só é criado se o banco estiver vazio). Também defina `AUTH_SECRET`
> com um valor aleatório longo antes de usar em produção.

## O que tem na área do administrador

- **Clientes**: cadastro de empresas, cada uma com um ou mais contatos
  (nome, e-mail, telefone, cargo) — permite enviar orçamento para
  pessoas diferentes de e-mails diferentes na mesma empresa.
- **Orçamentos**: criação com itens (descrição, fabricante, NCM, quantidade,
  valor unitário, prazo), desconto e condições comerciais. O número do
  orçamento é gerado automaticamente no formato `ddMMyyHHmm` (dia, mês, ano,
  hora, minuto da criação) e **nunca muda**, mesmo editando o orçamento depois.
- **PDF**: cada orçamento pode ser baixado/visualizado em PDF no layout de
  proposta comercial (botão "Baixar PDF" na página do orçamento).

## Dados

O banco de dados é um arquivo SQLite local em `data/gautomation.db`
(criado automaticamente). Para "resetar" o sistema, basta apagar esse arquivo
(o app recria as tabelas e o usuário admin padrão na próxima execução).
