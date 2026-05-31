export const PLACEHOLDERS = {
    TEAM: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=200&h=200&auto=format&fit=crop",
    COACH: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=200&h=200&auto=format&fit=crop",
    PLAYER: {
        GK: "https://images.unsplash.com/photo-1526232310673-59c9c8155837?q=80&w=200&h=200&auto=format&fit=crop",
        DF: "https://images.unsplash.com/photo-1544606111-883015b40462?q=80&w=200&h=200&auto=format&fit=crop",
        MF: "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=200&h=200&auto=format&fit=crop",
        FW: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=200&h=200&auto=format&fit=crop",
        DEFAULT: "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=200&h=200&auto=format&fit=crop"
    }
};

/**
 * Повертає URL-адресу заглушки для зображення, якщо основна завантаження не вдалася.
 * @param {string} type - 'TEAM', 'COACH' або 'PLAYER'
 * @param {string} position - позиція гравця (GK, DF, MF, FW)
 * @returns {string} URL заглушки
 */
export const getPlaceholder = (type, position = null) => {
    if (type === 'PLAYER') {
        return PLACEHOLDERS.PLAYER[position] || PLACEHOLDERS.PLAYER.DEFAULT;
    }
    return PLACEHOLDERS[type] || PLACEHOLDERS.TEAM;
};

/**
 * Обробник події onError для тегів <img>
 * @param {Event} e 
 * @param {string} placeholderUrl 
 */
export const handleImageError = (e, placeholderUrl) => {
    if (e.target.src !== placeholderUrl) {
        e.target.src = placeholderUrl;
    }
};
