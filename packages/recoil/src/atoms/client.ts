"use client"
import { Address, Client, ClientWithJwt } from '@paybox/common';
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

export const addressAtom = atom<Partial<Address> | null>({
  key: 'addressAtom',
  default: null
});

export const payloadAtom = atom<Partial<Address> | null>({
  key: 'payloadAtom',
  default: null,
});