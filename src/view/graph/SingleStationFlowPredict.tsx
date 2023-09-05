import React, { useCallback, useEffect, useRef } from "react";
import { request } from "graphql-request";
import * as echarts from "echarts";
import useWindowSize from "../useWindowSize";

const chartStyle: React.CSSProperties = {
  height: "100%",
};

const fetcher = (query: string) => request("/api/graphql/", query);

const getQueryString = (station: string, eitherInOut: string) =>
  `{
      predictSingleStationFlow(station: "${station}") {
        ${eitherInOut === 'in' ? 'flowIn' : 'flowOut'} {
          time
          flow
        }
      }
    }`;

const SingleStationFlowPredict = ({
  station,
  eitherInOut,
  style,
}: {
  station: string;
  eitherInOut: string;
  style: React.CSSProperties;
}) => {
  const predictRef = useRef<HTMLDivElement>(null);

  const windowSize = useWindowSize();

  const renderPredictChart = useCallback((predictSingleStationFlow: {
    station: string;
    flowIn: { time: string; flow: number }[];
    flowOut: { time: string; flow: number }[];
  }) => {
    if (!predictRef.current) return;
    const chart =
      echarts.getInstanceByDom(predictRef.current) ??
      echarts.init(predictRef.current);
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
        data: predictSingleStationFlow[key].map((e) => e.time),
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
          data: predictSingleStationFlow[key].map((e) => e.flow),
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
          }
        },
      ],
    });
  }, [eitherInOut]);

  useEffect(() => {
    fetcher(getQueryString(station, eitherInOut)).then((data) => {
      renderPredictChart(data.predictSingleStationFlow);
    });
  }, [station, eitherInOut, renderPredictChart]);
  useEffect(() => {
    if (!predictRef.current) return;
    const chart = echarts.getInstanceByDom(predictRef.current);
    if (!chart) return;
    setTimeout(() => {
      chart.resize();
    }, 3)
  }, [windowSize]);

  return <div ref={predictRef} style={Object.assign({}, chartStyle, style)}></div>;
};

export default SingleStationFlowPredict;
