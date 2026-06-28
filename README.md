# Armário Social

Plataforma web que conecta doadores de roupas de inverno a pessoas em situação de vulnerabilidade, centralizando e organizando os pontos de coleta e distribuição.

Protótipo front-end desenvolvido como Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas da UNIFTEC (2026).

---

## Problema que resolve

Atualmente, as doações de roupas enfrentam problemas de organização: muitas vezes quem quer doar não sabe onde entregar, e quem precisa não sabe onde buscar. O Armário Social reúne em um só lugar os estabelecimentos parceiros que funcionam como pontos de coleta físicos. Isso permite que qualquer pessoa localize esses pontos, verifique quais itens são aceitos e registre as doações.

### Atores do sistema
- **Doador / visitante (usuário comum)**: usa as páginas públicas e o painel em modo leitura (vê pontos, estoque e encaminhamentos). **Não vê as doações** e **não edita** nada.
- **Parceiro (autenticado)**: estabelecimento com login próprio. Além do que o visitante vê, **gerencia os itens que cada ponto precisa**. Não vê doações, não exclui e não aprova.
- **Administrador (autenticado)**: super usuário (conta no `.env`). É o **único** que vê a identidade dos doadores, **exclui** registros, **aprova** patrocinadores e **cria/remove contas de parceiro**.

---

## Funcionalidades

- **Página inicial**: apresentação da proposta do projeto com um guia simples de como doar em 3 passos.
- **Pontos de coleta**: exibição dos pontos cadastrados em formato de cartões, com busca por cidade ou bairro. Já vem populado com 8 pontos de teste localizados em cidades do Rio Grande do Sul (São Leopoldo, Novo Hamburgo, Caxias do Sul e Porto Alegre).
- **Cadastro de doação**: formulário que permite selecionar o local de entrega, os tipos de vestuário, quantidades e observações.
- **Cadastro de ponto parceiro**: formulário para novos pontos de coleta. Ao ser cadastrado, o ponto aparece automaticamente na busca.
- **Login (Parceiro e Administrador)**: botão "Entrar como Parceiro" na página inicial leva à tela de login. O acesso é validado no servidor (token JWT) e exigido para ver doações, editar e administrar.
- **Painel de controle (com papéis)**: o conteúdo muda conforme quem acessa — **visitante** (só leitura), **parceiro** (gerencia os itens dos pontos) e **administrador** (doações com identidade, excluir, aprovar patrocinadores e criar contas de parceiro).
- **Persistência de dados**: as informações ficam em um banco de dados **PostgreSQL**, acessado por uma API REST (backend em Node.js + Express + Prisma).
- **Responsividade e acessibilidade**: interface adaptada para telas de celulares e uso de tags HTML semânticas para facilitar a leitura.

### Fluxo de teste sugerido
> Cadastrar um novo ponto -> Conferir se ele aparece na listagem -> Criar uma doação direcionada a esse novo ponto -> Verificar se a doação consta no painel de administração.

---

## Tecnologias utilizadas

**Front-end**
- HTML5
- CSS3 (Flexbox, Grid e variáveis CSS)
- JavaScript puro (vanilla), consumindo a API via `fetch`

**Back-end**
- Node.js + Express (API REST)
- PostgreSQL (banco de dados relacional)
- Prisma ORM (`@prisma/client` + `prisma`) para acesso ao banco e migrações
- Autenticação por token: `jsonwebtoken` (JWT) + `bcryptjs` (hash de senha)
- `dotenv` para as variáveis de ambiente

---

## Como executar o projeto

O projeto agora tem um backend que conversa com o PostgreSQL, então é preciso
prepará-lo antes de abrir no navegador.

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18 ou superior
- [PostgreSQL](https://www.postgresql.org/download/) instalado e em execução

### Passo a passo

1. **Instale as dependências do backend:**
   ```bash
   cd server
   npm install
   ```

2. **Configure o ambiente.** Copie o arquivo de exemplo e ajuste o
   `DATABASE_URL` (usuário/senha do PostgreSQL) e o `JWT_SECRET` (segredo do login):
   ```bash
   # dentro da pasta server
   copy .env.example .env      # Windows (PowerShell: Copy-Item .env.example .env)
   # cp .env.example .env       # Linux/macOS
   ```

3. **Crie o banco, as tabelas e os dados iniciais** com o Prisma. O comando
   abaixo cria o banco (se não existir), aplica as migrações (tabelas) e roda
   o seed automaticamente:
   ```bash
   npx prisma migrate dev
   ```
   O seed cria uma **conta de parceiro padrão** (`parceiro` / `parceiro123`).
   O **administrador** não fica no banco: configure `ADMIN_USUARIO` e
   `ADMIN_SENHA` no `.env` (passo 2) — é o super usuário do sistema.

4. **Inicie o servidor:**
   ```bash
   npm start
   ```

5. **Abra no navegador:** acesse [http://localhost:3000](http://localhost:3000).
   O próprio servidor entrega as páginas e a API — não abra os arquivos `.html`
   diretamente pelo sistema de arquivos.

> Notas úteis:
> - Para restaurar os dados originais de exemplo: `npm run db:reset`
>   (apaga, recria as tabelas e reinsere os dados de teste).
> - Para inspecionar os dados no navegador: `npm run db:studio` (Prisma Studio).
> - Em outra máquina, depois de clonar com as migrações já versionadas, use
>   `npm run db:deploy` seguido de `npm run db:seed`.

---

## Controle de acesso (papéis)

| Recurso | Visitante | Parceiro | Administrador |
| --- | --- | --- | --- |
| Páginas públicas (início, pontos, doar, seja parceiro, seja patrocinador) | ✅ | ✅ | ✅ |
| Painel → Pontos | ✅ ver | ✅ ver + gerenciar itens | ✅ ver + gerenciar + **remover** |
| Painel → Estoque e Encaminhamentos | ✅ ver | ✅ ver | ✅ ver |
| Painel → Patrocinadores | ✅ só aprovados | ✅ só aprovados | ✅ todos + **aprovar/remover** |
| Painel → Doações (com identidade do doador) | ❌ | ❌ | ✅ ver + remover |
| Painel → Contas de parceiro (criar/remover) | ❌ | ❌ | ✅ |

O login devolve um **token JWT** (guardado no navegador via `sessionStorage`). O servidor
**exige o token e o papel correto** — não é apenas um controle visual. O **administrador**
(credenciais no `.env`) é o único que vê quem fez cada doação, exclui registros, aprova
patrocinadores e cria contas de parceiro.

---

## API REST (resumo dos endpoints)

Acesso: **público** (qualquer um), **autenticado** (parceiro ou admin) ou **admin** (só administrador).

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/api/login` | público | Login (admin do `.env` ou parceiro do banco); devolve um token |
| GET | `/api/me` | autenticado | Confirma a sessão atual e o papel |
| GET | `/api/pontos` | público | Lista os pontos de coleta |
| POST | `/api/pontos` | público | Cadastra um novo ponto |
| PATCH | `/api/pontos/:id/pecas` | autenticado | Atualiza os itens que o ponto precisa |
| DELETE | `/api/pontos/:id` | admin | Remove um ponto |
| GET | `/api/estoque` | público | Estoque agregado por ponto |
| GET | `/api/redistribuicoes` | público | Encaminhamentos sugeridos |
| GET | `/api/doacoes` | admin | Lista as doações (contém identidade do doador) |
| POST | `/api/doacoes` | público | Registra uma doação |
| DELETE | `/api/doacoes/:id` | admin | Remove uma doação |
| GET | `/api/patrocinadores/aprovados` | público | Lista só os aprovados (mural) |
| GET | `/api/patrocinadores` | admin | Lista todos (inclui pendentes) |
| POST | `/api/patrocinadores` | público | Cadastra um patrocinador (entra como pendente) |
| DELETE | `/api/patrocinadores/:id` | admin | Remove um patrocinador |
| PATCH | `/api/patrocinadores/:id/aprovar` | admin | Aprova um patrocinador |
| GET | `/api/parceiros` | admin | Lista as contas de parceiro |
| POST | `/api/parceiros` | admin | Cria uma conta de parceiro |
| DELETE | `/api/parceiros/:id` | admin | Remove uma conta de parceiro |

---

## Estrutura de arquivos

```
armario-social/
├── index.html              # Página inicial do projeto
├── pontos.html             # Listagem e busca de locais de coleta
├── doar.html               # Formulário de registro de doações
├── parceiro.html           # Cadastro de novos parceiros
├── patrocinador.html       # Cadastro de patrocinadores/apoiadores
├── login.html              # Tela de login do Parceiro
├── painel.html             # Painel (visão conforme o papel)
├── css/
│   └── estilo.css          # Estilos gerais e responsivos
├── js/
│   ├── auth.js             # Sessão do parceiro (token no sessionStorage)
│   ├── dados.js            # Cliente da API (envia o token; lê/grava via fetch)
│   ├── menu.js             # Menu hambúrguer para dispositivos móveis
│   ├── aviso.js            # Modal de avisos/confirmações
│   ├── login.js            # Tela de login
│   ├── inicio.js           # Botão "Entrar/Sair" na página inicial
│   ├── pontos.js           # Comportamento da busca de pontos de coleta
│   ├── doar.js             # Controle e validação do formulário de doação
│   ├── parceiro.js         # Lógica de cadastro de novos estabelecimentos
│   ├── patrocinador.js     # Cadastro de patrocinadores/apoiadores
│   ├── apoiadores.js       # Mural de apoiadores na página inicial
│   └── painel.js           # Painel ciente de papel (parceiro x comum)
├── img/
│   └── logo.svg            # Logotipo do projeto
├── server/                 # Backend (API REST + Prisma + PostgreSQL)
│   ├── server.js           # Servidor Express (serve o site e a API)
│   ├── prismaClient.js     # Instância única do Prisma Client
│   ├── auth.js             # JWT: assinar token + middleware requireParceiro
│   ├── estoque.js          # Cálculo de estoque/redistribuição (servidor)
│   ├── package.json        # Dependências e scripts do backend
│   ├── .env.example        # Modelo de configuração (DATABASE_URL, JWT_SECRET)
│   ├── prisma/
│   │   ├── schema.prisma   # Modelos/tabelas e conexão do Prisma
│   │   ├── seed.js         # Dados iniciais + conta de parceiro padrão
│   │   └── migrations/     # Histórico de migrações (gerado pelo Prisma)
│   └── routes/             # Rotas (auth, pontos, doacoes, patrocinadores, parceiros, relatorios)
└── README.md
```

---

## Integrantes do grupo

Isaac Conceição Sirtolli, Bruno Viapiana, Robson Caetano Vieira, Juliane Katherine dos Santos, Kauã Dalsotto Corrêa, Ruhan Dalsotto Corrêa e Ana Maria dos Santos.

Análise e Desenvolvimento de Sistemas, UNIFTEC, 2026.
