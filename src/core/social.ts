export namespace Social {
  export type Link = {
    slug: string;
    label: string;
    url: string;
  };

  export const items: Link[] = [
    { slug: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/jv-vogler/" },
    { slug: "mail", label: "Email", url: "mailto:jvsvogler@gmail.com" },
    { slug: "instagram", label: "Instagram", url: "https://www.instagram.com/jv_vogler/" },
    { slug: "github", label: "Github", url: "https://github.com/jv-vogler" },
  ];
}
