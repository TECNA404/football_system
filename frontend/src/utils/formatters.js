export const formatDate = (dt, language = 'uk') => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString(language === "uk" ? "uk-UA" : "en-US", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDateOnly = (dt, language = 'uk') => {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString(language === "uk" ? "uk-UA" : "en-US");
};
