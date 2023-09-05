import React, { useCallback, useEffect, useRef } from "react";
import { request } from "graphql-request";
import * as echarts from "echarts";
import useWindowSize from "../useWindowSize";

const chartStyle: React.CSSProperties = {
  height: "100%",
};

const fetcher = (query: string) => request("/api/graphql/", query);

const getQueryString = (station: string, start: string, end: string, eitherInOut: string) =>
  `{
      singleStationFlow(station: "${station}", dateRange: {start: "${start}", end: "${end}"}) {
        ${eitherInOut === 'in' ? 'flowIn' : 'flowOut'} {
          time
          flow
        }
      }
    }`;

const SingleStationFlow = ({
  station,
  dateRange,
  eitherInOut,
  style,
}: {
  station: string;
  dateRange: [string, string];
  eitherInOut: string;
  style: React.CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const windowSize = useWindowSize();

  const renderChart = useCallback((singleStationFlow: {
    flowIn: { time: string; flow: number }[];
    flowOut: { time: string; flow: number }[];
  }) => {
    if (!ref.current) return;
    const chart =
      echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current);
    const key = eitherInOut === 'in' ? 'flowIn' : 'flowOut';
    chart.setOption({
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "10%",
        right: "10%",
        top: "10%",
        bottom: "2%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: singleStationFlow[key].map((e) => e.time),
        show: false,
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "rgba(255,255,255,0.75)"
        },
        splitLine: {
          lineStyle: {
            color: "#666"
          }
        },
      },
      series: [
        {
          data: singleStationFlow[key].map((e) => e.flow),
          showSymbol: false,
          type: "line",
          lineStyle: {
            color: '#ea8739',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
              {
                offset: 0,
                color: "rgba(59,24,41,0.3)",
              },
              {
                offset: 1,
                color: "rgba(153,86,117,1)",
              },
            ]),
          },
        },
      ],
    });
  }, [eitherInOut]);

  useEffect(() => {
    fetcher(getQueryString(station, ...dateRange, eitherInOut)).then((data) => {
      renderChart(data.singleStationFlow);
    });
  }, [station, dateRange, eitherInOut, renderChart]);
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

export default SingleStationFlow;
