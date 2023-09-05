import React, { useEffect, useRef } from "react";
import { request } from "graphql-request";
import * as echarts from "echarts";
import useWindowSize from "../useWindowSize";

const chartStyle: React.CSSProperties = {
  height: "100%",
};
const emphasisStyle = {
  itemStyle: {
    shadowBlur: 20,
    shadowColor: "rgba(255,255,255,0.3)",
  },
};

const fetcher = (query: string) => request("/api/graphql/", query);

const getQueryString = (start: string, end: string) =>
  `{
      dayTypeFlow(dateRange: {start: "${start}", end: "${end}"}) {
        workday
        weekend
      }
    }`;

const DayTypeFlow = ({
  dateRange,
  style,
}: {
  dateRange: [string, string];
  style?: React.CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const windowSize = useWindowSize();

  const renderChart = (dayTypeFlow: any) => {
    if (!ref.current) return;
    const chart =
      echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current);
    chart.setOption({
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "10%",
        right: "10%",
        top: "8%",
        bottom: "6%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: ["工作日", "周末"],
        axisLabel: {
          color: "rgba(255,255,255,0.75)",
        },
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
          data: [
            Math.round(dayTypeFlow.workday),
            Math.round(dayTypeFlow.weekend),
          ],
          type: "bar",
          emphasis: emphasisStyle,
          itemStyle: {
            normal: {
              color: (params: any) => {
                const colorList = [
                  new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                    {
                      offset: 0,
                      color: "rgba(87,49,60,0.8)",
                    },
                    {
                      offset: 1,
                      color: "rgba(191,47,47,0.9)",
                    },
                  ]),
                  new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                    {
                      offset: 0,
                      color: "rgba(43,44,74,0.8)",
                    },
                    {
                      offset: 1,
                      color: "rgba(44,52,202,0.9)",
                    },
                  ]),
                ];
                return colorList[params.dataIndex];
              },
            },
          },
        },
      ],
    });
  };

  useEffect(() => {
    fetcher(getQueryString(...dateRange)).then((data) => {
      renderChart(data.dayTypeFlow);
    });
  }, [dateRange]);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.getInstanceByDom(ref.current);
    if (!chart) return;
    setTimeout(() => {
      chart.resize();
    }, 3);
  }, [windowSize]);
  return <div ref={ref} style={Object.assign({}, chartStyle, style)}></div>;
};

export default DayTypeFlow;
