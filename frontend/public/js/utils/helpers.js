
//Basic email validation
function isValidEmailBasic(email) {
    if (!email) {
        return false;
    }
    // Basic regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}