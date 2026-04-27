"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { RecruitStatus } from "@/constants/recruit";
import { recruitButtonLabelsByStatus } from "@/constants/recruit";

type RecruitStatusContextValue = {
  recruitStatus: RecruitStatus;
  isRecruitOpen: boolean;
  recruitButtonLabels: {
    navigation: string;
    hero: string;
    role: string;
  };
};

const RecruitStatusContext = createContext<RecruitStatusContextValue>({
  recruitStatus: "closed",
  isRecruitOpen: false,
  recruitButtonLabels: recruitButtonLabelsByStatus.closed,
});

export const RecruitStatusProvider = ({
  recruitStatus,
  children,
}: {
  recruitStatus: RecruitStatus;
  children: ReactNode;
}) => {
  const value: RecruitStatusContextValue = {
    recruitStatus,
    isRecruitOpen: recruitStatus === "open",
    recruitButtonLabels: recruitButtonLabelsByStatus[recruitStatus],
  };

  return <RecruitStatusContext.Provider value={value}>{children}</RecruitStatusContext.Provider>;
};

export const useRecruitStatus = () => useContext(RecruitStatusContext);
