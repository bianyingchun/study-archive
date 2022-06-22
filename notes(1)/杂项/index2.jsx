import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Form,
  Select,
  Button,
  Table,
  Pagination,
  Progress,
  Message,
  Popconfirm,
  Spin,
} from "antd";
import classnames from "classnames";
import { connect } from "dva";
import { CLEAN_TYPE_LIST } from "@/constants/cleanTypes";
import { AD_COLUMN_LIST } from "@/constants/adColumnList";
import {
  STATISTICAL_TIME,
  CREATE_TIME,
  CONVERSION_COUNT,
  COST,
  LESS_EQUALS,
  STATUS_OPTIONS,
} from "@/constants/filterConfig";
import { STATUS_SUSPEND } from "@/constants/adStatus";
import FilterGroup from "@/components/FilterGroup";
import { QUOTA_LIST } from "@/constants/filterConfig";
import service from "@/services";
import { usePercent } from "@/hooks";
import style from "./style.less";

const defaultFilterGroup = [{ field: QUOTA_LIST[0].field, id: -1 }];

let timer = null;
let tick = 100;
let step = 1;

const { Option } = Select;
const MODE_LIST = [...CLEAN_TYPE_LIST].reverse();
const initialPagination = { current: 1, pageSize: 50, total: 0 };

const matchMode = ({ createDateType, filtering = [], countType }) => {
  if (createDateType !== 0 && countType !== 2) return null;
  let costFilter,
    conversionFilter = null;
  filtering.forEach((item) => {
    if (item.field === COST && item.operator === LESS_EQUALS) costFilter = item;
    else if (item.field === CONVERSION_COUNT && item.operator === LESS_EQUALS)
      conversionFilter = item;
  });
  if (!costFilter || !conversionFilter) return null;
  return MODE_LIST.find((item) => {
    const config = item.config;
    if (
      config.createDateType !== createDateType ||
      config.countType !== countType
    )
      return false;
    if (
      costFilter.value <= config.filtering[0].value &&
      conversionFilter.value <= config.filtering[1].value
    )
      return true;
    return false;
  });
};

const filterVlaidator = (rule, list = [], callback) => {
  try {
    const filterMaps = {};
    if (!list.length) return callback("过滤条件不得少于一条");
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const { field, operator, value } = item;
      if (!field || !operator || isNaN(parseFloat(value))) {
        return callback("请输入完整判断条件");
      }
      if (!filterMaps[field]) {
        filterMaps[field] = {};
      }
      if (filterMaps[field][operator]) return callback("存在相同的过滤条件");
      filterMaps[field][operator] = value;
    }
    callback();
  } catch (err) {
    callback(err);
  }
};

const Main = (props) => {
  const { form, globalModel } = props;
  const { code } = globalModel;
  const { getFieldDecorator, setFieldsValue, getFieldsValue } = form;
  const [accountList, setAccountList] = useState([]);
  const [adList, setAdList] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [selectedAdIdList, setSelectedAdIdList] = useState([]);
  const [percent, setPercent] = useState(0);
  const [scaned, setScaned] = useState(false);
  const [isScaning, setIsScanning] = useState(false);
  const precentRef = useRef(0);
  const isScaningRef = useRef(false);
  const filterParams = useRef({});
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const mode = matchMode(getFieldsValue());
  const currentPageIdList = adList.map((item) => item.id);
  // 按钮可用状态
  const btnDisable = useMemo(() => {
    return !selectedAdIdList.length || !scaned;
  }, [scaned, selectedAdIdList.length]);
  // 获取广告列表
  const getAdList = useCallback(async () => {
    try {
      setIsFetching(true);
      const res = await service.getAdList({
        ...filterParams.current,
        page: {
          page: pagination.current,
          page_size: pagination.pageSize,
        },
      });
      if (res && res.data) {
        const { pageInfo, data = [] } = res;
        if (pageInfo) {
          const { totalNumber } = pageInfo || {};
          setPagination({
            ...pagination,
            total: totalNumber,
          });
        }
        setAdList(data);
      } else {
        Message.error("数据请求失败");
      }
      isScaningRef.current = false;
    } catch (err) {
      Message.error(err);
    } finally {
      setIsFetching(false);
    }
  }, [pagination]);

  // 账户列表
  useEffect(() => {
    (async () => {
      if (!code) return;
      const res = await service.getAccountList();
      if (res && res.data) {
        setAccountList(res.data);
      }
    })();
  }, [code]);

  useEffect(() => {
    if (scaned) {
      getAdList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageSize, pagination.current]);
  useEffect(() => {
    if (isScaning) {
      getAdList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScaning]);
  // 扫描广告
  function scanAdList() {
    validate(async () => {
      setPercent(0);
      setIsScanning(true);
      setScaned(false);
      precentRef.current = 0;
      isScaningRef.current = true;
      setPagination(initialPagination);
      timer = setInterval(() => {
        if (isScaningRef.current) {
          tick = 100;
          step = 1;
        } else {
          step = 10;
        }
        if (isScaningRef.current) {
          precentRef.current = Math.min(99, precentRef.current + step);
          setPercent(precentRef.current);
        } else {
          const percent = (precentRef.current = Math.min(
            100,
            precentRef.current + step
          ));
          setPercent(percent);
          if (percent >= 100) {
            clearInterval(timer);
            tick = 100;
            setTimeout(() => {
              setScaned(true);
              setIsScanning(false);
            }, 200);
          }
        }
      }, tick);
    });
  }

  function setCleanMode(item) {
    const { filtering, createDateType, countType } = item.config;
    setFieldsValue({
      filtering,
      createDateType,
      countType,
    });
  }

  function validate(cb) {
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        let {
          accountIDs,
          createDateType,
          countType,
          filtering = [],
          status,
        } = fieldsValue;
        filtering = filtering.map((item) => {
          return { ...item, value: [item.value + ""], id: undefined };
        });
        const params = {
          status,
          createDateType,
          accountIDs,
          countType,
          filtering,
        };
        filterParams.current = params;
        cb && cb();
      }
    });
  }

  // 批量删除广告
  async function clearAdBatch() {
    if (loading) return;
    if (!selectedAdIdList.length) {
      Message.warning("请选择广告");
    }
    setLoading(true);
    const res = await service.clearAd({ id: selectedAdIdList });
    setLoading(false);
    if (res) {
      const newList = adList.filter(
        (item) => !selectedAdIdList.includes(item.id)
      );
      setAdList(newList);
      setPagination({
        ...pagination,
        total: pagination.total - selectedAdIdList.length,
      });
      setSelectedAdIdList([]);
      Message.success("删除成功");
    } else {
      Message.error("删除失败");
    }
  }

  async function suspendAdBatch() {
    if (loading) return;
    if (!selectedAdIdList.length) {
      Message.warning("请选择广告");
    }
    setLoading(true);
    const res = await service.suspendAd({ id: selectedAdIdList });
    setLoading(false);
    if (res) {
      const newList = adList.map((item) => {
        if (selectedAdIdList.includes(item.id)) {
          item = { ...item, status: STATUS_SUSPEND };
        }
        return item;
      });
      setAdList(newList);
      setPagination({
        ...pagination,
        total: pagination.total - selectedAdIdList.length,
      });
      setSelectedAdIdList([]);
      Message.success("暂停成功");
    } else {
      Message.error("删除失败");
    }
  }
  return (
    <Spin spinning={loading}>
      <div className={style.main}>
        <div className={style.cleanTypeList}>
          {CLEAN_TYPE_LIST.map((item, index) => (
            <div
              className={classnames([
                style.cleanTypeCard,
                { [style.active]: mode && item.id === mode.id },
              ])}
              key={index}
              onClick={() => setCleanMode(item)}
            >
              <div className={style.title}>{item.title}</div>
              <div className={style.desc}>{item.desc}</div>
            </div>
          ))}
        </div>
        <Form layout="horizontal">
          <div className={style.blockFormItem}>
            <Form.Item label="选择账户">
              {getFieldDecorator("accountIDs", {
                rules: [
                  {
                    required: true,
                    message: "请选择账户",
                  },
                ],
              })(
                <Select mode="multiple" placeholder="账户（可多选）">
                  {accountList.map((accountItem) => (
                    <Option
                      key={accountItem.accountID}
                      value={accountItem.accountID}
                      title={accountItem.name}
                    >
                      <span>
                        {accountItem.name}（{accountItem.accountID}）
                      </span>
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </div>
          <div className={style.selectGroup}>
            <div className={style.formItemContainer}>
              <Form.Item label="创建日期">
                {getFieldDecorator("createDateType", {
                  initialValue: CREATE_TIME[0].value,
                  rules: [
                    {
                      required: true,
                      message: "请选择广告创建日期",
                    },
                  ],
                })(
                  <Select>
                    {CREATE_TIME.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.title}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="统计时间">
                {getFieldDecorator("countType", {
                  initialValue: STATISTICAL_TIME[0].value,
                  rules: [
                    {
                      required: true,
                      message: "请选择统计时间",
                    },
                  ],
                })(
                  <Select>
                    {STATISTICAL_TIME.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.title}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>

              <Form.Item label="投放状态">
                {getFieldDecorator("status", {
                  initialValue: STATUS_OPTIONS[0].value,
                })(
                  <Select>
                    {STATUS_OPTIONS.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.title}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </div>
          </div>

          <div className={style.filterList}>
            <Form.Item>
              {getFieldDecorator("filtering", {
                initialValue: defaultFilterGroup,
                rules: [
                  {
                    validator: filterVlaidator,
                  },
                ],
              })(<FilterGroup></FilterGroup>)}
            </Form.Item>
          </div>
          <div className={style.actionGroup}>
            <Button
              type="primary"
              className={style.btnItem}
              onClick={scanAdList}
              disabled={isScaning || !code}
            >
              开始扫描
            </Button>
            <Popconfirm
              title="是否确认暂停？"
              okText="确认"
              cancelText="取消"
              className={style.btnItem}
              onConfirm={() => {
                suspendAdBatch();
              }}
              disabled={btnDisable}
            >
              <Button disabled={btnDisable}>批量暂停</Button>
            </Popconfirm>
            <Popconfirm
              title="是否确认删除？"
              okText="确认"
              cancelText="取消"
              onConfirm={() => {
                clearAdBatch();
              }}
              className={style.btnItem}
              disabled={btnDisable}
            >
              <Button disabled={btnDisable}>批量删除</Button>
            </Popconfirm>
          </div>
        </Form>
        {isScaning ? (
          <div>
            <Progress percent={percent} />
          </div>
        ) : (
          <div className={style.dataList}>
            <Table
              columns={AD_COLUMN_LIST}
              dataSource={adList}
              rowKey={(record) => record.id}
              loading={isFetching}
              rowSelection={{
                selectedRowKeys: selectedAdIdList,
                onChange: (selectedRowKeys) => {
                  setSelectedAdIdList([
                    ...new Set([
                      ...selectedAdIdList.filter(
                        (id) => !currentPageIdList.includes(id)
                      ),
                      ...selectedRowKeys,
                    ]),
                  ]);
                },
              }}
              pagination={false}
            ></Table>
            <div className={style.paginationContainer}>
              <Pagination
                {...pagination}
                pageSizeOptions={[10, 20, 50, 200, 500, 1000].map(
                  (item) => item + ""
                )}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `共 ${total} 条数据`}
                onChange={(current) => {
                  setPagination({ ...pagination, current });
                }}
                onShowSizeChange={(current, size) => {
                  setPagination({ ...pagination, pageSize: size });
                }}
              ></Pagination>
            </div>
          </div>
        )}
      </div>
    </Spin>
  );
};
export default connect(
  ({ globalModel, loading }) => {
    return {
      globalModel,
      loading,
    };
  },
  (dispatch) => {
    return {
      dispatch,
    };
  }
)(Form.create({})(Main));
