# 🚗 Ferramenta de Caronas – Guia Completo

## O que é isso?

Um app web que o grupo inteiro acessa pelo celular via link no WhatsApp.  
Cada pessoa vê os carros disponíveis em tempo real, entra numa carona, e é notificada se algo mudar.

---

## ⚡ Configuração rápida (5 minutos, só uma vez)

A ferramenta precisa de um "banco de dados" online gratuito para sincronizar as caronas entre todo o grupo.  
Usaremos o **JSONBin.io** — zero custo, sem cartão, sem complicação.

---

### Passo 1 – Criar conta no JSONBin.io

1. Acesse **https://jsonbin.io**
2. Clique em **Sign Up**
3. Crie conta com e-mail e senha (pode usar Gmail com "Continue with Google")

---

### Passo 2 – Copiar sua API Key

1. Faça login no JSONBin.io
2. No menu, clique em **API Keys**
3. Copie a chave que aparece (**Master Key** — começa com `$2b$10$...`)

---

### Passo 3 – Criar um Bin (armazenamento)

1. No menu, clique em **Bins**
2. Clique em **Create Bin**
3. No campo de conteúdo, cole apenas: `{}`
4. Dê um nome (ex: "caronas-aniversario")
5. Clique em **Create**
6. Copie o **Bin ID** que aparece na URL (ex: `6650abc123def456`)

---

### Passo 4 – Publicar o arquivo online (gratuito)

Para que o grupo todo acesse o link, o arquivo `caronas.html` precisa estar publicado online.

**Opção mais fácil – Netlify Drop:**
1. Acesse **https://app.netlify.com/drop**
2. Arraste o arquivo `caronas.html` para a área indicada
3. Em segundos, você receberá um link como `https://nome-aleatorio.netlify.app`
4. Pronto! Copie esse link e cole no grupo do WhatsApp

> O Netlify Drop é 100% gratuito e não requer conta para uso básico.

---

### Passo 5 – Configurar dentro do app

1. Abra o link gerado no navegador
2. Uma tela de configuração aparecerá automaticamente
3. Cole a **API Key** e o **Bin ID** copiados nos passos anteriores
4. Clique em **Salvar e começar** ✅

> 💡 **Dica:** Você só precisa fazer isso UMA VEZ. Depois de configurado, todos que abrirem o link verão os dados normalmente — sem precisar configurar nada.

---

## 📱 Como usar no dia a dia

### Motoristas

1. Acesse o link no WhatsApp
2. Toque no botão 🚗 (canto inferior direito)
3. Preencha: seu nome, WhatsApp, descrição do carro, ponto de saída, horário e quantidade de vagas
4. Pronto! Seu carro aparece para o grupo

**Editar ou cancelar:** Toque em ✏️ ou 🗑️ no seu card de carro.

---

### Passageiros

1. Acesse o link no WhatsApp
2. Veja os carros disponíveis na aba do trajeto desejado
3. Toque em **🙋 Quero uma vaga** no carro de sua escolha
4. Preencha: nome, WhatsApp e e-mail (opcional)
5. O motorista será notificado automaticamente via WhatsApp

**Sair de um carro:** Toque em **❌ Sair do carro** no seu card.

---

### Compartilhar atualização no WhatsApp

Cada card de carro tem um botão 📤 que gera automaticamente uma mensagem formatada com todos os detalhes da carona.  
Toque nele para abrir o WhatsApp com a mensagem pronta para enviar ao grupo.

---

## 🔔 Notificações

### Como funciona (sem custo, zero configuração extra)

| Situação | Como é notificado |
|---|---|
| Passageiro entra no carro | Motorista recebe notificação automática via WhatsApp |
| Motorista edita o carro | App pergunta se quer notificar passageiros (WhatsApp) |
| Motorista cancela o carro | App pergunta se quer notificar cada passageiro |
| Passageiro é removido | App pergunta se quer notificar via WhatsApp |
| Qualquer mudança no seu carro | Banner vermelho aparece ao reabrir o app |

> As notificações de WhatsApp abrem o WhatsApp Web/App com a mensagem já escrita — o usuário só precisa apertar Enviar.

### Auto-refresh

O app atualiza os dados automaticamente a cada **30 segundos**.  
Para ver imediatamente: recarregue a página.

---

## 🗓️ Viagens disponíveis

| Aba | Direção | Saída padrão | Horário padrão |
|---|---|---|---|
| 🎉 Sex 22/05 – Ida | São Paulo → Mairiporã | R. Martim Buchard 187, Ap 2505 | 15h00 |
| 🚙 Sáb 23/05 – Ida | São Paulo → Mairiporã | Livre (cada carro define) | Livre |
| 🏠 Dom 24/05 – Volta | Mairiporã → São Paulo | Sítio FMB | Livre |

---

## 📍 Informações do trajeto

- **Origem principal:** R. Martim Buchard, 187 – Ap 2505 Atlântico, São Paulo
- **Destino:** Sítio FMB Recanto dos Duendes – Av. Dr. Sérgio Machado Brauner, 2090 – Terra Preta, Mairiporã
- **Distância:** ~53 km via Rodovia Fernão Dias (BR-381)
- **Tempo estimado:** 50 min (sem trânsito) · 1h30–2h30 (sexta à tarde com trânsito)
- **Google Maps:** https://maps.app.goo.gl/caronas-mairipora *(adicione o link correto aqui)*

---

## ❓ Perguntas frequentes

**Preciso criar uma conta para usar?**  
Não. Basta abrir o link. O app identifica você pelo dispositivo automaticamente.

**Os dados somem se a página fechar?**  
Não. Os dados ficam salvos no JSONBin.io e aparecem para todos ao reabrir.

**Posso estar em dois carros ao mesmo tempo?**  
Não — o app impede. Você precisa sair de um carro antes de entrar em outro (por trajeto).

**E se um carro lotar enquanto estou preenchendo o formulário?**  
O app verifica em tempo real antes de confirmar sua entrada e avisa se o carro lotou.

**Posso usar no celular?**  
Sim! O layout é 100% responsivo e otimizado para celular.

**Precisa instalar algum aplicativo?**  
Não. Funciona direto no navegador do celular (Chrome, Safari, etc.).

---

## 🛠️ Suporte

Em caso de problemas, entre em contato com o organizador do grupo.  
O arquivo `caronas.html` pode ser aberto em qualquer editor de texto para ajustes.

---

*Ferramenta criada especialmente para o Aniversário em Mairiporã · Maio 2025 🎉*
