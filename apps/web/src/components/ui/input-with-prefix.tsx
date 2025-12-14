import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputWithPrefixProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
    prefix: string;
}

const InputWithPrefix = React.forwardRef<HTMLInputElement, InputWithPrefixProps>(
    ({ className, prefix, type, ...props }, ref) => {
        // Calculate padding based on prefix length (tighter spacing)
        const prefixWidth = `${prefix.length * 0.6}em`;

        return (
            <div className="relative">
                {/* Prefix overlay - dark/muted color */}
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base md:text-sm font-mono text-foreground/40 pointer-events-none select-none z-10">
                    {prefix}
                </span>

                {/* Input with exact same styling as Input component */}
                <input
                    type={type}
                    data-slot="input"
                    className={cn(
                        'file:text-foreground selection:bg-primary placeholder:text-secondary-foreground/50 selection:text-primary-foreground dark:bg-input/30 border-input h-auto w-full min-w-0 rounded-md border bg-transparent py-2.5 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono',
                        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                        className,
                    )}
                    style={{
                        paddingLeft: `calc(${prefixWidth} + 0.75rem)`,
                        paddingRight: '0.75rem',

                    }}
                    ref={ref}
                    {...props}
                />
            </div>
        )
    }
)
InputWithPrefix.displayName = "InputWithPrefix"

export { InputWithPrefix }
