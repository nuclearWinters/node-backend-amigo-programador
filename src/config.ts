import * as dotenv from "dotenv";

dotenv.config();

dotenv.config({ path: "../.env" });

export const ATLAS_CONFIG = process.env.ATLAS as string;

export const SEND_GRID = process.env.SEND_GRID as string;

export const REFRESHSECRET = process.env.REFRESHSECRET as string;

export const ACCESSSECRET = process.env.ACCESSSECRET as string;
