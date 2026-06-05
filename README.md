# Armário Social

Plataforma web que conecta doadores de roupas de inverno a pessoas em situação de vulnerabilidade, centralizando e organizando os pontos de coleta e distribuição.

Protótipo front-end desenvolvido como Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas da UNIFTEC (2026).

---

## Problema que resolve

Atualmente, as doações de roupas enfrentam problemas de organização: muitas vezes quem quer doar não sabe onde entregar, e quem precisa não sabe onde buscar. O Armário Social reúne em um só lugar os estabelecimentos parceiros que funcionam como pontos de coleta físicos. Isso permite que qualquer pessoa localize esses pontos, verifique quais itens são aceitos e registre as doações.

### Atores do sistema
- **Doador**: encontra pontos de coleta e registra a intenção de doar.
- **Estabelecimento parceiro**: cadastra-se como ponto de coleta e pode registrar doações presenciais para pessoas sem acesso à internet.
- **Administrador**: gerencia os pontos cadastrados e as doações registradas (visão simplificada para demonstração).

---

## Funcionalidades

- **Página inicial**: apresentação da proposta do projeto com um guia simples de como doar em 3 passos.
- **Pontos de coleta**: exibição dos pontos cadastrados em formato de cartões, com busca por cidade ou bairro. Já vem populado com 8 pontos de teste localizados em cidades do Rio Grande do Sul (São Leopoldo, Novo Hamburgo, Caxias do Sul e Porto Alegre).
- **Cadastro de doação**: formulário que permite selecionar o local de entrega, os tipos de vestuário, quantidades e observações.
- **Cadastro de ponto parceiro**: formulário para novos pontos de coleta. Ao ser cadastrado, o ponto aparece automaticamente na busca.
- **Painel de controle**: tela simples para gerenciar ou remover doações e pontos parceiros cadastrados.
- **Persistência de dados**: uso de localStorage para manter as informações salvas diretamente no navegador.
- **Responsividade e acessibilidade**: interface adaptada para telas de celulares e uso de tags HTML semânticas para facilitar a leitura.

### Fluxo de teste sugerido
> Cadastrar um novo ponto -> Conferir se ele aparece na listagem -> Criar uma doação direcionada a esse novo ponto -> Verificar se a doação consta no painel de administração.

---

## Tecnologias utilizadas

- HTML5
- CSS3 (Flexbox, Grid e variáveis CSS)
- JavaScript puro (vanilla, sem frameworks ou bibliotecas externas)
- localStorage para armazenamento local de dados

---

## Como executar o projeto

Não é necessário rodar servidores ou compilar código. Para visualizar o projeto:

1. Baixe ou clone os arquivos deste repositório.
2. Abra o arquivo `index.html` diretamente no seu navegador de preferência.
3. Utilize o menu de navegação superior para navegar pelas páginas.

> Nota: para restaurar os dados originais de exemplo, basta limpar o localStorage do navegador ou abrir o projeto em uma aba anônima.

---

## Estrutura de arquivos

```
armario-social/
├── index.html          # Página inicial do projeto
├── pontos.html         # Listagem e busca de locais de coleta
├── doar.html           # Formulário de registro de doações
├── parceiro.html       # Cadastro de novos parceiros
├── painel.html         # Painel administrativo simples
├── css/
│   └── estilo.css      # Estilos gerais e responsivos
├── js/
│   ├── dados.js        # Configuração inicial de dados e local storage
│   ├── menu.js         # Menu hambúrguer para dispositivos móveis
│   ├── pontos.js       # Comportamento da busca de pontos de coleta
│   ├── doar.js         # Controle e validação do formulário de doação
│   ├── parceiro.js     # Lógica de cadastro de novos estabelecimentos
│   └── painel.js       # Controle de exclusão e exibição no painel
├── img/
│   └── logo.svg        # Logotipo do projeto
└── README.md
```

---

## Integrantes do grupo

Isaac Conceição Sirtolli, Bruno Viapiana, Robson Caetano Vieira, Juliane Katherine dos Santos, Kauã Dalsotto Corrêa, Ruhan Dalsotto Corrêa e Ana Maria dos Santos.

Análise e Desenvolvimento de Sistemas, UNIFTEC, 2026.
