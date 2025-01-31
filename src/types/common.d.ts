declare global {
    interface Window {
        debug?: RSAny;
    }
    
    type RSAny = Record<string, any>;
    type RSS = Record<string, string>;

    /** Shortcut to React.FC<React.PropsWithChildren<Props & { className?: string }>> */
    type FC<T = {}> = React.FC<React.PropsWithChildren<T & {
        className?: string;
        style?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>['style'];
    }>>;

    /**
     * Custom state shortcut. Provides autocomplete for react states.
     * ```ts
     * const [state, setState] = props.unknownValue as React.State<boolean>;
     * ```
    */
    type State<T> = [T, React.Dispatch<React.SetStateAction<T>>];

    /**
     * Filters out properties of T given by constraint C
     * @example
     * ```ts
     * interface MyObject {
     *     someValue: 5;
     *     run(): void;
     *     get(): void;
     * }
     * 
     * // Method keys of MyObject
     * type Methods = keyof Constrain<MyObject, Function>;
     * ```
    */
    type Constrain<T, C> = Pick<T, {
        [K in keyof T]: T[K] extends C? K: never
    }[keyof T]>;

    type WithFilter<T> = T & { _filter?: Partial<T> };
}

export {}