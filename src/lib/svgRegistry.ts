const svgModules = import.meta.glob('/src/assets/svgs/**/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const svgRegistry: Record<string, string> = {};
for (const [path, content] of Object.entries(svgModules)) {
  const key = path.replace('/src/assets/svgs/', '');
  svgRegistry[key] = content as string;
}

export function getSvgContent(svgPath: string): string {
  return svgRegistry[svgPath] ?? '';
}

export function getCardBackSvg(): string {
  return svgRegistry['card-back.svg'] ?? '';
}
