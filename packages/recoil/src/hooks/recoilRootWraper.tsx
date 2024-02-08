"use client";
import React from "react";

import { RecoilRoot } from "recoil";
import { ReactNode } from "react";

const RecoilRootWrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

export default RecoilRootWrapper;
