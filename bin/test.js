const getLikedGraphs = async (id, opts = {}) => {
  let { page = 1, limit = 10 } = opts;
  const query = { from: id };
  const options = {
    page: Number(page),
    limit: Number(limit),
    populate: {
      path: "to",
      populate: {
        path: "auth",
        select: getUserFields(),
      },
      select: getGraphFields(),
    },
    sort: { ct: -1 },
  };
  const result = await Like.paginate(query, options);
  const list = result.docs.map(item => { 
    const graph = dealGraphItem(item.toObject().to, id)
    graph.favtime = item.ct;
    return graph
  })
  return {
    total: result.total,
    page: result.page,
    limit: result.limit,
    list
  };
};