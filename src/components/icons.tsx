import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';


export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-headline font-bold tracking-widest",
        className
      )}
    >
      ALLANO
    </div>
  );
}
