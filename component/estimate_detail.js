import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  Text,
  Button,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Modal,
  useDisclosure,
  Center,
  Box,
  position,
} from "@chakra-ui/react";
import Grid from "@toast-ui/react-grid";
import TuiGrid from "tui-grid";
import { loadProgressBar } from "axios-progress-bar";
import { decodeToken, isLoginCheck } from "../provider/auth";
import style from "../styles/Home.module.css";
import $ from "jquery";

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
      background: "#5499C7",
      text: "#fff",
    },
    rowHeader: {
      background: "#fff",
    },
    normal: {
      background: "#f6f6f6",
      showVerticalBorder: true,
      showHorizontalBorder: true,
    },
    disabled: {
      background: "#ddfe",
      text: "#7a7a7a",
    },
  },
});

// 순번표시 렌더러
export class EstimateDataNumCustomRenderer {
  constructor(props) {
    const rootDom = document.createElement("div");
    const row = props.grid.getRow(props.rowKey);
    rootDom.style.overflow = "visible";
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
      element = <span>{this.props.value}</span>;
    }
    ReactDOM.render(element, this.el);
  }
}

// 제조사 렌더러
export class EsitmateCustomPartnumberRenderer {
  constructor(props) {
    const rootDom = document.createElement("div");
    const row = props.grid.getRow(props.rowKey);
    rootDom.style.overflow = "hidden";
    const el = document.createElement("a");
    this.el = el;
    this.value = props.value; // 초기 값
    this.render(props);
  }

  getElement() {
    return this.el;
  }

  render(props) {
    this.el.classList.add("ml-2");
    // 수정된 text로 변경한다.
    let row = props.grid.getRow(props.rowKey);
    this.el.textContent = props.value;
    if (row.stock_no) {
      this.el.href = `/parts/view/PD${Number(row.stock_no)}`;
      this.el.target = "_blank";
      this.el.classList.add("text-primary");
    }
    if (row.data_num !== null) {
      if (row.data_type === "child") {
        this.el.classList.add("font12");
      } else {
        this.el.classList.add("font-weight-bold");
      }
      // 초기값과 변경된 값이 다르다면
      if (props.value) {
        if (this.value !== props.value) {
          const i = document.createElement("i");
          i.className = "fas fa-check text-success ml-2";
          this.el.append(i);
        } else {
        }
        this.value = props.value;
      }
    }
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

async function getPartnerData(keyword) {
  try {
    let URL = process.env.ONDA_API_URL + "/api/partner/findName";
    if (keyword) {
      URL += `?keyword=${keyword}`;
    }
    const res = await axios.get(URL, {
      headers: {
        "content-type": "application/json",
      },
    });
    if (res.data.status === 200) {
      return res.data;
    }
    if (res.data.status === 204) {
      return null;
    }
    return 0;
  } catch (e) {
    return 0;
  }
}

// 견적서 tui grid
export default function EstimateGrid(props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const urlParams = new URLSearchParams(window.location.search);
  loadProgressBar();
  const ref = useRef();

  const ref_partner = useRef();
  const ref_estimate_partner = useRef();

  const es_id = props.es_id;
  const type = urlParams.get("type");
  const [data, setData] = useState();
  const [keyword, setKeyword] = useState();
  const [mb_id, setMbId] = useState(null);

  const [dataPartner, setDataPartner] = useState();
  const [dataSendPartner, setDataSendPartner] = useState();
  const [checkDeleteKey, setCheckDeleteKey] = useState();
  const [closeAllBtn, setCloseAllBtn] = useState(0);
  const [blockModal, setBlockModal] = useState(0);
  const [blockReply, setBlockReply] = useState(0);

  useEffect(() => {
    initPartnerData();
  }, []);

  const initPartnerData = async () => {
    try {
      const res = await getPartnerData();
      setDataPartner(res.data.partners);
    } catch (e) {
      console.log(e);
    }
  };

  const urlFromOndaQuotation =
    process.env.ONDA_API_URL + `/api/quotation/list/${es_id}`;

  // 데이터 로드
  const loadData = async (props) => {
    await axios.get(urlFromOndaQuotation).then((res) => {
      setData(res.data.data);

      // 상태값 완료 개수 계산
      // 모든 견적이 완료될 시, 모든 버튼을 비활성화할 목적
      const dataRefined = res.data.data;
      const dataLength = res.data.data.length;
      // 기존 데이터에서 상태값'만'뽑기
      let checkCompleteDatumStatus = dataRefined.map(function (datum) {
        return datum.qr_status;
      });

      // 데이터 내 '완료(complete)' 값만 추출하는 함수
      function findComplete(element) {
        if (element === "complete") {
          return true;
        }
      }

      // 기존 데이터에서 '완료' 상태만 추출해서 개수 계산
      const filterOnlyCompleteData =
        checkCompleteDatumStatus.filter(findComplete);

      // 모든 데이터 개수와 '완료' 상태의 데이터 개수가 같다면,
      // 모든 견적이 완료되었음을 의미한다.
      if (dataLength == filterOnlyCompleteData.length) {
        setCloseAllBtn(1);
      }

      // 전체 견적이 미완료일 때, 견적회신하기 막기
      function findIncomplete(element) {
        if (element === "incomplete") {
          return true;
        }
      }

      const filterOnlyIncompleteData =
        checkCompleteDatumStatus.filter(findIncomplete);

      if (dataLength == filterOnlyIncompleteData.length) {
        setBlockReply(1);
      }
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
      className: "font12",
      minWidth: 130,
      hidden: false,
      filter: "select",
    },
    {
      header: "상태",
      name: "state_kr",
      className: "font12",
      minWidth: 50,
      hidden: false,
    },
    {
      header: "제조사",
      name: "manufacturer",
      className: "font12",
      hidden: false,
      minWidth: 130,
    },
    {
      header: "셀러(명칭)",
      name: "name",
      className: "font12",
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
      name: "cost_price",
      align: "center",
      hidden: false,
      editor: "text",

      renderer: {
        type: EstimateCustomCommonRenderer,
        options: {
          type: "float",
        },
      },
      width: 60,
      filter: "select",
    },
    {
      header: "견적가",
      name: "price",
      className: "text-primary font-weight-bold",
      align: "center",
      editor: "text",
      hidden: false,
      renderer: {
        type: EstimateCustomCommonRenderer,
        options: {
          type: "float",
        },
      },
      width: 60,
      filter: "select",
    },
    {
      header: "합계",
      name: "korean_total_est_price",
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
      header: "D/C(제조년)",
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
    {
      header: "등록일",
      name: "reg_date",
      className: "font12",
      hidden: false,
      width: 90,
    },
  ];

  const handleSearch = async () => {
    (async () => {
      if (keyword == null || keyword == "undefined") {
        alert("검색어 입력은 필수입니다.");
        return;
      }

      try {
        const res = await getPartnerData(keyword);
        setDataPartner(res.data.partners);
      } catch (e) {
        console.log(e);
      }
    })();
  };

  // [셀러 선택 견적요청하기] 모달창 내 선택 이벤트
  const handleSelect = async () => {
    const rows = ref_partner.current.getInstance().getCheckedRows();
    // 선택한 체크박스가 없을 경우 validation
    if (rows.length == 0) {
      alert("셀러를 선택해 주세요");
      return;
    }

    // 선택한 체크박스가 있을 경우 validation
    // 처음에는 선택한 셀러의 데이터의 상태가 "undefined"
    if (rows.length != 0) {
      if (dataSendPartner === undefined) {
        let dt_ids = rows.map((item) => {
          return {
            id: item.id,
            partner_name: item.partner_name,
            _attributes: { checkDisabled: false, checked: true },
          };
        });
        setDataSendPartner(dt_ids);
        // 기존에 선택한 셀러의 데이터 상태가 남이 있음
      } else {
        // 삭제 이벤트 클릭 후, 곧바로 선택한 셀러가 [견적대상 셀러] grid로 넘어가도록 한다.
        if (checkDeleteKey === "On") {
          let dt_ids = rows.map((item) => {
            return {
              id: item.id,
              partner_name: item.partner_name,
              _attributes: { checkDisabled: false, checked: true },
            };
          });
          setDataSendPartner(dt_ids);
          //[checkDeleteKey]의 값을 ""로 줌
          // 또 다른 셀러를 추가할 때, 기존의 셀러가 유지되면서 새로 추가된 셀러가 추가되도록 하기 위함
          setCheckDeleteKey("");
          return;
        }

        // 기존의 추가된 셀러에 새로운 셀러를 추가할 때,
        // 기존 추가한 셀러가 삭제가 되지 않도록 함과 동시에,
        // 새로운 셀러가 그대로 추가되도록 해주는 로직
        let dt_ids = ref_estimate_partner.current.getInstance().getData();

        rows.map((item) => {
          let ret = dataSendPartner.find((el, idx, data) => {
            if (el.id === item.id) {
              return true;
            }
          });
          if (ret == undefined) {
            dt_ids.push({
              id: item.id,
              partner_name: item.partner_name,
              _attributes: { checkDisabled: false, checked: true },
            });
          }
        });
        setDataSendPartner(dt_ids);
      }
    }
  };

  // [셀러 선택 견적요청하기] 모달창 내 삭제 이벤트
  const handleDelete = async () => {
    const rows = ref_estimate_partner.current.getInstance().getCheckedRows();
    // 선택한 체크박스가 없을 때 validation
    if (rows.length == 0) {
      alert("셀러를 선택해 주세요.");
      return;
    }
    // 선택한 체크박스가 삭제되도록 하는 함수 removeCheckedRows
    ref_estimate_partner.current.getInstance().removeCheckedRows(true);
    // 셀러 검색 grid의 선택버튼과 연동되도록 하는 on,off 변수
    setCheckDeleteKey("On");
  };

  // 셀러 선택 견적요청하기
  const requestQuotationFromDistribution = async () => {
    // 추후 체크하는 견적 내역 변경때 사용
    let rows = ref.current.getInstance().getCheckedRows();

    // 견적을 선택하지 않았을 때,
    if (rows.length === 0) {
      alert("부품번호 선택은 필수입니다.");
      return;
    }

    // 본 견적서
    let parentRows = ref.current
      .getInstance()
      .getCheckedRows()
      .filter((list) => list.data_type === "parent");

    let checkParentStatus = parentRows.map(function (datum) {
      return datum.qr_status;
    });

    function findIncompleteParentsStatus(element) {
      if (element === "incomplete") {
        return true;
      }
    }

    const filteredIncompleteParents = checkParentStatus.filter(
      findIncompleteParentsStatus
    );

    // 셀러 견적
    let childRows = ref.current
      .getInstance()
      .getCheckedRows()
      .filter((list) => list.data_type === "child");

    //자식요소 견적 상태값 배열
    let checkChildrenStatus = childRows.map(function (child) {
      return child.qr_state;
    });

    const filterChildrenStatus = (checkChildrenStatus, value) => {
      return checkChildrenStatus.filter((ele) => {
        return ele != value;
      });
    };

    const childReplyStatus = filterChildrenStatus(
      checkChildrenStatus,
      "incomplete"
    );

    // 셀러 견적(자식요소) 팝업창 막기
    // 혹은 셀러 견적과 본 견적(부모견적/상위견적) 둘 다 미완료일 때, 견적요청 팝첩창 막기
    if (
      childReplyStatus.length > 0 ||
      (filteredIncompleteParents.length > 0 && childRows.length > 0)
    ) {
      alert("셀러 선택 견적요청을 할 수 없습니다.");
      return;
    }

    // 본래 견적서 클릭 했을 때
    // 본 견적서와 셀러 견적서를 함께 클릭했을 때
    if (
      (parentRows.length > 0 && childRows.length > 0) ||
      parentRows.length > 0
    ) {
      onOpen();
      return;
    }

    // 셀러 견적만 선택했을 때, 팝업창
    if (childRows.length > 0) {
      alert("회신된 견적은 추가 요청할 수 없습니다.");
    }
  };

  // child 집어 넣기
  const makeChilds = async (parent) => {
    let childrenRows = ref_estimate_partner.current
      .getInstance()
      .getCheckedRows();

    let make = [];
    for (const child of childrenRows) {
      make.push({
        data_type: "child",
        partnumber: parent.partnumber,
        manufacturer: parent.manufacturer,
        es_id: parent.es_id,
        es_no: parent.es_no,
        it_maker: child.id,
        sku: "",
        qty: "",
        korean_price_attr: "",
        korean_est_price_attr: "",
        korean_total_est_price: "",
        quantity: parent.quantity,

        packaging: "",
        dc: "",
        lead_time: "",
      });
    }
    return make;
  };

  // 셀러 선택 견적 요청한 후, 데이터 세팅
  const handleAfterData = async () => {
    let rows = ref.current.getInstance().getCheckedRows();
    // parent가 아닌 경우는 모두 삭제
    rows = rows.filter((element, i) => element.data_num != null);

    let childrenRows = ref_estimate_partner.current
      .getInstance()
      .getCheckedRows();
    let keywordRows = ref_partner.current.getInstance().getCheckedRows();
    let body = { quotationLists: [] };

    for (const parent of rows) {
      if (parent.dtl_id !== undefined) {
        body.quotationLists.push({
          data_type: "parent",
          dtl_id: parent.dtl_id,
          data_num: parent.data_num,
          partnumber: parent.partnumber,
          manufacturer: parent.manufacturer,
          it_maker: parent.it_maker,
          sku: parent.sku,
          qty: parent.qty,
          quantity: parent.quantity,
          korean_price_attr: parent.korean_price_attr,
          korean_total_est_price: parent.korean_total_est_price,
          packaging: parent.packaging,
          dc: parent.dc,
          lead_time: parent.lead_time,
          es_id: parent.es_id,
          es_no: parent.es_no,
          req_id: parent.req_id,
          _children: await makeChilds(parent),
        });
      }
    }

    try {
      if (keywordRows == 0 && childrenRows == 0) {
        alert("셀러 선택은 필수입니다.");
        return;
      }
      if (childrenRows == 0) {
        alert("견적대상 셀러를 선택해 주세요.");
        return;
      }

      const res = await axios.post(
        process.env.ONDA_API_URL + `/api/quotation/reply`,
        body
      );
      if (res.data.status === 200) {
        alert("견적 대상 셀러에 견적요청이 완료되었습니다.");
        setTimeout(function () {
          location.reload();
        }, 1000);
      } else {
        alert("다시 입력해주세요.");
      }

      onClose();
    } catch (e) {
      console.log(e);
    }
  };

  // 판다파츠 견적회신하기
  const replyQuotationToPandaParts = async () => {
    try {
      let body = { quotationLists: [] };
      // 셀러 선택 견적만 추출 (child / 대체-선택)
      let rows = ref.current.getInstance().getCheckedRows();

      let childRows = ref.current
        .getInstance()
        .getCheckedRows()
        .filter((rows) => rows.data_type === "child");

      let parentRows = ref.current
        .getInstance()
        .getCheckedRows()
        .filter((list) => list.data_type === "parent");

      let checkParentStatus = parentRows.map(function (datum) {
        return datum.qr_status;
      });

      function findIncompleteParentsStatus(element) {
        if (element === "incomplete") {
          return true;
        }
      }

      const filteredIncompleteParents = checkParentStatus.filter(
        findIncompleteParentsStatus
      );

      // 판다파츠 견적회신하기 validation
      if (childRows.length == 0) {
        alert("부품번호를 선택해 주세요.");
        return;
      }
      // 셀러 견적과 미완료 사우이 견적이 함께 클릭되어 있을 때 막는 validation
      if (childRows.length > 0 && filteredIncompleteParents.length > 0) {
        alert("미완료인 견적은 회신할 수 없습니다.");
        return;
      }

      // 견적회신에 맞는 데이터 파싱 및 전송
      // data에서 parent 속 es_no 빼기
      for (let i = 0; i < childRows.length; i++) {
        // console.log("i의 개수 " + i);

        // 견적상태가 미완료일 경우, 회신할 수 없도록 함
        for (let j = 0; j < data.length; j++) {
          if (childRows[i].qr_state === "incomplete") {
            alert("미완료인 견적은 회신할 수 없습니다.");
            return;
          }

          if (
            //  children의 parentKey = data의 rowKey
            // 죽, children에 없는 es_no를 data 속 parent의 es_no로 맞춰서 넣어주는 작업
            childRows[i]._attributes.tree.parentRowKey === data[j].rowKey
          ) {
            body.quotationLists[i] = {
              partnumber: childRows[i].partnumber,
              manufacturer: childRows[i].manufacturer,
              it_maker: childRows[i].it_maker,
              it_id: null,
              quantity: data[j].quantity,
              es_id: props.es_id,
              es_no: data[j].es_no,
              qty: data[j].qty,
              moq: null,
              unit_no: childRows[i].unit_no,
              price: data[j].cost_price, // 원가
              est_price: childRows[i].price, // 견적가
              price_monetary: "KRW",
              monetary: "KRW",
              packaging: null,
              origin_pn: null,
              detailURL: null,
              datasheet: null,
              is_stock: null,
              price_reason_str: null,
              req_id: data[j].req_id,
              dtl_id: data[j].dtl_id,
            };
          }
        }
      }

      const res = await axios.post(
        process.env.ONDA_API_URL + `/api/quotation/masterpanda`,
        body
      );

      if (res.data.status === 200) {
        alert("견적 회신이 완료되었습니다.");
        setTimeout(function () {
          location.reload();
        }, 1000);
      } else {
        alert(res.data.msg);
      }
    } catch (e) {
      console.log("err" + e);
    }
  };

  // 데이터 갱신하기
  const refreshTuiGrid = async (e) => {
    try {
      loadData(e);
    } catch (e) {
      console.log("err " + e);
    }
  };

  const expandTuiGrid = () => {
    try {
      ref.current.getInstance().expandAll();
    } catch (e) {
      console.log("err " + e);
    }
  };

  // [셀러 선택 젼적 요청하기] 모달창 검색
  const searchKeyword = useCallback((e) => {
    setKeyword(e.target.value);
  });

  const columns_def = [
    {
      header: "셀러번호",
      name: "id",
      minWidth: 130,
      className: "font12",
      hidden: false,
      filter: "select",
    },

    {
      header: "셀러명",
      name: "partner_name",
      minWidth: 260,
      className: "font12",
      hidden: false,
    },
  ];

  useEffect(() => {
    if (!data) {
      loadData(es_id);

      ref.current.getInstance().on("onGridUpdated", (ev) => expandTuiGrid());
    }
  }, []);

  if (data) {
    return (
      <>
        <div className="mb-5 estimate-detail__body">
          <div className={style.estimate_list_detail_btns}>
            <div
              className={style.estimate_detail_left}
              style={{ fontWeight: "500", color: "#555", fontSize: "12.5px" }}
            >
              <Text
                style={{ display: "block", color: "#bbb", fontSize: "13px" }}
              >
                견적서명
              </Text>
              {es_id}
            </div>
            <div className={style.estimate_detail_right}>
              {closeAllBtn === 1 ? (
                <>
                  {" "}
                  <Button
                    type="button"
                    className={style.estimate_list_detail_btn_cant}
                  >
                    셀러 선택 <br /> 견적요청하기
                  </Button>
                  <Button
                    type="button"
                    className={style.estimate_list_detail_btn_cant}
                  >
                    판다파츠 <br /> 견적회신하기
                  </Button>
                  <Button
                    type="button"
                    className={style.estimate_list_detail_btn}
                    onClick={refreshTuiGrid}
                    style={{ padding: "15px" }}
                  >
                    갱신
                  </Button>
                </>
              ) : (
                <>
                  <>
                    <Button
                      type="button"
                      className={style.estimate_list_detail_btn}
                      onClick={requestQuotationFromDistribution}
                    >
                      셀러 선택 <br /> 견적요청하기
                    </Button>
                  </>

                  <>
                    {blockReply === 1 ? (
                      <Button
                        type="button"
                        className={style.estimate_list_detail_btn_cant}
                      >
                        판다파츠 <br /> 견적회신하기
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        className={style.estimate_list_detail_btn}
                        onClick={replyQuotationToPandaParts}
                      >
                        판다파츠 <br /> 견적회신하기
                      </Button>
                    )}
                  </>

                  <Button
                    type="button"
                    className={style.estimate_list_detail_btn}
                    onClick={refreshTuiGrid}
                    style={{ padding: "15px" }}
                  >
                    갱신
                  </Button>
                </>
              )}
            </div>
          </div>

          <div id="estimate_grid">
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
        </div>

        <Modal
          closeOnOverlayClick={false}
          isOpen={isOpen}
          onClose={onClose}
          size="xl"
          isCentered
        >
          <ModalOverlay />
          <Box maxW="45rem" className={style.ModalContent} style={{}}>
            <Center
              className="mb-5 "
              w="100%"
              flexDirection="column"
              justifyContent="center"
            >
              <ModalHeader>셀러 견적 요청하기</ModalHeader>
            </Center>
            <ModalCloseButton />

            <Center
              className="mb-5 "
              w="100%"
              marginTop={30}
              flexDirection="column"
              justifyContent="center"
            >
              <Box w="500px">
                <Center
                  className="mb-5 "
                  w="100%"
                  marginTop={30}
                  flexDirection="column"
                  justifyContent="center"
                >
                  <Box fontWeight="bold" marginBottom={5}>
                    셀러 검색&nbsp;&nbsp;
                    <input
                      type="text"
                      className="form-control form-control-sm bg-light border-primary small"
                      placeholder='PN, 회원명, 회원ID, 견적명 - 복수 검색가능 ("," 로 구분)'
                      value={keyword}
                      style={{ border: "1px solid black" }}
                      onChange={searchKeyword}
                    />
                    &nbsp;&nbsp;
                    <Button
                      w="60px"
                      type="button"
                      color="#21618C"
                      ml={3}
                      size="sm"
                      isFullWidth
                      onClick={() => handleSearch()}
                    >
                      검색
                    </Button>
                    <Button
                      w="60px"
                      type="button"
                      color="#21618C"
                      ml={3}
                      size="sm"
                      isFullWidth
                      onClick={() => handleSelect()}
                    >
                      선택
                    </Button>
                  </Box>
                </Center>
                <div className="ref_partner">
                  <Grid
                    ref={ref_partner}
                    data={dataPartner}
                    columns={columns_def}
                    bodyHeight={200}
                    rowHeaders={[{ type: "checkbox", checked: false }]}
                  />
                </div>
              </Box>
            </Center>

            <Center
              className="mb-5 "
              w="100%"
              marginTop={30}
              flexDirection="column"
              justifyContent="center"
            >
              <Box w="500px">
                <Box fontWeight="bold" style={{ marginBottom: "20px" }}>
                  견적대상 셀러
                  <Button
                    w="60px"
                    type="button"
                    color="#21618C"
                    ml={3}
                    size="sm"
                    float="right"
                    isFullWidth
                    onClick={() => handleDelete()}
                  >
                    삭제
                  </Button>
                </Box>

                <Grid
                  ref={ref_estimate_partner}
                  data={dataSendPartner}
                  columns={columns_def}
                  bodyHeight={200}
                  rowHeaders={[{ type: "checkbox", checked: false }]}
                />
              </Box>
            </Center>

            <ModalBody px={6} pb={0}></ModalBody>
            <ModalFooter>
              <Center
                className="mb-5 "
                w="100%"
                marginTop={30}
                flexDirection="column"
                justifyContent="center"
              >
                <Button
                  w="100px"
                  type="button"
                  color="#21618C"
                  ml={3}
                  onClick={() => {
                    handleAfterData();
                  }}
                  onChange={() => {}}
                  size="sm"
                  isFullWidth
                >
                  견적요청하기
                </Button>
              </Center>
            </ModalFooter>
          </Box>
        </Modal>
      </>
    );
  } else {
    return (
      <>
        <div className="mb-5 estimate-detail__body">
          <div className={style.estimate_list_detail_btns}>
            <div
              className={style.estimate_detail_left}
              style={{ fontWeight: "500", color: "#555", fontSize: "12.5px" }}
            >
              <Text
                style={{ display: "block", color: "#bbb", fontSize: "13px" }}
              >
                견적서명
              </Text>
              {es_id}
            </div>
            <div className={style.estimate_detail_right}>
              <div>
                <Button
                  type="button"
                  className={style.estimate_list_detail_btn_cant}
                >
                  셀러 선택 <br /> 견적요청하기
                </Button>
                <Button
                  type="button"
                  className={style.estimate_list_detail_btn_cant}
                >
                  판다파츠 <br /> 견적회신하기
                </Button>
                <Button
                  type="button"
                  className={style.estimate_list_detail_btn}
                  onClick={refreshTuiGrid}
                  style={{ padding: "15px" }}
                >
                  갱신
                </Button>
              </div>
            </div>
          </div>

          <div id="estimate_grid">
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
        </div>
      </>
    );
  }
}
