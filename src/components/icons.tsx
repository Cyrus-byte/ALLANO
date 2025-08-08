import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';


export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-serif font-bold tracking-wider",
        className
      )}
      style={{ letterSpacing: '0.1em' }}
    >
      ALLANO
    </div>
  );
}