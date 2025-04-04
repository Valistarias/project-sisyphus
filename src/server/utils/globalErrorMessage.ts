interface IGemRes {
  message: string;
  code: string;
  sent?: Record<string, unknown> | string | null;
  err?: unknown;
}

// ------ Global Errors
// Error 403
const gemNotAllowed = (): IGemRes => ({
  message: 'Request Not Allowed',
  code: 'CYPU-001',
});
// Error 403
const gemNotAdmin = (): IGemRes => ({
  message: 'Administrator Role Needed',
  code: 'CYPU-002',
});
// Error 418
const gemTeaPot = (): IGemRes => ({
  message: "I'm a teapot",
  code: 'CYPU-003',
});

// ------ Form Validation Errors ------
// Error 400
const gemEmpty = (type: string): IGemRes => ({
  message: `Content of the ${type} object can not be empty`,
  code: 'CYPU-101',
});
const gemInvalidField = (field: string): IGemRes => ({
  message: `Invalid ${field}`,
  sent: field,
  code: 'CYPU-102',
});
const gemUnverifiedUser = (): IGemRes => ({
  message: 'User Not Verified',
  code: 'CYPU-103',
});
const gemDuplicate = (field: string): IGemRes => ({
  message: `${field} already used`,
  sent: field,
  code: 'CYPU-104',
});
// Error 401
const gemUnauthorized = (): IGemRes => ({
  message: 'You need to log in to do this request',
  code: 'CYPU-105',
});
const gemUnauthorizedGlobal = (): IGemRes => ({
  message: 'You are not authorized to do this',
  code: 'CYPU-106',
});

// ------ Request Errors
// Error 456
const gemCreate = (type: string): IGemRes => ({
  message: `Some error occurred while creating the ${type}`,
  code: 'CYPU-201',
});
// Error 403
const gemForbidden = (): IGemRes => ({
  message: 'You cant use this request',
  code: 'CYPU-203',
});
// Error 404
const gemNotFound = (type: string): IGemRes => ({
  message: `${type} not  found`,
  code: 'CYPU-202',
});

// ------ Server Errors
// Error 500
const gemServerError = (err: unknown): IGemRes => ({
  message: 'Internal server error',
  err,
  code: 'CYPU-301',
});

export {
  gemCreate,
  gemDuplicate,
  gemEmpty,
  gemForbidden,
  gemInvalidField,
  gemNotAdmin,
  gemNotAllowed,
  gemNotFound,
  gemServerError,
  gemTeaPot,
  gemUnauthorized,
  gemUnauthorizedGlobal,
  gemUnverifiedUser,
};
