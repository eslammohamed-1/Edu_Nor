
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model QuestionBankEntry
 * بنك الأسئلة: صف واحد لكل سؤال (المعرّف = id داخل الحمولة JSON).
 */
export type QuestionBankEntry = $Result.DefaultSelection<Prisma.$QuestionBankEntryPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more QuestionBankEntries
 * const questionBankEntries = await prisma.questionBankEntry.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more QuestionBankEntries
   * const questionBankEntries = await prisma.questionBankEntry.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.questionBankEntry`: Exposes CRUD operations for the **QuestionBankEntry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more QuestionBankEntries
    * const questionBankEntries = await prisma.questionBankEntry.findMany()
    * ```
    */
  get questionBankEntry(): Prisma.QuestionBankEntryDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    QuestionBankEntry: 'QuestionBankEntry'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "questionBankEntry"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      QuestionBankEntry: {
        payload: Prisma.$QuestionBankEntryPayload<ExtArgs>
        fields: Prisma.QuestionBankEntryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.QuestionBankEntryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankEntryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.QuestionBankEntryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankEntryPayload>
          }
          findFirst: {
            args: Prisma.QuestionBankEntryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankEntryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.QuestionBankEntryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankEntryPayload>
          }
          findMany: {
            args: Prisma.QuestionBankEntryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankEntryPayload>[]
          }
          create: {
            args: Prisma.QuestionBankEntryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankEntryPayload>
          }
          createMany: {
            args: Prisma.QuestionBankEntryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.QuestionBankEntryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankEntryPayload>[]
          }
          delete: {
            args: Prisma.QuestionBankEntryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankEntryPayload>
          }
          update: {
            args: Prisma.QuestionBankEntryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankEntryPayload>
          }
          deleteMany: {
            args: Prisma.QuestionBankEntryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.QuestionBankEntryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.QuestionBankEntryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankEntryPayload>[]
          }
          upsert: {
            args: Prisma.QuestionBankEntryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QuestionBankEntryPayload>
          }
          aggregate: {
            args: Prisma.QuestionBankEntryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateQuestionBankEntry>
          }
          groupBy: {
            args: Prisma.QuestionBankEntryGroupByArgs<ExtArgs>
            result: $Utils.Optional<QuestionBankEntryGroupByOutputType>[]
          }
          count: {
            args: Prisma.QuestionBankEntryCountArgs<ExtArgs>
            result: $Utils.Optional<QuestionBankEntryCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    questionBankEntry?: QuestionBankEntryOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model QuestionBankEntry
   */

  export type AggregateQuestionBankEntry = {
    _count: QuestionBankEntryCountAggregateOutputType | null
    _min: QuestionBankEntryMinAggregateOutputType | null
    _max: QuestionBankEntryMaxAggregateOutputType | null
  }

  export type QuestionBankEntryMinAggregateOutputType = {
    id: string | null
    slug: string | null
    payloadJson: string | null
    updatedAt: Date | null
    createdAt: Date | null
  }

  export type QuestionBankEntryMaxAggregateOutputType = {
    id: string | null
    slug: string | null
    payloadJson: string | null
    updatedAt: Date | null
    createdAt: Date | null
  }

  export type QuestionBankEntryCountAggregateOutputType = {
    id: number
    slug: number
    payloadJson: number
    updatedAt: number
    createdAt: number
    _all: number
  }


  export type QuestionBankEntryMinAggregateInputType = {
    id?: true
    slug?: true
    payloadJson?: true
    updatedAt?: true
    createdAt?: true
  }

  export type QuestionBankEntryMaxAggregateInputType = {
    id?: true
    slug?: true
    payloadJson?: true
    updatedAt?: true
    createdAt?: true
  }

  export type QuestionBankEntryCountAggregateInputType = {
    id?: true
    slug?: true
    payloadJson?: true
    updatedAt?: true
    createdAt?: true
    _all?: true
  }

  export type QuestionBankEntryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which QuestionBankEntry to aggregate.
     */
    where?: QuestionBankEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QuestionBankEntries to fetch.
     */
    orderBy?: QuestionBankEntryOrderByWithRelationInput | QuestionBankEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: QuestionBankEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QuestionBankEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QuestionBankEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned QuestionBankEntries
    **/
    _count?: true | QuestionBankEntryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: QuestionBankEntryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: QuestionBankEntryMaxAggregateInputType
  }

  export type GetQuestionBankEntryAggregateType<T extends QuestionBankEntryAggregateArgs> = {
        [P in keyof T & keyof AggregateQuestionBankEntry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateQuestionBankEntry[P]>
      : GetScalarType<T[P], AggregateQuestionBankEntry[P]>
  }




  export type QuestionBankEntryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QuestionBankEntryWhereInput
    orderBy?: QuestionBankEntryOrderByWithAggregationInput | QuestionBankEntryOrderByWithAggregationInput[]
    by: QuestionBankEntryScalarFieldEnum[] | QuestionBankEntryScalarFieldEnum
    having?: QuestionBankEntryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: QuestionBankEntryCountAggregateInputType | true
    _min?: QuestionBankEntryMinAggregateInputType
    _max?: QuestionBankEntryMaxAggregateInputType
  }

  export type QuestionBankEntryGroupByOutputType = {
    id: string
    slug: string | null
    payloadJson: string
    updatedAt: Date
    createdAt: Date
    _count: QuestionBankEntryCountAggregateOutputType | null
    _min: QuestionBankEntryMinAggregateOutputType | null
    _max: QuestionBankEntryMaxAggregateOutputType | null
  }

  type GetQuestionBankEntryGroupByPayload<T extends QuestionBankEntryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<QuestionBankEntryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof QuestionBankEntryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], QuestionBankEntryGroupByOutputType[P]>
            : GetScalarType<T[P], QuestionBankEntryGroupByOutputType[P]>
        }
      >
    >


  export type QuestionBankEntrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    payloadJson?: boolean
    updatedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["questionBankEntry"]>

  export type QuestionBankEntrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    payloadJson?: boolean
    updatedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["questionBankEntry"]>

  export type QuestionBankEntrySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    payloadJson?: boolean
    updatedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["questionBankEntry"]>

  export type QuestionBankEntrySelectScalar = {
    id?: boolean
    slug?: boolean
    payloadJson?: boolean
    updatedAt?: boolean
    createdAt?: boolean
  }

  export type QuestionBankEntryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "slug" | "payloadJson" | "updatedAt" | "createdAt", ExtArgs["result"]["questionBankEntry"]>

  export type $QuestionBankEntryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "QuestionBankEntry"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      slug: string | null
      payloadJson: string
      updatedAt: Date
      createdAt: Date
    }, ExtArgs["result"]["questionBankEntry"]>
    composites: {}
  }

  type QuestionBankEntryGetPayload<S extends boolean | null | undefined | QuestionBankEntryDefaultArgs> = $Result.GetResult<Prisma.$QuestionBankEntryPayload, S>

  type QuestionBankEntryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<QuestionBankEntryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: QuestionBankEntryCountAggregateInputType | true
    }

  export interface QuestionBankEntryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['QuestionBankEntry'], meta: { name: 'QuestionBankEntry' } }
    /**
     * Find zero or one QuestionBankEntry that matches the filter.
     * @param {QuestionBankEntryFindUniqueArgs} args - Arguments to find a QuestionBankEntry
     * @example
     * // Get one QuestionBankEntry
     * const questionBankEntry = await prisma.questionBankEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends QuestionBankEntryFindUniqueArgs>(args: SelectSubset<T, QuestionBankEntryFindUniqueArgs<ExtArgs>>): Prisma__QuestionBankEntryClient<$Result.GetResult<Prisma.$QuestionBankEntryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one QuestionBankEntry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {QuestionBankEntryFindUniqueOrThrowArgs} args - Arguments to find a QuestionBankEntry
     * @example
     * // Get one QuestionBankEntry
     * const questionBankEntry = await prisma.questionBankEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends QuestionBankEntryFindUniqueOrThrowArgs>(args: SelectSubset<T, QuestionBankEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__QuestionBankEntryClient<$Result.GetResult<Prisma.$QuestionBankEntryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first QuestionBankEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankEntryFindFirstArgs} args - Arguments to find a QuestionBankEntry
     * @example
     * // Get one QuestionBankEntry
     * const questionBankEntry = await prisma.questionBankEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends QuestionBankEntryFindFirstArgs>(args?: SelectSubset<T, QuestionBankEntryFindFirstArgs<ExtArgs>>): Prisma__QuestionBankEntryClient<$Result.GetResult<Prisma.$QuestionBankEntryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first QuestionBankEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankEntryFindFirstOrThrowArgs} args - Arguments to find a QuestionBankEntry
     * @example
     * // Get one QuestionBankEntry
     * const questionBankEntry = await prisma.questionBankEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends QuestionBankEntryFindFirstOrThrowArgs>(args?: SelectSubset<T, QuestionBankEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma__QuestionBankEntryClient<$Result.GetResult<Prisma.$QuestionBankEntryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more QuestionBankEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all QuestionBankEntries
     * const questionBankEntries = await prisma.questionBankEntry.findMany()
     * 
     * // Get first 10 QuestionBankEntries
     * const questionBankEntries = await prisma.questionBankEntry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const questionBankEntryWithIdOnly = await prisma.questionBankEntry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends QuestionBankEntryFindManyArgs>(args?: SelectSubset<T, QuestionBankEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionBankEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a QuestionBankEntry.
     * @param {QuestionBankEntryCreateArgs} args - Arguments to create a QuestionBankEntry.
     * @example
     * // Create one QuestionBankEntry
     * const QuestionBankEntry = await prisma.questionBankEntry.create({
     *   data: {
     *     // ... data to create a QuestionBankEntry
     *   }
     * })
     * 
     */
    create<T extends QuestionBankEntryCreateArgs>(args: SelectSubset<T, QuestionBankEntryCreateArgs<ExtArgs>>): Prisma__QuestionBankEntryClient<$Result.GetResult<Prisma.$QuestionBankEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many QuestionBankEntries.
     * @param {QuestionBankEntryCreateManyArgs} args - Arguments to create many QuestionBankEntries.
     * @example
     * // Create many QuestionBankEntries
     * const questionBankEntry = await prisma.questionBankEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends QuestionBankEntryCreateManyArgs>(args?: SelectSubset<T, QuestionBankEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many QuestionBankEntries and returns the data saved in the database.
     * @param {QuestionBankEntryCreateManyAndReturnArgs} args - Arguments to create many QuestionBankEntries.
     * @example
     * // Create many QuestionBankEntries
     * const questionBankEntry = await prisma.questionBankEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many QuestionBankEntries and only return the `id`
     * const questionBankEntryWithIdOnly = await prisma.questionBankEntry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends QuestionBankEntryCreateManyAndReturnArgs>(args?: SelectSubset<T, QuestionBankEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionBankEntryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a QuestionBankEntry.
     * @param {QuestionBankEntryDeleteArgs} args - Arguments to delete one QuestionBankEntry.
     * @example
     * // Delete one QuestionBankEntry
     * const QuestionBankEntry = await prisma.questionBankEntry.delete({
     *   where: {
     *     // ... filter to delete one QuestionBankEntry
     *   }
     * })
     * 
     */
    delete<T extends QuestionBankEntryDeleteArgs>(args: SelectSubset<T, QuestionBankEntryDeleteArgs<ExtArgs>>): Prisma__QuestionBankEntryClient<$Result.GetResult<Prisma.$QuestionBankEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one QuestionBankEntry.
     * @param {QuestionBankEntryUpdateArgs} args - Arguments to update one QuestionBankEntry.
     * @example
     * // Update one QuestionBankEntry
     * const questionBankEntry = await prisma.questionBankEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends QuestionBankEntryUpdateArgs>(args: SelectSubset<T, QuestionBankEntryUpdateArgs<ExtArgs>>): Prisma__QuestionBankEntryClient<$Result.GetResult<Prisma.$QuestionBankEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more QuestionBankEntries.
     * @param {QuestionBankEntryDeleteManyArgs} args - Arguments to filter QuestionBankEntries to delete.
     * @example
     * // Delete a few QuestionBankEntries
     * const { count } = await prisma.questionBankEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends QuestionBankEntryDeleteManyArgs>(args?: SelectSubset<T, QuestionBankEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more QuestionBankEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many QuestionBankEntries
     * const questionBankEntry = await prisma.questionBankEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends QuestionBankEntryUpdateManyArgs>(args: SelectSubset<T, QuestionBankEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more QuestionBankEntries and returns the data updated in the database.
     * @param {QuestionBankEntryUpdateManyAndReturnArgs} args - Arguments to update many QuestionBankEntries.
     * @example
     * // Update many QuestionBankEntries
     * const questionBankEntry = await prisma.questionBankEntry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more QuestionBankEntries and only return the `id`
     * const questionBankEntryWithIdOnly = await prisma.questionBankEntry.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends QuestionBankEntryUpdateManyAndReturnArgs>(args: SelectSubset<T, QuestionBankEntryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QuestionBankEntryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one QuestionBankEntry.
     * @param {QuestionBankEntryUpsertArgs} args - Arguments to update or create a QuestionBankEntry.
     * @example
     * // Update or create a QuestionBankEntry
     * const questionBankEntry = await prisma.questionBankEntry.upsert({
     *   create: {
     *     // ... data to create a QuestionBankEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the QuestionBankEntry we want to update
     *   }
     * })
     */
    upsert<T extends QuestionBankEntryUpsertArgs>(args: SelectSubset<T, QuestionBankEntryUpsertArgs<ExtArgs>>): Prisma__QuestionBankEntryClient<$Result.GetResult<Prisma.$QuestionBankEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of QuestionBankEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankEntryCountArgs} args - Arguments to filter QuestionBankEntries to count.
     * @example
     * // Count the number of QuestionBankEntries
     * const count = await prisma.questionBankEntry.count({
     *   where: {
     *     // ... the filter for the QuestionBankEntries we want to count
     *   }
     * })
    **/
    count<T extends QuestionBankEntryCountArgs>(
      args?: Subset<T, QuestionBankEntryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], QuestionBankEntryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a QuestionBankEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends QuestionBankEntryAggregateArgs>(args: Subset<T, QuestionBankEntryAggregateArgs>): Prisma.PrismaPromise<GetQuestionBankEntryAggregateType<T>>

    /**
     * Group by QuestionBankEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuestionBankEntryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends QuestionBankEntryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: QuestionBankEntryGroupByArgs['orderBy'] }
        : { orderBy?: QuestionBankEntryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, QuestionBankEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetQuestionBankEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the QuestionBankEntry model
   */
  readonly fields: QuestionBankEntryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for QuestionBankEntry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__QuestionBankEntryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the QuestionBankEntry model
   */
  interface QuestionBankEntryFieldRefs {
    readonly id: FieldRef<"QuestionBankEntry", 'String'>
    readonly slug: FieldRef<"QuestionBankEntry", 'String'>
    readonly payloadJson: FieldRef<"QuestionBankEntry", 'String'>
    readonly updatedAt: FieldRef<"QuestionBankEntry", 'DateTime'>
    readonly createdAt: FieldRef<"QuestionBankEntry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * QuestionBankEntry findUnique
   */
  export type QuestionBankEntryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
    /**
     * Filter, which QuestionBankEntry to fetch.
     */
    where: QuestionBankEntryWhereUniqueInput
  }

  /**
   * QuestionBankEntry findUniqueOrThrow
   */
  export type QuestionBankEntryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
    /**
     * Filter, which QuestionBankEntry to fetch.
     */
    where: QuestionBankEntryWhereUniqueInput
  }

  /**
   * QuestionBankEntry findFirst
   */
  export type QuestionBankEntryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
    /**
     * Filter, which QuestionBankEntry to fetch.
     */
    where?: QuestionBankEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QuestionBankEntries to fetch.
     */
    orderBy?: QuestionBankEntryOrderByWithRelationInput | QuestionBankEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for QuestionBankEntries.
     */
    cursor?: QuestionBankEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QuestionBankEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QuestionBankEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of QuestionBankEntries.
     */
    distinct?: QuestionBankEntryScalarFieldEnum | QuestionBankEntryScalarFieldEnum[]
  }

  /**
   * QuestionBankEntry findFirstOrThrow
   */
  export type QuestionBankEntryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
    /**
     * Filter, which QuestionBankEntry to fetch.
     */
    where?: QuestionBankEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QuestionBankEntries to fetch.
     */
    orderBy?: QuestionBankEntryOrderByWithRelationInput | QuestionBankEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for QuestionBankEntries.
     */
    cursor?: QuestionBankEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QuestionBankEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QuestionBankEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of QuestionBankEntries.
     */
    distinct?: QuestionBankEntryScalarFieldEnum | QuestionBankEntryScalarFieldEnum[]
  }

  /**
   * QuestionBankEntry findMany
   */
  export type QuestionBankEntryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
    /**
     * Filter, which QuestionBankEntries to fetch.
     */
    where?: QuestionBankEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QuestionBankEntries to fetch.
     */
    orderBy?: QuestionBankEntryOrderByWithRelationInput | QuestionBankEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing QuestionBankEntries.
     */
    cursor?: QuestionBankEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QuestionBankEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QuestionBankEntries.
     */
    skip?: number
    distinct?: QuestionBankEntryScalarFieldEnum | QuestionBankEntryScalarFieldEnum[]
  }

  /**
   * QuestionBankEntry create
   */
  export type QuestionBankEntryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
    /**
     * The data needed to create a QuestionBankEntry.
     */
    data: XOR<QuestionBankEntryCreateInput, QuestionBankEntryUncheckedCreateInput>
  }

  /**
   * QuestionBankEntry createMany
   */
  export type QuestionBankEntryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many QuestionBankEntries.
     */
    data: QuestionBankEntryCreateManyInput | QuestionBankEntryCreateManyInput[]
  }

  /**
   * QuestionBankEntry createManyAndReturn
   */
  export type QuestionBankEntryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
    /**
     * The data used to create many QuestionBankEntries.
     */
    data: QuestionBankEntryCreateManyInput | QuestionBankEntryCreateManyInput[]
  }

  /**
   * QuestionBankEntry update
   */
  export type QuestionBankEntryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
    /**
     * The data needed to update a QuestionBankEntry.
     */
    data: XOR<QuestionBankEntryUpdateInput, QuestionBankEntryUncheckedUpdateInput>
    /**
     * Choose, which QuestionBankEntry to update.
     */
    where: QuestionBankEntryWhereUniqueInput
  }

  /**
   * QuestionBankEntry updateMany
   */
  export type QuestionBankEntryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update QuestionBankEntries.
     */
    data: XOR<QuestionBankEntryUpdateManyMutationInput, QuestionBankEntryUncheckedUpdateManyInput>
    /**
     * Filter which QuestionBankEntries to update
     */
    where?: QuestionBankEntryWhereInput
    /**
     * Limit how many QuestionBankEntries to update.
     */
    limit?: number
  }

  /**
   * QuestionBankEntry updateManyAndReturn
   */
  export type QuestionBankEntryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
    /**
     * The data used to update QuestionBankEntries.
     */
    data: XOR<QuestionBankEntryUpdateManyMutationInput, QuestionBankEntryUncheckedUpdateManyInput>
    /**
     * Filter which QuestionBankEntries to update
     */
    where?: QuestionBankEntryWhereInput
    /**
     * Limit how many QuestionBankEntries to update.
     */
    limit?: number
  }

  /**
   * QuestionBankEntry upsert
   */
  export type QuestionBankEntryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
    /**
     * The filter to search for the QuestionBankEntry to update in case it exists.
     */
    where: QuestionBankEntryWhereUniqueInput
    /**
     * In case the QuestionBankEntry found by the `where` argument doesn't exist, create a new QuestionBankEntry with this data.
     */
    create: XOR<QuestionBankEntryCreateInput, QuestionBankEntryUncheckedCreateInput>
    /**
     * In case the QuestionBankEntry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<QuestionBankEntryUpdateInput, QuestionBankEntryUncheckedUpdateInput>
  }

  /**
   * QuestionBankEntry delete
   */
  export type QuestionBankEntryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
    /**
     * Filter which QuestionBankEntry to delete.
     */
    where: QuestionBankEntryWhereUniqueInput
  }

  /**
   * QuestionBankEntry deleteMany
   */
  export type QuestionBankEntryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which QuestionBankEntries to delete
     */
    where?: QuestionBankEntryWhereInput
    /**
     * Limit how many QuestionBankEntries to delete.
     */
    limit?: number
  }

  /**
   * QuestionBankEntry without action
   */
  export type QuestionBankEntryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuestionBankEntry
     */
    select?: QuestionBankEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the QuestionBankEntry
     */
    omit?: QuestionBankEntryOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const QuestionBankEntryScalarFieldEnum: {
    id: 'id',
    slug: 'slug',
    payloadJson: 'payloadJson',
    updatedAt: 'updatedAt',
    createdAt: 'createdAt'
  };

  export type QuestionBankEntryScalarFieldEnum = (typeof QuestionBankEntryScalarFieldEnum)[keyof typeof QuestionBankEntryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    
  /**
   * Deep Input Types
   */


  export type QuestionBankEntryWhereInput = {
    AND?: QuestionBankEntryWhereInput | QuestionBankEntryWhereInput[]
    OR?: QuestionBankEntryWhereInput[]
    NOT?: QuestionBankEntryWhereInput | QuestionBankEntryWhereInput[]
    id?: StringFilter<"QuestionBankEntry"> | string
    slug?: StringNullableFilter<"QuestionBankEntry"> | string | null
    payloadJson?: StringFilter<"QuestionBankEntry"> | string
    updatedAt?: DateTimeFilter<"QuestionBankEntry"> | Date | string
    createdAt?: DateTimeFilter<"QuestionBankEntry"> | Date | string
  }

  export type QuestionBankEntryOrderByWithRelationInput = {
    id?: SortOrder
    slug?: SortOrderInput | SortOrder
    payloadJson?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type QuestionBankEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: QuestionBankEntryWhereInput | QuestionBankEntryWhereInput[]
    OR?: QuestionBankEntryWhereInput[]
    NOT?: QuestionBankEntryWhereInput | QuestionBankEntryWhereInput[]
    slug?: StringNullableFilter<"QuestionBankEntry"> | string | null
    payloadJson?: StringFilter<"QuestionBankEntry"> | string
    updatedAt?: DateTimeFilter<"QuestionBankEntry"> | Date | string
    createdAt?: DateTimeFilter<"QuestionBankEntry"> | Date | string
  }, "id">

  export type QuestionBankEntryOrderByWithAggregationInput = {
    id?: SortOrder
    slug?: SortOrderInput | SortOrder
    payloadJson?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
    _count?: QuestionBankEntryCountOrderByAggregateInput
    _max?: QuestionBankEntryMaxOrderByAggregateInput
    _min?: QuestionBankEntryMinOrderByAggregateInput
  }

  export type QuestionBankEntryScalarWhereWithAggregatesInput = {
    AND?: QuestionBankEntryScalarWhereWithAggregatesInput | QuestionBankEntryScalarWhereWithAggregatesInput[]
    OR?: QuestionBankEntryScalarWhereWithAggregatesInput[]
    NOT?: QuestionBankEntryScalarWhereWithAggregatesInput | QuestionBankEntryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"QuestionBankEntry"> | string
    slug?: StringNullableWithAggregatesFilter<"QuestionBankEntry"> | string | null
    payloadJson?: StringWithAggregatesFilter<"QuestionBankEntry"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"QuestionBankEntry"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"QuestionBankEntry"> | Date | string
  }

  export type QuestionBankEntryCreateInput = {
    id: string
    slug?: string | null
    payloadJson: string
    updatedAt?: Date | string
    createdAt?: Date | string
  }

  export type QuestionBankEntryUncheckedCreateInput = {
    id: string
    slug?: string | null
    payloadJson: string
    updatedAt?: Date | string
    createdAt?: Date | string
  }

  export type QuestionBankEntryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    payloadJson?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionBankEntryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    payloadJson?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionBankEntryCreateManyInput = {
    id: string
    slug?: string | null
    payloadJson: string
    updatedAt?: Date | string
    createdAt?: Date | string
  }

  export type QuestionBankEntryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    payloadJson?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QuestionBankEntryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: NullableStringFieldUpdateOperationsInput | string | null
    payloadJson?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type QuestionBankEntryCountOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    payloadJson?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type QuestionBankEntryMaxOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    payloadJson?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type QuestionBankEntryMinOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    payloadJson?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}