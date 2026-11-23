"use client";

import { useEffect, useRef } from "react";

// The home cover's background video: a dealer handing out poker cards, darkened (owners' meeting, 2026-11-22).
//
// Files (public/imagens/capa), re-encoded from the owners' 100427-video-720.mp4, darker, without sound and with a
// keyframe every second (with the first encode's single keyframe the browser decoded the clip from its start whenever
// playback picked up again, and it froze):
// - poker-1280.mp4: computers, the whole scene.
// - poker-celular.mp4: phones, its own 4:5 crop of the scene (the dealer's hands, the cards and the chips), 576x720.
//   A landscape video filling a phone screen showed a blurred sleeve (owners, 2026-11-23: "tirar o zoom").
// Each has a still of its first frame (poker-poster / poker-celular-poster), shown at once in a <picture> under the video.
//
// The video plays only once it is fully downloaded: started while still arriving, it stuttered on phones while the
// rest of the page loaded. The download starts as the HTML arrives (the small script below), at low priority, so the
// page's own files come first; until it's ready the still frame shows, and since it is the video's first frame the
// switch can't be seen. With "save data" on, the still stays.

const CELULAR = "(max-width: 767px)";
const URL_CELULAR = "/imagens/capa/poker-celular.mp4";
const URL_COMPUTADOR = "/imagens/capa/poker-1280.mp4";

// The download, in the page itself (runs as the HTML arrives, before any of the site's JavaScript)...
const SCRIPT_BAIXAR = `window.__capaVideo||(window.__capaVideo=function(){var u=matchMedia("${CELULAR}").matches?"${URL_CELULAR}":"${URL_COMPUTADOR}",c=navigator.connection;if(matchMedia("(prefers-reduced-motion: reduce)").matches||(c&&c.saveData))return{pronto:Promise.resolve(null)};return{pronto:fetch(u,{priority:"low"}).then(function(r){if(!r.ok)throw new Error(r.status);return r.blob()}).then(function(b){return URL.createObjectURL(b)},function(){return u})}}())`;

// ...and the same here, for when the home opens from inside the site (that script then doesn't run).
function baixarVideo(): { pronto: Promise<string | null> } {
  const url = window.matchMedia(CELULAR).matches ? URL_CELULAR : URL_COMPUTADOR;
  const conexao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || conexao?.saveData) return { pronto: Promise.resolve(null) };
  const pronto = fetch(url, { priority: "low" } as RequestInit)
    .then((resposta) => { if (!resposta.ok) throw new Error(String(resposta.status)); return resposta.blob(); })
    .then((arquivo) => URL.createObjectURL(arquivo), () => url);
  return { pronto };
}

const VIDEO = `<picture>
  <source media="(max-width: 767px)" srcset="/imagens/capa/poker-celular-poster.webp">
  <img class="capa-video" src="/imagens/capa/poker-poster.webp" alt="" fetchpriority="high" decoding="async">
</picture>
<video class="capa-video" muted loop playsinline preload="none" disablepictureinpicture disableremoteplayback aria-hidden="true"></video>
<script>${SCRIPT_BAIXAR}</script>`;

declare global {
  interface Window { __capaVideo?: { pronto: Promise<string | null> } }
}

export function CapaVideo() {
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = caixa.current?.querySelector("video");
    if (!video) return;
    let ativo = true;
    let naTela = true;
    // It plays only while it's on screen and the tab is open: paused out of sight it costs nothing, and it picks up
    // again at once when the visitor scrolls back up.
    const atualizar = () => {
      if (!video.getAttribute("src")) return;
      if (naTela && !document.hidden) video.play().catch(() => { /* autoplay blocked (e.g. iPhone low power): the still stays */ });
      else video.pause();
    };
    // After a move inside the site the page's script doesn't run again: the download starts (or is reused) here.
    window.__capaVideo ??= baixarVideo();
    window.__capaVideo.pronto.then((src) => {
      if (!ativo || !src) return; // no src: reduced motion or save data, the still stays
      video.src = src;
      atualizar();
    });

    const observador = new IntersectionObserver(([entrada]) => {
      naTela = entrada.isIntersecting;
      atualizar();
    });
    observador.observe(video);
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      ativo = false;
      observador.disconnect();
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, []);

  return <div ref={caixa} className="capa-midia" dangerouslySetInnerHTML={{ __html: VIDEO }} />;
}
