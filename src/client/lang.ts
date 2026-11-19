import { langOf, messages } from "../i18n";

// The store does not expose the user's language. Read the choice Sharkord
// saves when the user picks one (`sharkord-language`), else the browser's, the
// same order Sharkord itself uses. `<html lang>` is always "en", so not that.
const savedLanguage = () => {
  try {
    return localStorage.getItem("sharkord-language");
  } catch {
    return null;
  }
};

const msg = messages[langOf(savedLanguage() || navigator.languages?.[0] || navigator.language)];

export { msg };
