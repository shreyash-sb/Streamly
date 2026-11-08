/**
 * Generates readable meeting codes in the format `abc-defg-hij`
 */
export const generateMeetingCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const segment = (len) => {
        let str = "";
        for (let i = 0; i < len; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return str;
    };
    return `${segment(3)}-${segment(4)}-${segment(3)}`;
};

/**
 * Validates and normalizes meeting codes
 * @param {string} code 
 * @returns {string} normalized code
 */
export const normalizeMeetingCode = (code) => {
    if (!code) return "";
    return code.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
};

