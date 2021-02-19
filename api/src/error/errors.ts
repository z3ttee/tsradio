export default {
    UNKNOWN_ROUTE: { errorId: "UNKNOWN_ROUTE", statusCode: 404, message: "Es konnte keine Route gefunden worden" },
    UNKNOWN_AUTH_METHOD: { errorId: "UNKNOWN_AUTH_METHOD", statusCode: 400, message: "Unbekannter Account-Typ" },

    INTERNAL_ERROR: { errorId: "INTERNAL_ERROR", statusCode: 500, message: "Es ist ein interner Fehler aufgetreten" },
    
    MISSING_ATTACHMENTS: { errorId: "MISSING_ATTACHMENTS", statusCode: 403, message: "" },
    PERMISSION_DENIED: { errorId: "PERMISSION_DENIED", statusCode: 403, message: "Keine Berechtigung" },
    SESSION_EXPIRED: { errorId: "SESSION_EXPIRED", statusCode: 403, message: "Die Sitzung ist abgelaufen" },
    UNSUPPORTED_FORMAT: { errorId: "UNSUPPORTED_FORMAT", statusCode: 400, message: "Das Format wird nicht unterstützt" },

    RESOURCE_NOT_FOUND: { errorId: "RESOURCE_NOT_FOUND", statusCode: 404, message: "Resource nicht gefunden" },
    RESOURCE_EXISTS: { errorId: "RESOURCE_EXISTS", statusCode: 400, message: "Resource existiert bereits" },

    AUTH_REQUIRED: { errorId: "AUTH_REQUIRED", statusCode: 403, message: "Bitte melde dich vorher an" },
    INVALID_CREDENTIALS: { errorId: "INVALID_CREDENTIALS", statusCode: 403, message: "Die Anmeldedaten sind nicht korrekt" },
    INVALID_ACCOUNT: { errorId: "INVALID_ACCOUNT", statusCode: 403, message: "Das Konto konnte nicht gefunden werden" },
}