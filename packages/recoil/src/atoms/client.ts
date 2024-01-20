"use client"
import { Client, ClientWithJwt } from '@paybox/common';
import { atom } from 'recoil';

// Create an atom to store user data
export const clientAtom = atom<(ClientWithJwt) | null>({
  key: 'clientAtom',
  default: null,
});

export const loadingAtom = atom<boolean>({
  key: "loadingAtom",
  default: false
});