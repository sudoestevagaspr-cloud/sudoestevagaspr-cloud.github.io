// Lê a planilha (CSV), transforma cada linha numa vaga e aplica as regras:
// quais vagas aparecem, em que ordem, quando são "Nova".
// Também tem funções pequenas usadas pelas duas páginas (lista e vaga).

// ---------------------------------------------------------------
// 1. Leitor de CSV
// ---------------------------------------------------------------
// Um CSV não é só "separar por vírgula": um campo pode ter vírgula,
// quebra de linha ou aspas dentro, e aí ele vem entre aspas ("...").
// Aspas dentro de um campo aparecem dobradas (""). Este leitor anda
// caractere por caractere e trata esses casos.
function lerCSV(texto) {
  var linhas = [];
  var linha = [];
  var campo = "";
  var entreAspas = false;

  if (texto.charCodeAt(0) === 0xFEFF) texto = texto.slice(1); // remove BOM

  for (var i = 0; i < texto.length; i++) {
    var c = texto[i];

    if (entreAspas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; } // "" vira "
        else entreAspas = false;
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') entreAspas = true;
    else if (c === ",") { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo); campo = "";
      linhas.push(linha); linha = [];
    } else {
      campo += c;
    }
  }
  if (campo !== "" || linha.length) { linha.push(campo); linhas.push(linha); }

  return linhas;
}

// Transforma as linhas em objetos usando a primeira linha (cabeçalho) como nomes.
// Ex.: { cargo: "Assistente de Suporte", empresa: "Megasult", ... }
function linhasParaObjetos(linhas) {
  if (!linhas.length) return [];
  var nomes = linhas[0].map(function (n) {
    return semAcento(n).trim().toLowerCase().replace(/\s+/g, "_");
  });
  return linhas.slice(1).map(function (valores, indice) {
    var obj = { _linha: indice };
    nomes.forEach(function (nome, j) { obj[nome] = (valores[j] || "").trim(); });
    return obj;
  });
}

// ---------------------------------------------------------------
// 2. Ajudantes de texto e data
// ---------------------------------------------------------------
function semAcento(texto) {
  return String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Para comparar textos sem ligar para acento e maiúsculas: "Estágio" == "estagio".
function normalizar(texto) {
  return semAcento(texto).toLowerCase().trim();
}

// "Configuração;Suporte; ;Banco" -> ["Configuração", "Suporte", "Banco"]
function itens(texto) {
  return String(texto || "").split(";").map(function (t) { return t.trim(); }).filter(Boolean);
}

// "dd/mm/aaaa" -> Date (meia-noite, horário local). Retorna null se inválida.
function lerData(texto) {
  var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(texto || "").trim());
  if (!m) return null;
  var d = new Date(+m[3], +m[2] - 1, +m[1]);
  if (d.getMonth() !== +m[2] - 1) return null; // ex.: 31/02
  return d;
}

function hoje() {
  var d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function doisDigitos(n) { return (n < 10 ? "0" : "") + n; }

function dataCurta(d) { return doisDigitos(d.getDate()) + "/" + doisDigitos(d.getMonth() + 1); }

function dataCompleta(d) { return dataCurta(d) + "/" + d.getFullYear(); }

// "Analista de TI Cloud Jr." + "Viasoft" -> "analista-de-ti-cloud-jr-viasoft"
function criarId(texto) {
  return normalizar(texto).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Só aceita links http/https, para ninguém colocar "javascript:" na planilha.
function linkSeguro(url) {
  url = String(url || "").trim();
  if (!url) return "";
  if (/^www\./i.test(url)) url = "https://" + url;
  try {
    var u = new URL(url);
    return (u.protocol === "https:" || u.protocol === "http:") ? u.href : "";
  } catch (e) {
    return "";
  }
}

// ---------------------------------------------------------------
// 3. Regras das vagas
// ---------------------------------------------------------------
function prepararVaga(bruta) {
  var v = bruta;
  v.id = criarId(v.id) || criarId(v.cargo + " " + v.empresa);
  v.dataPrazo = lerData(v.prazo);
  v.dataAdicionada = lerData(v.adicionada_em);
  v.dataConferida = lerData(v.conferida_em);
  v.dataPublicada = lerData(v.publicada_em);
  v.link = linkSeguro(v.link_candidatura);
  v.ehPcd = ["sim", "s", "yes"].indexOf(normalizar(v.pcd)) !== -1;
  return v;
}

// Vaga aparece se: tem cargo, status é "Aberta" e o prazo não passou.
// O prazo vale até o fim do dia: com prazo 06/12, a vaga some em 07/12.
function estaAberta(v) {
  if (!v.cargo) return false;
  if (normalizar(v.status) !== "aberta") return false;
  if (v.dataPrazo && v.dataPrazo < hoje()) return false;
  return true;
}

function ehNova(v) {
  if (!v.dataAdicionada) return false;
  var dias = (hoje() - v.dataAdicionada) / 86400000;
  return dias >= 0 && dias < CONFIG.DIAS_NOVA;
}

// Mais recentes primeiro (adicionada_em). No mesmo dia, quem está
// mais embaixo na planilha (cadastrada depois) vem antes.
function ordenar(vagas) {
  return vagas.slice().sort(function (a, b) {
    var da = a.dataAdicionada ? a.dataAdicionada.getTime() : 0;
    var db = b.dataAdicionada ? b.dataAdicionada.getTime() : 0;
    if (db !== da) return db - da;
    return b._linha - a._linha;
  });
}

// Busca a planilha e devolve TODAS as vagas preparadas (abertas e encerradas).
function carregarVagas() {
  var url = CONFIG.URL_PLANILHA || "modelo-vagas.csv";
  return fetch(url, { cache: "no-store" })
    .then(function (resposta) {
      if (!resposta.ok) throw new Error("Planilha respondeu " + resposta.status);
      return resposta.text();
    })
    .then(function (texto) {
      // Se o link não for de CSV (ex.: página de login do Google), avisa como erro.
      if (/^\s*<(!doctype|html)/i.test(texto)) throw new Error("O link não devolveu um CSV");
      var vagas = linhasParaObjetos(lerCSV(texto)).map(prepararVaga);
      if (vagas.length && !("cargo" in vagas[0])) throw new Error("A planilha não tem a coluna cargo");
      return vagas;
    });
}

// ---------------------------------------------------------------
// 4. Montagem de HTML com segurança
// ---------------------------------------------------------------
// Todo texto da planilha entra como texto (textContent), nunca como HTML.
// Assim, se alguém escrever <script> numa célula, aparece como texto.
function el(tag, classe, texto) {
  var e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined && texto !== null) e.textContent = texto;
  return e;
}

// Ícones (desenhados aqui, sem depender de biblioteca externa).
var ICONES = {
  local: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  seta: '<path d="m9 6 6 6-6 6"/>',
  externo: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  voltar: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
  compartilhar: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4"/><path d="m15.4 6.5-6.8 4"/>'
};

function icone(nome) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "icone");
  svg.innerHTML = ICONES[nome]; // conteúdo fixo deste arquivo, não vem da planilha
  return svg;
}

// Chips: cidade, contrato, modalidade, PcD e etiquetas.
function chips(v) {
  var lista = el("ul", "chips");
  lista.setAttribute("aria-label", "Detalhes da vaga");
  function chip(texto, comIcone) {
    if (!texto) return;
    var li = el("li", "chip");
    if (comIcone) li.appendChild(icone("local"));
    li.appendChild(document.createTextNode(texto));
    lista.appendChild(li);
  }
  chip(v.cidade, true);
  chip(v.contrato);
  chip(v.modalidade);
  if (v.ehPcd) chip("Também para PcD");
  itens(v.etiquetas).forEach(function (t) { chip(t); });
  return lista.children.length ? lista : null;
}

// Linha em amarelo: o salário; se não houver, o prazo.
function destaque(v) {
  if (v.salario) return el("p", "destaque", v.salario);
  if (v.dataPrazo) return el("p", "destaque", "Inscrições até " + dataCompleta(v.dataPrazo));
  return null;
}

// Prazo em linha própria quando o salário já ocupou o destaque.
function linhaPrazo(v) {
  if (v.salario && v.dataPrazo) return el("p", "prazo", "Inscrições até " + dataCompleta(v.dataPrazo));
  return null;
}

function selo(v) {
  return ehNova(v) ? el("span", "selo-nova", "Nova") : null;
}

function anexar(pai) {
  for (var i = 1; i < arguments.length; i++) {
    if (arguments[i]) pai.appendChild(arguments[i]);
  }
  return pai;
}

// Bloco de aviso (sem vagas / erro), sempre com link para o Instagram.
function aviso(titulo, texto) {
  var caixa = el("div", "aviso");
  caixa.setAttribute("role", "status");
  caixa.appendChild(el("h2", null, titulo));
  caixa.appendChild(el("p", null, texto));
  var p = el("p");
  var a = el("a", "link-seta", "Ver as vagas no Instagram");
  a.href = CONFIG.INSTAGRAM;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.appendChild(icone("externo"));
  p.appendChild(a);
  caixa.appendChild(p);
  return caixa;
}
