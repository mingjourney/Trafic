import "./PageLayout.css";
import React, { useCallback, useState } from "react";
import { Col, Row, DatePicker, Radio, Select } from "antd";
import { createFromIconfontCN } from "@ant-design/icons";
import moment, { Moment } from "moment";
import outsideBorderImage from "./outside-border.png";
import itemBorderImage from "./border.png";
import MetroMap from "./graph/MetroMap";
import SingleMonthFlow from "./graph/SingleMonthFlow";
import AgeStructure from "./graph/AgeStructure";
import DayTypeFlow from "./graph/DayTypeFlow";
import DayTypeFlowPredict from "./graph/DayTypeFlowPredict";
import SingleStationFlow from "./graph/SingleStationFlow";
import SingleStationFlowPredict from "./graph/SingleStationFlowPredict";
import SectionFlow from "./graph/SectionFlow";
import SectionFlowPredict from "./graph/SectionFlowPredict";
import LineToLineFlow from "./graph/LineToLineFlow";
import useWindowSize from "./useWindowSize";

const { RangePicker } = DatePicker;
const { Option } = Select;

const IconFont = createFromIconfontCN({
  scriptUrl: ["//at.alicdn.com/t/font_2432588_5ydj5zh9i86.js"],
});

const iconStyle = {
  fontSize: 27,
  paddingRight: 1,
};

const outsideBorderStyle = {
  border: "60px solid transparent",
  borderImage: `url(${outsideBorderImage}) 60 60 stretch`,
  width: 1320,
  height: 690,
};
const itemBorderStyle = {
  border: "17px solid transparent",
  borderImage: `url(${itemBorderImage}) 20 20 stretch`,
};
const MonthPickerStyle = {
  width: 100,
  height: 16,
};
const rangePickerStyle = {
  width: 260,
  height: 28,
};

const defaultMomentSingleMonthFlow = moment("2020-06");
const defaultMomentRange: [Moment, Moment] = [
  moment("2020-07-07"),
  moment("2020-07-12"),
];

const radioOptions = [
  { label: "进站", value: "in" },
  { label: "出站", value: "out" },
];
const mapRadioOptions = [
  {
    label: "OD客流",
    value: "day",
  },
  {
    label: "早高峰",
    value: "morning",
  },
  {
    label: "晚高峰",
    value: "evening",
  },
];
const mapEitherHistoryOrFutureRadioOptions = [
  {
    label: "历史",
    value: "history",
  },
  {
    label: "预测",
    value: "future",
  },
];

const PageLayout = () => {
  const [month, setMonth] = useState("2020-06");
  const [range, setRange] = useState(["2020-07-07", "2020-07-12"] as [
    string,
    string
  ]);
  const [eitherInOut, setEitherInOut] = useState("in");
  const [station, setStation] = useState("Sta1");
  const windowSize = useWindowSize();
  const [mapType, setMapType] = useState("day");
  const [mapEitherHistoryOrFuture, setMapEitherHistoryOrFuture] = useState(
    "history"
  );
  const [line, setLine] = useState("1号线");

  const onChangeMonth = (_date: any, dateString: string) => {
    if (dateString) {
      setMonth(dateString);
    }
  };
  const onChangeRange = (_value: any, dateString: [string, string]) => {
    if (dateString[0] && dateString[1]) {
      setRange(dateString);
    }
  };
  const onChangeRadio = (e: any) => {
    setEitherInOut(e.target.value);
  };
  const onChangeStation = useCallback((sta: string) => {
    setStation(sta);
  }, []);
  const onChangeMapRadio = (e: any) => {
    setMapType(e.target.value);
  };
  const onChangeMapEitherHistoryOrFutureRadio = (e: any) => {
    setMapEitherHistoryOrFuture(e.target.value);
  };
  const onChangeLine = (value: string) => {
    setLine(value);
  };

  return (
    <div
      style={{
        width: windowSize.width - 20,
        height: windowSize.height - 80,
      }}
    >
      <div
        className="outside-border"
        style={Object.assign({}, outsideBorderStyle, {
          width: windowSize.width - 140,
          height: windowSize.height - 120,
        })}
      ></div>
      <div className="header">轨道交通智慧客流分析预测</div>
      <div className="container">
        <div className="item item-1" style={itemBorderStyle}>
          <div className="flex-vertical">
            <div>
              <IconFont type="icon-zhou" style={iconStyle} />
              <h2 className="inline">工作日周末客流分析</h2>
            </div>
            <h3>历史</h3>
            <DayTypeFlow dateRange={range} style={{ flex: 1 }} />
            <h3 style={{ marginTop: 3 }}>预测</h3>
            <DayTypeFlowPredict style={{ flex: 1 }} />
          </div>
        </div>
        <div className="item item-2" style={itemBorderStyle}>
          <div className="flex-vertical">
            <div>
              <IconFont type="icon-gonglu" style={iconStyle} />
              <h2 className="inline">线路换乘分析</h2>
            </div>
            <LineToLineFlow style={{ flex: 1 }} dateRange={range} />
          </div>
        </div>
        <div className="item item-3" style={itemBorderStyle}>
          <div className="flex-vertical">
            <div>
              <IconFont type="icon-yonhu" style={iconStyle} />
              <h2 className="inline">用户年龄结构分析</h2>
            </div>
            <AgeStructure style={{ flex: 1, marginTop: 3 }} />
          </div>
        </div>
        <div className="item item-4">
          <div className="flex-vertical">
            <div style={{ display: "flex" }}>
              <RangePicker
                defaultPickerValue={defaultMomentRange}
                defaultValue={defaultMomentRange}
                onChange={onChangeRange}
                style={rangePickerStyle}
              />
              <div style={{ flex: 1 }}></div>
              <Radio.Group
                options={radioOptions}
                onChange={onChangeRadio}
                value={eitherInOut}
                optionType="button"
              />
            </div>
            <div
              className="map"
              style={Object.assign({ flex: 1 }, itemBorderStyle)}
            >
              <div className="flex-vertical">
                <div style={{ display: "flex" }}>
                  <Radio.Group
                    options={mapEitherHistoryOrFutureRadioOptions}
                    onChange={onChangeMapEitherHistoryOrFutureRadio}
                    value={mapEitherHistoryOrFuture}
                    optionType="button"
                  />
                  <div style={{ flex: 1 }}></div>
                  <Radio.Group
                    options={mapRadioOptions}
                    onChange={onChangeMapRadio}
                    value={mapType}
                    optionType="button"
                  />
                </div>
                <MetroMap
                  onChange={onChangeStation}
                  dateRange={range}
                  mapType={mapType}
                  eitherInOut={eitherInOut}
                  eitherHistoryOrFuture={mapEitherHistoryOrFuture}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="item item-5" style={itemBorderStyle}>
          <div className="flex-vertical">
            <div>
              <IconFont type="icon-subway-active" style={iconStyle} />
              <h2 className="inline">单站点客流分析</h2>
            </div>
            <h3 style={{ marginTop: 3 }}>历史</h3>
            <SingleStationFlow
              style={{ flex: 1 }}
              station={station}
              dateRange={range}
              eitherInOut={eitherInOut}
            />
            <h3 style={{ marginTop: 3 }}>预测</h3>
            <SingleStationFlowPredict
              style={{ flex: 1 }}
              station={station}
              eitherInOut={eitherInOut}
            />
          </div>
        </div>
        <div className="item item-6" style={itemBorderStyle}>
          <div className="flex-vertical">
            <div>
              <IconFont type="icon-yue" style={iconStyle} />
              <h2 className="inline">单月整体客流波动分析</h2>
            </div>
            <Row gutter={16} style={{ marginTop: 3 }}>
              <Col span={12}>
                <div style={{ display: "flex" }}>
                  <h3>历史</h3>
                  <div style={{ flex: 1 }}></div>
                  <DatePicker
                    defaultPickerValue={defaultMomentSingleMonthFlow}
                    defaultValue={defaultMomentSingleMonthFlow}
                    onChange={onChangeMonth}
                    picker="month"
                    style={MonthPickerStyle}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: "flex" }}>
                  <h3>预测</h3>
                </div>
              </Col>
            </Row>
            <SingleMonthFlow style={{ flex: 1 }} month={month} />
          </div>
        </div>
        <div className="item item-7" style={itemBorderStyle}>
          <div className="flex-vertical">
            <div style={{ display: "flex" }}>
              <IconFont type="icon-xianlu" style={iconStyle} />
              <h2>线路断面流量分析</h2>
              <div style={{ flex: 1 }}></div>
              <Select
                onChange={onChangeLine}
                defaultValue="1号线"
                style={{ width: 90 }}
              >
                <Option value="1号线">1号线</Option>
                <Option value="2号线">2号线</Option>
                <Option value="3号线">3号线</Option>
                <Option value="4号线">4号线</Option>
                <Option value="5号线">5号线</Option>
                <Option value="10号线">10号线</Option>
                <Option value="11号线">11号线</Option>
                <Option value="12号线">12号线</Option>
              </Select>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <h3>历史</h3>
              </Col>
              <Col span={12}>
                <h3>预测</h3>
              </Col>
            </Row>
            <Row style={{ flex: 1 }} gutter={16}>
              <Col style={{ height: "100%" }} span={12}>
                <SectionFlow
                  line={line}
                  dateRange={range}
                  style={{ flex: 1 }}
                />
              </Col>
              <Col style={{ height: "100%" }} span={12}>
                <SectionFlowPredict
                  line={line}
                  style={{ flex: 1 }}
                />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
