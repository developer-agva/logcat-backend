class QueryHelper {
  constructor(query, queryStr) {
      this.query = query;
      this.queryStr = queryStr;
  }

  logFilter() {
      const queryObj = { ...this.queryStr };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach(el => delete queryObj[el]);
      let dt = new Date(queryObj["endDate"])
      dt.setDate(dt.getDate()+1)
      if (queryObj.startDate && queryObj.endDate) {
          queryObj.createdAt = { gte: new Date(queryObj["startDate"]), lte: dt }
      } else if (queryObj.startDate) {
          queryObj.createdAt = { gte: new Date(queryObj["startDate"]) }
      } else if (queryObj.endDate) {
          queryObj.createdAt = { lte: dt }
      }

      if (queryObj.logType) {
          queryObj.logType = (queryObj.logType).split('-');
      } else delete queryObj.logType
      
      let queryStr = JSON.stringify(queryObj);
      console.log(queryObj)
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      queryStr = queryStr.replace("logType", "log.type")
      queryStr = queryStr.replace("createdAt", "log.date")
      console.log(queryStr)
      this.query = this.query.find(JSON.parse(queryStr)).lean().maxTimeMS(10000).select({'version':1, 'type': 1, 'device': 1, 'log.date': 1, 'log.type': 1, 'log.message': 1, 'log.file': 1, 'log.filePath': 1, 'createdAt':1})
      return this;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    let dt = new Date(queryObj["endDate"])
    dt.setDate(dt.getDate()+1)
    if (queryObj.startDate && queryObj.endDate) {
        queryObj.createdAt = { gte: new Date(queryObj["startDate"]), lte: dt }
    } else if (queryObj.startDate) {
        queryObj.createdAt = { gte: new Date(queryObj["startDate"]) }
    } else if (queryObj.endDate) {
        queryObj.createdAt = { lte: dt }
    }
    
    let queryStr = JSON.stringify(queryObj);
    console.log(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    console.log(queryStr)
    this.query = this.query.find(JSON.parse(queryStr)).lean().maxTimeMS(10000)
    return this;
}

  sort() {
      if (this.queryStr.sort) {
          const sortBy = this.queryStr.sort.split(',').join(' ');
          this.query = this.query.sort(sortBy);
      } else {
          this.query = this.query.sort('-createdAt');
      }

      return this;
  }

  paginate() {
      const page = parseInt(this.queryStr.page) || 1;
      const limit = parseInt(this.queryStr.limit) || 500;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      return this;
  }

}

module.exports = QueryHelper;