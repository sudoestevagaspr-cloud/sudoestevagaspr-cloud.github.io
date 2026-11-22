// Página inicial: lista de vagas abertas, filtro por tipo e cidade (ou remota),
// ordenação e busca.

(function () {
  contar({ path: "/", title: "Página inicial" });

  var areaLista = document.getElementById("lista");
  var resumo = document.getElementById("resumo");
  var contagemFiltro = document.getElementById("contagem-filtro");
  var campoBusca = document.getElementById("busca");
  var campoCidade = document.getElementById("cidade");
  var campoOrdem = document.getElementById("ordem");
  var botoesTipo = document.querySelectorAll(".tipos button");

  var abertas = [];
  var filtro = { tipo: "", cidade: "", texto: "" };
  var ordem = "recentes"; // valores do seletor #ordem: recentes, prazo, az, za

  // ---------- Card de uma vaga ----------
  function card(v) {
    var link = "vaga.html?id=" + encodeURIComponent(v.id);
    var art = el("article", "cartao");

    var cabeca = el("div", "cartao-cabeca");
    anexar(cabeca, el("span", "tipo", v.tipo), selo(v));

    var titulo = el("div", "titulo-bloco");
    var h2 = el("h2");
    var a = el("a", null, v.cargo);
    a.href = link;
    h2.appendChild(a);
    anexar(titulo, h2, v.empresa ? el("span", "empresa", v.empresa) : null);

    var pe = el("div", "cartao-pe");
    pe.appendChild(el("span", "conferida", v.dataConferida ? "Conferida em " + dataCurta(v.dataConferida) : ""));
    var detalhes = el("a", "link-seta", "Ver detalhes");
    detalhes.href = link;
    detalhes.setAttribute("aria-label", "Ver detalhes: " + v.cargo + (v.empresa ? ", " + v.empresa : ""));
    detalhes.appendChild(icone("seta"));
    pe.appendChild(detalhes);

    return anexar(art, cabeca, titulo, chips(v), destaque(v), linhaPrazo(v), pe);
  }

  // ---------- Filtros ----------
  // Junta os textos da vaga numa "frase" sem acento para a busca.
  function textoBusca(v) {
    return normalizar([v.cargo, v.empresa, v.cidade, v.tipo, v.contrato, v.modalidade,
      v.etiquetas, v.atividades, v.requisitos, v.observacao].join(" "));
  }

  function passaNoFiltro(v) {
    if (filtro.tipo && normalizar(v.tipo) !== filtro.tipo) return false;
    if (filtro.cidade === "remota") {
      if (!ehRemota(v)) return false;
    } else if (filtro.cidade && normalizar(v.cidade) !== filtro.cidade) return false;
    if (filtro.texto) {
      var palavras = filtro.texto.split(/\s+/);
      var alvo = v._busca;
      for (var i = 0; i < palavras.length; i++) {
        if (alvo.indexOf(palavras[i]) === -1) return false;
      }
    }
    return true;
  }

  function desenhar() {
    areaLista.textContent = "";
    var visiveis = ordenarPor(abertas.filter(passaNoFiltro), ordem);
    var filtrando = filtro.tipo || filtro.cidade || filtro.texto;

    if (!abertas.length) {
      areaLista.appendChild(aviso(
        "Nenhuma vaga aberta agora",
        "Assim que aparecer vaga de TI na região, ela entra aqui e no nosso Instagram. Ative as notificações por lá para não perder."
      ));
    } else if (!visiveis.length) {
      areaLista.appendChild(aviso(
        "Nenhuma vaga com esses filtros",
        "Tente outra palavra, outra cidade ou o filtro “Todas”."
      ));
    } else {
      visiveis.forEach(function (v) { areaLista.appendChild(card(v)); });
    }

    contagemFiltro.textContent = (filtrando && abertas.length)
      ? visiveis.length + (visiveis.length === 1 ? " vaga encontrada" : " vagas encontradas")
      : "";
  }

  // ---------- Topo: número de vagas e data de atualização ----------
  function escreverResumo(todas) {
    resumo.textContent = "";
    var n = abertas.length;
    var forte = el("strong", null,
      n === 0 ? "Nenhuma vaga aberta" : n + (n === 1 ? " vaga aberta" : " vagas abertas"));
    resumo.appendChild(forte);

    // "atualizado em" = data de conferência mais recente entre as vagas abertas.
    var maisRecente = null;
    abertas.forEach(function (v) {
      if (v.dataConferida && (!maisRecente || v.dataConferida > maisRecente)) maisRecente = v.dataConferida;
    });
    if (maisRecente) resumo.appendChild(document.createTextNode(" · atualizado em " + dataCompleta(maisRecente)));
  }

  function preencherCidades() {
    var vistas = {};
    abertas.forEach(function (v) {
      var chave = normalizar(v.cidade);
      // "Remoto" escrito na coluna cidade já entra pela opção "Remota".
      if (v.cidade && !/^remot/.test(chave) && !vistas[chave]) vistas[chave] = v.cidade;
    });
    Object.keys(vistas)
      .sort(function (a, b) { return vistas[a].localeCompare(vistas[b], "pt-BR"); })
      .forEach(function (chave) {
        var op = el("option", null, vistas[chave]);
        op.value = chave;
        campoCidade.appendChild(op);
      });
  }

  // ---------- Eventos ----------
  Array.prototype.forEach.call(botoesTipo, function (botao) {
    botao.addEventListener("click", function () {
      filtro.tipo = normalizar(botao.getAttribute("data-tipo"));
      Array.prototype.forEach.call(botoesTipo, function (b) {
        b.setAttribute("aria-pressed", b === botao ? "true" : "false");
      });
      desenhar();
    });
  });

  campoCidade.addEventListener("change", function () {
    filtro.cidade = campoCidade.value;
    desenhar();
  });

  campoOrdem.addEventListener("change", function () {
    ordem = campoOrdem.value;
    desenhar();
  });

  campoBusca.addEventListener("input", function () {
    filtro.texto = normalizar(campoBusca.value);
    desenhar();
  });

  // Enter no teclado do celular fecha o teclado em vez de recarregar a página.
  document.getElementById("form-busca").addEventListener("submit", function (e) {
    e.preventDefault();
    campoBusca.blur();
  });

  // ---------- Início ----------
  carregarVagas()
    .then(function (todas) {
      abertas = ordenar(todas.filter(estaAberta));
      abertas.forEach(function (v) { v._busca = textoBusca(v); });
      escreverResumo(todas);
      preencherCidades();
      desenhar();
    })
    .catch(function (erro) {
      console.error(erro);
      resumo.textContent = "";
      areaLista.textContent = "";
      areaLista.appendChild(aviso(
        "Não conseguimos carregar as vagas",
        "Pode ser a sua conexão ou uma instabilidade do nosso lado. Tente de novo em alguns minutos. Enquanto isso, as vagas também estão no Instagram."
      ));
    });
})();
