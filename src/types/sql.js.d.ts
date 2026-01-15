declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: typeof Database;
  }

  export interface QueryExecResult {
    columns: string[];
    values: SqlValue[][];
  }

  export type SqlValue = string | number | Uint8Array | null;

  export interface ParamsObject {
    [key: string]: SqlValue;
  }

  export interface ParamsCallback {
    (obj: ParamsObject): void;
  }

  export interface Statement {
    bind(params?: SqlValue[] | ParamsObject): boolean;
    step(): boolean;
    getAsObject(params?: ParamsObject): ParamsObject;
    get(params?: ParamsObject): SqlValue[];
    getColumnNames(): string[];
    free(): boolean;
    reset(): void;
    run(params?: SqlValue[] | ParamsObject): void;
  }

  export class Database {
    constructor(data?: ArrayLike<number> | Buffer | null);
    run(sql: string, params?: SqlValue[] | ParamsObject): Database;
    exec(sql: string, params?: SqlValue[]): QueryExecResult[];
    prepare(sql: string): Statement;
    each(sql: string, params: SqlValue[] | ParamsObject, callback: ParamsCallback, done?: () => void): Database;
    each(sql: string, callback: ParamsCallback, done?: () => void): Database;
    export(): Uint8Array;
    close(): void;
    getRowsModified(): number;
    create_function(name: string, func: (...args: SqlValue[]) => SqlValue): Database;
    create_aggregate(name: string, init: () => unknown, step: (state: unknown, ...args: SqlValue[]) => unknown, finalize: (state: unknown) => SqlValue): Database;
  }

  export interface SqlJsConfig {
    locateFile?: (file: string) => string;
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
}
