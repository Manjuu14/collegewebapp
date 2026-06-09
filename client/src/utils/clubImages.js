/**
 * clubImages.js — Centralized club image map
 * Single source of truth used by ClubCard (React) and student-dashboard.js (plain JS).
 * Keys are lowercase club names.
 */

export const CLUB_IMAGES = {
    'tech innovators': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=900&auto=format&fit=crop',
    'debate society': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=900&auto=format&fit=crop',
    'fitness club': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=900&auto=format&fit=crop',
    'music club': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=900&auto=format&fit=crop',
    'web dev club': 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=900&auto=format&fit=crop',
    'dance club': 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=900&auto=format&fit=crop',
    'dj club': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=900&auto=format&fit=crop',
    'wildlife & geo': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=900&auto=format&fit=crop',
    'gardening club': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=900&auto=format&fit=crop',
    'badminton club': 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=900&auto=format&fit=crop',
    'trekking club': 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=900&auto=format&fit=crop',
    'drawing club': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=900&auto=format&fit=crop',
};

export const CLUB_GRADIENTS = [
    'linear-gradient(135deg, #dbeafe, #93c5fd)',
    'linear-gradient(135deg, #fce7f3, #f9a8d4)',
    'linear-gradient(135deg, #d1fae5, #6ee7b7)',
    'linear-gradient(135deg, #fef3c7, #fcd34d)',
    'linear-gradient(135deg, #ede9fe, #c4b5fd)',
    'linear-gradient(135deg, #ffedd5, #fdba74)',
];

/**
 * getClubBackground(name, index)
 * Returns a CSS background string: url() for known clubs, gradient fallback otherwise.
 */
export const getClubBackground = (name = '', index = 0) => {
    const key = name.toLowerCase();
    const img = CLUB_IMAGES[key];
    if (img) return `url('${img}') center/cover no-repeat`;
    return CLUB_GRADIENTS[index % CLUB_GRADIENTS.length];
};
