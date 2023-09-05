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

const DayTypeFlowPredict = ({ style }: { style?: React.CSSProperties }) => {
  const predictRef = useRef<HTMLDivElement>(null);

  const windowSize = useWindowSize();

  const renderPredictChart = (
    predictSingleMonthFlow: { isWorkday: boolean; flow: number }[]
  ) => {
    if (!predictRef.current) return;
    const chart =
      echarts.getInstanceByDom(predictRef.current) ??
      echarts.init(predictRef.current);
    const workdays = predictSingleMonthFlow.filter((e) => e.isWorkday);
    const weekends = predictSingleMonthFlow.filter((e) => !e.isWorkday);
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
            Math.round(
              workdays.reduce((total, e) => total + e.flow, 0) / workdays.length
            ),
            Math.round(
              weekends.reduce((total, e) => total + e.flow, 0) / weekends.length
            ),
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
    fetcher(
      ` {
        predictSingleMonthFlow(timesteps: 31) {
          isWorkday
          flow
        }
      }`
    ).then((data) => {
      renderPredictChart(data.predictSingleMonthFlow);
    });
  }, []);
  useEffect(() => {
    if (!predictRef.current) return;
    const chart = echarts.getInstanceByDom(predictRef.current);
    if (!chart) return;
    setTimeout(() => {
      chart.resize();
    }, 3);
  }, [windowSize]);
  return (
    <div ref={predictRef} style={Object.assign({}, chartStyle, style)}></div>
  );
};

export default DayTypeFlowPredict;
