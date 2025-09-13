
export const cn = (...a: (string | false | undefined)[]) =>
  a.filter(Boolean).join(" ");
