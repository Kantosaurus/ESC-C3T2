declare module "qss" {
  export function encode(
    obj: Record<string, string | number | boolean>
  ): string;
}
