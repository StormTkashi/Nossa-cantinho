# Site Nenem / Para Ela 💕

Estrutura limpa, leve e moderna para o site em **HTML, CSS e TypeScript**, inspirada no projeto original, mas completamente livre de amarras e dependências complexas do Lovable (sem Nitro, sem TanStack Start, sem telemetria ou configurações fechadas).

---

## 📁 Estrutura de Pastas

```text
Site nenem/
├── index.html               # Página principal (lista de desejos, métricas, abas e modais)
├── entrar.html              # Página de login/acesso
├── package.json             # Dependências leves (Vite, TypeScript, Lucide)
├── tsconfig.json            # Configurações do TypeScript
├── vite.config.ts           # Configuração de build do Vite (multi-page)
├── .gitignore               # Arquivos ignorados pelo Git
├── README.md                # Este documento
├── assets/                  # Arquivos estáticos e mídia
│   ├── images/
│   │   └── home-care.jpg    # Banner fotográfico original
│   └── favicon.ico          # Ícone da aba
├── css/                     # Estilos organizados e modulares
│   ├── reset.css            # Reset moderno de CSS
│   ├── variables.css        # Cores (tons de rosa e neutros), fontes e sombras
│   └── style.css            # Estilos dos componentes, cards, modais e responsividade
└── src/                     # Código TypeScript
    ├── types.ts             # Tipos do item (nome, valor, status, prioridade)
    ├── storage.ts           # Persistência no localStorage do navegador
    ├── auth.ts              # Gerenciador de sessão simples
    ├── entrar.ts            # Lógica da tela de login
    └── main.ts              # Lógica principal (busca, abas, filtros, modal e fotos)
```

---

## 🚀 Como Executar

### 1. Iniciar em Modo de Desenvolvimento (Live Reload)
Para editar o código com atualização instantânea na tela:
```bash
npm run dev
```
O terminal exibirá um link local (por exemplo: `http://localhost:5173`). Abra no seu navegador.

### 2. Gerar a Versão Final para Publicação (Build)
Para compilar o HTML, CSS e JavaScript otimizados:
```bash
npm run build
```
Os arquivos prontos serão gerados na pasta `dist/`.

---

## ✨ Funcionalidades Incluídas

- **Persistência Real no Navegador (`localStorage`)**: Ao adicionar, editar ou marcar itens como realizados, tudo continua salvo mesmo ao recarregar ou fechar a página.
- **Upload de Fotos**: Pré-visualização imediata da foto do item (em JPG, PNG ou WebP).
- **Abas Dinâmicas**: Alternância suave entre *"Quero"*, *"Tô precisando"* e *"Realizado"*, com contadores em tempo real.
- **Filtros e Busca**: Campo de pesquisa rápida e filtro por prioridade (*Todas*, *Não tenho*, *Acabando*).
- **Cálculo de Totais**: Soma automática dos valores em R$ e contagem dos itens a realizar vs. já realizados.
- **Autenticação Real via Supabase**: Login por Email/Senha, Cadastro de novos usuários e suporte a Google OAuth.
- **Design Responsivo**: Adaptado para celulares, tablets e computadores.

---

## ⚡ Conectando o Supabase

1. Crie uma conta ou projeto gratuito em [supabase.com](https://supabase.com).
2. No painel do Supabase, acesse **Project Settings > API**.
3. Abra o arquivo `.env` na raiz deste projeto e preencha:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica-aqui
   ```
4. Reinicie o servidor de desenvolvimento (`npm run dev`) e a autenticação estará ativa em nuvem!


