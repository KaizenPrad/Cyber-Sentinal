export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
    const result = schema.safeParse(data);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.errors[0]?.message || 'Validation failed',
        details: result.error.errors,
      });
    }
    if (source === 'query') req.query = result.data;
    else if (source === 'params') req.params = result.data;
    else req.validated = result.data;
    next();
  };
}
export default validate;
