/**
 * mockStudents.js
 * Seeded pseudo-random student generator.
 * Each unique URL/seed produces a consistent, unique set of students.
 * Used as fallback when no real registrations exist yet.
 */

const MOCK_FIRST = [
    'Rahul','Priya','Arjun','Sneha','Vikram','Ananya','Rohit','Kavya',
    'Aditya','Meera','Kiran','Deepak','Pooja','Suresh','Divya','Nikhil',
    'Lakshmi','Sanjay','Riya','Manish','Keerthi','Harish','Nandini',
    'Akash','Swathi','Rajesh','Isha','Praveen','Ayesha','Darshan',
];
const MOCK_LAST = [
    'Sharma','Reddy','Kumar','Nair','Patel','Iyer','Singh','Rao',
    'Verma','Pillai','Joshi','Menon','Gupta','Krishnan','Shetty',
    'Bhat','Mishra','Anand','Chatterjee','Das',
];
const MOCK_COURSE = ['BCA','MCA','B.Sc CS','B.Com','BBA','B.Tech','M.Tech','MBA'];
const SECTIONS    = ['A','B','C','D'];

/** Simple LCG — deterministic, seeded by the API URL string */
function seededRng(seed) {
    let s = [...seed].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0x7fffffff, 0) || 7;
    return () => {
        s = (s * 1664525 + 1013904223) & 0x7fffffff;
        return s / 0x7fffffff;
    };
}

/**
 * Returns a consistent random integer in [min, max] seeded by `seed`.
 * Same seed always returns the same number — different seeds give different values.
 * Used to show realistic varying registered/member counts per event/club.
 */
export function seededCount(seed, min = 5, max = 50) {
    const rng = seededRng(seed + '__count');
    return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Generate `count` unique realistic student objects seeded by `url`.
 * The same URL always produces the same list.
 */
export function generateMockStudents(url, count = 9) {
    const rng  = seededRng(url);
    const pick = (arr) => arr[Math.floor(rng() * arr.length)];
    const used = new Set();
    const result = [];
    let tries = 0;

    while (result.length < count && tries < count * 4) {
        tries++;
        const first = pick(MOCK_FIRST);
        const last  = pick(MOCK_LAST);
        const name  = `${first} ${last}`;
        if (used.has(name)) continue;
        used.add(name);

        const year    = 23 + Math.floor(rng() * 3);
        const roll    = String(Math.floor(rng() * 90000) + 10000);
        const section = pick(SECTIONS);
        const sem     = (Math.floor(rng() * 6) + 1).toString();
        const course  = pick(MOCK_COURSE);

        result.push({
            _id:       `mock-${url}-${result.length}`,
            name,
            email:     `${first.toLowerCase()}.${last.toLowerCase()}${roll.slice(-3)}@college.edu`,
            regNumber: `${year}${section}${roll.slice(-5)}`,
            semester:  sem,
            section,
            course,
        });
    }
    return result;
}
