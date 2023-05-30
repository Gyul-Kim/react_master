import DoughnutChart from "../components/chart/doughnut";
import FilledLineChart from "../components/chart/linechart";
import style from "../styles/Home.module.css";
import $ from "jquery";

export default function ChartAll() {
  const onClickMonth = () => {
    $("#monthLineChart").show();
    $("#annualLineChart").hide();
  };
  const onClickAnnual = () => {
    $("#monthLineChart").hide();
    $("#annualLineChart").show();
  };

  return (
    <div className={style.main_md}>
      <div className={style.main_lft}>
        <div style={{ display: "flex", width: "92%" }}>
          <h3>거래액</h3>
          <button onClick={onClickMonth}>월별</button>
          <button onClick={onClickAnnual}>연별</button>
        </div>

        <div className={style.chart_frame}>
          <FilledLineChart />
        </div>
      </div>
      <div className={style.main_rt}>
        <h3>Hit Rate</h3>

        <div className={style.chart_frame}>
          <DoughnutChart />
        </div>
      </div>
    </div>
  );
}
