// Página de uma vaga: vaga.html?id=identificador-da-vaga

(function () {
  var area = document.getElementById("vaga");
  var id = new URLSearchParams(location.search).get("id") || "";

  // Uma seção com título; lista de tópicos se houver vários itens,
  // parágrafo se houver só um. Campo vazio: a seção não aparece.
  function secao(titulo, texto) {
    var lista = itens(texto);
    if (!lista.length) return null;
    var s = el("section", "secao");
    s.appendChild(el("h2", null, titulo));
    if (lista.length === 1) {
      s.appendChild(el("p", null, lista[0]));
    } else {
      var ul = el("ul", "topicos");
      lista.forEach(function (t) { ul.appendChild(el("li", null, t)); });
      s.appendChild(ul);
    }
    return s;
  }

  function passos(texto) {
    var lista = itens(texto);
    if (!lista.length) return null;
    var s = el("section", "secao");
    s.appendChild(el("h2", null, "Como se candidatar"));
    var ol = el("ol", "passos");
    lista.forEach(function (t) { ol.appendChild(el("li", null, t)); });
    s.appendChild(ol);
    return s;
  }

  function botoes(v) {
    var caixa = el("div", "acoes");

    if (v.link) {
      var candidatar = el("a", "botao botao-cheio", "Ver vaga e se candidatar");
      candidatar.href = v.link;
      candidatar.target = "_blank";
      candidatar.rel = "noopener noreferrer";
      candidatar.appendChild(icone("externo"));
      // Conta o clique (só o número, sem saber quem clicou). O link da vaga não muda.
      var contarClique = function (ev) {
        if (ev.type === "auxclick" && ev.button !== 1) return; // só botão do meio
        contar({ path: "candidatar/" + v.id, title: nomeVaga(v), event: true });
      };
      candidatar.addEventListener("click", contarClique);
      candidatar.addEventListener("auxclick", contarClique);
      caixa.appendChild(candidatar);
    }

    // Link do WhatsApp: wa.me abre o app com o texto pronto para escolher o contato.
    var texto = v.cargo + (v.empresa ? " · " + v.empresa : "") +
      (v.cidade ? " (" + v.cidade + ")" : "") + "\n" +
      "Vaga de TI no Sudoeste do PR: " + location.href;
    var whats = el("a", "botao botao-contorno");
    whats.href = "https://wa.me/?text=" + encodeURIComponent(texto);
    whats.target = "_blank";
    whats.rel = "noopener noreferrer";
    whats.appendChild(icone("compartilhar"));
    whats.appendChild(document.createTextNode("Compartilhar no WhatsApp"));
    caixa.appendChild(whats);

    return caixa;
  }

  function linhaFonte(v) {
    var partes = [];
    if (v.fonte) partes.push("Fonte: " + v.fonte);
    if (v.dataPublicada) partes.push("publicada em " + dataCompleta(v.dataPublicada));
    if (v.dataConferida) partes.push("conferida em " + dataCompleta(v.dataConferida));
    if (!partes.length) return null;
    var texto = partes.join(" · ");
    return el("p", "fonte", texto.charAt(0).toUpperCase() + texto.slice(1));
  }

  function nomeVaga(v) {
    return v.cargo + (v.empresa ? " · " + v.empresa : "");
  }

  function mostrar(v) {
    document.title = nomeVaga(v) + " | Sudoeste Tech";
    contar({ path: "/vaga/" + v.id, title: nomeVaga(v) });

    var art = el("article", "cartao detalhe");

    var cabeca = el("div", "cartao-cabeca");
    anexar(cabeca, el("span", "tipo", v.tipo), selo(v));

    var titulo = el("div", "titulo-bloco");
    anexar(titulo, el("h1", null, v.cargo), v.empresa ? el("span", "empresa", v.empresa) : null);

    var temSecoes = v.atividades || v.requisitos || v.beneficios || v.como_se_candidatar;

    anexar(art,
      cabeca,
      titulo,
      chips(v),
      destaque(v),
      linhaPrazo(v),
      v.observacao ? el("p", "observacao", v.observacao) : null,
      temSecoes ? el("hr", "divisor") : null,
      secao("O que você vai fazer", v.atividades),
      secao("Quem pode se candidatar", v.requisitos),
      secao("Benefícios", v.beneficios),
      passos(v.como_se_candidatar),
      botoes(v),
      linhaFonte(v)
    );

    area.textContent = "";
    area.appendChild(art);
  }

  carregarVagas()
    .then(function (todas) {
      var vaga = null;
      for (var i = 0; i < todas.length; i++) {
        if (todas[i].id === criarId(id) && estaAberta(todas[i])) { vaga = todas[i]; break; }
      }
      if (vaga) {
        mostrar(vaga);
      } else {
        contar({ path: "/vaga/encerrada", title: "Vaga encerrada ou não encontrada" });
        area.textContent = "";
        area.appendChild(aviso(
          "Esta vaga foi encerrada",
          "Ela saiu do ar porque o prazo acabou ou as inscrições foram fechadas. Veja as outras vagas abertas na página inicial."
        ));
      }
    })
    .catch(function (erro) {
      console.error(erro);
      area.textContent = "";
      area.appendChild(aviso(
        "Não conseguimos carregar esta vaga",
        "Pode ser a sua conexão ou uma instabilidade do nosso lado. Tente de novo em alguns minutos. Enquanto isso, as vagas também estão no Instagram."
      ));
    });
})();
