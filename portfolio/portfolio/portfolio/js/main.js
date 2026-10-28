"use strict";

/* ===== 1. Ano automático no rodapé ===== */
document.getElementById("ano").textContent = new Date().getFullYear();

/* ===== 2. Saudação dinâmica conforme o horário ===== */
function obterSaudacao(hora) {
  if (hora >= 5 && hora < 12) return "Bom dia! 👋";
  if (hora >= 12 && hora < 18) return "Boa tarde! 👋";
  return "Boa noite! 👋";
}
document.getElementById("saudacao").textContent = obterSaudacao(new Date().getHours());

/* ===== 3. Menu hambúrguer ===== */
const btnMenu = document.getElementById("btn-menu");
const menu = document.getElementById("menu");

function abrirMenu(abrir) {
  menu.classList.toggle("menu--aberto", abrir);
  btnMenu.setAttribute("aria-expanded", String(abrir));
  btnMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
}

btnMenu.addEventListener("click", () => {
  abrirMenu(btnMenu.getAttribute("aria-expanded") !== "true");
});

// Fecha ao escolher um link
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => abrirMenu(false));
});

// Fecha com a tecla Esc e devolve o foco ao botão
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && btnMenu.getAttribute("aria-expanded") === "true") {
    abrirMenu(false);
    btnMenu.focus();
  }
});

// Se a tela for ampliada, o menu volta ao estado normal
window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => {
  if (e.matches) abrirMenu(false);
});

/* ===== 4. Modo claro / escuro ===== */
const raiz = document.documentElement;
const btnTema = document.getElementById("btn-tema");
const iconeTema = document.getElementById("icone-tema");

function aplicarTema(tema) {
  const escuro = tema === "dark";
  if (escuro) raiz.setAttribute("data-tema", "dark");
  else raiz.removeAttribute("data-tema");
  btnTema.setAttribute("aria-pressed", String(escuro));
  btnTema.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
  iconeTema.textContent = escuro ? "☀" : "☾";
}

// Tema inicial: preferência salva ou preferência do sistema
let temaInicial = "light";
try {
  temaInicial = localStorage.getItem("tema") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
} catch (e) { /* localStorage indisponível: segue com o padrão */ }
aplicarTema(temaInicial);

btnTema.addEventListener("click", () => {
  const novo = raiz.getAttribute("data-tema") === "dark" ? "light" : "dark";
  aplicarTema(novo);
  try { localStorage.setItem("tema", novo); } catch (e) {}
});

/* ===== 5. Validação do formulário ===== */
const form = document.getElementById("form-contato");
const status = document.getElementById("status-form");
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const regras = {
  nome: (campo) => {
    const v = campo.value.trim();
    if (!v) return "Informe seu nome.";
    if (v.length < 3) return "O nome deve ter pelo menos 3 caracteres.";
    return "";
  },
  email: (campo) => {
    const v = campo.value.trim();
    if (!v) return "Informe seu e-mail.";
    if (!regexEmail.test(v)) return "Digite um e-mail válido, como nome@exemplo.com.";
    return "";
  },
  mensagem: (campo) => {
    const v = campo.value.trim();
    if (!v) return "Escreva sua mensagem.";
    if (v.length < 10) return "A mensagem deve ter pelo menos 10 caracteres.";
    return "";
  },
  consentimento: (campo) =>
    campo.checked ? "" : "Marque o consentimento para enviar a mensagem."
};

function validarCampo(campo) {
  const mensagemErro = regras[campo.name](campo);
  const caixa = campo.closest(".campo");
  document.getElementById("erro-" + campo.name).textContent = mensagemErro;
  caixa.dataset.invalido = mensagemErro ? "true" : "false";
  campo.setAttribute("aria-invalid", mensagemErro ? "true" : "false");
  return !mensagemErro;
}

const campos = Object.keys(regras).map((nome) => form.elements[nome]);

// Valida ao sair do campo e revalida enquanto digita (se já havia erro)
campos.forEach((campo) => {
  campo.addEventListener("blur", () => validarCampo(campo));
  const evento = campo.type === "checkbox" ? "change" : "input";
  campo.addEventListener(evento, () => {
    if (campo.closest(".campo").dataset.invalido === "true") validarCampo(campo);
  });
});

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  status.textContent = "";

  const resultados = campos.map(validarCampo);
  const primeiroInvalido = campos.find((_, i) => !resultados[i]);

  if (primeiroInvalido) {
    primeiroInvalido.focus();
    return;
  }

  // Os dados NÃO são enviados nem guardados. Para enviar de verdade,
  // seria preciso um serviço de e-mail ou um back-end.
  form.reset();
  campos.forEach((c) => {
    c.closest(".campo").dataset.invalido = "false";
    c.removeAttribute("aria-invalid");
  });
  status.textContent = "Mensagem validada com sucesso! Obrigado pelo contato.";
});
