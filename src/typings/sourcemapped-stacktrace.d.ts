declare module 'sourcemapped-stacktrace' {
    export function mapStackTrace(stack: string | undefined, onStack: (mappedStack: string[]) => void): void
}
