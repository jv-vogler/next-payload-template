export namespace Navigation {
  export type Link = {
    label: string;
    href: string;
  };

  export const links: Link[] = [
    { label: "home", href: "/" },
    { label: "about", href: "/about" },
    { label: "blog", href: "/blog" },
    { label: "contact", href: "/#contact" },
  ];
}
