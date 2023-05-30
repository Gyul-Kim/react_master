import React, { useState, useEffect } from "react";
import style from "../../styles/Home.module.css";
const axios = require("axios").default;

export default function BoxIndicator() {
  const [data, setData] = useState("");

  const [totalSumOrder, setTotalSumOrder] = useState("");
  const [totalSumOrderRate, setTotalSumOrderRate] = useState("");
  const [totalYearlyOrder, setTotalYearlyOrder] = useState("");
  const [totalYearlyOrderRate, setTotalYearlyOrderRate] = useState("");

  const [totalCountOrder, setTotalCountOrder] = useState("");
  const [totalCountOrderRate, setTotalCountOrderRate] = useState("");
  const [totalCountReply, setTotalCountReply] = useState("");
  const [totalCountReplyRate, setTotalCountReplyRate] = useState("");

  const [totalCount, setTotalCount] = useState("");
  const [totalCountRate, setTotalCountRate] = useState("");

  const URLDashboard = process.env.ONDA_API_URL + "/api/dashboard";
  const loadData = async () => {
    await axios.get(URLDashboard).then((res) => {
      setData(res.data.data);

      setTotalCount(res.data.data.totalCount);
      setTotalCountRate(res.data.data.percentage);

      setTotalCountReply(res.data.data.totalCountReply);
      setTotalCountReplyRate(
        res.data.data.yesterday_to_today_increase_rate_reply
      );

      setTotalCountOrder(res.data.data.totalCountOrder);
      setTotalCountOrderRate(
        res.data.data.yesterday_to_today_increase_rate_order
      );

      setTotalSumOrder(res.data.data.totalSumOrder);
      setTotalSumOrderRate(res.data.data.monthly_to_today_increase_rate_order);

      setTotalSumOrder(res.data.data.totalSumOrder);
      setTotalSumOrderRate(res.data.data.monthly_to_today_increase_rate_order);
      setTotalYearlyOrder(res.data.data.totalYearlyOrder);
      setTotalYearlyOrderRate(
        res.data.data.yearly_to_today_increase_rate_order
      );
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (data) {
    return (
      <div className={style.main_tp}>
        <div className={style.bx_indicator}>
          <h4>견적요청 건수</h4>
          <p>{totalCount}건</p>
          <p>{totalCountRate}%</p>
          <p>Since Yesterday</p>
        </div>
        <div className={style.bx_indicator}>
          <h4>견적회신건수</h4>
          <p>{totalCountReply}건</p>
          <p>{totalCountReplyRate}%</p>
          <p>Since Yesterday</p>
        </div>
        <div className={style.bx_indicator}>
          <h4>주문건수</h4>
          <p>{totalCountOrder}건</p>
          <p>{totalCountOrderRate}%</p>
          <p>Since Yesterday</p>
        </div>
        <div className={style.bx_indicator}>
          <h4>월 거래액</h4>
          <p>₩{totalSumOrder}</p>
          <p>{totalSumOrderRate}%</p>
          <p>Since Yesterday</p>
        </div>
        <div className={style.bx_indicator}>
          <h4>연 거래액</h4>
          <p>₩{totalYearlyOrder}</p>
          <p>{totalYearlyOrderRate}%</p>
          <p>Since Yesterday</p>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
