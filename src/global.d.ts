// CSS module declarations for tsgo compatibility
// tsgo does not resolve CSS side-effect imports via Next.js type references
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

// SCSS side-effect imports (e.g. Payload admin custom.scss)
declare module "*.scss" {}

// @payloadcms/next/css has no type declarations — declare it as a side-effect module
declare module "@payloadcms/next/css" {}
