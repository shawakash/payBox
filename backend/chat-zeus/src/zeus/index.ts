/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from "./const";
export const HOST = "http://localhost:8113/v1/graphql";

export const HEADERS = {};
export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + "?query=" + encodeURIComponent(query);
    const wsString = queryString.replace("http", "ws");
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
    const webSocketOptions = options[1]?.websocket || [host];
    const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data);
            const data = parsed.data;
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error("No websockets implemented");
  }
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === "GET") {
      return fetch(
        `${options[0]}?query=${encodeURIComponent(query)}`,
        fetchOptions,
      )
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetch(`${options[0]}`, {
      body: JSON.stringify({ query, variables }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = "",
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = [],
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return "";
    }
    if (typeof o === "boolean" || typeof o === "number") {
      return k;
    }
    if (typeof o === "string") {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === "__alias") {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (
            typeof objectUnderAlias !== "object" ||
            Array.isArray(objectUnderAlias)
          ) {
            throw new Error(
              "Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}",
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join("\n");
    }
    const hasOperationName =
      root && options?.operationName ? " " + options.operationName : "";
    const keyForDirectives = o.__directives ?? "";
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== "__directives")
      .map((e) =>
        ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars),
      )
      .join("\n")}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars
      .map((v) => `${v.name}: ${v.graphQLType}`)
      .join(", ");
    return `${k} ${keyForDirectives}${hasOperationName}${varsString ? `(${varsString})` : ""} ${query}`;
  };
  return ibb;
};

export const Thunder =
  (fn: FetchFunction) =>
  <
    O extends keyof typeof Ops,
    SCLR extends ScalarDefinition,
    R extends keyof ValueTypes = GenericOperation<O>,
  >(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: Record<string, unknown> },
  ) =>
    fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
      ops?.variables,
    ).then((data) => {
      if (graphqlOptions?.scalars) {
        return decodeScalarsInResponse({
          response: data,
          initialOp: operation,
          initialZeusQuery: o as VType,
          returns: ReturnTypes,
          scalars: graphqlOptions.scalars,
          ops: Ops,
        });
      }
      return data;
    }) as Promise<InputType<GraphQLTypes[R], Z, SCLR>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  (fn: SubscriptionFunction) =>
  <
    O extends keyof typeof Ops,
    SCLR extends ScalarDefinition,
    R extends keyof ValueTypes = GenericOperation<O>,
  >(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: ExtractVariables<Z> },
  ) => {
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], SCLR>;
    if (returnedFunction?.on && graphqlOptions?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (
        fnToCall: (args: InputType<GraphQLTypes[R], Z, SCLR>) => void,
      ) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, SCLR>) => {
          if (graphqlOptions?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: graphqlOptions.scalars,
                ops: Ops,
              }),
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };

export const Subscription = (...options: chainOptions) =>
  SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>,
>(
  operation: O,
  o: (Z & ValueTypes[R]) | ValueTypes[R],
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  },
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) =>
  key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) =>
  key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    "Content-Type": "application/json",
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(
    initialOp as string,
    ops[initialOp],
    initialZeusQuery,
  );
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(
      initialOp as string,
      response,
      [ops[initialOp]],
    );
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p: string[] = [],
  ): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder =
        resolvers[currentScalarString.split(".")[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (
      typeof o === "boolean" ||
      typeof o === "number" ||
      typeof o === "string" ||
      !o
    ) {
      return o;
    }
    const entries = Object.entries(o).map(
      ([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const,
    );
    const objectFromEntries = entries.reduce<Record<string, unknown>>(
      (a, [k, v]) => {
        a[k] = v;
        return a;
      },
      {},
    );
    return objectFromEntries;
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | `scalar.${string}`
    | "enum"
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | `scalar.${string}`
    | undefined;
};
export type InputValueType = {
  [x: string]:
    | undefined
    | boolean
    | string
    | number
    | [any, undefined | boolean | InputValueType]
    | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = "|";

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (
  ...args: infer R
) => WebSocket
  ? R
  : never;
export type chainOptions =
  | [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }]
  | [fetchOptions[0]];
export type FetchFunction = (
  query: string,
  variables?: Record<string, unknown>,
) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<
  F extends [infer ARGS, any] ? ARGS : undefined
>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super("");
    console.error(response);
  }
  toString() {
    return "GraphQL Response Error";
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops
  ? (typeof Ops)[O]
  : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (
  mappedParts: string[],
  returns: ReturnTypesType,
): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === "object") {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({
  ops,
  returns,
}: {
  returns: ReturnTypesType;
  ops: Operations;
}) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true,
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (
      typeof o === "boolean" ||
      typeof o === "number" ||
      typeof o === "string"
    ) {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith("scalar")) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === "__alias") {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (
            typeof objectUnderAlias !== "object" ||
            Array.isArray(objectUnderAlias)
          ) {
            throw new Error(
              "Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}",
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== "__directives")
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment
            ? pOriginals
            : [...pOriginals, purifyGraphQLKey(originalKey)],
          false,
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) =>
  k.replace(/\([^)]*\)/g, "").replace(/^[^:]*\:/g, "");

const mapPart = (p: string) => {
  const [isArg, isField] = p.split("<>");
  if (isField) {
    return {
      v: isField,
      __type: "field",
    } as const;
  }
  return {
    v: isArg,
    __type: "arg",
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (
  props: AllTypesPropsType,
  returns: ReturnTypesType,
  ops: Operations,
) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === "enum" && mappedParts.length === 1) {
      return "enum";
    }
    if (
      typeof propsP1 === "string" &&
      propsP1.startsWith("scalar.") &&
      mappedParts.length === 1
    ) {
      return propsP1;
    }
    if (typeof propsP1 === "object") {
      if (mappedParts.length < 2) {
        return "not";
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === "string") {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === "object") {
        if (mappedParts.length < 3) {
          return "not";
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === "arg") {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return "not";
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === "object") {
      if (mappedParts.length < 2) return "not";
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): "enum" | "not" | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return "not";
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = "", root = true): string => {
    if (typeof a === "string") {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a
          .replace(START_VAR_NAME, "$")
          .split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith("scalar.")) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split(".");
      const scalarKey = splittedScalar.join(".");
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(", ")}]`;
    }
    if (typeof a === "string") {
      if (checkType === "enum") {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === "object") {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== "undefined")
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(",\n");
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <
  X,
  T extends keyof ResolverInputTypes,
  Z extends keyof ResolverInputTypes[T],
>(
  type: T,
  field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any]
      ? Input
      : any,
    source: any,
  ) => Z extends keyof ModelTypes[T]
    ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X
    : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<
  UnwrapPromise<ReturnType<T>>
>;
export type ZeusHook<
  T extends (
    ...args: any[]
  ) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends "scalar" & {
  name: infer T;
}
  ? T extends keyof SCLR
    ? SCLR[T]["decode"] extends (s: unknown) => unknown
      ? ReturnType<SCLR[T]["decode"]>
      : unknown
    : unknown
  : S;
type IsArray<T, U, SCLR extends ScalarDefinition> =
  T extends Array<infer R> ? InputType<R, U, SCLR>[] : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<
  SRC extends DeepAnify<DST>,
  DST,
  SCLR extends ScalarDefinition,
> =
  FlattenArray<SRC> extends ZEUS_INTERFACES | ZEUS_UNIONS
    ? {
        [P in keyof SRC]: SRC[P] extends "__union" & infer R
          ? P extends keyof DST
            ? IsArray<
                R,
                "__typename" extends keyof DST
                  ? DST[P] & { __typename: true }
                  : DST[P],
                SCLR
              >
            : IsArray<
                R,
                "__typename" extends keyof DST
                  ? { __typename: true }
                  : Record<string, never>,
                SCLR
              >
          : never;
      }[keyof SRC] & {
        [P in keyof Omit<
          Pick<
            SRC,
            {
              [P in keyof DST]: SRC[P] extends "__union" & infer R ? never : P;
            }[keyof DST]
          >,
          "__typename"
        >]: IsPayLoad<DST[P]> extends BaseZeusResolver
          ? IsScalar<SRC[P], SCLR>
          : IsArray<SRC[P], DST[P], SCLR>;
      }
    : {
        [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<
          DST[P]
        > extends BaseZeusResolver
          ? IsScalar<SRC[P], SCLR>
          : IsArray<SRC[P], DST[P], SCLR>;
      };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> =
  SRC extends DeepAnify<DST> ? IsInterfaced<SRC, DST, SCLR> : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> =
  IsPayLoad<DST> extends { __alias: infer R }
    ? {
        [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<
          SRC,
          R[P],
          SCLR
        >];
      } & MapType<SRC, Omit<IsPayLoad<DST>, "__alias">, SCLR>
    : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (
    fn: (e: {
      data?: InputType<T, Z, SCLR>;
      code?: number;
      reason?: string;
      message?: string;
    }) => void,
  ) => void;
  error: (
    fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void,
  ) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<
  SELECTOR,
  NAME extends keyof GraphQLTypes,
  SCLR extends ScalarDefinition = {},
> = InputType<GraphQLTypes[NAME], SELECTOR, SCLR>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <T>(t: T | V) => T;

type BuiltInVariableTypes = {
  ["String"]: string;
  ["Int"]: number;
  ["Float"]: number;
  ["ID"]: unknown;
  ["Boolean"]: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> =
  | `${T}!`
  | T
  | `[${T}]`
  | `[${T}]!`
  | `[${T}!]`
  | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> =
  T extends VR<infer R1>
    ? R1 extends VR<infer R2>
      ? R2 extends VR<infer R3>
        ? R3 extends VR<infer R4>
          ? R4 extends VR<infer R5>
            ? R5
            : R4
          : R3
        : R2
      : R1
    : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
    ? NonNullable<DecomposeType<R, Type>>
    : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> =
  T extends keyof ZEUS_VARIABLES
    ? ZEUS_VARIABLES[T]
    : T extends keyof BuiltInVariableTypes
      ? BuiltInVariableTypes[T]
      : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> &
  WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  " __zeus_name": Name;
  " __zeus_type": T;
};

export type ExtractVariablesDeep<Query> =
  Query extends Variable<infer VType, infer VName>
    ? { [key in VName]: GetVariableType<VType> }
    : Query extends string | number | boolean | Array<string | number | boolean>
      ? // eslint-disable-next-line @typescript-eslint/ban-types
        {}
      : UnionToIntersection<
          {
            [K in keyof Query]: WithOptionalNullables<
              ExtractVariablesDeep<Query[K]>
            >;
          }[keyof Query]
        >;

export type ExtractVariables<Query> =
  Query extends Variable<infer VType, infer VName>
    ? { [key in VName]: GetVariableType<VType> }
    : Query extends [infer Inputs, infer Outputs]
      ? ExtractVariablesDeep<Inputs> & ExtractVariables<Outputs>
      : Query extends
            | string
            | number
            | boolean
            | Array<string | number | boolean>
        ? // eslint-disable-next-line @typescript-eslint/ban-types
          {}
        : UnionToIntersection<
            {
              [K in keyof Query]: WithOptionalNullables<
                ExtractVariables<Query[K]>
              >;
            }[keyof Query]
          >;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(
  name: Name,
  graphqlType: Type,
) => {
  return (START_VAR_NAME +
    name +
    GRAPHQL_TYPE_SEPARATOR +
    graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = never;
export type ScalarCoders = {
  timestamptz?: ScalarResolver;
  uuid?: ScalarResolver;
};
type ZEUS_UNIONS = never;

export type ValueTypes = {
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined | null | Variable<any, string>;
    _gt?: string | undefined | null | Variable<any, string>;
    _gte?: string | undefined | null | Variable<any, string>;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined | null | Variable<any, string>;
    _in?: Array<string> | undefined | null | Variable<any, string>;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    /** does the column match the given pattern */
    _like?: string | undefined | null | Variable<any, string>;
    _lt?: string | undefined | null | Variable<any, string>;
    _lte?: string | undefined | null | Variable<any, string>;
    _neq?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined | null | Variable<any, string>;
    _nin?: Array<string> | undefined | null | Variable<any, string>;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined | null | Variable<any, string>;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined | null | Variable<any, string>;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined | null | Variable<any, string>;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined | null | Variable<any, string>;
  };
  /** all the rooms for chat */
  ["channel"]: AliasType<{
    clientId1?: boolean | `@${string}`;
    clientId2?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "channel" */
  ["channel_aggregate"]: AliasType<{
    aggregate?: ValueTypes["channel_aggregate_fields"];
    nodes?: ValueTypes["channel"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "channel" */
  ["channel_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["channel_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["channel_max_fields"];
    min?: ValueTypes["channel_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "channel". All fields are combined with a logical 'AND'. */
  ["channel_bool_exp"]: {
    _and?:
      | Array<ValueTypes["channel_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["channel_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["channel_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    clientId1?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    clientId2?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "channel" */
  ["channel_constraint"]: channel_constraint;
  /** input type for inserting data into table "channel" */
  ["channel_insert_input"]: {
    clientId1?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    clientId2?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["channel_max_fields"]: AliasType<{
    clientId1?: boolean | `@${string}`;
    clientId2?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["channel_min_fields"]: AliasType<{
    clientId1?: boolean | `@${string}`;
    clientId2?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "channel" */
  ["channel_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["channel"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "channel" */
  ["channel_on_conflict"]: {
    constraint: ValueTypes["channel_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["channel_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["channel_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "channel". */
  ["channel_order_by"]: {
    clientId1?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    clientId2?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: channel */
  ["channel_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "channel" */
  ["channel_select_column"]: channel_select_column;
  /** input type for updating data in table "channel" */
  ["channel_set_input"]: {
    clientId1?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    clientId2?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Streaming cursor of the table "channel" */
  ["channel_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["channel_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["channel_stream_cursor_value_input"]: {
    clientId1?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    clientId2?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** update columns of table "channel" */
  ["channel_update_column"]: channel_update_column;
  ["channel_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["channel_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["channel_bool_exp"] | Variable<any, string>;
  };
  /** chat messages between clients */
  ["chat"]: AliasType<{
    channelId?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message?: boolean | `@${string}`;
    senderId?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "chat" */
  ["chat_aggregate"]: AliasType<{
    aggregate?: ValueTypes["chat_aggregate_fields"];
    nodes?: ValueTypes["chat"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "chat" */
  ["chat_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["chat_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["chat_max_fields"];
    min?: ValueTypes["chat_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "chat". All fields are combined with a logical 'AND'. */
  ["chat_bool_exp"]: {
    _and?:
      | Array<ValueTypes["chat_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["chat_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["chat_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    channelId?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    message?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    senderId?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "chat" */
  ["chat_constraint"]: chat_constraint;
  /** input type for inserting data into table "chat" */
  ["chat_insert_input"]: {
    channelId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    message?: string | undefined | null | Variable<any, string>;
    senderId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["chat_max_fields"]: AliasType<{
    channelId?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message?: boolean | `@${string}`;
    senderId?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["chat_min_fields"]: AliasType<{
    channelId?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message?: boolean | `@${string}`;
    senderId?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "chat" */
  ["chat_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["chat"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "chat" */
  ["chat_on_conflict"]: {
    constraint: ValueTypes["chat_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["chat_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["chat_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "chat". */
  ["chat_order_by"]: {
    channelId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    created_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    message?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    senderId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    updated_at?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: chat */
  ["chat_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "chat" */
  ["chat_select_column"]: chat_select_column;
  /** input type for updating data in table "chat" */
  ["chat_set_input"]: {
    channelId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    message?: string | undefined | null | Variable<any, string>;
    senderId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Streaming cursor of the table "chat" */
  ["chat_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["chat_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_stream_cursor_value_input"]: {
    channelId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    created_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    message?: string | undefined | null | Variable<any, string>;
    senderId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    updated_at?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** update columns of table "chat" */
  ["chat_update_column"]: chat_update_column;
  ["chat_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["chat_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["chat_bool_exp"] | Variable<any, string>;
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_channel?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["channel_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["channel_mutation_response"],
    ];
    delete_channel_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["channel"],
    ];
    delete_chat?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["chat_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["chat_mutation_response"],
    ];
    delete_chat_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["chat"],
    ];
    insert_channel?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["channel_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["channel_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["channel_mutation_response"],
    ];
    insert_channel_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["channel_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["channel_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["channel"],
    ];
    insert_chat?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["chat_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chat_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_mutation_response"],
    ];
    insert_chat_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["chat_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chat_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat"],
    ];
    update_channel?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["channel_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["channel_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["channel_mutation_response"],
    ];
    update_channel_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["channel_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["channel_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["channel"],
    ];
    update_channel_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["channel_updates"]> | Variable<any, string>;
      },
      ValueTypes["channel_mutation_response"],
    ];
    update_chat?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["chat_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["chat_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["chat_mutation_response"],
    ];
    update_chat_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["chat_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns: ValueTypes["chat_pk_columns_input"] | Variable<any, string>;
      },
      ValueTypes["chat"],
    ];
    update_chat_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["chat_updates"]> | Variable<any, string>;
      },
      ValueTypes["chat_mutation_response"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    channel?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["channel_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["channel_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["channel_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["channel"],
    ];
    channel_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["channel_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["channel_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["channel_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["channel_aggregate"],
    ];
    channel_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["channel"],
    ];
    chat?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["chat_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat"],
    ];
    chat_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["chat_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_aggregate"],
    ];
    chat_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["chat"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    channel?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["channel_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["channel_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["channel_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["channel"],
    ];
    channel_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["channel_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["channel_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["channel_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["channel_aggregate"],
    ];
    channel_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["channel"],
    ];
    channel_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["channel_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["channel_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["channel"],
    ];
    chat?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["chat_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat"],
    ];
    chat_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chat_select_column"]>
          | undefined
          | null
          | Variable<any, string> /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null
          | Variable<
              any,
              string
            > /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null
          | Variable<any, string> /** sort the rows by one or more columns */;
        order_by?:
          | Array<ValueTypes["chat_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat_aggregate"],
    ];
    chat_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["chat"],
    ];
    chat_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["chat_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chat_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chat"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["timestamptz"]: unknown;
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _in?:
      | Array<ValueTypes["timestamptz"]>
      | undefined
      | null
      | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    _nin?:
      | Array<ValueTypes["timestamptz"]>
      | undefined
      | null
      | Variable<any, string>;
  };
  ["uuid"]: unknown;
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _in?: Array<ValueTypes["uuid"]> | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    _nin?: Array<ValueTypes["uuid"]> | undefined | null | Variable<any, string>;
  };
};

export type ResolverInputTypes = {
  ["schema"]: AliasType<{
    query?: ResolverInputTypes["query_root"];
    mutation?: ResolverInputTypes["mutation_root"];
    subscription?: ResolverInputTypes["subscription_root"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined | null;
    _gt?: string | undefined | null;
    _gte?: string | undefined | null;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined | null;
    _in?: Array<string> | undefined | null;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined | null;
    _is_null?: boolean | undefined | null;
    /** does the column match the given pattern */
    _like?: string | undefined | null;
    _lt?: string | undefined | null;
    _lte?: string | undefined | null;
    _neq?: string | undefined | null;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined | null;
    _nin?: Array<string> | undefined | null;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined | null;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined | null;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined | null;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined | null;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined | null;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined | null;
  };
  /** all the rooms for chat */
  ["channel"]: AliasType<{
    clientId1?: boolean | `@${string}`;
    clientId2?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "channel" */
  ["channel_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["channel_aggregate_fields"];
    nodes?: ResolverInputTypes["channel"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "channel" */
  ["channel_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["channel_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["channel_max_fields"];
    min?: ResolverInputTypes["channel_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "channel". All fields are combined with a logical 'AND'. */
  ["channel_bool_exp"]: {
    _and?: Array<ResolverInputTypes["channel_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["channel_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["channel_bool_exp"]> | undefined | null;
    clientId1?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    clientId2?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    updated_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "channel" */
  ["channel_constraint"]: channel_constraint;
  /** input type for inserting data into table "channel" */
  ["channel_insert_input"]: {
    clientId1?: ResolverInputTypes["uuid"] | undefined | null;
    clientId2?: ResolverInputTypes["uuid"] | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** aggregate max on columns */
  ["channel_max_fields"]: AliasType<{
    clientId1?: boolean | `@${string}`;
    clientId2?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["channel_min_fields"]: AliasType<{
    clientId1?: boolean | `@${string}`;
    clientId2?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "channel" */
  ["channel_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["channel"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "channel" */
  ["channel_on_conflict"]: {
    constraint: ResolverInputTypes["channel_constraint"];
    update_columns: Array<ResolverInputTypes["channel_update_column"]>;
    where?: ResolverInputTypes["channel_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "channel". */
  ["channel_order_by"]: {
    clientId1?: ResolverInputTypes["order_by"] | undefined | null;
    clientId2?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    updated_at?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: channel */
  ["channel_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "channel" */
  ["channel_select_column"]: channel_select_column;
  /** input type for updating data in table "channel" */
  ["channel_set_input"]: {
    clientId1?: ResolverInputTypes["uuid"] | undefined | null;
    clientId2?: ResolverInputTypes["uuid"] | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** Streaming cursor of the table "channel" */
  ["channel_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["channel_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["channel_stream_cursor_value_input"]: {
    clientId1?: ResolverInputTypes["uuid"] | undefined | null;
    clientId2?: ResolverInputTypes["uuid"] | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** update columns of table "channel" */
  ["channel_update_column"]: channel_update_column;
  ["channel_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["channel_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["channel_bool_exp"];
  };
  /** chat messages between clients */
  ["chat"]: AliasType<{
    channelId?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message?: boolean | `@${string}`;
    senderId?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "chat" */
  ["chat_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["chat_aggregate_fields"];
    nodes?: ResolverInputTypes["chat"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "chat" */
  ["chat_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["chat_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["chat_max_fields"];
    min?: ResolverInputTypes["chat_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "chat". All fields are combined with a logical 'AND'. */
  ["chat_bool_exp"]: {
    _and?: Array<ResolverInputTypes["chat_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["chat_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["chat_bool_exp"]> | undefined | null;
    channelId?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    created_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    message?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    senderId?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    updated_at?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "chat" */
  ["chat_constraint"]: chat_constraint;
  /** input type for inserting data into table "chat" */
  ["chat_insert_input"]: {
    channelId?: ResolverInputTypes["uuid"] | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    message?: string | undefined | null;
    senderId?: ResolverInputTypes["uuid"] | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** aggregate max on columns */
  ["chat_max_fields"]: AliasType<{
    channelId?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message?: boolean | `@${string}`;
    senderId?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["chat_min_fields"]: AliasType<{
    channelId?: boolean | `@${string}`;
    created_at?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    message?: boolean | `@${string}`;
    senderId?: boolean | `@${string}`;
    updated_at?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "chat" */
  ["chat_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["chat"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "chat" */
  ["chat_on_conflict"]: {
    constraint: ResolverInputTypes["chat_constraint"];
    update_columns: Array<ResolverInputTypes["chat_update_column"]>;
    where?: ResolverInputTypes["chat_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "chat". */
  ["chat_order_by"]: {
    channelId?: ResolverInputTypes["order_by"] | undefined | null;
    created_at?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    message?: ResolverInputTypes["order_by"] | undefined | null;
    senderId?: ResolverInputTypes["order_by"] | undefined | null;
    updated_at?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: chat */
  ["chat_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "chat" */
  ["chat_select_column"]: chat_select_column;
  /** input type for updating data in table "chat" */
  ["chat_set_input"]: {
    channelId?: ResolverInputTypes["uuid"] | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    message?: string | undefined | null;
    senderId?: ResolverInputTypes["uuid"] | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** Streaming cursor of the table "chat" */
  ["chat_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["chat_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_stream_cursor_value_input"]: {
    channelId?: ResolverInputTypes["uuid"] | undefined | null;
    created_at?: ResolverInputTypes["timestamptz"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    message?: string | undefined | null;
    senderId?: ResolverInputTypes["uuid"] | undefined | null;
    updated_at?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** update columns of table "chat" */
  ["chat_update_column"]: chat_update_column;
  ["chat_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["chat_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["chat_bool_exp"];
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_channel?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["channel_bool_exp"];
      },
      ResolverInputTypes["channel_mutation_response"],
    ];
    delete_channel_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["channel"],
    ];
    delete_chat?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["chat_bool_exp"];
      },
      ResolverInputTypes["chat_mutation_response"],
    ];
    delete_chat_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["chat"],
    ];
    insert_channel?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["channel_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["channel_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["channel_mutation_response"],
    ];
    insert_channel_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["channel_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["channel_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["channel"],
    ];
    insert_chat?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["chat_insert_input"]
        > /** upsert condition */;
        on_conflict?: ResolverInputTypes["chat_on_conflict"] | undefined | null;
      },
      ResolverInputTypes["chat_mutation_response"],
    ];
    insert_chat_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["chat_insert_input"] /** upsert condition */;
        on_conflict?: ResolverInputTypes["chat_on_conflict"] | undefined | null;
      },
      ResolverInputTypes["chat"],
    ];
    update_channel?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["channel_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["channel_bool_exp"];
      },
      ResolverInputTypes["channel_mutation_response"],
    ];
    update_channel_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["channel_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["channel_pk_columns_input"];
      },
      ResolverInputTypes["channel"],
    ];
    update_channel_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["channel_updates"]>;
      },
      ResolverInputTypes["channel_mutation_response"],
    ];
    update_chat?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["chat_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["chat_bool_exp"];
      },
      ResolverInputTypes["chat_mutation_response"],
    ];
    update_chat_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["chat_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["chat_pk_columns_input"];
      },
      ResolverInputTypes["chat"],
    ];
    update_chat_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["chat_updates"]>;
      },
      ResolverInputTypes["chat_mutation_response"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    channel?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["channel_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["channel_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["channel_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["channel"],
    ];
    channel_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["channel_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["channel_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["channel_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["channel_aggregate"],
    ];
    channel_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["channel"],
    ];
    chat?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["chat_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["chat_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chat"],
    ];
    chat_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["chat_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["chat_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chat_aggregate"],
    ];
    chat_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["chat"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    channel?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["channel_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["channel_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["channel_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["channel"],
    ];
    channel_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["channel_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["channel_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["channel_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["channel_aggregate"],
    ];
    channel_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["channel"],
    ];
    channel_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["channel_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["channel_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["channel"],
    ];
    chat?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["chat_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["chat_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chat"],
    ];
    chat_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chat_select_column"]>
          | undefined
          | null /** limit the number of rows returned */;
        limit?:
          | number
          | undefined
          | null /** skip the first n rows. Use only with order_by */;
        offset?:
          | number
          | undefined
          | null /** sort the rows by one or more columns */;
        order_by?:
          | Array<ResolverInputTypes["chat_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["chat_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chat_aggregate"],
    ];
    chat_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["chat"],
    ];
    chat_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["chat_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["chat_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chat"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["timestamptz"]: unknown;
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: ResolverInputTypes["timestamptz"] | undefined | null;
    _gt?: ResolverInputTypes["timestamptz"] | undefined | null;
    _gte?: ResolverInputTypes["timestamptz"] | undefined | null;
    _in?: Array<ResolverInputTypes["timestamptz"]> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: ResolverInputTypes["timestamptz"] | undefined | null;
    _lte?: ResolverInputTypes["timestamptz"] | undefined | null;
    _neq?: ResolverInputTypes["timestamptz"] | undefined | null;
    _nin?: Array<ResolverInputTypes["timestamptz"]> | undefined | null;
  };
  ["uuid"]: unknown;
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: ResolverInputTypes["uuid"] | undefined | null;
    _gt?: ResolverInputTypes["uuid"] | undefined | null;
    _gte?: ResolverInputTypes["uuid"] | undefined | null;
    _in?: Array<ResolverInputTypes["uuid"]> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: ResolverInputTypes["uuid"] | undefined | null;
    _lte?: ResolverInputTypes["uuid"] | undefined | null;
    _neq?: ResolverInputTypes["uuid"] | undefined | null;
    _nin?: Array<ResolverInputTypes["uuid"]> | undefined | null;
  };
};

export type ModelTypes = {
  ["schema"]: {
    query?: ModelTypes["query_root"] | undefined;
    mutation?: ModelTypes["mutation_root"] | undefined;
    subscription?: ModelTypes["subscription_root"] | undefined;
  };
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined;
    _gt?: string | undefined;
    _gte?: string | undefined;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined;
    _in?: Array<string> | undefined;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined;
    _is_null?: boolean | undefined;
    /** does the column match the given pattern */
    _like?: string | undefined;
    _lt?: string | undefined;
    _lte?: string | undefined;
    _neq?: string | undefined;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined;
    _nin?: Array<string> | undefined;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined;
  };
  /** all the rooms for chat */
  ["channel"]: {
    clientId1: ModelTypes["uuid"];
    clientId2: ModelTypes["uuid"];
    created_at: ModelTypes["timestamptz"];
    id: ModelTypes["uuid"];
    updated_at: ModelTypes["timestamptz"];
  };
  /** aggregated selection of "channel" */
  ["channel_aggregate"]: {
    aggregate?: ModelTypes["channel_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["channel"]>;
  };
  /** aggregate fields of "channel" */
  ["channel_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["channel_max_fields"] | undefined;
    min?: ModelTypes["channel_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "channel". All fields are combined with a logical 'AND'. */
  ["channel_bool_exp"]: {
    _and?: Array<ModelTypes["channel_bool_exp"]> | undefined;
    _not?: ModelTypes["channel_bool_exp"] | undefined;
    _or?: Array<ModelTypes["channel_bool_exp"]> | undefined;
    clientId1?: ModelTypes["uuid_comparison_exp"] | undefined;
    clientId2?: ModelTypes["uuid_comparison_exp"] | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    updated_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
  };
  ["channel_constraint"]: channel_constraint;
  /** input type for inserting data into table "channel" */
  ["channel_insert_input"]: {
    clientId1?: ModelTypes["uuid"] | undefined;
    clientId2?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["channel_max_fields"]: {
    clientId1?: ModelTypes["uuid"] | undefined;
    clientId2?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** aggregate min on columns */
  ["channel_min_fields"]: {
    clientId1?: ModelTypes["uuid"] | undefined;
    clientId2?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** response of any mutation on the table "channel" */
  ["channel_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["channel"]>;
  };
  /** on_conflict condition type for table "channel" */
  ["channel_on_conflict"]: {
    constraint: ModelTypes["channel_constraint"];
    update_columns: Array<ModelTypes["channel_update_column"]>;
    where?: ModelTypes["channel_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "channel". */
  ["channel_order_by"]: {
    clientId1?: ModelTypes["order_by"] | undefined;
    clientId2?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    updated_at?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: channel */
  ["channel_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["channel_select_column"]: channel_select_column;
  /** input type for updating data in table "channel" */
  ["channel_set_input"]: {
    clientId1?: ModelTypes["uuid"] | undefined;
    clientId2?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "channel" */
  ["channel_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["channel_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["channel_stream_cursor_value_input"]: {
    clientId1?: ModelTypes["uuid"] | undefined;
    clientId2?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  ["channel_update_column"]: channel_update_column;
  ["channel_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["channel_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["channel_bool_exp"];
  };
  /** chat messages between clients */
  ["chat"]: {
    channelId: ModelTypes["uuid"];
    created_at: ModelTypes["timestamptz"];
    id: ModelTypes["uuid"];
    message: string;
    senderId: ModelTypes["uuid"];
    updated_at: ModelTypes["timestamptz"];
  };
  /** aggregated selection of "chat" */
  ["chat_aggregate"]: {
    aggregate?: ModelTypes["chat_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["chat"]>;
  };
  /** aggregate fields of "chat" */
  ["chat_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["chat_max_fields"] | undefined;
    min?: ModelTypes["chat_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "chat". All fields are combined with a logical 'AND'. */
  ["chat_bool_exp"]: {
    _and?: Array<ModelTypes["chat_bool_exp"]> | undefined;
    _not?: ModelTypes["chat_bool_exp"] | undefined;
    _or?: Array<ModelTypes["chat_bool_exp"]> | undefined;
    channelId?: ModelTypes["uuid_comparison_exp"] | undefined;
    created_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    message?: ModelTypes["String_comparison_exp"] | undefined;
    senderId?: ModelTypes["uuid_comparison_exp"] | undefined;
    updated_at?: ModelTypes["timestamptz_comparison_exp"] | undefined;
  };
  ["chat_constraint"]: chat_constraint;
  /** input type for inserting data into table "chat" */
  ["chat_insert_input"]: {
    channelId?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    message?: string | undefined;
    senderId?: ModelTypes["uuid"] | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["chat_max_fields"]: {
    channelId?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    message?: string | undefined;
    senderId?: ModelTypes["uuid"] | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** aggregate min on columns */
  ["chat_min_fields"]: {
    channelId?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    message?: string | undefined;
    senderId?: ModelTypes["uuid"] | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** response of any mutation on the table "chat" */
  ["chat_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["chat"]>;
  };
  /** on_conflict condition type for table "chat" */
  ["chat_on_conflict"]: {
    constraint: ModelTypes["chat_constraint"];
    update_columns: Array<ModelTypes["chat_update_column"]>;
    where?: ModelTypes["chat_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chat". */
  ["chat_order_by"]: {
    channelId?: ModelTypes["order_by"] | undefined;
    created_at?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    message?: ModelTypes["order_by"] | undefined;
    senderId?: ModelTypes["order_by"] | undefined;
    updated_at?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: chat */
  ["chat_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["chat_select_column"]: chat_select_column;
  /** input type for updating data in table "chat" */
  ["chat_set_input"]: {
    channelId?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    message?: string | undefined;
    senderId?: ModelTypes["uuid"] | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "chat" */
  ["chat_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["chat_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_stream_cursor_value_input"]: {
    channelId?: ModelTypes["uuid"] | undefined;
    created_at?: ModelTypes["timestamptz"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    message?: string | undefined;
    senderId?: ModelTypes["uuid"] | undefined;
    updated_at?: ModelTypes["timestamptz"] | undefined;
  };
  ["chat_update_column"]: chat_update_column;
  ["chat_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["chat_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["chat_bool_exp"];
  };
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: {
    /** delete data from the table: "channel" */
    delete_channel?: ModelTypes["channel_mutation_response"] | undefined;
    /** delete single row from the table: "channel" */
    delete_channel_by_pk?: ModelTypes["channel"] | undefined;
    /** delete data from the table: "chat" */
    delete_chat?: ModelTypes["chat_mutation_response"] | undefined;
    /** delete single row from the table: "chat" */
    delete_chat_by_pk?: ModelTypes["chat"] | undefined;
    /** insert data into the table: "channel" */
    insert_channel?: ModelTypes["channel_mutation_response"] | undefined;
    /** insert a single row into the table: "channel" */
    insert_channel_one?: ModelTypes["channel"] | undefined;
    /** insert data into the table: "chat" */
    insert_chat?: ModelTypes["chat_mutation_response"] | undefined;
    /** insert a single row into the table: "chat" */
    insert_chat_one?: ModelTypes["chat"] | undefined;
    /** update data of the table: "channel" */
    update_channel?: ModelTypes["channel_mutation_response"] | undefined;
    /** update single row of the table: "channel" */
    update_channel_by_pk?: ModelTypes["channel"] | undefined;
    /** update multiples rows of table: "channel" */
    update_channel_many?:
      | Array<ModelTypes["channel_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "chat" */
    update_chat?: ModelTypes["chat_mutation_response"] | undefined;
    /** update single row of the table: "chat" */
    update_chat_by_pk?: ModelTypes["chat"] | undefined;
    /** update multiples rows of table: "chat" */
    update_chat_many?:
      | Array<ModelTypes["chat_mutation_response"] | undefined>
      | undefined;
  };
  ["order_by"]: order_by;
  ["query_root"]: {
    /** fetch data from the table: "channel" */
    channel: Array<ModelTypes["channel"]>;
    /** fetch aggregated fields from the table: "channel" */
    channel_aggregate: ModelTypes["channel_aggregate"];
    /** fetch data from the table: "channel" using primary key columns */
    channel_by_pk?: ModelTypes["channel"] | undefined;
    /** fetch data from the table: "chat" */
    chat: Array<ModelTypes["chat"]>;
    /** fetch aggregated fields from the table: "chat" */
    chat_aggregate: ModelTypes["chat_aggregate"];
    /** fetch data from the table: "chat" using primary key columns */
    chat_by_pk?: ModelTypes["chat"] | undefined;
  };
  ["subscription_root"]: {
    /** fetch data from the table: "channel" */
    channel: Array<ModelTypes["channel"]>;
    /** fetch aggregated fields from the table: "channel" */
    channel_aggregate: ModelTypes["channel_aggregate"];
    /** fetch data from the table: "channel" using primary key columns */
    channel_by_pk?: ModelTypes["channel"] | undefined;
    /** fetch data from the table in a streaming manner: "channel" */
    channel_stream: Array<ModelTypes["channel"]>;
    /** fetch data from the table: "chat" */
    chat: Array<ModelTypes["chat"]>;
    /** fetch aggregated fields from the table: "chat" */
    chat_aggregate: ModelTypes["chat_aggregate"];
    /** fetch data from the table: "chat" using primary key columns */
    chat_by_pk?: ModelTypes["chat"] | undefined;
    /** fetch data from the table in a streaming manner: "chat" */
    chat_stream: Array<ModelTypes["chat"]>;
  };
  ["timestamptz"]: any;
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: ModelTypes["timestamptz"] | undefined;
    _gt?: ModelTypes["timestamptz"] | undefined;
    _gte?: ModelTypes["timestamptz"] | undefined;
    _in?: Array<ModelTypes["timestamptz"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: ModelTypes["timestamptz"] | undefined;
    _lte?: ModelTypes["timestamptz"] | undefined;
    _neq?: ModelTypes["timestamptz"] | undefined;
    _nin?: Array<ModelTypes["timestamptz"]> | undefined;
  };
  ["uuid"]: any;
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: ModelTypes["uuid"] | undefined;
    _gt?: ModelTypes["uuid"] | undefined;
    _gte?: ModelTypes["uuid"] | undefined;
    _in?: Array<ModelTypes["uuid"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: ModelTypes["uuid"] | undefined;
    _lte?: ModelTypes["uuid"] | undefined;
    _neq?: ModelTypes["uuid"] | undefined;
    _nin?: Array<ModelTypes["uuid"]> | undefined;
  };
};

export type GraphQLTypes = {
  /** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
  ["String_comparison_exp"]: {
    _eq?: string | undefined;
    _gt?: string | undefined;
    _gte?: string | undefined;
    /** does the column match the given case-insensitive pattern */
    _ilike?: string | undefined;
    _in?: Array<string> | undefined;
    /** does the column match the given POSIX regular expression, case insensitive */
    _iregex?: string | undefined;
    _is_null?: boolean | undefined;
    /** does the column match the given pattern */
    _like?: string | undefined;
    _lt?: string | undefined;
    _lte?: string | undefined;
    _neq?: string | undefined;
    /** does the column NOT match the given case-insensitive pattern */
    _nilike?: string | undefined;
    _nin?: Array<string> | undefined;
    /** does the column NOT match the given POSIX regular expression, case insensitive */
    _niregex?: string | undefined;
    /** does the column NOT match the given pattern */
    _nlike?: string | undefined;
    /** does the column NOT match the given POSIX regular expression, case sensitive */
    _nregex?: string | undefined;
    /** does the column NOT match the given SQL regular expression */
    _nsimilar?: string | undefined;
    /** does the column match the given POSIX regular expression, case sensitive */
    _regex?: string | undefined;
    /** does the column match the given SQL regular expression */
    _similar?: string | undefined;
  };
  /** all the rooms for chat */
  ["channel"]: {
    __typename: "channel";
    clientId1: GraphQLTypes["uuid"];
    clientId2: GraphQLTypes["uuid"];
    created_at: GraphQLTypes["timestamptz"];
    id: GraphQLTypes["uuid"];
    updated_at: GraphQLTypes["timestamptz"];
  };
  /** aggregated selection of "channel" */
  ["channel_aggregate"]: {
    __typename: "channel_aggregate";
    aggregate?: GraphQLTypes["channel_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["channel"]>;
  };
  /** aggregate fields of "channel" */
  ["channel_aggregate_fields"]: {
    __typename: "channel_aggregate_fields";
    count: number;
    max?: GraphQLTypes["channel_max_fields"] | undefined;
    min?: GraphQLTypes["channel_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "channel". All fields are combined with a logical 'AND'. */
  ["channel_bool_exp"]: {
    _and?: Array<GraphQLTypes["channel_bool_exp"]> | undefined;
    _not?: GraphQLTypes["channel_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["channel_bool_exp"]> | undefined;
    clientId1?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    clientId2?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    updated_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "channel" */
  ["channel_constraint"]: channel_constraint;
  /** input type for inserting data into table "channel" */
  ["channel_insert_input"]: {
    clientId1?: GraphQLTypes["uuid"] | undefined;
    clientId2?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["channel_max_fields"]: {
    __typename: "channel_max_fields";
    clientId1?: GraphQLTypes["uuid"] | undefined;
    clientId2?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** aggregate min on columns */
  ["channel_min_fields"]: {
    __typename: "channel_min_fields";
    clientId1?: GraphQLTypes["uuid"] | undefined;
    clientId2?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** response of any mutation on the table "channel" */
  ["channel_mutation_response"]: {
    __typename: "channel_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["channel"]>;
  };
  /** on_conflict condition type for table "channel" */
  ["channel_on_conflict"]: {
    constraint: GraphQLTypes["channel_constraint"];
    update_columns: Array<GraphQLTypes["channel_update_column"]>;
    where?: GraphQLTypes["channel_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "channel". */
  ["channel_order_by"]: {
    clientId1?: GraphQLTypes["order_by"] | undefined;
    clientId2?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    updated_at?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: channel */
  ["channel_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "channel" */
  ["channel_select_column"]: channel_select_column;
  /** input type for updating data in table "channel" */
  ["channel_set_input"]: {
    clientId1?: GraphQLTypes["uuid"] | undefined;
    clientId2?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "channel" */
  ["channel_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["channel_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["channel_stream_cursor_value_input"]: {
    clientId1?: GraphQLTypes["uuid"] | undefined;
    clientId2?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** update columns of table "channel" */
  ["channel_update_column"]: channel_update_column;
  ["channel_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["channel_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["channel_bool_exp"];
  };
  /** chat messages between clients */
  ["chat"]: {
    __typename: "chat";
    channelId: GraphQLTypes["uuid"];
    created_at: GraphQLTypes["timestamptz"];
    id: GraphQLTypes["uuid"];
    message: string;
    senderId: GraphQLTypes["uuid"];
    updated_at: GraphQLTypes["timestamptz"];
  };
  /** aggregated selection of "chat" */
  ["chat_aggregate"]: {
    __typename: "chat_aggregate";
    aggregate?: GraphQLTypes["chat_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["chat"]>;
  };
  /** aggregate fields of "chat" */
  ["chat_aggregate_fields"]: {
    __typename: "chat_aggregate_fields";
    count: number;
    max?: GraphQLTypes["chat_max_fields"] | undefined;
    min?: GraphQLTypes["chat_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "chat". All fields are combined with a logical 'AND'. */
  ["chat_bool_exp"]: {
    _and?: Array<GraphQLTypes["chat_bool_exp"]> | undefined;
    _not?: GraphQLTypes["chat_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["chat_bool_exp"]> | undefined;
    channelId?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    created_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    message?: GraphQLTypes["String_comparison_exp"] | undefined;
    senderId?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    updated_at?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "chat" */
  ["chat_constraint"]: chat_constraint;
  /** input type for inserting data into table "chat" */
  ["chat_insert_input"]: {
    channelId?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    message?: string | undefined;
    senderId?: GraphQLTypes["uuid"] | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["chat_max_fields"]: {
    __typename: "chat_max_fields";
    channelId?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    message?: string | undefined;
    senderId?: GraphQLTypes["uuid"] | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** aggregate min on columns */
  ["chat_min_fields"]: {
    __typename: "chat_min_fields";
    channelId?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    message?: string | undefined;
    senderId?: GraphQLTypes["uuid"] | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** response of any mutation on the table "chat" */
  ["chat_mutation_response"]: {
    __typename: "chat_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["chat"]>;
  };
  /** on_conflict condition type for table "chat" */
  ["chat_on_conflict"]: {
    constraint: GraphQLTypes["chat_constraint"];
    update_columns: Array<GraphQLTypes["chat_update_column"]>;
    where?: GraphQLTypes["chat_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chat". */
  ["chat_order_by"]: {
    channelId?: GraphQLTypes["order_by"] | undefined;
    created_at?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    message?: GraphQLTypes["order_by"] | undefined;
    senderId?: GraphQLTypes["order_by"] | undefined;
    updated_at?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: chat */
  ["chat_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "chat" */
  ["chat_select_column"]: chat_select_column;
  /** input type for updating data in table "chat" */
  ["chat_set_input"]: {
    channelId?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    message?: string | undefined;
    senderId?: GraphQLTypes["uuid"] | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "chat" */
  ["chat_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["chat_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chat_stream_cursor_value_input"]: {
    channelId?: GraphQLTypes["uuid"] | undefined;
    created_at?: GraphQLTypes["timestamptz"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    message?: string | undefined;
    senderId?: GraphQLTypes["uuid"] | undefined;
    updated_at?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** update columns of table "chat" */
  ["chat_update_column"]: chat_update_column;
  ["chat_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["chat_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["chat_bool_exp"];
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** mutation root */
  ["mutation_root"]: {
    __typename: "mutation_root";
    /** delete data from the table: "channel" */
    delete_channel?: GraphQLTypes["channel_mutation_response"] | undefined;
    /** delete single row from the table: "channel" */
    delete_channel_by_pk?: GraphQLTypes["channel"] | undefined;
    /** delete data from the table: "chat" */
    delete_chat?: GraphQLTypes["chat_mutation_response"] | undefined;
    /** delete single row from the table: "chat" */
    delete_chat_by_pk?: GraphQLTypes["chat"] | undefined;
    /** insert data into the table: "channel" */
    insert_channel?: GraphQLTypes["channel_mutation_response"] | undefined;
    /** insert a single row into the table: "channel" */
    insert_channel_one?: GraphQLTypes["channel"] | undefined;
    /** insert data into the table: "chat" */
    insert_chat?: GraphQLTypes["chat_mutation_response"] | undefined;
    /** insert a single row into the table: "chat" */
    insert_chat_one?: GraphQLTypes["chat"] | undefined;
    /** update data of the table: "channel" */
    update_channel?: GraphQLTypes["channel_mutation_response"] | undefined;
    /** update single row of the table: "channel" */
    update_channel_by_pk?: GraphQLTypes["channel"] | undefined;
    /** update multiples rows of table: "channel" */
    update_channel_many?:
      | Array<GraphQLTypes["channel_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "chat" */
    update_chat?: GraphQLTypes["chat_mutation_response"] | undefined;
    /** update single row of the table: "chat" */
    update_chat_by_pk?: GraphQLTypes["chat"] | undefined;
    /** update multiples rows of table: "chat" */
    update_chat_many?:
      | Array<GraphQLTypes["chat_mutation_response"] | undefined>
      | undefined;
  };
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: {
    __typename: "query_root";
    /** fetch data from the table: "channel" */
    channel: Array<GraphQLTypes["channel"]>;
    /** fetch aggregated fields from the table: "channel" */
    channel_aggregate: GraphQLTypes["channel_aggregate"];
    /** fetch data from the table: "channel" using primary key columns */
    channel_by_pk?: GraphQLTypes["channel"] | undefined;
    /** fetch data from the table: "chat" */
    chat: Array<GraphQLTypes["chat"]>;
    /** fetch aggregated fields from the table: "chat" */
    chat_aggregate: GraphQLTypes["chat_aggregate"];
    /** fetch data from the table: "chat" using primary key columns */
    chat_by_pk?: GraphQLTypes["chat"] | undefined;
  };
  ["subscription_root"]: {
    __typename: "subscription_root";
    /** fetch data from the table: "channel" */
    channel: Array<GraphQLTypes["channel"]>;
    /** fetch aggregated fields from the table: "channel" */
    channel_aggregate: GraphQLTypes["channel_aggregate"];
    /** fetch data from the table: "channel" using primary key columns */
    channel_by_pk?: GraphQLTypes["channel"] | undefined;
    /** fetch data from the table in a streaming manner: "channel" */
    channel_stream: Array<GraphQLTypes["channel"]>;
    /** fetch data from the table: "chat" */
    chat: Array<GraphQLTypes["chat"]>;
    /** fetch aggregated fields from the table: "chat" */
    chat_aggregate: GraphQLTypes["chat_aggregate"];
    /** fetch data from the table: "chat" using primary key columns */
    chat_by_pk?: GraphQLTypes["chat"] | undefined;
    /** fetch data from the table in a streaming manner: "chat" */
    chat_stream: Array<GraphQLTypes["chat"]>;
  };
  ["timestamptz"]: "scalar" & { name: "timestamptz" };
  /** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
  ["timestamptz_comparison_exp"]: {
    _eq?: GraphQLTypes["timestamptz"] | undefined;
    _gt?: GraphQLTypes["timestamptz"] | undefined;
    _gte?: GraphQLTypes["timestamptz"] | undefined;
    _in?: Array<GraphQLTypes["timestamptz"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: GraphQLTypes["timestamptz"] | undefined;
    _lte?: GraphQLTypes["timestamptz"] | undefined;
    _neq?: GraphQLTypes["timestamptz"] | undefined;
    _nin?: Array<GraphQLTypes["timestamptz"]> | undefined;
  };
  ["uuid"]: "scalar" & { name: "uuid" };
  /** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
  ["uuid_comparison_exp"]: {
    _eq?: GraphQLTypes["uuid"] | undefined;
    _gt?: GraphQLTypes["uuid"] | undefined;
    _gte?: GraphQLTypes["uuid"] | undefined;
    _in?: Array<GraphQLTypes["uuid"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: GraphQLTypes["uuid"] | undefined;
    _lte?: GraphQLTypes["uuid"] | undefined;
    _neq?: GraphQLTypes["uuid"] | undefined;
    _nin?: Array<GraphQLTypes["uuid"]> | undefined;
  };
};
/** unique or primary key constraints on table "channel" */
export const enum channel_constraint {
  channel_clientId1_key = "channel_clientId1_key",
  channel_clientId2_key = "channel_clientId2_key",
  channel_pkey = "channel_pkey",
}
/** select columns of table "channel" */
export const enum channel_select_column {
  clientId1 = "clientId1",
  clientId2 = "clientId2",
  created_at = "created_at",
  id = "id",
  updated_at = "updated_at",
}
/** update columns of table "channel" */
export const enum channel_update_column {
  clientId1 = "clientId1",
  clientId2 = "clientId2",
  created_at = "created_at",
  id = "id",
  updated_at = "updated_at",
}
/** unique or primary key constraints on table "chat" */
export const enum chat_constraint {
  chat_pkey = "chat_pkey",
}
/** select columns of table "chat" */
export const enum chat_select_column {
  channelId = "channelId",
  created_at = "created_at",
  id = "id",
  message = "message",
  senderId = "senderId",
  updated_at = "updated_at",
}
/** update columns of table "chat" */
export const enum chat_update_column {
  channelId = "channelId",
  created_at = "created_at",
  id = "id",
  message = "message",
  senderId = "senderId",
  updated_at = "updated_at",
}
/** ordering argument of a cursor */
export const enum cursor_ordering {
  ASC = "ASC",
  DESC = "DESC",
}
/** column ordering options */
export const enum order_by {
  asc = "asc",
  asc_nulls_first = "asc_nulls_first",
  asc_nulls_last = "asc_nulls_last",
  desc = "desc",
  desc_nulls_first = "desc_nulls_first",
  desc_nulls_last = "desc_nulls_last",
}

type ZEUS_VARIABLES = {
  ["String_comparison_exp"]: ValueTypes["String_comparison_exp"];
  ["channel_bool_exp"]: ValueTypes["channel_bool_exp"];
  ["channel_constraint"]: ValueTypes["channel_constraint"];
  ["channel_insert_input"]: ValueTypes["channel_insert_input"];
  ["channel_on_conflict"]: ValueTypes["channel_on_conflict"];
  ["channel_order_by"]: ValueTypes["channel_order_by"];
  ["channel_pk_columns_input"]: ValueTypes["channel_pk_columns_input"];
  ["channel_select_column"]: ValueTypes["channel_select_column"];
  ["channel_set_input"]: ValueTypes["channel_set_input"];
  ["channel_stream_cursor_input"]: ValueTypes["channel_stream_cursor_input"];
  ["channel_stream_cursor_value_input"]: ValueTypes["channel_stream_cursor_value_input"];
  ["channel_update_column"]: ValueTypes["channel_update_column"];
  ["channel_updates"]: ValueTypes["channel_updates"];
  ["chat_bool_exp"]: ValueTypes["chat_bool_exp"];
  ["chat_constraint"]: ValueTypes["chat_constraint"];
  ["chat_insert_input"]: ValueTypes["chat_insert_input"];
  ["chat_on_conflict"]: ValueTypes["chat_on_conflict"];
  ["chat_order_by"]: ValueTypes["chat_order_by"];
  ["chat_pk_columns_input"]: ValueTypes["chat_pk_columns_input"];
  ["chat_select_column"]: ValueTypes["chat_select_column"];
  ["chat_set_input"]: ValueTypes["chat_set_input"];
  ["chat_stream_cursor_input"]: ValueTypes["chat_stream_cursor_input"];
  ["chat_stream_cursor_value_input"]: ValueTypes["chat_stream_cursor_value_input"];
  ["chat_update_column"]: ValueTypes["chat_update_column"];
  ["chat_updates"]: ValueTypes["chat_updates"];
  ["cursor_ordering"]: ValueTypes["cursor_ordering"];
  ["order_by"]: ValueTypes["order_by"];
  ["timestamptz"]: ValueTypes["timestamptz"];
  ["timestamptz_comparison_exp"]: ValueTypes["timestamptz_comparison_exp"];
  ["uuid"]: ValueTypes["uuid"];
  ["uuid_comparison_exp"]: ValueTypes["uuid_comparison_exp"];
};
