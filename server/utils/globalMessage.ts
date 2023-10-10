const gM400 = (type: string): string => `Content of the ${type} object can not be empty !`;
const gM404 = (type: string): string => `No ${type} found`;
const gM405 = (): string => 'Not Allowed';
const gM418 = (): string => 'I\'m a teapot';
const gM500 = (type: string): string => `Some error occurred while creating the ${type}`;

export {
  gM400,
  gM404,
  gM405,
  gM418,
  gM500
};
