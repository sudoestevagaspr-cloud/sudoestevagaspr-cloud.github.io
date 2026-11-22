// Quem abrir o endereço antigo do GitHub Pages vai direto para o domínio novo,
// mantendo a página e o id da vaga (ex.: vaga.html?id=...). Veja o README, seção 5.7.
// No domínio novo, no sudoestetech.pages.dev e no localhost não faz nada.
(function () {
  if (location.hostname === "sudoestevagaspr-cloud.github.io") {
    location.replace("https://sudoestetech.com.br" + location.pathname + location.search + location.hash);
  }
})();
