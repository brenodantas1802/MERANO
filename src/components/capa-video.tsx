"use client";

import { useEffect, useRef } from "react";

// The home cover's background video: a dealer handing out poker cards, darkened (owners' meeting, 2026-11-22).
// Files: public/imagens/capa/poker-1280.mp4 (computers) and poker-854.mp4 (phones), re-encoded darker and without sound
// from the owners' file (100427-video-720.mp4), with a keyframe every second. With a single keyframe (the first encode)
// the browser had to decode the clip from its start whenever playback picked up again, so the video froze after
// scrolling away and back (owners, 2026-11-22). The poster is the clip's first frame, so the switch to the video is
// invisible.
//
// The <video> is written as plain HTML so the browser gets the `muted` attribute in the first response: without it
// iPhones don't autoplay (React only sets `muted` after the page's JavaScript runs).
const VIDEO = `<video class="capa-video" autoplay muted loop playsinline preload="auto" disablepictureinpicture disableremoteplayback poster="/imagens/capa/poker-poster.webp" aria-hidden="true">
  <source src="/imagens/capa/poker-854.mp4" type="video/mp4" media="(max-width: 767px)">
  <source src="/imagens/capa/poker-1280.mp4" type="video/mp4">
</video>`;

export function CapaVideo() {
  const caixa = useRef<HTMLDivElement>(null);

  // It plays only while it's on screen and the tab is open: paused out of sight, it costs nothing, and it picks up
  // again at once (instead of whenever the browser gets round to it) when the visitor scrolls back up.
  useEffect(() => {
    const video = caixa.current?.querySelector("video");
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    let naTela = true;
    const atualizar = () => {
      if (naTela && !document.hidden) video.play().catch(() => { /* autoplay blocked: the poster stays */ });
      else video.pause();
    };
    const observador = new IntersectionObserver(([entrada]) => {
      naTela = entrada.isIntersecting;
      atualizar();
    });
    observador.observe(video);
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      observador.disconnect();
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, []);

  return <div ref={caixa} className="capa-midia" dangerouslySetInnerHTML={{ __html: VIDEO }} />;
}
