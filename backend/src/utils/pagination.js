function paginate(page = 1, limit = 20, maxLimit = 100) {
  const safePage = Math.max(1, parseInt(page) || 1);
  const safeLimit = Math.min(maxLimit, Math.max(1, parseInt(limit) || 20));
  const offset = (safePage - 1) * safeLimit;
  return { page: safePage, limit: safeLimit, offset };
}

module.exports = { paginate };
