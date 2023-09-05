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

const getQueryString = (line: string) =>
  `{
    predictSectionFlow(line: "${line}") {
      up {
        source
        target
        flow
      }
      down {
        source
        target
        flow
      }
    }
  }`;

const trimStation = (sta: string) => {
  if(sta.slice(0, 3) === 'Sta') {
    return sta.slice(3);
  } else {
    return sta;
  }
}

const SectionFlow = ({
  line,
  style,
}: {
  line: string;
  style?: React.CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const windowSize = useWindowSize();

  const renderChart = (predictSectionFlow: any) => {
    if (!ref.current) return;
    const chart =
      echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current);
    chart.setOption({
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          return `${params[0].name}<br />${params[0].marker}${
            params[0].value
          }<br />${params[1].marker}${-params[1].value}`;
        },
      },
      grid: {
        left: "1%",
        right: "1%",
        top: "10%",
        bottom: "1%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: [
          trimStation(predictSectionFlow.up[0].source),
          ...predictSectionFlow.up.map((e: any) => trimStation(e.target)),
        ],
        axisLabel: {
          color: "rgba(255,255,255,0.75)",
          fontSize: 6,
          formatter: (value: string) => value.split("").join("\n"),
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "rgba(255,255,255,0.75)",
          formatter: (value: string) => Math.abs(+value),
        },
        splitLine: {
          lineStyle: {
            color: "#666",
          },
        },
      },
      series: [
        {
          data: [...predictSectionFlow.up.map((e: any) => e.flow), 0],
          stack: "total",
          type: "bar",
          emphasis: emphasisStyle,
          color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            {
              offset: 0,
              color: "rgba(126,53,200,0.5)",
            },
            {
              offset: 1,
              color: "rgba(160,149,196,1)",
            },
          ]),
        },
        {
          data: [0, ...predictSectionFlow.down.map((e: any) => -e.flow)],
          stack: "total",
          type: "bar",
          emphasis: emphasisStyle,
          color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            {
              offset: 0,
              color: "rgba(191,202,230,0.5)",
            },
            {
              offset: 1,
              color: "rgba(33,62,245,1)",
            },
          ]),
        },
      ],
    });
  };

  useEffect(() => {
    fetcher(getQueryString(line)).then((data) => {
      renderChart(data.predictSectionFlow);
    });
  }, [line]);
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

export default SectionFlow;
