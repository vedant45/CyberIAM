declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      cursor: number;
    };
  }

  export interface ParseError {
    type: string;
    code: string;
    message: string;
    row: number;
    index: number;
  }

  export interface ParseConfig<T = unknown> {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean;
    step?: (results: ParseResult<T>) => void;
    complete?: (results: ParseResult<T>) => void;
    error?: (error: ParseError) => void;
    download?: boolean;
    skipEmptyLines?: boolean;
    fastMode?: boolean;
  }

  export interface Parser<T = unknown> {
    parse(input: string, config?: ParseConfig<T>): ParseResult<T>;
  }

  const Papa: {
    parse<T = unknown>(input: string, config?: ParseConfig<T>): ParseResult<T>;
  };

  export default Papa;
}