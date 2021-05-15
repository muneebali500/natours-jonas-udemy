class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1) FILTERING
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = [`page`, `sort`, `limit`, `fields`];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj); // converting obj into string
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  // 2) SORTING
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(`,`).join(` `);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(`price`); // by default value
    }

    return this;
  }

  // 3) FIELD LIMITING
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(`,`).join(` `);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select(`-__v`); // removing '__v' field from every tour
    }

    return this;
  }

  // 4. PAGINATION
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
