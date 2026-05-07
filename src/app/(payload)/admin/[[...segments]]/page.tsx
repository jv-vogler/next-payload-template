/* eslint-disable no-restricted-exports */
/* THIS FILE IS ADAPTED FROM A PAYLOAD-GENERATED FILE — KEEP STRUCTURE SIMILAR */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import config from "@payload-config";
import { importMap } from "../importMap.js";

const DISABLED = process.env.PAYLOAD_ENABLED === "false";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  if (DISABLED) return {};
  return generatePageMetadata({ config, params, searchParams });
};

const Page = ({ params, searchParams }: Args) => {
  if (DISABLED) notFound();
  return RootPage({ config, params, searchParams, importMap });
};

export default Page;
