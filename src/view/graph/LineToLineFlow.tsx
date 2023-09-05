import React, { useEffect, useRef } from "react";
import { request } from "graphql-request";
import * as echarts from "echarts";
import useWindowSize from "../useWindowSize";

const chartStyle: React.CSSProperties = {
  height: "100%",
};

const fetcher = (query: string) => request("/api/graphql/", query);

const getQueryString = (start: string, end: string) =>
  `{
      lineToLineFlow(dateRange: {start: "${start}", end: "${end}"}) {
        source
        target
        flow
      }
    }`;

const LineToLineFlow = ({
  dateRange,
  style,
}: {
  dateRange: [string, string];
  style?: React.CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const windowSize = useWindowSize();

  const renderChart = (
    lineToLineFlow: Array<{ source: string; target: string; flow: number }>
  ) => {
    if (!ref.current) return;
    const chart =
      echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current);
    const arr = Array.from(new Set(lineToLineFlow.map((e) => e.source)));
    const data = [
      ...arr.map((e) => ({ name: e })),
      ...arr.map((e) => ({ name: `${e} ` })),
    ];
    const links = lineToLineFlow.map((e) => ({
      source: e.source,
      target: `${e.target} `,
      value: e.flow,
    }));
    chart.setOption({
      grid: {
        left: "5%",
        right: "5%",
        top: "5%",
        bottom: "5%",
        containLabel: true,
      },
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
      },
      series: [
        {
          type: "sankey",
          nodeWidth: 3,
          label: {
            color: "rgba(255,255,255,0.75)",
          },
          lineStyle: {
            color: "gradient",
          },
          data,
          links,
        },
      ],
    });
  };

  useEffect(() => {
    fetcher(getQueryString(...dateRange)).then((data) => {
      renderChart(data.lineToLineFlow);
    });
  }, [dateRange]);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.getInstanceByDom(ref.current);
    if (!chart) return;
    setTimeout(() => {
      chart.resize();
    }, 3)
  }, [windowSize]);
  return <div ref={ref} style={Object.assign({}, chartStyle, style)}></div>;
};

export default LineToLineFlow;
