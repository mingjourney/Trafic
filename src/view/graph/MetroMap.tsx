import React, { useCallback, useEffect, useRef, useState } from "react";
import { request } from "graphql-request";
import * as echarts from "echarts";
import { commonStationData, transferStationData, links, lineLabelData } from "./MetroMapData";
import useWindowSize from "../useWindowSize";

commonStationData.forEach((obj: any) => {
  Object.assign(obj, {
    symbol: "circle",
    symbolSize: [6, 6],
    label: {
      color: "rgba(255,255,255,0.75)",
      position: "bottom",
      fontSize: 10,
      fontWeight: 100,
      rotate: 0,
      padding: -4,
    },
    fixed: true,
    category: 2,
    itemStyle: {
      normal: {
        color: "rgba(255,255,255,0.2)",
      },
    },
  });
});

transferStationData.forEach((obj: any) => {
  Object.assign(obj, {
    symbol: "circle",
    symbolSize: [8, 8],
    label: {
      color: "rgba(255,255,255,0.75)",
      position: "bottom",
      fontSize: 10,
      rotate: 0,
      padding: -4,
    },
    fixed: true,
    category: 2,
    itemStyle: {
      normal: {
        color: "rgba(65,252,255,0.5)",
      },
    },
  });
});

lineLabelData.forEach(obj => {
    Object.assign(obj, {
        tooltip: {},
        symbolSize: 0,
        fixed: true,
        category: 1,
        itemStyle: {
            normal: {
                color: 'rgba(0,0,0,0)'
            }
        },
    })
});

const data = [...commonStationData, ...transferStationData];

const chartStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

const fetcher = (query: string) => request("/api/graphql/", query);

const getQueryString = (
  type: string,
  start: string,
  end: string,
  eitherInOut: string,
  eitherHistoryOrFuture: string
) => {
  if (eitherHistoryOrFuture === "history") {
    return type === "day"
      ? `{
          allStationsFlow(dateRange: {start: "${start}", end: "${end}"}) {
            station
            ${eitherInOut === "in" ? "flowIn" : "flowOut"}
          }
        }`
      : `{
          peakFlow(dateRange: {start: "${start}", end: "${end}"}) {
            ${type} {
              station
              ${eitherInOut === "in" ? "flowIn" : "flowOut"}
            }
          }
        }`;
  } else {
    return type === "day"
      ? `{
          predictStationsFlow {
            station
            ${eitherInOut === "in" ? "flowIn" : "flowOut"}
          }
        }`
      : `{
          predictPeakFlow {
            ${type} {
              station
              ${eitherInOut === "in" ? "flowIn" : "flowOut"}
            }
          }
        }`;
  }
};

const MetroMap = ({
  onChange,
  dateRange,
  mapType,
  eitherInOut,
  eitherHistoryOrFuture,
  style,
}: {
  onChange?(station: string): void;
  dateRange: [string, string];
  mapType: string;
  eitherInOut: string;
  eitherHistoryOrFuture: string;
  style?: React.CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [selectedStation, setSelectedStation] = useState("Sta1");

  const windowSize = useWindowSize();

  const renderChart = useCallback(
    (flowData) => {
      if (!ref.current) return;
      let chart = echarts.getInstanceByDom(ref.current);
      if (!chart) {
        chart = echarts.init(ref.current);
        chart.on("click", "series", (params: any) => {
          if (params.seriesType === "graph" && params.dataType === "node") {
            if (onChange) {
              setSelectedStation(params.name);
              onChange(params.name);
            }
          } else if (params.seriesType === "scatter") {
            if (onChange) {
              setSelectedStation(params.data[3]);
              onChange(params.data[3]);
            }
          }
        });
      }
      const key =
        eitherHistoryOrFuture === "history"
          ? mapType === "day"
            ? "allStationsFlow"
            : "peakFlow"
          : mapType === "day"
          ? "predictStationsFlow"
          : "predictPeakFlow";
      const keyIO = eitherInOut === "in" ? "flowIn" : "flowOut";
      flowData = flowData[key];
      if (mapType !== "day") {
        flowData = flowData[mapType];
      }
      const sum = flowData.reduce(
        (total: number, e: any) => total + e[keyIO],
        0
      );
      chart.setOption({
        backgroundColor: "#080f1d",
        grid: {
          left: "2%",
          right: "2%",
          top: "2%",
          bottom: "2%",
          containLabel: true,
        },
        xAxis: {
          show: false,
          min: 0,
          max: 2300,
          axisPointer: {
            show: false,
          },
        },
        yAxis: {
          show: false,
          min: 0,
          max: 2700,
          axisPointer: {
            show: false,
          },
        },
        dataZoom: [
          {
            type: "inside",
            xAxisIndex: [0],
            start: 0,
            end: 100,
            moveOnMouseMove: true,
          },
          {
            type: "inside",
            yAxisIndex: [0],
            start: 0,
            end: 100,
            moveOnMouseMove: true,
          },
        ],
        tooltip: {
          show: false
        },
        series: [
          {
            name: 'stations',
            type: "graph",
            draggable: false,
            coordinateSystem: "cartesian2d",
            symbol: "rect",
            symbolOffset: ["15%", 0],
            label: {
              normal: {
                show: true,
              },
            },
            labelLayout(params: any) {
              console.log(params);
              return {
                hideOverlap: true,
              }
            },
            data: data.map((e) =>
              Object.assign({}, e, {
                itemStyle: {
                  normal: {
                    color:
                      e.name === selectedStation
                        ? "#f00"
                        : e.itemStyle.normal.color,
                  },
                },
              })
            ),
            links,
            lineStyle: {
              normal: {
                opacity: 0.6,
                curveness: 0,
                width: 2,
              },
            },
          },
          {
            type: "graph",
            draggable: false,
            coordinateSystem: "cartesian2d",
            symbol: "rect",
            symbolOffset: ["15%", 0],
            label: {
              normal: {
                show: true,
              },
            },
            data: lineLabelData,
          },
          {
            type: "scatter",
            data: flowData.map((e: any) => {
              const station: any = data.find((s) => s.name === e.station);
              return [...station.value, e[keyIO], e.station];
            }),
            symbolSize: (data: number[]) => {
              return Math.sqrt((data[2] / sum) * 3000) * 3;
            },
            itemStyle: {
              color: (params: any) => {
                if (params.value[3] === selectedStation) {
                  return "#f00";
                }
                if (
                  transferStationData.find(
                    (e: any) => e.name === params.value[3]
                  )
                ) {
                  return new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
                    {
                      offset: 0,
                      color: "rgba(76,155,166,0.4)",
                    },
                    {
                      offset: 1,
                      color: "rgba(76,155,166,1)",
                    },
                  ]);
                }
                return new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
                  {
                    offset: 0,
                    color: "rgba(153,138,105,0.4)",
                  },
                  {
                    offset: 1,
                    color: "rgba(153,138,105,1)",
                  },
                ]);
              },
            },
          },
        ],
      });
    },
    [eitherHistoryOrFuture, mapType, eitherInOut, onChange, selectedStation]
  );

  useEffect(() => {
    fetcher(
      getQueryString(mapType, ...dateRange, eitherInOut, eitherHistoryOrFuture)
    ).then((data) => {
      renderChart(data);
    });
  }, [
    dateRange,
    eitherInOut,
    mapType,
    renderChart,
    selectedStation,
    eitherHistoryOrFuture,
  ]);
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

export default MetroMap;
