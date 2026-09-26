export const ok = (res, data, message) =>
  res.json({ success: true, data, ...(message ? { message } : {}) });

export const created = (res, data, message) =>
  res.status(201).json({ success: true, data, ...(message ? { message } : {}) });

export const paginated = (res, rows, page, limit, total) =>
  res.json({
    success: true,
    data: rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });

export const fail = (res, status, error) =>
  res.status(status).json({ success: false, error });
