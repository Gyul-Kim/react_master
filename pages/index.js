import { Text, Input, Button, Checkbox, Stack, Box } from "@chakra-ui/react";
import IndexLayout from "../components/index_layout";
import BoxIndicator from "../components/box/box";
import ChartAll from "../components/chartAll";
import Loading from "../components/Loading";

import React, { useState, useEffect } from "react";
import style from "../styles/Home.module.css";
import { isMemberCheck } from "../provider/auth";

import { authLogin, socialLoginPop } from "../provider/auth";
import { SetToken, SetCookie, GetCookie } from "../provider/common";
import { useRouter } from "next/router";
import { getMembersFromOnda } from "../pages/api/estimate";

export default function Home() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [memberData, setMemberData] = useState();

  // 회원목록 데이터 불러오기
  const showMembers = async () => {
    try {
      const res = await getMembersFromOnda();

      setMemberData(res.data);
    } catch (e) {
      console.log("err " + e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    isMemberCheck();
    setIsLoading(false);
    showMembers();
  }, []);

  return (
    <IndexLayout>
      <Loading loadingShow={isLoading} />

      <div className={style.main_container}>
        <BoxIndicator />
        <ChartAll />
        <div className={style.main_btm}>
          <div className={style.btm_title}>
            <h3>회원목록</h3>
            <a href="member/lists" className={style.btn_member}>
              + More
            </a>
          </div>
          <div className={style.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>순번</th>
                  <th>회원명</th>
                  <th>회원코드</th>
                  <th>이메일</th>
                  <th>전화번호</th>
                  <th>가입일</th>
                </tr>
              </thead>
              <tbody>
                {memberData != undefined && memberData.length > 0 ? (
                  memberData.map((e, i) => (
                    <tr key={e.index}>
                      <td>{i}</td>
                      <td>{e.name}</td>
                      <td>{e.it_maker}</td>
                      <td>{e.id}</td>
                      <td>{e.tel}</td>
                      <td>{e.reg_date.substr(0, 10)}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <td textAlign="center" pt="10px" colSpan={7}>
                      등록된 회원목록이 없습니다
                    </td>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </IndexLayout>
  );
}
