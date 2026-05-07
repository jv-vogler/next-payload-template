/* eslint-disable no-restricted-exports */
/* THIS FILE IS ADAPTED FROM A PAYLOAD-GENERATED FILE — KEEP STRUCTURE SIMILAR */
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import config from "@payload-config";
import "@payloadcms/next/css";
import type { ServerFunctionClient } from "payload";
import { importMap } from "./admin/importMap.js";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => RootLayout({ config, importMap, serverFunction, children });

export default Layout;
