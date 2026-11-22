// Contador de visitas e de cliques com o GoatCounter (https://www.goatcounter.com).
//
// O GoatCounter só conta números: quantas vezes cada página foi vista e quantas
// vezes cada botão "Ver vaga e se candidatar" foi clicado. Ele não usa cookies,
// não guarda IP e não sabe quem é a pessoa. Por isso dá para ver "a vaga X teve
// 25 cliques", mas não "fulano clicou".
//
// Enquanto CONFIG.GOATCOUNTER estiver vazio (em js/config.js), nada é carregado
// e nada é contado. O contador também não conta visitas feitas no localhost.

(function () {
  var fila = [];
  var pronto = false;
  var codigo = (window.CONFIG && CONFIG.GOATCOUNTER || "").trim();

  // Função usada pelas páginas: contar({ path: "...", title: "...", event: true }).
  // Se o script do GoatCounter ainda não carregou, guarda na fila.
  window.contar = function (dados) {
    if (!codigo) return;
    if (pronto && window.goatcounter && window.goatcounter.count) {
      try { window.goatcounter.count(dados); } catch (e) { /* contador nunca quebra o site */ }
    } else {
      fila.push(dados);
    }
  };

  if (!codigo) return;

  // Aceita só o código do site (letras, números e hífen), ex.: "sudoestetech".
  if (!/^[a-z0-9-]+$/i.test(codigo)) {
    console.warn("CONFIG.GOATCOUNTER deve ter só o código do site, ex.: sudoestetech");
    codigo = "";
    return;
  }

  var endereco = "https://" + codigo + ".goatcounter.com/count";

  // no_onload: as páginas é que dizem o que contar (o nome certo de cada vaga).
  window.goatcounter = { no_onload: true, endpoint: endereco };

  var s = document.createElement("script");
  s.async = true;
  // Versão fixa do script com "integrity": se alguém alterar o arquivo no
  // servidor do GoatCounter, o navegador recusa rodar. Para trocar de versão,
  // pegue o código novo em https://www.goatcounter.com/help/countjs-versions
  s.src = "https://gc.zgo.at/count.v4.js";
  s.integrity = "sha384-nRw6qfbWyJha9LhsOtSb2YJDyZdKvvCFh0fJYlkquSFjUxp9FVNugbfy8q1jdxI+";
  s.crossOrigin = "anonymous";
  s.setAttribute("data-goatcounter", endereco);
  s.onload = function () {
    pronto = true;
    var lista = fila;
    fila = [];
    lista.forEach(window.contar);
  };
  document.head.appendChild(s);
})();
