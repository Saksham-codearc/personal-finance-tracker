export function validate(schema) {
  return function validateRequest(req, res, next) {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(result.error);
    }

    req.body = result.data;
    return next();
  };
}
