import _ from "lodash";
import DataSet from "@antv/data-set";

const EXPRESSION_REG = "(sum|count|max|min|avg)\\((.+?)\\)";
/**
 * 执行表达式
 * @param {string} expression
 * @param {Object} scope
 *
 * @example
 *  executeExpression('sum(cost)/sum(imp)*1000',{
 *      count:{
 *        click:300
 *      },
 *      sum:{
 *         click:2
 *      }
 *   })
 */
function executeExpression(expression = "", scope = {}) {
  const exp = expression.replace(new RegExp(EXPRESSION_REG, "g"), (a, b, c) =>
    a.replace(c, `'${c}'`)
  );

  // eslint-disable-next-line no-new-func
  let count = function (key) {
    if (scope.count) {
      if (scope.count.hasOwnProperty(key)) {
        return scope.count[key];
      } else {
        console.error("表达式使用不存在的字段：", key);
        return NaN;
      }
    }
  };

  let sum = function (key) {
    if (scope.sum) {
      if (scope.sum.hasOwnProperty(key)) {
        return scope.sum[key];
      } else {
        console.error("表达式使用不存在的字段：", key);
        return NaN;
      }
    }
  };
  return new Function(
    "count",
    "sum",
    `
      try {
        return ${exp}
      } catch (e) {
        console.error('expressionError：${expression}');
        console.error(e);
        return NaN
      }
    
  `
  )(count, sum);
}

/**
 * 将数据转化成汇总方法
 * @param {Object} data
 * @param {Array}  fields
 * @param {Array}  operations
 * @param {Array}  as
 *
 * fields operations as 三者长度相等
 *
 * fields 字段真实名称
 * operations 操作方式
 * as   别名
 *
 * @return {Object}
 *
 * @example
 *
 *  data {a:1,b:2,c:3,a_count:3}
 *  fields:[a,b,c,a]
 *  operations:[sum,count,sum,count]
 *  as:[a,b,c,a_count]
 *
 *  return {
 *    sum:{
 *      a:1,
 *      c:3
 *    },
 *    count:{
 *      a:3,
 *      b:2
 *    }
 *  }
 *
 */
function dataToScopeData(data, fields, operations, as) {
  const methods = {};

  _.each(fields, (f, index) => {
    const o = operations[index];
    methods[o] = methods[o] || {};
    methods[o][f] = data[as[index]];
  });

  return methods;
}

/**
 * 解析表达式
 * @param {String} expressionStr
 *
 * @example
 *  parseExpression('sum(cost)/sum(imp)*1000')
 *
 *  return {
 *    fields:[cost,imp],
 *    operations:[sum,sum]
 *  }
 */
function parseExpression(expressionStr = "") {
  const fields = [];
  const operations = [];
  const match = expressionStr.match(new RegExp(EXPRESSION_REG, "g"));
  if (match) {
    match.forEach((code) => {
      const [, operation, field] = code.match(new RegExp(EXPRESSION_REG));
      fields.push(field);
      operations.push(operation);
    });

    return {
      fields,
      operations,
    };
  }
  return null;
}

function parseAggregateMethod(field, config) {
  if (config) {
    let fields = [];
    let operations = [config.method === "avg" ? "median" : config.method];
    let as = [];
    let expression;

    if (config.method === "exp") {
      const reuslt = parseExpression(config.expression);
      expression = config.expression;
      if (reuslt) {
        /* eslint-disable prefer-destructuring */
        fields = reuslt.fields;
        operations = reuslt.operations;
        /* eslint-disable prefer-destructuring */
      }
    } else {
      fields = [field];
      as = [field];
    }

    return {
      fields,
      expression,
      operations,
      as,
      method: config.method,
    };
  }
  return null;
}

/**
 *
 * @param {*} xField
 * @param {*} yFields
 * @param {*} groupField
 * @param {*} data
 * @param {*} aggregateConfig
 *  cpm: {expression: "sum(cost)/sum(imp)*1000", method: "exp"}
 *  o_plan_count: {expression: "", method: "sum"}
 */
export default function aggregate(
  xField,
  yFields,
  groupField,
  data,
  aggregateConfig = {}
) {
  // 是否配置聚合方式
  const ds = new DataSet();

  const dv = ds.createView().source(data);

  let fields = [];
  let operations = [];
  let as = [];
  const expressions = {};
  const groupBy = [xField];
  let parseAggregateResult;

  const appendOption = (key, config) => {
    parseAggregateResult = parseAggregateMethod(key, config);
    if (parseAggregateResult) {
      fields = fields.concat(parseAggregateResult.fields);
      operations = operations.concat(parseAggregateResult.operations);
      as = as.concat(parseAggregateResult.fields);
      if (parseAggregateResult.expression) {
        expressions[key] = parseAggregateResult.expression;
      }
    } else {
      fields.push(key);
      operations.push("sumSimple"); // 默认使用累加
      as.push(key);
    }
  };

  if (!_.isEmpty(groupField)) {
    appendOption(yFields[0], aggregateConfig[yFields[0]]);
    groupBy.push(groupField);
  } else {
    _.each(yFields, (yf) => {
      appendOption(yf, aggregateConfig[yf]);
    });
  }

  // 去重
  const set = {};
  const asSet = [];
  const fieldsSet = [];
  const operationsSet = [];
  _.each(fields, (key, index) => {
    if (!set[`${key}_${operations[index]}`]) {
      set[`${key}_${operations[index]}`] = true;
      asSet.push(key);
      fieldsSet.push(fields[index]);
      operationsSet.push(operations[index]);
    }
  });

  // see https://g2.antv.vision/zh/docs/manual/dataset/transform/#aggregate-%E8%81%9A%E5%90%88%E7%BB%9F%E8%AE%A1
  // OR see https://simplestatistics.org/
  dv.transform({
    type: "aggregate",
    fields: fieldsSet, // 统计字段集
    operations: operationsSet, // 统计操作集
    as: asSet,
    groupBy,
  });

  const dataView = dv.rows;

  // 处理表达式
  Object.keys(expressions).forEach((key) => {
    _.each(dataView, (d) => {
      let value = executeExpression(
        expressions[key],
        dataToScopeData(d, fields, operations, as)
      );

      d[key] = Math.abs(value) === Infinity ? 0 : value;
    });
  });

  return dataView;
}

/**
 * 数据聚合
 * @param xField
 * @param yFields
 * @param groupField
 * @param data
 *
 * @returns [x,data,group]
 *  x {Array} x轴数据
 *  data {Array[Array]} 二维数组，每一个类别一个数据
 *  group {Array} 分组数据，跟data坐标一一对应。跟group相同坐标data即是对应的数据
 *
 * @example
 * [{
 *  date:'2019-10-10',
 *  value:3,
 *  value2:10,
 *  category:'a'
 * },{
 *  date:'2019-10-11',
 *  value:3,
 *  value2:10,
 *  category:'a'
 * },{
 *  date:'2019-10-10',
 *  value:3,
 *  value2:10,
 *  category:'b'
 * }]
 *
 * 不分组
 * xField = date
 * yFields = [value,value2]
 *
 * return [
 *  ['2019-10-10','2019-10-11'],
 *  [[6,3],[20,10]],
 *  null
 * ]
 *
 * 分组
 * xField = date
 * yFields = [value]
 * groupField = category
 * return [
 *  ['2019-10-10','2019-10-11'],
 *  [[3,3],[3,0]]
 *  ['a','b']
 * ]
 */
export function polymerize(xField, yFields, groupField, data, isXAxisSort) {
  let result = [];
  let xSets;
  const set = {};
  const map = new Map();
  const groupSet = {};
  let group = null;

  if (!_.isEmpty(groupField)) {
    _.each(data, (dat) => {
      // x
      if (!map.has(dat[xField])) {
        map.set(dat[xField], []);
      }

      let value = map.get(dat[xField]);
      value.push(dat);

      // group
      groupSet[dat[groupField]] = [];
    });

    xSets = [...map.keys()];

    // 对set进行排序
    // 避免出现 （'06-02','06-04','06-03'）
    // 不分组不排序 使用数据源顺序

    if (isXAxisSort) {
      xSets.sort((a, b) => (a < b ? -1 : a === b ? 0 : 1));
    }

    _.each(Object.keys(groupSet), (gkey) => {
      _.each(xSets, (setKey) => {
        const find = _.find(map.get(setKey), (dat) => dat[groupField] == gkey);
        if (find) {
          groupSet[gkey].push(find[yFields[0]]);
        } else {
          groupSet[gkey].push("");
        }
      });
    });

    result = Object.values(groupSet);

    group = Object.keys(groupSet);
  } else {
    _.each(data, (dat) => {
      // x
      if (!map.has(dat[xField])) {
        map.set(dat[xField], {});
      }

      // y
      _.each(yFields, (yf) => {
        let value = map.get(dat[xField]);
        value[yf] = dat[yf];
      });
    });

    xSets = [...map.keys()];

    if (isXAxisSort) {
      xSets.sort((a, b) => (a < b ? -1 : a === b ? 0 : 1));
    }

    result = _.map(yFields, (yf) => _.map(xSets, (x) => map.get(x)[yf]));

    group = yFields;
  }
  return [xSets, result, group];
}

/**
 *
 * @param {string} xFields
 * @param {array} yFields
 * @param {array} groupFields
 * @param {array} data
 * @param {object} aggregateConfig
 */
export const getChartData = (
  xField,
  yFields,
  groupField,
  data,
  aggregateConfig,
  isXAxisSort
) => {
  const aggregateData = aggregate(
    xField,
    yFields,
    groupField,
    data,
    aggregateConfig
  );

  return polymerize(xField, yFields, groupField, aggregateData, isXAxisSort);
};
