// Quem abrir o endereço antigo do GitHub Pages ou o www vai direto para
// https://sudoestetech.com.br, mantendo a página e o id da vaga
// (ex.: vaga.html?id=...). Veja o README, seção 5.7.
// Assim o Google vê um endereço só. No domínio principal, no
// sudoestetech.pages.dev e no localhost não faz nada.
(function () {
  var h = location.hostname;
  if (h === "sudoestevagaspr-cloud.github.io" || h === "www.sudoestetech.com.br") {
    location.replace("https://sudoestetech.com.br" + location.pathname + location.search + location.hash);
  }
})();
