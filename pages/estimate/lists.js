/* eslint-disable react/jsx-no-duplicate-props */
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import BaseLayout from "../../components/base_layout";
import EstimateNav from "../../components/navi/estimate_nav";
import React, { useState, useEffect } from "react";
import { getQuotationFromOnda, getQuotationCntFromOnda } from "../api/estimate";
import { isMemberCheck } from "../../provider/auth";
import Pagination from "react-js-pagination";
import Loading from "../../components/Loading";
import style from "../../styles/Home.module.css";

export default function EstimateList() {
  const [loadingShow, setLoadingShow] = useState(true);
  const [estimateData, setEstimateData] = useState([]);
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(10);
  const [total, setTotal] = useState(1);

  useEffect(() => {
    isMemberCheck();
    showEstimate();
  }, [page]);

  // 견적내역 데이터 불러오기
  const showEstimate = async () => {
    try {
      // data 및 total 호출
      const res = await getQuotationFromOnda(page, offset);
      const resCnt = await getQuotationCntFromOnda();

      // offset, total, data 불러오기
      setOffset(offset);
      setTotal(resCnt.data);
      setEstimateData(res.data);
      setLoadingShow(false);
    } catch (e) {
      setLoadingShow(false);
    }
  };

  // 현재 페이지 나타내는 함수
  const handlePageChange = (page) => setPage(page);

  return (
    <BaseLayout>
      <Loading loadingShow={loadingShow} />
      <EstimateNav />
      <Box className="base_container">
        <Box className="center">
          <Box className="estimate-list__container">
            <Heading
              as="h4"
              size="lg"
              mb="15px"
              color="#333"
              letterSpacing="-2px"
              textAlign="center"
            >
              견적목록
            </Heading>
            <Box
              bg="#fff"
              color="#333"
              mt="2"
              fontSize="13"
              className="layout-body flex-center"
            >
              <Table variant="simple">
                <Thead>
                  <Tr bg="#f9f9f9">
                    <Th className={style.estimate_td}>순번</Th>
                    <Th className={style.estimate_td}>견적정보</Th>
                    <Th className={style.estimate_td}>요청건수</Th>
                    <Th className={style.estimate_td}>견적수집</Th>
                    <Th className={style.estimate_td}>견적수집여부</Th>
                    <Th className={style.estimate_td}>상세</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {estimateData != undefined && estimateData.length > 0 ? (
                    estimateData.map((e, i) => (
                      <Tr key={e.es_id}>
                        <Td>{i + 1}</Td>
                        <Td>
                          <Link
                            href={`/estimate/detail?p_es_id=${e.p_es_id}`}
                            passHref
                          >
                            <Text color="#337AB7" className="cursor">
                              {e.p_es_id || "없음"}
                            </Text>
                          </Link>
                        </Td>
                        <Td>{e.CNT || 0}</Td>
                        <Td>{e.reg_date.substr(0, 10)}</Td>
                        <Td>
                          {e.qr_status === "complete" ? (
                            <Box className="qna-status-box checked flex-center">
                              수집완료
                            </Box>
                          ) : e.qr_status === "replytomasterpanda" ? (
                            <Box
                              className="qna-status-box pending flex-center"
                              style={{
                                background: "#337ab7",
                                color: "#fff",
                                border: "1px solid #337ab7",
                              }}
                            >
                              회신완료
                            </Box>
                          ) : e.qr_status === "inprogress" ? (
                            <Box
                              className="qna-status-box flex-center"
                              style={{
                                background: "rgb(255, 205, 86)",
                                color: "#fff",
                                border: "1px solid rgb(255, 205, 86)",
                              }}
                            >
                              수집중
                            </Box>
                          ) : (
                            <Box className="qna-status-box   flex-center">
                              수집미완료
                            </Box>
                          )}
                        </Td>
                        <Td>
                          <Link
                            href={`/estimate/detail?p_es_id=${e.p_es_id}`}
                            className={style.estimate_link}
                          >
                            상세
                          </Link>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <>
                      <Td textAlign="center" pt="10px" colSpan={7}>
                        등록된 견적내역이 없습니다
                      </Td>
                    </>
                  )}
                </Tbody>
              </Table>
            </Box>
            <Box marginBottom="20px">
              <Pagination
                activePage={page}
                itemsCountPerPage={offset}
                totalItemsCount={total}
                pageRangeDisplayed={5}
                prevPageText={"‹"}
                nextPageText={"›"}
                onChange={handlePageChange}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </BaseLayout>
  );
}
