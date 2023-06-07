import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Text, Button } from "@chakra-ui/react";
import Grid from "@toast-ui/react-grid";
import TuiGrid from "tui-grid";
import { loadProgressBar } from "axios-progress-bar";
import { decodeToken, isLoginCheck } from "../provider/auth";
import style from "../styles/Home.module.css";

import "tui-grid/dist/tui-grid.min.css";
import "axios-progress-bar/dist/nprogress.css";
// 전역변수
const axios = require("axios").default;
// Toast-ui에서 사용하는 Grid css
TuiGrid.setLanguage("ko");
TuiGrid.applyTheme("default", {
  grid: {
    border: "#ccc",
    text: "#333",
  },
  cell: {
    header: {
      background: "#fff",
    },
    rowHeader: {
      background: "#fff",
    },
    normal: {
      background: "#fff",
      showVerticalBorder: true,
      showHorizontalBorder: true,
    },
    disabled: {
      background: "#fff",
      text: "#7a7a7a",
    },
  },
});

// 순번표시 렌더러
export class EstimateDataNumCustomRenderer {
  constructor(props) {
    const rootDom = document.createElement("div");
    const row = props.grid.getRow(props.rowKey);
    rootDom.style.overflow = "hidden";
    this.el = rootDom;
    // set instance property for grid
    this.grid = props.grid;
    this.props = props;
    this.row = row;
    if (props.columnInfo.renderer.options) {
      this.click = props.columnInfo.renderer.options.handler;
    }
    this.render(props);
  }

  getElement() {
    return this.el;
  }

  onClick() {
    if (this.click) {
      this.click(this.props);
    }
  }

  render() {
    let element;
    if (this.row.data_type === "parent") {
    } else {
      element = (
        <button onClick={() => this.onClick()}>{this.props.rowKey + 1}</button>
      );
    }
    ReactDOM.render(element, this.el);
  }
}

// 요청수량 렌더러
export class EstimateCustomCommonRenderer {
  constructor(props) {
    this.el = document.createElement("span");
    const { type } = props.columnInfo.renderer.options;
    this.type = type;
    this.value = this.formatter(props);
    this.render(props);
  }

  getElement() {
    return this.el;
  }

  formatter(props) {
    if (this.type === "number") {
      return Number(props.value).toLocaleString();
    } else if (this.type === "float") {
      return props.value > 100
        ? Number(props.value).toLocaleString()
        : Number(props.value).toLocaleString();
    } else {
      return isNaN(props.value)
        ? props.value
        : Number(props.value).toLocaleString();
    }
  }

  render(props) {
    if (props.value) {
      if (this.type === "number" || this.type === "float") {
        let val = props.value.toString().replace(",", "");
        if (isNaN(val) !== false) {
          alert("숫자만 입력 가능합니다");
          return false;
        }
      }
      let value = this.formatter(props);
      // 입력된 값으로 변경
      this.el.textContent = value;
    } else {
      this.el.textContent = "";
    }
    this.el.classList.add("ml-2");
    this.el.classList.add("mr-2");
  }
}

// 견적서 tui grid
export default function PurchaseGrid(props) {
  const urlParams = new URLSearchParams(window.location.search);
  loadProgressBar();
  const ref = useRef();

  const es_id = props.es_id;
  const [data, setData] = useState();
  const [mb_id, setMbId] = useState(null);

  const urlFromOndaQuotation = process.env.ONDA_API_URL + `/api/order/`;

  // 데이터 로드
  const loadData = async (props) => {
    await axios.get(urlFromOndaQuotation).then((res) => {
      setData(res.data.data);
      getMbId();
    });
  };
  const getMbId = async () => {
    //로그인 했을때만 mb_id를 던지도록 보완
    const isLogin = await isLoginCheck();

    if (isLogin) {
      const info = await decodeToken();
      setMbId(info.payload.mb_id);
    } else {
      setMbId(null);
    }
  };

  // 컬럼 설정
  const columns = [
    {
      header: "순번",
      name: "data_num",
      width: 30,
      className: "font12 text-center",
      renderer: {
        type: EstimateDataNumCustomRenderer,
      },
      filter: "select",
    },
    {
      header: "부품번호",
      name: "partnumber",
      className: "font12 text-center",
      minWidth: 130,
      hidden: false,
      filter: "select",
    },
    {
      header: "상태",
      name: "od_status",
      className: "font12 text-center",
      hidden: false,
      minWidth: 80,
    },

    {
      header: "제조사",
      name: "manufacturer",
      className: "font12",
      hidden: false,
      width: 130,
    },
    {
      header: "유통사(명칭)",
      name: "p_it_maker",
      className: "font12 text-center",
      hidden: false,
      minWidth: 60,
    },
    {
      header: "SKU",
      name: "sku",
      className: "font12",
      hidden: false,
      minWidth: 60,
    },
    {
      header: "재고",
      name: "qty",
      className: "font12",
      renderer: {
        type: EstimateCustomCommonRenderer,
        options: {
          type: "number",
        },
      },
      align: "center",
      width: 60,
      className: "font-12",
    },

    {
      header: "요청수량",
      name: "quantity",
      hidden: false,
      align: "center",
      renderer: {
        type: EstimateCustomCommonRenderer,
        options: {
          type: "number",
        },
      },
      minWidth: 60,
      filter: "select",
    },
    {
      header: "원가",
      name: "onda_price",
      align: "center",
      hidden: false,
      renderer: {
        type: EstimateCustomCommonRenderer,
        options: {
          type: "float",
        },
      },
      width: 60,
      filter: "select",
      editor: "text",
    },
    {
      header: "견적가",
      name: "price",
      className: "text-primary font-weight-bold",
      align: "center",
      hidden: false,
      renderer: {
        type: EstimateCustomCommonRenderer,
        options: {
          type: "float",
        },
      },
      width: 60,
      filter: "select",
      editor: "text",
    },
    {
      header: "매입가",
      name: "panda_price",
      className: "text-primary font-weight-bold",
      align: "center",
      hidden: false,
      renderer: {
        type: EstimateCustomCommonRenderer,
        options: {
          type: "float",
        },
      },
      width: 70,
      filter: "select",
    },
    {
      header: "D/C(제조일)",
      name: "dc",
      className: "font12",
      hidden: false,
      minWidth: 70,
    },
    {
      header: "packaging",
      name: "packaging",
      className: "font12",
      hidden: false,
      minWidth: 70,
    },
    {
      header: "Lead Time",
      name: "lead_time",
      className: "font12",
      hidden: false,
      minWidth: 70,
    },
  ];

  // 유통사 발주 취소하기
  const cancelOrder = async () => {
    try {
      let rows = ref.current.getInstance().getCheckedRows();

      if (rows.length === 0) {
        alert("발주 취소할 주문 선택은 필수입니다.");
        return;
      }

      let body = { orderLists: [] };
      for (const row of rows) {
        body.orderLists.push({
          od_id: row.od_id,
          od_status: "cancelled",
        });
      }

      let URL = process.env.ONDA_API_URL + "/api/order/partner/changeStatus";

      const res = await axios.post(URL, body, {
        headers: {
          "content-type": "application/json",
        },
      });

      // validation 확정된 발주일 경우,
      if (res.data.status === 409) {
        alert("이미 확정된 상태입니다.");
        return;
      }

      // 확정되지 않은 발주를 취소할 경우
      if (res.status === 201) {
        alert("발주 취소가 완료되었습니다.");
        setTimeout(function () {
          location.reload();
        }, 1000);
      } else {
        alert("다시 시도해주세요");
      }
    } catch (e) {
      console.log("err " + e);
    }
  };

  // 판다파츠 견적회신하기
  const orderStartToContribution = async () => {
    try {
      let body = { orderLists: [] };
      let rows = ref.current.getInstance().getCheckedRows();
      // 유통사 발주하기 validation
      if (rows.length == 0) {
        alert("유통사로 발주할 부품번호 선택은 필수입니다.");
        return;
      }

      for (let i = 0; i < rows.length; i++) {
        if (rows[i].onda_price == 0 || rows[i].onda_price == null) {
          alert("순번 " + i + "번째에 원가를 집어 넣어주세요");
          return;
        }

        body.orderLists[i] = {
          od_id: rows[i].od_id,
          p_it_maker: rows[i].p_it_maker,
          od_status: rows[i].od_status,
          price: rows[i].onda_price,
          manufacturer: rows[i].manufacturer,
          partnumber: rows[i].partnumber,
          quantity: rows[i].quantity,
          p_es_id: rows[i].p_es_id,
        };
      }

      const res = await axios.post(
        process.env.ONDA_API_URL + `/api/order/partner`,
        body
      );

      if (res.status === 201) {
        alert("유통사 발주가 완료되었습니다.");
        setTimeout(function () {
          location.reload();
        }, 1000);
      } else {
        alert("다시 시도해주세요");
      }
    } catch (e) {
      console.log("err" + e);
    }
  };

  useEffect(() => {
    loadData(es_id);
  }, []);

  if (data) {
    return (
      <>
        <div className="mb-5 estimate-detail__body">
          <div
            className={style.estimate_list_detail_btns}
            style={{ marginTop: "none", margin: "35px 0" }}
          >
            <div
              className={style.estimate_detail_left}
              style={{
                fontWeight: "500",
                color: "#555",
                fontSize: "12.5px",
                left: "50%",
                margin: "40px 0",
                marginTop: "none",
              }}
            >
              <Text
                style={{
                  display: "block",
                  color: "#333",
                  fontSize: "1.875rem",
                }}
              >
                주문목록
              </Text>
            </div>
            <div
              className={style.estimate_detail_right}
              style={{ marginTop: "30px" }}
            >
              <Button
                type="button"
                className={style.estimate_list_detail_btn}
                onClick={cancelOrder}
              >
                유통사
                <br /> 발주 취소하기
              </Button>
              <Button
                type="button"
                className={style.estimate_list_detail_btn}
                onClick={orderStartToContribution}
              >
                유통사 <br /> 발주하기
              </Button>
            </div>
          </div>
          <Grid
            ref={ref}
            data={data}
            columns={columns}
            columnOptions={{ resizable: true }}
            heightResizable={true}
            w="100%"
            treeColumnOptions={{
              name: "partnumber",
              useIcon: false,
              useCascadingCheckbox: true,
            }}
            rowHeaders={[{ type: "checkbox", checked: false }]}
            refresh={() => loadData()}
          />
        </div>
      </>
    );
  } else {
    return <></>;
  }
}
