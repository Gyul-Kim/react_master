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
import BaseLayout from "../../components/base_layout";
import PurchaseNav from "../../components/navi/purchase_nav";
import React, { useState, useEffect } from "react";
import { getMembersFromOnda } from "../api/estimate";
import { isMemberCheck } from "../../provider/auth";
import Pagination from "react-js-pagination";
import Loading from "../../components/Loading";
import style from "../../styles/Home.module.css";

export default function EstimateList() {
  const [loadingShow, setLoadingShow] = useState(true);
  const [orderData, setOrderData] = useState([]);
  const [page, setPage] = useState(1);
  const [offset, setOffset] = useState(10);
  const [total, setTotal] = useState(1);

  useEffect(() => {
    isMemberCheck();
    showMembers();
  }, [page]);

  // 회원목록 데이터 불러오기
  const showMembers = async () => {
    try {
      // data 및 total 호출
      const res = await getMembersFromOnda(page, offset);
      console.log(res);

      // offset, total, data 불러오기
      setOffset(offset);
      setTotal(res.data.length);
      setOrderData(res.data);
      setLoadingShow(false);

      console.log(JSON.stringify(res.data));
    } catch (e) {
      setLoadingShow(false);
    }
  };

  // 현재 페이지 나타내는 함수
  const handlePageChange = (page) => setPage(page);

  return (
    <BaseLayout>
      <Loading loadingShow={loadingShow} />
      <PurchaseNav />
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
              회원목록
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
                    <Th className={style.estimate_td}>회원명</Th>
                    <Th className={style.estimate_td}>회원코드</Th>
                    <Th className={style.estimate_td}>이메일</Th>
                    <Th className={style.estimate_td}>전화번호</Th>
                    <Th className={style.estimate_td}>회원권한</Th>
                    <Th className={style.estimate_td}>가입일</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {orderData != undefined && orderData.length > 0 ? (
                    orderData.map((e, i) => (
                      <Tr key={e.name}>
                        <Td>{i + 1}</Td>
                        <Td>{e.name} </Td>
                        <Td>{e.it_maker}</Td>
                        <Td>{e.id || 0}</Td>
                        <Td>{e.tel}</Td>
                        <Td>{e.is_admin}</Td>
                        <Td>{e.reg_date.substr(0, 10)}</Td>
                      </Tr>
                    ))
                  ) : (
                    <>
                      <Td textAlign="center" pt="10px" colSpan={7}>
                        등록된 회원목록이 없습니다
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
