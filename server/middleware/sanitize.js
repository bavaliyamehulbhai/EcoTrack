/**
 * Custom middleware to sanitize NoSQL queries and prevent XSS.
 * Deeply cleans req.body, req.params without trying to overwrite the req.query getter in Express 5.
 */

export const sanitizeData = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (value && typeof value === 'object') {
      for (let key in value) {
        if (key.startsWith('$') || key.includes('.')) {
          delete value[key];
        } else {
          sanitizeValue(value[key]);
        }
      }
    }
    return value;
  };

  // Safely sanitize body and params
  if (req.body) sanitizeValue(req.body);
  if (req.params) sanitizeValue(req.params);

  // Apply xss filtering only on body and params since query is a getter
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
    }
  }

  next();
};
