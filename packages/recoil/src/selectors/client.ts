import { atom, selector, useRecoilCallback } from "recoil";
import { addressAtom, clientAtom, payloadAtom } from "../atoms";
import {
  Address,
  AddressFormPartialType,
  BACKEND_URL,
  ClientWithJwt,
  responseStatus,
} from "@paybox/common";


