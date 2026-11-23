// Site theme (owners, 2026-11-22): dark, black and wine, is the main one; light is the option. The choice stays in this
// browser (localStorage "meranno-tema") and lives on <html data-tema>, where globals.css swaps the colours.
export type Tema = "escuro" | "claro";
export const TEMA_KEY = "meranno-tema";
export const TEMA_PADRAO: Tema = "escuro";

// Runs before anything paints (first thing in <body>), so a light-theme visitor never sees a dark flash, or the
// other way around.
export const SCRIPT_TEMA = `try{var t=localStorage.getItem("${TEMA_KEY}");if(t==="claro"||t==="escuro")document.documentElement.dataset.tema=t}catch(e){}`;
