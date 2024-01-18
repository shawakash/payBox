"use client"
import { Client } from '@paybox/common';
import { atom } from 'recoil';

// Create an atom to store user data
export const clientAtom = atom<Partial<Client> | null>({
  key: 'clientAtom',
  default: null,
});