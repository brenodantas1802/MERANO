// The sea behind the home headline. One video picks its file by screen: phones get a vertical cut of the same
// footage (the part a tall screen shows) at a third of the weight. It holds still under the headline, so scrolling
// never has to move it.
export function HeroVideo({ src, mobileSrc, poster }: { src: string; mobileSrc: string; poster: string }) {
  return (
    <div className="absolute inset-0">
      <video autoPlay muted loop playsInline preload="metadata" poster={poster} className="h-full w-full object-cover">
        <source media="(min-width: 768px)" src={src} type="video/mp4" />
        <source src={mobileSrc} type="video/mp4" />
      </video>
    </div>
  );
}
