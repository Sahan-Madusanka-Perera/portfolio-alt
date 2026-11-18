// Runs before first paint:
//  * sets the theme (dark by default, light if the visitor chose it before), so nothing flashes
//  * marks <html> as having JavaScript, so scroll reveals may start hidden (without JS, all
//    content stays visible)
//  * skips the loader on repeat visits in the same session and under reduced motion
const INIT_SCRIPT = `(function () {
  var d = document.documentElement;
  d.classList.add("js");
  try {
    if (localStorage.getItem("theme") === "light") d.setAttribute("data-theme", "light");
  } catch (e) {}
  try {
    if (sessionStorage.getItem("loader-seen") === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      d.setAttribute("data-loader", "skip");
    }
  } catch (e) {}
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />;
}
