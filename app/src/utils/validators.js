function containsUppercase(value) {
    return /[A-Z]/.test(value)
}
function containsLowercase(value) {
    return /[a-z]/.test(value)
}
function containsNumber(value) {
    return /[0-9]/.test(value)
}
function containsSpecial(value) {
    return /[#?!@$%^&*-]/.test(value)
}
function isUUID(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export {
    containsUppercase,
    containsLowercase,
    containsNumber,
    containsSpecial,
    isUUID
}