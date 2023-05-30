import { useEffect, useState } from "react";
import { Chart } from "chart.js";
import style from "../../styles/Home.module.css";
const axios = require("axios").default;

function FilledLineChart() {
  const [data, setData] = useState("");
  const [monthlyTotalData, setMonthlyTotalData] = useState("");

  const URLDashboard = process.env.ONDA_API_URL + "/api/dashboard";
  const loadData = async () => {
    await axios.get(URLDashboard).then((res) => {
      setData(res.data.data);
      setMonthlyTotalData(Object.values(res.data.data.monthly_total_array[0]));
    });
  };

  useEffect(() => {
    loadData();

    var ctx = document.getElementById("monthLineChart").getContext("2d");
    var ctx2 = document.getElementById("annualLineChart").getContext("2d");
    var myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "1월",
          "2월",
          "3월",
          "4월",
          "5월",
          "6월",
          "7월",
          "8월",
          "9월",
          "10월",
          "11월",
          "12월",
        ],
        datasets: [
          {
            data: [monthlyTotalData],
            label: "Hit",
            borderColor: "#3e95cd",
            backgroundColor: "#7bb6dd",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          xAxes: [
            {
              display: true,
            },
          ],
          yAxes: [
            {
              display: true,
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });

    var myChart2 = new Chart(ctx2, {
      type: "line",
      data: {
        labels: ["2020", "2021", "2022", "2023", "2024"],
        datasets: [
          {
            data: [86, 114, 106, 106, 107],
            label: "Applied",
            borderColor: "#3e95cd",
            backgroundColor: "#7bb6dd",
            fill: false,
          },
          {
            data: [70, 90, 44, 60, 83],
            label: "Accepted",
            borderColor: "#3cba9f",
            backgroundColor: "#71d1bd",
            fill: false,
          },
          // {
          //   data: [10, 21, 60, 44, 17, 21, 17],
          //   label: "Pending",
          //   borderColor: "#ffa500",
          //   backgroundColor: "#ffc04d",
          //   fill: false,
          // },
          {
            data: [6, 3, 2, 2, 7],
            label: "Rejected",
            borderColor: "#c45850",
            backgroundColor: "#d78f89",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          xAxes: [
            {
              display: true,
            },
          ],
          yAxes: [
            {
              display: true,
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }, []);

  return (
    <>
      {/* Bar chart */}

      <div className={style.earning_chart}>
        <canvas id="monthLineChart"></canvas>
        <canvas id="annualLineChart" style={{ display: "none" }}></canvas>
      </div>
    </>
  );
}

export default FilledLineChart;
