// Configuração do site. Este é o único arquivo que você precisa editar.
//
// URL_PLANILHA: o link CSV da planilha publicada na web
// (Google Sheets > Arquivo > Compartilhar > Publicar na Web > formato CSV).
// Ele termina com "output=csv". Cole entre as aspas.
//
// Enquanto estiver vazio, o site mostra as vagas do arquivo modelo-vagas.csv
// deste repositório (útil para testar antes de publicar a planilha).
var CONFIG = {
  URL_PLANILHA: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhnIBInyx3i1LED3Je6bXMe-nK6b0jLit7oflqqykms7S5fB6XbKld3-0pEZ8uIe7GJJj-tZHnZW1g/pub?gid=208015752&single=true&output=csv",

  INSTAGRAM: "https://www.instagram.com/sudoestetechpr/",
  DIRECT: "https://ig.me/m/sudoestetechpr",
  // Formulário para empresas enviarem vagas (também está nos links do index.html e vaga.html).
  FORMULARIO_EMPRESAS: "https://docs.google.com/forms/d/e/1FAIpQLSdrJC9svuXizVMNhkHapBApEBNYe-bqqFJYwQx15sDE28wVZw/viewform",
  EMAIL: "sudoestevagaspr@gmail.com",

  // Código do site no GoatCounter (contador de visitas e de cliques em "se candidatar").
  // É a primeira parte do endereço do painel: em https://sudoestetech.goatcounter.com
  // o código é "sudoestetech". Deixe vazio ("") para desligar o contador.
  GOATCOUNTER: "sudoestetech",

  // Por quantos dias a vaga mostra o selo "Nova" depois de adicionada.
  DIAS_NOVA: 7
};
