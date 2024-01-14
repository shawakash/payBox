import { Router } from "express";
import { BaseCreateClient } from "../validations/client";
import { responseStatus } from "../types/client";
import { conflictClient, createClient } from "../db/client";

export const clientRouter = Router();

