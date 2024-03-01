const statusList = {
    statusOK: {
        name: "Status OK",
        value: 200
    },
    created: {
        name: "Created",
        value: 201
    },
    noContent: {
        name: "No Content",
        value: 204
    },
    badRequest: {
        name: "Bad Request",
        value: 400
    },
    unauthorized: {
        name: "Unauthorized",
        value: 401
    },
    forbidden: {
        name: "Forbidden",
        value: 403
    },
    notFound: {
        name: "Not Found",
        value: 404
    },
    methodNotAllowed: {
        name: "Method Not Allowed",
        value: 405
    },
    internalServerError: {
        name: "Internal Server Error",
        value: 500
    },
    serviceUnavailable: {
        name: "Service Unavailable",
        value: 503
    }
};

module.exports = statusList
