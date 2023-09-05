import React, { useEffect, useRef } from "react";
import { request } from "graphql-request";  
import * as echarts from "echarts";
import useWindowSize from "../useWindowSize";

const chartStyle: React.CSSProperties = {
  height: "100%",
};

const fetcher = (query: string) => request("/api/graphql/", query);

const AgeStructure = ({ style }: { style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);

  const windowSize = useWindowSize();

  const renderChart = (ageStructure: { male: number[]; female: number[] }) => {
    if (!ref.current) return;
    const chart =
      echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current);
    const all = [];
    const ages = [
      "0-10岁",
      "10-20岁",
      "20-30岁",
      "30-40岁",
      "40-50岁",
      "50-60岁",
      "60-100岁",
    ];
    for (let i = 0; i < 6; i++) {
      all.push({
        value: ageStructure.male[i] + ageStructure.female[i],
        name: ages[i],
      });
    }
    all.push({
      value:
        ageStructure.male[6] +
        ageStructure.male[7] +
        ageStructure.male[8] +
        ageStructure.male[9] +
        ageStructure.female[6] +
        ageStructure.female[7] +
        ageStructure.female[8] +
        ageStructure.female[9],
      name: "60-100岁",
    });
    chart.setOption({
      grid: {
        left: "2%",
        right: "2%",
        top: "5%",
        bottom: "5%",
        containLabel: true,
      },
      tooltip: {
        trigger: "item",
        formatter: "{b} : {c} ({d}%)",
      },
      series: [
        {
          type: "pie",
          radius: [8, 40],
          roseType: 'area',
          label: {
            color: "rgba(255,255,255,0.75)",
          },
          itemStyle: {
            borderRadius: 3,
            color: (params: any) => {
              const colors: string[] = [
                "rgba(63,83,141,1)",
                "rgba(158,201,127,1)",
                "rgba(243,200,107,0.8)",
                "rgba(222,110,106,1)",
                "rgba(132,191,219,1)",
                "rgba(89,159,118,1)",
                "rgba(144,88,67,0.9)"
              ];
              return colors[params.dataIndex];
            },
          },
          labelLayout: {
            moveOverlap: 'shiftY',
          },
          data: all,
        },
      ],
    });
  };

  useEffect(() => {
    fetcher(
      `{
        ageStructure {
          male
          female
        }
      }`
    ).then((data) => {
      renderChart(data.ageStructure);
    });
  }, []);
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

export default AgeStructure;
