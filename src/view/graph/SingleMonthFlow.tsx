import React, { useEffect, useRef, useState } from "react";
import { request } from "graphql-request";
import * as echarts from "echarts";
import { Row, Col } from "antd";
import useWindowSize from "../useWindowSize";

const chartStyle: React.CSSProperties = {
  height: "100%",
};

const fetcher = (query: string) => request("/api/graphql/", query);

const getQueryString = (timeYm: string) =>
  `{
      singleMonthFlow(timeYm: "${timeYm}") {
        time
        flow
      }
    }`;

const SingleMonthFlow = ({
  month,
  style,
}: {
  month: string;
  style?: React.CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const predictRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(getQueryString("2020-06"));
  const windowSize = useWindowSize();

  const renderChart = (singleMonthFlow: any[]) => {
    if (!ref.current) return;
    const chart =
      echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current);
    chart.setOption({
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "6%",
        right: "6%",
        top: "10%",
        bottom: "0%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: singleMonthFlow.map((e) => e.time),
        show: false,
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "rgba(255,255,255,0.75)",
        },
        splitLine: {
          lineStyle: {
            color: "#666",
          },
        },
      },
      series: [
        {
          data: singleMonthFlow.map((e) => e.flow),
          showSymbol: false,
          type: "line",
          lineStyle: {
            color: "#53b9c9",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
              {
                offset: 0,
                color: "rgba(53,80,177,0.7)",
              },
              {
                offset: 1,
                color: "rgba(83,185,201,1)",
              },
            ]),
          },
        },
      ],
    });
  };

  const renderPredictChart = (predictSingleMonthFlow: any[]) => {
    if (!predictRef.current) return;
    const chart =
      echarts.getInstanceByDom(predictRef.current) ??
      echarts.init(predictRef.current);
    chart.setOption({
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "6%",
        right: "6%",
        top: "10%",
        bottom: "0%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: predictSingleMonthFlow.map((e) => e.time),
        show: false,
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "rgba(255,255,255,0.75)",
        },
        splitLine: {
          lineStyle: {
            color: "#666",
          },
        },
      },
      series: [
        {
          data: predictSingleMonthFlow.map((e) => e.flow),
          showSymbol: false,
          type: "line",
          lineStyle: {
            color: "#53b9c9",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
              {
                offset: 0,
                color: "rgba(53,80,177,0.7)",
              },
              {
                offset: 1,
                color: "rgba(83,185,201,1)",
              },
            ])
          },
        },
      ],
    });
  };

  useEffect(() => {
    setQuery(getQueryString(month));
  }, [month]);
  useEffect(() => {
    fetcher(query).then((data) => {
      renderChart(data.singleMonthFlow);
    });
  }, [query]);
  useEffect(() => {
    fetcher(
      ` {
        predictSingleMonthFlow(timesteps: 31) {
          time
          flow
        }
      }`
    ).then((data) => {
      renderPredictChart(data.predictSingleMonthFlow);
    });
  }, []);
  useEffect(() => {
    (() => {
      if (!ref.current) return;
      const chart = echarts.getInstanceByDom(ref.current);
      if (!chart) return;
      setTimeout(() => {
        chart.resize();
      }, 3);
    })();
    (() => {
      if (!predictRef.current) return;
      const chart = echarts.getInstanceByDom(predictRef.current);
      if (!chart) return;
      setTimeout(() => {
        chart.resize();
      }, 3);
    })();
  }, [windowSize]);

  return (
    <Row style={Object.assign({ height: "100%" }, style)} gutter={16}>
      <Col style={{ height: "100%" }} span={12}>
        <div ref={ref} style={chartStyle}></div>
      </Col>
      <Col style={{ height: "100%" }} span={12}>
        <div ref={predictRef} style={chartStyle}></div>
      </Col>
    </Row>
  );
};

export default SingleMonthFlow;
