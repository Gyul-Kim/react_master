import BaseLayout from "../../components/base_layout";
import PurchaseNav from "../../components/navi/purchase_nav";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import style from "../../styles/Home.module.css";

const PurchaseGrid = dynamic(() => import("../../components/purchase_detail"), {
  ssr: false,
});

// 전역변수
const axios = require("axios").default;

export default function PurchaseDetail() {
  const [loadingShow, setLoadingShow] = useState(true);
  const [orderData, setOrderData] = useState([]);
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(10);
  const [total, setTotal] = useState(1);
  useEffect(() => {
    // checkAdmin(p_es_id, admin_mb_no);
    showPurchase();
  }, [page]);

  const showPurchase = async () => {
    try {
      // data 및 total 호출
      const res = await getPurchaseFromOnda(page, offset);

      // offset, total, data 불러오기
      setOffset(offset);
      setTotal(res.data.length);
      setOrderData(res.data);
      setLoadingShow(false);
    } catch (e) {
      setLoadingShow(false);
    }
  };

  const handlePageChange = (page) => setPage(page);

  return (
    <BaseLayout>
      <PurchaseNav />
      <div className="flex-center" id="purchase_grid">
        <PurchaseGrid />
      </div>
    </BaseLayout>
  );
}
