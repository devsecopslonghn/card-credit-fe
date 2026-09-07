type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; sizes?: string; unoptimized?: boolean };

export function Image({ fill, sizes, unoptimized, ...props }: ImageProps) {
  void fill; void sizes; void unoptimized;
  return <img {...props} />;
}
