export namespace Theme {
  export enum Variant {
    Dark = "dark",
    Light = "light",
  }

  export function toggle(current: Variant): Variant {
    return current === Variant.Dark ? Variant.Light : Variant.Dark;
  }
}
