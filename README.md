# Sudoeste Tech: site de vagas de TI

Site que reúne as vagas de TI de Francisco Beltrão, Pato Branco e região divulgadas pela
[@sudoestetechpr](https://www.instagram.com/sudoestetechpr/). É o link da bio do Instagram.

As vagas vêm de uma **planilha do Google Sheets**. Para adicionar ou encerrar uma vaga você só
edita a planilha (dá para fazer pelo celular). Não precisa mexer em código.

## Como funciona

```
Google Sheets  --(publicada na web como CSV)-->  site no Cloudflare Pages
 (você edita)                                    (https://sudoestetech.com.br;
                                                  o navegador de quem visita
                                                  baixa o CSV e monta a página)
```

- **Grátis:** Cloudflare Pages e Google Sheets não cobram (só o domínio no Registro.br é pago, por ano). Não tem servidor, banco de dados nem login.
- **Sem build:** é HTML, CSS e JavaScript puro. O que está no repositório é exatamente o que vai para o ar.
- **Sem cookies e sem rastreadores:** a fonte Montserrat está dentro do próprio site (pasta `fontes/`),
  então nem o Google Fonts é chamado. Além da planilha, o site só chama o contador anônimo GoatCounter (sem cookies, seção 7).

> **Atenção: a planilha publicada é pública.** Qualquer pessoa com o link do CSV consegue ler tudo
> o que está nela, inclusive colunas que o site não mostra. Nunca coloque na planilha dados pessoais,
> telefone ou e-mail pessoal de recrutador, nem anotações internas.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | Página inicial: lista de vagas, filtros e busca |
| `vaga.html` | Página de uma vaga. O link fica `vaga.html?id=identificador-da-vaga` |
| `js/config.js` | **O único arquivo que você precisa editar:** link da planilha e contatos |
| `js/planilha.js` | Lê o CSV e aplica as regras (quais vagas aparecem, ordem, selo "Nova") |
| `js/lista.js` | Monta a lista, os filtros e a busca |
| `js/vaga.js` | Monta a página de uma vaga e os botões |
| `js/contador.js` | Contador anônimo de visitas e cliques em "se candidatar" (GoatCounter, seção 7) |
| `js/redirecionar.js` | Manda quem abre o endereço antigo do GitHub para sudoestetech.com.br (seção 5.7) |
| `css/estilo.css` | Visual do site (cores, tamanhos, versão para celular e computador) |
| `img/` | Logo, favicon e `previa.png` (imagem que aparece ao compartilhar o link) |
| `fontes/` | Fonte Montserrat (licença livre OFL, em `LICENSE-OFL.txt`) |
| `modelo-vagas.csv` | Planilha modelo com as colunas e as vagas atuais, para importar no Google Sheets |

---

## 1. Criar a planilha

1. Abra o [Google Sheets](https://sheets.google.com) e crie uma planilha em branco. Dê um nome, por exemplo "Vagas Sudoeste Tech".
2. **Arquivo > Configurações > Localidade: Brasil.** Isso é importante: com outra localidade o Google
   pode trocar as datas para o formato americano (mm/dd) e o site entende errado.
3. **Arquivo > Importar > Fazer upload** e escolha o `modelo-vagas.csv`.
   Em "Local de importação", escolha **Substituir planilha**. Em "Converter texto em números, datas e fórmulas", **desmarque**.
4. Confira se a primeira linha tem os nomes das colunas e se as vagas vieram certinhas.
5. Preencha o `link_candidatura` de cada vaga (o link oficial). Sem ele, o botão "Ver vaga e se candidatar" não aparece.

Dica: no celular, instale o app **Planilhas Google**. Para editar uma célula com texto longo, toque nela e use a barra de edição em cima.

### As colunas

A ordem das colunas pode mudar, mas **os nomes da primeira linha precisam ser exatamente estes**
(o site ignora maiúsculas e acentos no cabeçalho).

| Coluna | O que colocar | Exemplo |
|---|---|---|
| `id` | Identificador do link da vaga: minúsculas, sem acento, com hífens. **Não mude depois de divulgar**, senão o link antigo para de funcionar. Se ficar vazio, o site cria um a partir do cargo e da empresa | `viasoft-analista-ti-cloud-jr` |
| `status` | `Aberta`, `Pendente` ou `Encerrada`. Só `Aberta` aparece no site. Se o Apps Script do formulário estiver instalado, a linha muda sozinha de aba: `Aberta` fica em "vagas" (a única publicada), `Pendente` vai para "pendentes" e `Encerrada` vai para "encerradas" | `Aberta` |
| `tipo` | `Estágio` ou `Efetivo` (usado no filtro) | `Efetivo` |
| `cargo` | Nome da vaga. **Obrigatório**: linha sem cargo não aparece | `Analista de TI Cloud Jr.` |
| `empresa` | Nome da empresa (ou "via CIUNEM" quando é intermediada) | `Viasoft` |
| `cidade` | Só o nome da cidade. Escreva sempre igual, porque o filtro usa este texto | `Pato Branco` |
| `contrato` | CLT, PJ, Estágio não obrigatório... | `CLT` |
| `modalidade` | Presencial, Híbrido ou Remoto | `Presencial` |
| `pcd` | `Sim` mostra o chip "Também para PcD". `Não` ou vazio não mostra nada | `Sim` |
| `etiquetas` | Chips extras, separados por `;` | `ADS;Período integral` |
| `salario` | Texto livre, aparece em amarelo | `Bolsa de R$ 950/mês + R$ 50 de auxílio-transporte` |
| `observacao` | Texto curto abaixo do salário | `1 vaga aberta.` |
| `atividades` | Itens separados por `;`. Viram tópicos em "O que você vai fazer" | `Suporte a usuários;Instalação de programas` |
| `requisitos` | Itens separados por `;`. Viram tópicos em "Quem pode se candidatar" | `Cursando ADS;Inglês básico` |
| `beneficios` | Itens separados por `;`. Viram tópicos em "Benefícios" | `VA;VT;Plano de saúde` |
| `como_se_candidatar` | Passos separados por `;`. Viram passos numerados | `Cadastre-se no site;Envie o currículo` |
| `link_candidatura` | Link oficial da vaga (começa com `https://`). O site tira sozinho os códigos de rastreamento que vêm junto ao copiar do Instagram ou Facebook (`fbclid`, `utm_...`) | `https://empresa.gupy.io/jobs/123` |
| `prazo` | Último dia de inscrição, `dd/mm/aaaa`. A vaga some sozinha no dia seguinte | `06/12/2026` |
| `fonte` | De onde veio a vaga | `Vagas da Viasoft (Gupy)` |
| `publicada_em` | Quando a empresa publicou, `dd/mm/aaaa` | `07/10/2026` |
| `adicionada_em` | Quando **você** colocou no site, `dd/mm/aaaa`. Define a ordem e o selo "Nova" | `21/11/2026` |
| `conferida_em` | Última vez que você conferiu na fonte, `dd/mm/aaaa` | `20/11/2026` |

**Campo vazio:** a parte correspondente simplesmente não aparece no site.

**Regras do site:**
- Aparecem só vagas com `status` = Aberta **e** com o `prazo` vazio ou ainda não vencido.
- Ordem: `adicionada_em` mais recente primeiro. No mesmo dia, a linha mais embaixo na planilha vem antes.
- Selo **Nova**: nos 7 primeiros dias depois de `adicionada_em` (dá para mudar em `DIAS_NOVA` no `js/config.js`).
- Linha amarela do card: o `salario`. Se estiver vazio, mostra "Inscrições até" com o `prazo`.
- "Atualizado em", no topo, é o `conferida_em` mais recente entre as vagas abertas.
- Se você usar `;` dentro de um item, ele vai ser dividido em dois. Use vírgula dentro dos itens.

## 2. Adicionar uma vaga

1. Abra a planilha (pelo app no celular ou pelo computador).
2. Vá até a **primeira linha vazia no fim** e preencha as colunas. No mínimo: `id`, `status` = Aberta, `tipo`, `cargo`, `cidade`, `adicionada_em` e `link_candidatura`.
3. Pronto. Em alguns minutos ela aparece no site (veja "Quanto tempo demora", abaixo).
4. O link para divulgar a vaga é `ENDEREÇO-DO-SITE/vaga.html?id=` + o `id` que você escreveu.
   Também dá para abrir a vaga no site e copiar o link do navegador.

## 3. Encerrar uma vaga

Escolha um dos jeitos:
- Mude o `status` para **Encerrada**. A vaga sai do site e a linha fica guardada na planilha como histórico. (Recomendado.)
- Ou deixe o `prazo` fazer isso: no dia seguinte ao prazo ela some sozinha.
- Ou apague a linha.

Quem abrir o link de uma vaga encerrada vê a mensagem "Esta vaga foi encerrada" e um link para as outras vagas.

## 4. Publicar a planilha como CSV

1. Na planilha, no computador: **Arquivo > Compartilhar > Publicar na Web**.
2. Em "Link", escolha a **aba das vagas** (não "Documento inteiro") e o formato **Valores separados por vírgula (.csv)**.
3. Clique em **Publicar** e confirme. Copie o link: ele termina com `output=csv`.
4. Em "Conteúdo publicado e configurações", deixe marcado **"Republicar automaticamente quando houver alterações"**.
5. Cole o link no `js/config.js`, entre as aspas de `URL_PLANILHA`:
   ```js
   URL_PLANILHA: "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=0&single=true&output=csv",
   ```
   No GitHub, dá para editar pelo navegador: abra o arquivo, clique no lápis (Edit), cole, e clique em **Commit changes**.

Enquanto `URL_PLANILHA` estiver vazio, o site mostra as vagas do `modelo-vagas.csv` do repositório.

**Quanto tempo demora:** o Google atualiza o CSV publicado em até uns 5 minutos depois da sua edição.
Se a vaga não apareceu, espere um pouco e recarregue a página.

**A planilha publicada é pública** (veja o aviso no começo). Lembre que "Publicar na Web" é
diferente de "Compartilhar": ninguém consegue **editar** a planilha, só ler o CSV.

## 5. Colocar o site no ar (conta do GitHub da página)

O site deve ficar na conta do GitHub da Sudoeste Tech, não na sua pessoal. O GitHub Pages grátis
exige que o repositório seja **público**.

### 5.1 Criar a conta da página

1. Saia da sua conta pessoal (ou use uma janela anônima) e crie uma conta em [github.com/signup](https://github.com/signup)
   com o e-mail **sudoestevagaspr@gmail.com**.
2. Escolha o nome de usuário com cuidado: ele vai aparecer no endereço do site. Ex.: `sudoestetechpr`.

### 5.2 Criar o repositório e enviar os arquivos

O jeito mais simples, sem linha de comando, e que não leva o histórico da conta pessoal:

1. Na sua conta pessoal, abra este repositório, clique em **Code > Download ZIP** e descompacte.
2. Na conta da página, clique em **New repository**.
   - Nome: se você usar exatamente `NOMEDEUSUARIO.github.io` (ex.: `sudoestetechpr.github.io`),
     o site fica em `https://sudoestetechpr.github.io/`. Com outro nome (ex.: `vagas`), fica em
     `https://sudoestetechpr.github.io/vagas/`.
   - Marque **Public**. Não marque "Add a README".
3. Na página do repositório novo, clique em **uploading an existing file** e arraste **o conteúdo** da pasta
   descompactada (os arquivos e as pastas `css`, `js`, `img`, `fontes`, não a pasta de fora).
   O arquivo `.nojekyll` é oculto: se ele não for, tudo bem, o site funciona sem ele.
4. Clique em **Commit changes**.

Se preferir o terminal (dentro da pasta do projeto):
```bash
git remote add pagina https://github.com/NOMEDEUSUARIO/NOMEDOREPOSITORIO.git
git push pagina HEAD:main
```
Os commits deste projeto já estão com o nome "Sudoeste Tech" e o e-mail da página
(configurado com `git config user.name` e `git config user.email` só neste repositório).

### 5.3 Ligar o GitHub Pages

1. No repositório da página: **Settings > Pages**.
2. Em "Build and deployment", **Source: Deploy from a branch**, **Branch: main**, pasta **/ (root)**. Salve.
3. Espere 1 ou 2 minutos e recarregue: o endereço do site aparece no topo dessa tela.

### 5.4 Ajustar o endereço da prévia do WhatsApp

Nos arquivos `index.html` e `vaga.html`, o `og:url` e o `og:image` usam o endereço completo do site,
terminando com `/`. Hoje é o domínio próprio:
```html
<meta property="og:url" content="https://sudoestetech.com.br/">
<meta property="og:image" content="https://sudoestetech.com.br/img/previa.png">
```
Se o endereço do site mudar, troque nos dois arquivos.
O WhatsApp só mostra a imagem se o endereço estiver completo.

**Limite da prévia:** o WhatsApp não roda JavaScript ao montar a prévia, então todo link do site
(inclusive o de uma vaga) mostra o mesmo título, descrição e imagem. O botão "Compartilhar no WhatsApp"
da página da vaga já escreve o cargo, a empresa e o link da vaga na mensagem. O WhatsApp também guarda
a prévia por um tempo: se você mudar a imagem, pode demorar para atualizar.

### 5.5 Colocar na bio

Copie o endereço do site (`https://sudoestetech.com.br`) e coloque na bio do Instagram (ou dentro do conectai.bio).

### 5.6 Domínio próprio no Cloudflare Pages

Desde novembro de 2026 o site fica no **Cloudflare Pages** (grátis), no domínio **sudoestetech.com.br**
comprado no Registro.br. O endereço antigo do GitHub manda as visitas para o domínio novo (seção 5.7).

- **Conta:** Cloudflare com o e-mail da página. Projeto Pages: `sudoestetech`
  (endereço reserva: `https://sudoestetech.pages.dev`).
- **Publicação automática:** o projeto está ligado à branch `main` deste repositório, sem comando de
  build e com a pasta `/`. Cada mudança na `main` vai para o ar sozinha em cerca de 1 minuto.
- **DNS:** no Registro.br, os servidores DNS do domínio são os do Cloudflare
  (`agustin.ns.cloudflare.com` e `amber.ns.cloudflare.com`). Os registros DNS são editados no painel
  do Cloudflare, não no Registro.br.
- **E-mail:** o domínio não recebe nem envia e-mail (registros `MX .`, `v=spf1 -all` e DMARC `reject`
  vêm do Registro.br e foram mantidos). Isso evita que alguém mande e-mail falso em nome do domínio.
- **Renovação:** o domínio `.com.br` é pago por ano no Registro.br. Se não renovar, o site sai do ar
  nesse endereço (o `sudoestetech.pages.dev` continua funcionando).

### 5.7 Endereço antigo do GitHub

O GitHub Pages continua ligado, mas quem abre `https://sudoestevagaspr-cloud.github.io` é mandado
na hora para `https://sudoestetech.com.br`, na mesma página (inclusive o link de uma vaga). Quem faz isso
é o `js/redirecionar.js`, carregado no começo do `index.html` e do `vaga.html`. Como o redirecionamento
acontece antes do contador, as visitas no endereço antigo não são contadas duas vezes.

Para desligar o endereço antigo de vez: no repositório, **Settings > Pages**, em Source escolha **None**.
Aí os links antigos param de funcionar (dão erro 404).

## 6. Testar no seu computador

O site precisa ser aberto por um servidor (abrir o `index.html` com dois cliques não carrega a planilha).
Com Python instalado, dentro da pasta do projeto:

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`. Para ver como fica no celular, use o modo de dispositivo do navegador
(F12 e depois o ícone de celular, ou Ctrl+Shift+M).

## 7. Contador de visitas e de cliques (GoatCounter)

O site pode contar, de forma anônima, quantas vezes cada página foi vista e quantas vezes o botão
**"Ver vaga e se candidatar"** de cada vaga foi clicado. Quem faz isso é o
[GoatCounter](https://www.goatcounter.com), grátis para sites sem fins lucrativos.

**O que ele mostra:** números. Ex.: "a vaga Estágio em TI · CIUNEM teve 40 visitas e 12 cliques em
se candidatar". **O que ele não mostra:** quem clicou. Ele não usa cookies, não guarda IP, nome nem
qualquer dado que identifique a pessoa. Isso é de propósito: é o que deixa o site dentro da LGPD sem
precisar de aviso de cookies.

### 7.1 Criar a conta (uma vez)

A conta já existe: o painel fica em <https://sudoestetech.goatcounter.com> (login com o e-mail da página).
Se um dia precisar criar outra:

1. Entre em <https://www.goatcounter.com/signup> com o e-mail da página.
2. Em **Code**, escolha o código do site, por exemplo `sudoestetech`. O painel vai ficar em
   `https://sudoestetech.goatcounter.com`.
3. Termine o cadastro e confirme o e-mail.

### 7.2 Ligar no site

Em `js/config.js`, coloque o código entre as aspas:
```js
GOATCOUNTER: "sudoestetech",
```
Deixando vazio (`""`), o contador fica desligado e o site não chama nada do GoatCounter.

### 7.3 Ler os números

No painel do GoatCounter:
- `/` é a página inicial.
- `/vaga/identificador-da-vaga` são as visitas de cada vaga (o título mostra cargo e empresa).
- `/vaga/encerrada` conta quem abriu um link de vaga que já saiu do ar.
- Em **Events**, `candidatar/identificador-da-vaga` são os cliques no botão de candidatura.

Dica: cliques divididos por visitas da vaga mostram quanto a vaga interessou.

### 7.4 Não contar as suas próprias visitas

Você abre o site muitas vezes para conferir as vagas, e isso entraria na contagem. Para o seu navegador
parar de contar, abra uma vez o endereço do site com `#toggle-goatcounter` no final, por exemplo
`https://sudoestetech.com.br/#toggle-goatcounter`. Aparece um aviso dizendo que a contagem
foi desligada (`DISABLED`) neste navegador. Faça isso em cada navegador e celular que você usa e em cada
endereço do site (o do GitHub e o `sudoestetech.com.br` contam separado). Abrir o mesmo endereço de novo
liga a contagem outra vez (`ENABLED`).

Os números são uma estimativa: bloqueadores de anúncio podem impedir a contagem, e visitas feitas no
seu computador pelo `localhost` não contam. O link de candidatura continua o mesmo, sem códigos de
rastreamento: a contagem acontece no site, não no link.

## Privacidade (LGPD)

- O site não tem formulário próprio, não recebe currículo e não coleta nenhum dado de quem visita.
- Os links "Tem vaga? Envie aqui" e "Enviar vaga" levam ao formulário do Google Forms para empresas. As respostas ficam na conta Google da página: peça só dados da vaga e um contato da empresa, nunca dados de candidatos.
- Para trocar o link do formulário, procure por `docs.google.com/forms` no `index.html` e no `vaga.html`.
- Sem cookies, sem Google Analytics, sem pixel. A fonte é servida pelo próprio site.
- O contador (GoatCounter, seção 7) só conta números de visitas e cliques. Não usa cookies e não guarda nada que identifique quem visita.
- Não usamos logo de empresas nem contato pessoal de recrutadores: só o link e o contato oficiais da vaga.
- Todo texto da planilha entra na página como texto, nunca como código. Links de candidatura só são aceitos se começarem com `http://` ou `https://`.
