// Runs before hydration to set the `.dark` class synchronously and avoid a
// flash of the wrong theme. Default is the light exercise book unless the user
// has explicitly switched to the blackboard before (persisted in localStorage).
const THEME_INIT_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
