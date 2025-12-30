import { useLanguageStore } from "@/store/useLanguageStore";
import en from "./locales/en";
import id from "./locales/id";

const translations = {
	en,
	id,
};

export const t = (key: keyof typeof en) => {
	const language = useLanguageStore.getState().language;
	return translations[language][key] || key;
};

// Hook version if needed for reactivity in some cases, though usually direct store access + t() works if component re-renders on store change.
// However, since t() is not a hook, it won't trigger re-render on language change unless the component subscribes to the store.
// Best practice: component should use `const language = useLanguageStore(state => state.language)` to trigger re-render, then call `t()`.
