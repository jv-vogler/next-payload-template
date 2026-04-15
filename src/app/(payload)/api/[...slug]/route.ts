/* THIS FILE IS ADAPTED FROM A PAYLOAD-GENERATED FILE */
import { notFound } from "next/navigation";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";
import config from "@payload-config";

const DISABLED = process.env.PAYLOAD_ENABLED === "false";
const disabled = (): never => {
  notFound();
};

export const GET = DISABLED ? disabled : REST_GET(config);
export const POST = DISABLED ? disabled : REST_POST(config);
export const DELETE = DISABLED ? disabled : REST_DELETE(config);
export const PATCH = DISABLED ? disabled : REST_PATCH(config);
export const PUT = DISABLED ? disabled : REST_PUT(config);
export const OPTIONS = DISABLED ? disabled : REST_OPTIONS(config);
