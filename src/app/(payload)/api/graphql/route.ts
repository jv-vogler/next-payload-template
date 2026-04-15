/* THIS FILE IS ADAPTED FROM A PAYLOAD-GENERATED FILE */
import { notFound } from "next/navigation";
import { GRAPHQL_POST, REST_OPTIONS } from "@payloadcms/next/routes";
import config from "@payload-config";

const DISABLED = process.env.PAYLOAD_ENABLED === "false";
const disabled = (): never => {
  notFound();
};

export const POST = DISABLED ? disabled : GRAPHQL_POST(config);
export const OPTIONS = DISABLED ? disabled : REST_OPTIONS(config);
