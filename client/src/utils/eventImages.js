/**
 * eventImages.js
 * Single source of truth for event banner images.
 * Looked up by lowercase event title — works for both real API and mock events.
 */

export const EVENT_IMAGES = {
    'annual hackathon': 'https://images.unsplash.com/photo-1504384308090-c54be385363d?q=80&w=900&auto=format&fit=crop',
    'graduation party': 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=900&auto=format&fit=crop',
    'gaming tournament': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=900&auto=format&fit=crop',
};

/** Default gradient fallbacks by index when no image is matched */
export const EVENT_GRADIENTS = [
    'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    'linear-gradient(135deg, #4c1d95, #8b5cf6)',
    'linear-gradient(135deg, #0f766e, #14b8a6)',
    'linear-gradient(135deg, #be185d, #ec4899)',
    'linear-gradient(135deg, #92400e, #f59e0b)',
];

/**
 * getEventBackground(title, index)
 * Returns a CSS background string: either a url() for matched images or a gradient fallback.
 */
export const getEventBackground = (title = '', index = 0) => {
    const key = title.toLowerCase();
    if (EVENT_IMAGES[key]) {
        return `url('${EVENT_IMAGES[key]}') center/cover no-repeat`;
    }
    return EVENT_GRADIENTS[index % EVENT_GRADIENTS.length];
};

/**
 * fmtDate(iso)  →  { day, month, time, full }
 * Formats a date string into display-friendly parts.
 */
export const fmtDate = (iso) => {
    if (!iso) return { day: '?', month: '???', time: '', full: '' };
    const d = new Date(iso);
    return {
        day: d.getDate(),
        month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        full: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
};
