import Image from 'next/image';

interface IcteLogoProps { size?: number; className?: string; }

export function IcteLogo({ size = 40, className }: IcteLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="ICTE Hub"
      width={size * 3}
      height={size}
      className={className}
      style={{ height: size, width: 'auto' }}
      priority
    />
  );
}
