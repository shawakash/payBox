/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from "./const";
export const HOST = "http://localhost:8112/v1/graphql";

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
  bigint?: ScalarResolver;
  date?: ScalarResolver;
  float8?: ScalarResolver;
  jsonb?: ScalarResolver;
  uuid?: ScalarResolver;
};
type ZEUS_UNIONS = never;

export type ValueTypes = {
  /** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
  ["Boolean_comparison_exp"]: {
    _eq?: boolean | undefined | null | Variable<any, string>;
    _gt?: boolean | undefined | null | Variable<any, string>;
    _gte?: boolean | undefined | null | Variable<any, string>;
    _in?: Array<boolean> | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: boolean | undefined | null | Variable<any, string>;
    _lte?: boolean | undefined | null | Variable<any, string>;
    _neq?: boolean | undefined | null | Variable<any, string>;
    _nin?: Array<boolean> | undefined | null | Variable<any, string>;
  };
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined | null | Variable<any, string>;
    _gt?: number | undefined | null | Variable<any, string>;
    _gte?: number | undefined | null | Variable<any, string>;
    _in?: Array<number> | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: number | undefined | null | Variable<any, string>;
    _lte?: number | undefined | null | Variable<any, string>;
    _neq?: number | undefined | null | Variable<any, string>;
    _nin?: Array<number> | undefined | null | Variable<any, string>;
  };
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
  /** accounts in a wallet */
  ["account"]: AliasType<{
    /** An object relationship */
    bitcoin?: ValueTypes["bitcoin"];
    /** An object relationship */
    client?: ValueTypes["client"];
    clientId?: boolean | `@${string}`;
    /** An object relationship */
    eth?: ValueTypes["eth"];
    id?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    /** An object relationship */
    sol?: ValueTypes["sol"];
    /** An object relationship */
    wallet?: ValueTypes["wallet"];
    walletId?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "account" */
  ["account_aggregate"]: AliasType<{
    aggregate?: ValueTypes["account_aggregate_fields"];
    nodes?: ValueTypes["account"];
    __typename?: boolean | `@${string}`;
  }>;
  ["account_aggregate_bool_exp"]: {
    count?:
      | ValueTypes["account_aggregate_bool_exp_count"]
      | undefined
      | null
      | Variable<any, string>;
  };
  ["account_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ValueTypes["account_select_column"]>
      | undefined
      | null
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["account_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["Int_comparison_exp"] | Variable<any, string>;
  };
  /** aggregate fields of "account" */
  ["account_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["account_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["account_max_fields"];
    min?: ValueTypes["account_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "account" */
  ["account_aggregate_order_by"]: {
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["account_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["account_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "account" */
  ["account_arr_rel_insert_input"]: {
    data: Array<ValueTypes["account_insert_input"]> | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["account_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "account". All fields are combined with a logical 'AND'. */
  ["account_bool_exp"]: {
    _and?:
      | Array<ValueTypes["account_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["account_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["account_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    bitcoin?:
      | ValueTypes["bitcoin_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    client?:
      | ValueTypes["client_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    clientId?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    eth?: ValueTypes["eth_bool_exp"] | undefined | null | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    name?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    sol?: ValueTypes["sol_bool_exp"] | undefined | null | Variable<any, string>;
    wallet?:
      | ValueTypes["wallet_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    walletId?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "account" */
  ["account_constraint"]: account_constraint;
  /** input type for inserting data into table "account" */
  ["account_insert_input"]: {
    bitcoin?:
      | ValueTypes["bitcoin_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    client?:
      | ValueTypes["client_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    clientId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    eth?:
      | ValueTypes["eth_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    name?: string | undefined | null | Variable<any, string>;
    sol?:
      | ValueTypes["sol_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    wallet?:
      | ValueTypes["wallet_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    walletId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["account_max_fields"]: AliasType<{
    clientId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    walletId?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "account" */
  ["account_max_order_by"]: {
    clientId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    name?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    walletId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate min on columns */
  ["account_min_fields"]: AliasType<{
    clientId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    walletId?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "account" */
  ["account_min_order_by"]: {
    clientId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    name?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    walletId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** response of any mutation on the table "account" */
  ["account_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["account"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "account" */
  ["account_obj_rel_insert_input"]: {
    data: ValueTypes["account_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["account_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "account" */
  ["account_on_conflict"]: {
    constraint: ValueTypes["account_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["account_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["account_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "account". */
  ["account_order_by"]: {
    bitcoin?:
      | ValueTypes["bitcoin_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    client?:
      | ValueTypes["client_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    clientId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    eth?: ValueTypes["eth_order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    name?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    sol?: ValueTypes["sol_order_by"] | undefined | null | Variable<any, string>;
    wallet?:
      | ValueTypes["wallet_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    walletId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: account */
  ["account_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "account" */
  ["account_select_column"]: account_select_column;
  /** input type for updating data in table "account" */
  ["account_set_input"]: {
    clientId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    name?: string | undefined | null | Variable<any, string>;
    walletId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "account" */
  ["account_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["account_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["account_stream_cursor_value_input"]: {
    clientId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    name?: string | undefined | null | Variable<any, string>;
    walletId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
  };
  /** update columns of table "account" */
  ["account_update_column"]: account_update_column;
  ["account_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["account_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["account_bool_exp"] | Variable<any, string>;
  };
  /** different chain and there address */
  ["address"]: AliasType<{
    bitcoin?: boolean | `@${string}`;
    /** An object relationship */
    client?: ValueTypes["client"];
    client_id?: boolean | `@${string}`;
    eth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    sol?: boolean | `@${string}`;
    usdc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "address" */
  ["address_aggregate"]: AliasType<{
    aggregate?: ValueTypes["address_aggregate_fields"];
    nodes?: ValueTypes["address"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "address" */
  ["address_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["address_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["address_max_fields"];
    min?: ValueTypes["address_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "address". All fields are combined with a logical 'AND'. */
  ["address_bool_exp"]: {
    _and?:
      | Array<ValueTypes["address_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["address_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["address_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    bitcoin?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    client?:
      | ValueTypes["client_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    client_id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    eth?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    sol?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    usdc?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "address" */
  ["address_constraint"]: address_constraint;
  /** input type for inserting data into table "address" */
  ["address_insert_input"]: {
    bitcoin?: string | undefined | null | Variable<any, string>;
    client?:
      | ValueTypes["client_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    client_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    eth?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    sol?: string | undefined | null | Variable<any, string>;
    usdc?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["address_max_fields"]: AliasType<{
    bitcoin?: boolean | `@${string}`;
    client_id?: boolean | `@${string}`;
    eth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    sol?: boolean | `@${string}`;
    usdc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["address_min_fields"]: AliasType<{
    bitcoin?: boolean | `@${string}`;
    client_id?: boolean | `@${string}`;
    eth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    sol?: boolean | `@${string}`;
    usdc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "address" */
  ["address_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["address"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "address" */
  ["address_obj_rel_insert_input"]: {
    data: ValueTypes["address_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["address_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "address" */
  ["address_on_conflict"]: {
    constraint: ValueTypes["address_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["address_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["address_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "address". */
  ["address_order_by"]: {
    bitcoin?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    client?:
      | ValueTypes["client_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    client_id?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    eth?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    sol?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    usdc?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: address */
  ["address_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "address" */
  ["address_select_column"]: address_select_column;
  /** input type for updating data in table "address" */
  ["address_set_input"]: {
    bitcoin?: string | undefined | null | Variable<any, string>;
    client_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    eth?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    sol?: string | undefined | null | Variable<any, string>;
    usdc?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "address" */
  ["address_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["address_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["address_stream_cursor_value_input"]: {
    bitcoin?: string | undefined | null | Variable<any, string>;
    client_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    eth?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    sol?: string | undefined | null | Variable<any, string>;
    usdc?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "address" */
  ["address_update_column"]: address_update_column;
  ["address_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["address_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["address_bool_exp"] | Variable<any, string>;
  };
  ["bigint"]: unknown;
  /** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
  ["bigint_comparison_exp"]: {
    _eq?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    _in?:
      | Array<ValueTypes["bigint"]>
      | undefined
      | null
      | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    _nin?:
      | Array<ValueTypes["bigint"]>
      | undefined
      | null
      | Variable<any, string>;
  };
  /** bticoin address for client wallets */
  ["bitcoin"]: AliasType<{
    /** An object relationship */
    account?: ValueTypes["account"];
    accountId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetBtc?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "bitcoin" */
  ["bitcoin_aggregate"]: AliasType<{
    aggregate?: ValueTypes["bitcoin_aggregate_fields"];
    nodes?: ValueTypes["bitcoin"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "bitcoin" */
  ["bitcoin_aggregate_fields"]: AliasType<{
    avg?: ValueTypes["bitcoin_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ValueTypes["bitcoin_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["bitcoin_max_fields"];
    min?: ValueTypes["bitcoin_min_fields"];
    stddev?: ValueTypes["bitcoin_stddev_fields"];
    stddev_pop?: ValueTypes["bitcoin_stddev_pop_fields"];
    stddev_samp?: ValueTypes["bitcoin_stddev_samp_fields"];
    sum?: ValueTypes["bitcoin_sum_fields"];
    var_pop?: ValueTypes["bitcoin_var_pop_fields"];
    var_samp?: ValueTypes["bitcoin_var_samp_fields"];
    variance?: ValueTypes["bitcoin_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["bitcoin_avg_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "bitcoin". All fields are combined with a logical 'AND'. */
  ["bitcoin_bool_exp"]: {
    _and?:
      | Array<ValueTypes["bitcoin_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["bitcoin_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["bitcoin_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    account?:
      | ValueTypes["account_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    accountId?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    mainnetBtc?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    publicKey?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    regtestBtc?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    textnetBtc?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "bitcoin" */
  ["bitcoin_constraint"]: bitcoin_constraint;
  /** input type for incrementing numeric columns in table "bitcoin" */
  ["bitcoin_inc_input"]: {
    mainnetBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    regtestBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    textnetBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting data into table "bitcoin" */
  ["bitcoin_insert_input"]: {
    account?:
      | ValueTypes["account_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    accountId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    mainnetBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?: string | undefined | null | Variable<any, string>;
    publicKey?: string | undefined | null | Variable<any, string>;
    regtestBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    textnetBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["bitcoin_max_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetBtc?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["bitcoin_min_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetBtc?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "bitcoin" */
  ["bitcoin_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["bitcoin"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "bitcoin" */
  ["bitcoin_obj_rel_insert_input"]: {
    data: ValueTypes["bitcoin_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["bitcoin_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "bitcoin" */
  ["bitcoin_on_conflict"]: {
    constraint: ValueTypes["bitcoin_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["bitcoin_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["bitcoin_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "bitcoin". */
  ["bitcoin_order_by"]: {
    account?:
      | ValueTypes["account_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    accountId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    mainnetBtc?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    publicKey?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    regtestBtc?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    textnetBtc?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: bitcoin */
  ["bitcoin_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "bitcoin" */
  ["bitcoin_select_column"]: bitcoin_select_column;
  /** input type for updating data in table "bitcoin" */
  ["bitcoin_set_input"]: {
    accountId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    mainnetBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?: string | undefined | null | Variable<any, string>;
    publicKey?: string | undefined | null | Variable<any, string>;
    regtestBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    textnetBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate stddev on columns */
  ["bitcoin_stddev_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["bitcoin_stddev_pop_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["bitcoin_stddev_samp_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "bitcoin" */
  ["bitcoin_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["bitcoin_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["bitcoin_stream_cursor_value_input"]: {
    accountId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    mainnetBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?: string | undefined | null | Variable<any, string>;
    publicKey?: string | undefined | null | Variable<any, string>;
    regtestBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    textnetBtc?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate sum on columns */
  ["bitcoin_sum_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "bitcoin" */
  ["bitcoin_update_column"]: bitcoin_update_column;
  ["bitcoin_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["bitcoin_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["bitcoin_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["bitcoin_bool_exp"] | Variable<any, string>;
  };
  /** aggregate var_pop on columns */
  ["bitcoin_var_pop_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["bitcoin_var_samp_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["bitcoin_variance_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** subscriber for paybox */
  ["client"]: AliasType<{
    accounts?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["account_select_column"]>
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
          | Array<ValueTypes["account_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["account_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["account"],
    ];
    accounts_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["account_select_column"]>
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
          | Array<ValueTypes["account_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["account_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["account_aggregate"],
    ];
    /** An object relationship */
    address?: ValueTypes["address"];
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    mobile?: boolean | `@${string}`;
    password?: boolean | `@${string}`;
    transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["transactions_select_column"]>
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
          | Array<ValueTypes["transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["transactions"],
    ];
    transactions_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["transactions_select_column"]>
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
          | Array<ValueTypes["transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["transactions_aggregate"],
    ];
    username?: boolean | `@${string}`;
    valid?: boolean | `@${string}`;
    wallets?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["wallet_select_column"]>
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
          | Array<ValueTypes["wallet_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["wallet_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["wallet"],
    ];
    wallets_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["wallet_select_column"]>
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
          | Array<ValueTypes["wallet_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["wallet_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["wallet_aggregate"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "client" */
  ["client_aggregate"]: AliasType<{
    aggregate?: ValueTypes["client_aggregate_fields"];
    nodes?: ValueTypes["client"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "client" */
  ["client_aggregate_fields"]: AliasType<{
    avg?: ValueTypes["client_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ValueTypes["client_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["client_max_fields"];
    min?: ValueTypes["client_min_fields"];
    stddev?: ValueTypes["client_stddev_fields"];
    stddev_pop?: ValueTypes["client_stddev_pop_fields"];
    stddev_samp?: ValueTypes["client_stddev_samp_fields"];
    sum?: ValueTypes["client_sum_fields"];
    var_pop?: ValueTypes["client_var_pop_fields"];
    var_samp?: ValueTypes["client_var_samp_fields"];
    variance?: ValueTypes["client_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["client_avg_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "client". All fields are combined with a logical 'AND'. */
  ["client_bool_exp"]: {
    _and?:
      | Array<ValueTypes["client_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["client_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["client_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    accounts?:
      | ValueTypes["account_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    accounts_aggregate?:
      | ValueTypes["account_aggregate_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    address?:
      | ValueTypes["address_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    email?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    firstname?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    lastname?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    mobile?:
      | ValueTypes["bigint_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    password?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    transactions?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    transactions_aggregate?:
      | ValueTypes["transactions_aggregate_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    username?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    valid?:
      | ValueTypes["Boolean_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    wallets?:
      | ValueTypes["wallet_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    wallets_aggregate?:
      | ValueTypes["wallet_aggregate_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "client" */
  ["client_constraint"]: client_constraint;
  /** input type for incrementing numeric columns in table "client" */
  ["client_inc_input"]: {
    mobile?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "client" */
  ["client_insert_input"]: {
    accounts?:
      | ValueTypes["account_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    address?:
      | ValueTypes["address_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    email?: string | undefined | null | Variable<any, string>;
    firstname?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    lastname?: string | undefined | null | Variable<any, string>;
    mobile?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    password?: string | undefined | null | Variable<any, string>;
    transactions?:
      | ValueTypes["transactions_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    valid?: boolean | undefined | null | Variable<any, string>;
    wallets?:
      | ValueTypes["wallet_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["client_max_fields"]: AliasType<{
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    mobile?: boolean | `@${string}`;
    password?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["client_min_fields"]: AliasType<{
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    mobile?: boolean | `@${string}`;
    password?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "client" */
  ["client_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["client"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "client" */
  ["client_obj_rel_insert_input"]: {
    data: ValueTypes["client_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["client_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "client" */
  ["client_on_conflict"]: {
    constraint: ValueTypes["client_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["client_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["client_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "client". */
  ["client_order_by"]: {
    accounts_aggregate?:
      | ValueTypes["account_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    address?:
      | ValueTypes["address_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    email?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    firstname?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    lastname?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    mobile?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    password?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    transactions_aggregate?:
      | ValueTypes["transactions_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    username?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    valid?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    wallets_aggregate?:
      | ValueTypes["wallet_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: client */
  ["client_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "client" */
  ["client_select_column"]: client_select_column;
  /** input type for updating data in table "client" */
  ["client_set_input"]: {
    email?: string | undefined | null | Variable<any, string>;
    firstname?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    lastname?: string | undefined | null | Variable<any, string>;
    mobile?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    password?: string | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    valid?: boolean | undefined | null | Variable<any, string>;
  };
  /** aggregate stddev on columns */
  ["client_stddev_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["client_stddev_pop_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["client_stddev_samp_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "client" */
  ["client_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["client_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["client_stream_cursor_value_input"]: {
    email?: string | undefined | null | Variable<any, string>;
    firstname?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    lastname?: string | undefined | null | Variable<any, string>;
    mobile?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    password?: string | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
    valid?: boolean | undefined | null | Variable<any, string>;
  };
  /** aggregate sum on columns */
  ["client_sum_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "client" */
  ["client_update_column"]: client_update_column;
  ["client_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["client_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["client_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["client_bool_exp"] | Variable<any, string>;
  };
  /** aggregate var_pop on columns */
  ["client_var_pop_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["client_var_samp_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["client_variance_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  ["date"]: unknown;
  /** Boolean expression to compare columns of type "date". All fields are combined with logical 'AND'. */
  ["date_comparison_exp"]: {
    _eq?: ValueTypes["date"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["date"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["date"] | undefined | null | Variable<any, string>;
    _in?: Array<ValueTypes["date"]> | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["date"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["date"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["date"] | undefined | null | Variable<any, string>;
    _nin?: Array<ValueTypes["date"]> | undefined | null | Variable<any, string>;
  };
  /** eth address and token for client wallets */
  ["eth"]: AliasType<{
    /** An object relationship */
    account?: ValueTypes["account"];
    accountId?: boolean | `@${string}`;
    goerliEth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "eth" */
  ["eth_aggregate"]: AliasType<{
    aggregate?: ValueTypes["eth_aggregate_fields"];
    nodes?: ValueTypes["eth"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "eth" */
  ["eth_aggregate_fields"]: AliasType<{
    avg?: ValueTypes["eth_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ValueTypes["eth_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["eth_max_fields"];
    min?: ValueTypes["eth_min_fields"];
    stddev?: ValueTypes["eth_stddev_fields"];
    stddev_pop?: ValueTypes["eth_stddev_pop_fields"];
    stddev_samp?: ValueTypes["eth_stddev_samp_fields"];
    sum?: ValueTypes["eth_sum_fields"];
    var_pop?: ValueTypes["eth_var_pop_fields"];
    var_samp?: ValueTypes["eth_var_samp_fields"];
    variance?: ValueTypes["eth_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["eth_avg_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "eth". All fields are combined with a logical 'AND'. */
  ["eth_bool_exp"]: {
    _and?:
      | Array<ValueTypes["eth_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["eth_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["eth_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    account?:
      | ValueTypes["account_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    accountId?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    goerliEth?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    kovanEth?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    mainnetEth?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    publicKey?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    rinkebyEth?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    ropstenEth?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    sepoliaEth?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "eth" */
  ["eth_constraint"]: eth_constraint;
  /** input type for incrementing numeric columns in table "eth" */
  ["eth_inc_input"]: {
    goerliEth?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    kovanEth?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    mainnetEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    rinkebyEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    ropstenEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    sepoliaEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting data into table "eth" */
  ["eth_insert_input"]: {
    account?:
      | ValueTypes["account_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    accountId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    goerliEth?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    kovanEth?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    mainnetEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?: string | undefined | null | Variable<any, string>;
    publicKey?: string | undefined | null | Variable<any, string>;
    rinkebyEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    ropstenEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    sepoliaEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["eth_max_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    goerliEth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["eth_min_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    goerliEth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "eth" */
  ["eth_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["eth"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "eth" */
  ["eth_obj_rel_insert_input"]: {
    data: ValueTypes["eth_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["eth_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "eth" */
  ["eth_on_conflict"]: {
    constraint: ValueTypes["eth_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["eth_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["eth_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "eth". */
  ["eth_order_by"]: {
    account?:
      | ValueTypes["account_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    accountId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    goerliEth?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    kovanEth?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    mainnetEth?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    publicKey?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    rinkebyEth?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    ropstenEth?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    sepoliaEth?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: eth */
  ["eth_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "eth" */
  ["eth_select_column"]: eth_select_column;
  /** input type for updating data in table "eth" */
  ["eth_set_input"]: {
    accountId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    goerliEth?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    kovanEth?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    mainnetEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?: string | undefined | null | Variable<any, string>;
    publicKey?: string | undefined | null | Variable<any, string>;
    rinkebyEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    ropstenEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    sepoliaEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate stddev on columns */
  ["eth_stddev_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["eth_stddev_pop_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["eth_stddev_samp_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "eth" */
  ["eth_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["eth_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["eth_stream_cursor_value_input"]: {
    accountId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    goerliEth?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    kovanEth?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    mainnetEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?: string | undefined | null | Variable<any, string>;
    publicKey?: string | undefined | null | Variable<any, string>;
    rinkebyEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    ropstenEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    sepoliaEth?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate sum on columns */
  ["eth_sum_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "eth" */
  ["eth_update_column"]: eth_update_column;
  ["eth_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["eth_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["eth_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["eth_bool_exp"] | Variable<any, string>;
  };
  /** aggregate var_pop on columns */
  ["eth_var_pop_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["eth_var_samp_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["eth_variance_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["float8"]: unknown;
  /** Boolean expression to compare columns of type "float8". All fields are combined with logical 'AND'. */
  ["float8_comparison_exp"]: {
    _eq?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    _in?:
      | Array<ValueTypes["float8"]>
      | undefined
      | null
      | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    _nin?:
      | Array<ValueTypes["float8"]>
      | undefined
      | null
      | Variable<any, string>;
  };
  ["jsonb"]: unknown;
  ["jsonb_cast_exp"]: {
    String?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
  ["jsonb_comparison_exp"]: {
    _cast?:
      | ValueTypes["jsonb_cast_exp"]
      | undefined
      | null
      | Variable<any, string>;
    /** is the column contained in the given json value */
    _contained_in?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    /** does the column contain the given json value at the top level */
    _contains?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _eq?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _gt?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _gte?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    /** does the string exist as a top-level key in the column */
    _has_key?: string | undefined | null | Variable<any, string>;
    /** do all of these strings exist as top-level keys in the column */
    _has_keys_all?: Array<string> | undefined | null | Variable<any, string>;
    /** do any of these strings exist as top-level keys in the column */
    _has_keys_any?: Array<string> | undefined | null | Variable<any, string>;
    _in?: Array<ValueTypes["jsonb"]> | undefined | null | Variable<any, string>;
    _is_null?: boolean | undefined | null | Variable<any, string>;
    _lt?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _lte?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _neq?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    _nin?:
      | Array<ValueTypes["jsonb"]>
      | undefined
      | null
      | Variable<any, string>;
  };
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_account?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["account_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["account_mutation_response"],
    ];
    delete_account_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["account"],
    ];
    delete_address?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["address_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["address_mutation_response"],
    ];
    delete_address_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["address"],
    ];
    delete_bitcoin?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["bitcoin_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["bitcoin_mutation_response"],
    ];
    delete_bitcoin_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["bitcoin"],
    ];
    delete_client?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["client_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["client_mutation_response"],
    ];
    delete_client_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["client"],
    ];
    delete_eth?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["eth_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["eth_mutation_response"],
    ];
    delete_eth_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["eth"],
    ];
    delete_sol?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["sol_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["sol_mutation_response"],
    ];
    delete_sol_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["sol"],
    ];
    delete_transactions?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["transactions_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["transactions_mutation_response"],
    ];
    delete_transactions_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["transactions"],
    ];
    delete_wallet?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["wallet_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["wallet_mutation_response"],
    ];
    delete_wallet_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["wallet"],
    ];
    insert_account?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["account_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["account_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["account_mutation_response"],
    ];
    insert_account_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["account_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["account_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["account"],
    ];
    insert_address?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["address_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["address_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["address_mutation_response"],
    ];
    insert_address_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["address_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["address_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["address"],
    ];
    insert_bitcoin?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["bitcoin_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["bitcoin_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["bitcoin_mutation_response"],
    ];
    insert_bitcoin_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["bitcoin_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["bitcoin_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["bitcoin"],
    ];
    insert_client?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["client_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["client_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["client_mutation_response"],
    ];
    insert_client_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["client_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["client_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["client"],
    ];
    insert_eth?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["eth_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["eth_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["eth_mutation_response"],
    ];
    insert_eth_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["eth_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["eth_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["eth"],
    ];
    insert_sol?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["sol_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["sol_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["sol_mutation_response"],
    ];
    insert_sol_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["sol_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["sol_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["sol"],
    ];
    insert_transactions?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["transactions_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["transactions_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["transactions_mutation_response"],
    ];
    insert_transactions_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["transactions_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["transactions_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["transactions"],
    ];
    insert_wallet?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["wallet_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["wallet_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["wallet_mutation_response"],
    ];
    insert_wallet_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["wallet_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["wallet_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["wallet"],
    ];
    update_account?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["account_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["account_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["account_mutation_response"],
    ];
    update_account_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["account_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["account_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["account"],
    ];
    update_account_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["account_updates"]> | Variable<any, string>;
      },
      ValueTypes["account_mutation_response"],
    ];
    update_address?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["address_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["address_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["address_mutation_response"],
    ];
    update_address_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["address_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["address_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["address"],
    ];
    update_address_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["address_updates"]> | Variable<any, string>;
      },
      ValueTypes["address_mutation_response"],
    ];
    update_bitcoin?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["bitcoin_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["bitcoin_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["bitcoin_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["bitcoin_mutation_response"],
    ];
    update_bitcoin_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["bitcoin_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["bitcoin_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["bitcoin_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["bitcoin"],
    ];
    update_bitcoin_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["bitcoin_updates"]> | Variable<any, string>;
      },
      ValueTypes["bitcoin_mutation_response"],
    ];
    update_client?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["client_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["client_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["client_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["client_mutation_response"],
    ];
    update_client_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["client_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["client_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["client_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["client"],
    ];
    update_client_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["client_updates"]> | Variable<any, string>;
      },
      ValueTypes["client_mutation_response"],
    ];
    update_eth?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["eth_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["eth_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["eth_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["eth_mutation_response"],
    ];
    update_eth_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["eth_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["eth_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns: ValueTypes["eth_pk_columns_input"] | Variable<any, string>;
      },
      ValueTypes["eth"],
    ];
    update_eth_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["eth_updates"]> | Variable<any, string>;
      },
      ValueTypes["eth_mutation_response"],
    ];
    update_sol?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["sol_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["sol_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["sol_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["sol_mutation_response"],
    ];
    update_sol_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ValueTypes["sol_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["sol_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns: ValueTypes["sol_pk_columns_input"] | Variable<any, string>;
      },
      ValueTypes["sol"],
    ];
    update_sol_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["sol_updates"]> | Variable<any, string>;
      },
      ValueTypes["sol_mutation_response"],
    ];
    update_transactions?: [
      {
        /** append existing jsonb value of filtered columns with new jsonb value */
        _append?:
          | ValueTypes["transactions_append_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */;
        _delete_at_path?:
          | ValueTypes["transactions_delete_at_path_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */;
        _delete_elem?:
          | ValueTypes["transactions_delete_elem_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete key/value pair or string element. key/value pairs are matched based on their key value */;
        _delete_key?:
          | ValueTypes["transactions_delete_key_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** increments the numeric columns with given value of the filtered values */;
        _inc?:
          | ValueTypes["transactions_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** prepend existing jsonb value of filtered columns with new jsonb value */;
        _prepend?:
          | ValueTypes["transactions_prepend_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["transactions_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["transactions_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["transactions_mutation_response"],
    ];
    update_transactions_by_pk?: [
      {
        /** append existing jsonb value of filtered columns with new jsonb value */
        _append?:
          | ValueTypes["transactions_append_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */;
        _delete_at_path?:
          | ValueTypes["transactions_delete_at_path_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */;
        _delete_elem?:
          | ValueTypes["transactions_delete_elem_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** delete key/value pair or string element. key/value pairs are matched based on their key value */;
        _delete_key?:
          | ValueTypes["transactions_delete_key_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** increments the numeric columns with given value of the filtered values */;
        _inc?:
          | ValueTypes["transactions_inc_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** prepend existing jsonb value of filtered columns with new jsonb value */;
        _prepend?:
          | ValueTypes["transactions_prepend_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ValueTypes["transactions_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["transactions_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["transactions"],
    ];
    update_transactions_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["transactions_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["transactions_mutation_response"],
    ];
    update_wallet?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["wallet_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["wallet_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["wallet_mutation_response"],
    ];
    update_wallet_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["wallet_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["wallet_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["wallet"],
    ];
    update_wallet_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["wallet_updates"]> | Variable<any, string>;
      },
      ValueTypes["wallet_mutation_response"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    account?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["account_select_column"]>
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
          | Array<ValueTypes["account_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["account_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["account"],
    ];
    account_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["account_select_column"]>
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
          | Array<ValueTypes["account_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["account_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["account_aggregate"],
    ];
    account_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["account"],
    ];
    address?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["address_select_column"]>
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
          | Array<ValueTypes["address_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["address_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["address"],
    ];
    address_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["address_select_column"]>
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
          | Array<ValueTypes["address_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["address_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["address_aggregate"],
    ];
    address_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["address"],
    ];
    bitcoin?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["bitcoin_select_column"]>
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
          | Array<ValueTypes["bitcoin_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["bitcoin_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["bitcoin"],
    ];
    bitcoin_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["bitcoin_select_column"]>
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
          | Array<ValueTypes["bitcoin_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["bitcoin_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["bitcoin_aggregate"],
    ];
    bitcoin_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["bitcoin"],
    ];
    client?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["client_select_column"]>
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
          | Array<ValueTypes["client_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["client_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["client"],
    ];
    client_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["client_select_column"]>
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
          | Array<ValueTypes["client_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["client_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["client_aggregate"],
    ];
    client_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["client"],
    ];
    eth?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["eth_select_column"]>
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
          | Array<ValueTypes["eth_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["eth_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["eth"],
    ];
    eth_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["eth_select_column"]>
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
          | Array<ValueTypes["eth_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["eth_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["eth_aggregate"],
    ];
    eth_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["eth"],
    ];
    sol?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["sol_select_column"]>
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
          | Array<ValueTypes["sol_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["sol_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["sol"],
    ];
    sol_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["sol_select_column"]>
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
          | Array<ValueTypes["sol_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["sol_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["sol_aggregate"],
    ];
    sol_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["sol"],
    ];
    transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["transactions_select_column"]>
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
          | Array<ValueTypes["transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["transactions"],
    ];
    transactions_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["transactions_select_column"]>
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
          | Array<ValueTypes["transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["transactions_aggregate"],
    ];
    transactions_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["transactions"],
    ];
    wallet?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["wallet_select_column"]>
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
          | Array<ValueTypes["wallet_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["wallet_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["wallet"],
    ];
    wallet_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["wallet_select_column"]>
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
          | Array<ValueTypes["wallet_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["wallet_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["wallet_aggregate"],
    ];
    wallet_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["wallet"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** solana address for client wallets */
  ["sol"]: AliasType<{
    /** An object relationship */
    account?: ValueTypes["account"];
    accountId?: boolean | `@${string}`;
    devnetSol?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "sol" */
  ["sol_aggregate"]: AliasType<{
    aggregate?: ValueTypes["sol_aggregate_fields"];
    nodes?: ValueTypes["sol"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "sol" */
  ["sol_aggregate_fields"]: AliasType<{
    avg?: ValueTypes["sol_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ValueTypes["sol_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["sol_max_fields"];
    min?: ValueTypes["sol_min_fields"];
    stddev?: ValueTypes["sol_stddev_fields"];
    stddev_pop?: ValueTypes["sol_stddev_pop_fields"];
    stddev_samp?: ValueTypes["sol_stddev_samp_fields"];
    sum?: ValueTypes["sol_sum_fields"];
    var_pop?: ValueTypes["sol_var_pop_fields"];
    var_samp?: ValueTypes["sol_var_samp_fields"];
    variance?: ValueTypes["sol_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["sol_avg_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "sol". All fields are combined with a logical 'AND'. */
  ["sol_bool_exp"]: {
    _and?:
      | Array<ValueTypes["sol_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["sol_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["sol_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    account?:
      | ValueTypes["account_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    accountId?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    devnetSol?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    mainnetSol?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    publicKey?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    testnetSol?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "sol" */
  ["sol_constraint"]: sol_constraint;
  /** input type for incrementing numeric columns in table "sol" */
  ["sol_inc_input"]: {
    devnetSol?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    mainnetSol?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    testnetSol?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting data into table "sol" */
  ["sol_insert_input"]: {
    account?:
      | ValueTypes["account_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    accountId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    devnetSol?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    mainnetSol?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?: string | undefined | null | Variable<any, string>;
    publicKey?: string | undefined | null | Variable<any, string>;
    testnetSol?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["sol_max_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    devnetSol?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["sol_min_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    devnetSol?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "sol" */
  ["sol_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["sol"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "sol" */
  ["sol_obj_rel_insert_input"]: {
    data: ValueTypes["sol_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["sol_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "sol" */
  ["sol_on_conflict"]: {
    constraint: ValueTypes["sol_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["sol_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["sol_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "sol". */
  ["sol_order_by"]: {
    account?:
      | ValueTypes["account_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    accountId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    devnetSol?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    mainnetSol?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    publicKey?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    testnetSol?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: sol */
  ["sol_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "sol" */
  ["sol_select_column"]: sol_select_column;
  /** input type for updating data in table "sol" */
  ["sol_set_input"]: {
    accountId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    devnetSol?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    mainnetSol?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?: string | undefined | null | Variable<any, string>;
    publicKey?: string | undefined | null | Variable<any, string>;
    testnetSol?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate stddev on columns */
  ["sol_stddev_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["sol_stddev_pop_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["sol_stddev_samp_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "sol" */
  ["sol_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["sol_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["sol_stream_cursor_value_input"]: {
    accountId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    devnetSol?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    mainnetSol?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
    privateKey?: string | undefined | null | Variable<any, string>;
    publicKey?: string | undefined | null | Variable<any, string>;
    testnetSol?:
      | ValueTypes["float8"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate sum on columns */
  ["sol_sum_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "sol" */
  ["sol_update_column"]: sol_update_column;
  ["sol_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["sol_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["sol_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["sol_bool_exp"] | Variable<any, string>;
  };
  /** aggregate var_pop on columns */
  ["sol_var_pop_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["sol_var_samp_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["sol_variance_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    account?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["account_select_column"]>
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
          | Array<ValueTypes["account_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["account_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["account"],
    ];
    account_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["account_select_column"]>
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
          | Array<ValueTypes["account_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["account_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["account_aggregate"],
    ];
    account_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["account"],
    ];
    account_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["account_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["account_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["account"],
    ];
    address?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["address_select_column"]>
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
          | Array<ValueTypes["address_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["address_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["address"],
    ];
    address_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["address_select_column"]>
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
          | Array<ValueTypes["address_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["address_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["address_aggregate"],
    ];
    address_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["address"],
    ];
    address_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["address_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["address_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["address"],
    ];
    bitcoin?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["bitcoin_select_column"]>
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
          | Array<ValueTypes["bitcoin_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["bitcoin_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["bitcoin"],
    ];
    bitcoin_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["bitcoin_select_column"]>
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
          | Array<ValueTypes["bitcoin_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["bitcoin_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["bitcoin_aggregate"],
    ];
    bitcoin_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["bitcoin"],
    ];
    bitcoin_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["bitcoin_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["bitcoin_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["bitcoin"],
    ];
    client?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["client_select_column"]>
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
          | Array<ValueTypes["client_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["client_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["client"],
    ];
    client_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["client_select_column"]>
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
          | Array<ValueTypes["client_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["client_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["client_aggregate"],
    ];
    client_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["client"],
    ];
    client_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["client_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["client_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["client"],
    ];
    eth?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["eth_select_column"]>
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
          | Array<ValueTypes["eth_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["eth_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["eth"],
    ];
    eth_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["eth_select_column"]>
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
          | Array<ValueTypes["eth_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["eth_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["eth_aggregate"],
    ];
    eth_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["eth"],
    ];
    eth_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["eth_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["eth_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["eth"],
    ];
    sol?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["sol_select_column"]>
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
          | Array<ValueTypes["sol_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["sol_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["sol"],
    ];
    sol_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["sol_select_column"]>
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
          | Array<ValueTypes["sol_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["sol_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["sol_aggregate"],
    ];
    sol_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["sol"],
    ];
    sol_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["sol_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["sol_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["sol"],
    ];
    transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["transactions_select_column"]>
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
          | Array<ValueTypes["transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["transactions"],
    ];
    transactions_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["transactions_select_column"]>
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
          | Array<ValueTypes["transactions_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["transactions_aggregate"],
    ];
    transactions_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["transactions"],
    ];
    transactions_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<
              ValueTypes["transactions_stream_cursor_input"] | undefined | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["transactions_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["transactions"],
    ];
    wallet?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["wallet_select_column"]>
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
          | Array<ValueTypes["wallet_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["wallet_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["wallet"],
    ];
    wallet_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["wallet_select_column"]>
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
          | Array<ValueTypes["wallet_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["wallet_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["wallet_aggregate"],
    ];
    wallet_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["wallet"],
    ];
    wallet_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["wallet_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["wallet_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["wallet"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** transactions table  */
  ["transactions"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    /** An object relationship */
    client?: ValueTypes["client"];
    clientId?: boolean | `@${string}`;
    cluster?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    hash?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    network?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    postBalances?: [
      {
        /** JSON select path */
        path?: string | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    preBalances?: [
      {
        /** JSON select path */
        path?: string | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    recentBlockhash?: boolean | `@${string}`;
    signature?: [
      {
        /** JSON select path */
        path?: string | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    slot?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "transactions" */
  ["transactions_aggregate"]: AliasType<{
    aggregate?: ValueTypes["transactions_aggregate_fields"];
    nodes?: ValueTypes["transactions"];
    __typename?: boolean | `@${string}`;
  }>;
  ["transactions_aggregate_bool_exp"]: {
    avg?:
      | ValueTypes["transactions_aggregate_bool_exp_avg"]
      | undefined
      | null
      | Variable<any, string>;
    corr?:
      | ValueTypes["transactions_aggregate_bool_exp_corr"]
      | undefined
      | null
      | Variable<any, string>;
    count?:
      | ValueTypes["transactions_aggregate_bool_exp_count"]
      | undefined
      | null
      | Variable<any, string>;
    covar_samp?:
      | ValueTypes["transactions_aggregate_bool_exp_covar_samp"]
      | undefined
      | null
      | Variable<any, string>;
    max?:
      | ValueTypes["transactions_aggregate_bool_exp_max"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["transactions_aggregate_bool_exp_min"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_samp?:
      | ValueTypes["transactions_aggregate_bool_exp_stddev_samp"]
      | undefined
      | null
      | Variable<any, string>;
    sum?:
      | ValueTypes["transactions_aggregate_bool_exp_sum"]
      | undefined
      | null
      | Variable<any, string>;
    var_samp?:
      | ValueTypes["transactions_aggregate_bool_exp_var_samp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  ["transactions_aggregate_bool_exp_avg"]: {
    arguments:
      | ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns"]
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["float8_comparison_exp"] | Variable<any, string>;
  };
  ["transactions_aggregate_bool_exp_corr"]: {
    arguments:
      | ValueTypes["transactions_aggregate_bool_exp_corr_arguments"]
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["float8_comparison_exp"] | Variable<any, string>;
  };
  ["transactions_aggregate_bool_exp_corr_arguments"]: {
    X:
      | ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"]
      | Variable<any, string>;
    Y:
      | ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"]
      | Variable<any, string>;
  };
  ["transactions_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ValueTypes["transactions_select_column"]>
      | undefined
      | null
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["Int_comparison_exp"] | Variable<any, string>;
  };
  ["transactions_aggregate_bool_exp_covar_samp"]: {
    arguments:
      | ValueTypes["transactions_aggregate_bool_exp_covar_samp_arguments"]
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["float8_comparison_exp"] | Variable<any, string>;
  };
  ["transactions_aggregate_bool_exp_covar_samp_arguments"]: {
    X:
      | ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"]
      | Variable<any, string>;
    Y:
      | ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"]
      | Variable<any, string>;
  };
  ["transactions_aggregate_bool_exp_max"]: {
    arguments:
      | ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns"]
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["float8_comparison_exp"] | Variable<any, string>;
  };
  ["transactions_aggregate_bool_exp_min"]: {
    arguments:
      | ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns"]
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["float8_comparison_exp"] | Variable<any, string>;
  };
  ["transactions_aggregate_bool_exp_stddev_samp"]: {
    arguments:
      | ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns"]
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["float8_comparison_exp"] | Variable<any, string>;
  };
  ["transactions_aggregate_bool_exp_sum"]: {
    arguments:
      | ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns"]
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["float8_comparison_exp"] | Variable<any, string>;
  };
  ["transactions_aggregate_bool_exp_var_samp"]: {
    arguments:
      | ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns"]
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["float8_comparison_exp"] | Variable<any, string>;
  };
  /** aggregate fields of "transactions" */
  ["transactions_aggregate_fields"]: AliasType<{
    avg?: ValueTypes["transactions_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ValueTypes["transactions_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["transactions_max_fields"];
    min?: ValueTypes["transactions_min_fields"];
    stddev?: ValueTypes["transactions_stddev_fields"];
    stddev_pop?: ValueTypes["transactions_stddev_pop_fields"];
    stddev_samp?: ValueTypes["transactions_stddev_samp_fields"];
    sum?: ValueTypes["transactions_sum_fields"];
    var_pop?: ValueTypes["transactions_var_pop_fields"];
    var_samp?: ValueTypes["transactions_var_samp_fields"];
    variance?: ValueTypes["transactions_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "transactions" */
  ["transactions_aggregate_order_by"]: {
    avg?:
      | ValueTypes["transactions_avg_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["transactions_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["transactions_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev?:
      | ValueTypes["transactions_stddev_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_pop?:
      | ValueTypes["transactions_stddev_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    stddev_samp?:
      | ValueTypes["transactions_stddev_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    sum?:
      | ValueTypes["transactions_sum_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_pop?:
      | ValueTypes["transactions_var_pop_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    var_samp?:
      | ValueTypes["transactions_var_samp_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    variance?:
      | ValueTypes["transactions_variance_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** append existing jsonb value of filtered columns with new jsonb value */
  ["transactions_append_input"]: {
    postBalances?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    preBalances?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    signature?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "transactions" */
  ["transactions_arr_rel_insert_input"]: {
    data:
      | Array<ValueTypes["transactions_insert_input"]>
      | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["transactions_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate avg on columns */
  ["transactions_avg_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by avg() on columns of table "transactions" */
  ["transactions_avg_order_by"]: {
    amount?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    blockTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    nonce?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    slot?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "transactions". All fields are combined with a logical 'AND'. */
  ["transactions_bool_exp"]: {
    _and?:
      | Array<ValueTypes["transactions_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["transactions_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    amount?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    blockTime?:
      | ValueTypes["bigint_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?:
      | ValueTypes["bigint_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    client?:
      | ValueTypes["client_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    clientId?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    cluster?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    date?:
      | ValueTypes["date_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    fee?:
      | ValueTypes["float8_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    from?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    hash?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    network?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    nonce?:
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    postBalances?:
      | ValueTypes["jsonb_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    preBalances?:
      | ValueTypes["jsonb_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    recentBlockhash?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    signature?:
      | ValueTypes["jsonb_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    slot?:
      | ValueTypes["bigint_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    status?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    to?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "transactions" */
  ["transactions_constraint"]: transactions_constraint;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  ["transactions_delete_at_path_input"]: {
    postBalances?: Array<string> | undefined | null | Variable<any, string>;
    preBalances?: Array<string> | undefined | null | Variable<any, string>;
    signature?: Array<string> | undefined | null | Variable<any, string>;
  };
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  ["transactions_delete_elem_input"]: {
    postBalances?: number | undefined | null | Variable<any, string>;
    preBalances?: number | undefined | null | Variable<any, string>;
    signature?: number | undefined | null | Variable<any, string>;
  };
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  ["transactions_delete_key_input"]: {
    postBalances?: string | undefined | null | Variable<any, string>;
    preBalances?: string | undefined | null | Variable<any, string>;
    signature?: string | undefined | null | Variable<any, string>;
  };
  /** input type for incrementing numeric columns in table "transactions" */
  ["transactions_inc_input"]: {
    amount?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    blockTime?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    chainId?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    nonce?: number | undefined | null | Variable<any, string>;
    slot?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "transactions" */
  ["transactions_insert_input"]: {
    amount?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    blockTime?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    chainId?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    client?:
      | ValueTypes["client_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    clientId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    cluster?: string | undefined | null | Variable<any, string>;
    date?: ValueTypes["date"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    from?: string | undefined | null | Variable<any, string>;
    hash?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    network?: string | undefined | null | Variable<any, string>;
    nonce?: number | undefined | null | Variable<any, string>;
    postBalances?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    preBalances?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    recentBlockhash?: string | undefined | null | Variable<any, string>;
    signature?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    slot?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    status?: string | undefined | null | Variable<any, string>;
    to?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["transactions_max_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    clientId?: boolean | `@${string}`;
    cluster?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    hash?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    network?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    recentBlockhash?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "transactions" */
  ["transactions_max_order_by"]: {
    amount?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    blockTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    clientId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    cluster?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    date?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    from?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    hash?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    network?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    nonce?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    recentBlockhash?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    slot?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    status?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    to?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** aggregate min on columns */
  ["transactions_min_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    clientId?: boolean | `@${string}`;
    cluster?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    hash?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    network?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    recentBlockhash?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "transactions" */
  ["transactions_min_order_by"]: {
    amount?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    blockTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    clientId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    cluster?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    date?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    from?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    hash?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    network?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    nonce?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    recentBlockhash?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    slot?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    status?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    to?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** response of any mutation on the table "transactions" */
  ["transactions_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["transactions"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "transactions" */
  ["transactions_on_conflict"]: {
    constraint: ValueTypes["transactions_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["transactions_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["transactions_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "transactions". */
  ["transactions_order_by"]: {
    amount?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    blockTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    client?:
      | ValueTypes["client_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    clientId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    cluster?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    date?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    from?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    hash?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    network?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    nonce?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    postBalances?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    preBalances?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    recentBlockhash?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    signature?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    slot?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    status?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    to?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** primary key columns input for table: transactions */
  ["transactions_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  ["transactions_prepend_input"]: {
    postBalances?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    preBalances?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    signature?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
  };
  /** select columns of table "transactions" */
  ["transactions_select_column"]: transactions_select_column;
  /** select "transactions_aggregate_bool_exp_avg_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns;
  /** select "transactions_aggregate_bool_exp_corr_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns;
  /** select "transactions_aggregate_bool_exp_covar_samp_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns;
  /** select "transactions_aggregate_bool_exp_max_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns;
  /** select "transactions_aggregate_bool_exp_min_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns;
  /** select "transactions_aggregate_bool_exp_stddev_samp_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns;
  /** select "transactions_aggregate_bool_exp_sum_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns;
  /** select "transactions_aggregate_bool_exp_var_samp_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns;
  /** input type for updating data in table "transactions" */
  ["transactions_set_input"]: {
    amount?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    blockTime?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    chainId?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    clientId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    cluster?: string | undefined | null | Variable<any, string>;
    date?: ValueTypes["date"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    from?: string | undefined | null | Variable<any, string>;
    hash?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    network?: string | undefined | null | Variable<any, string>;
    nonce?: number | undefined | null | Variable<any, string>;
    postBalances?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    preBalances?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    recentBlockhash?: string | undefined | null | Variable<any, string>;
    signature?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    slot?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    status?: string | undefined | null | Variable<any, string>;
    to?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate stddev on columns */
  ["transactions_stddev_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev() on columns of table "transactions" */
  ["transactions_stddev_order_by"]: {
    amount?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    blockTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    nonce?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    slot?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** aggregate stddev_pop on columns */
  ["transactions_stddev_pop_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev_pop() on columns of table "transactions" */
  ["transactions_stddev_pop_order_by"]: {
    amount?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    blockTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    nonce?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    slot?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** aggregate stddev_samp on columns */
  ["transactions_stddev_samp_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev_samp() on columns of table "transactions" */
  ["transactions_stddev_samp_order_by"]: {
    amount?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    blockTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    nonce?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    slot?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "transactions" */
  ["transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["transactions_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["transactions_stream_cursor_value_input"]: {
    amount?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    blockTime?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    chainId?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    clientId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    cluster?: string | undefined | null | Variable<any, string>;
    date?: ValueTypes["date"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["float8"] | undefined | null | Variable<any, string>;
    from?: string | undefined | null | Variable<any, string>;
    hash?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    network?: string | undefined | null | Variable<any, string>;
    nonce?: number | undefined | null | Variable<any, string>;
    postBalances?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    preBalances?:
      | ValueTypes["jsonb"]
      | undefined
      | null
      | Variable<any, string>;
    recentBlockhash?: string | undefined | null | Variable<any, string>;
    signature?: ValueTypes["jsonb"] | undefined | null | Variable<any, string>;
    slot?: ValueTypes["bigint"] | undefined | null | Variable<any, string>;
    status?: string | undefined | null | Variable<any, string>;
    to?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate sum on columns */
  ["transactions_sum_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by sum() on columns of table "transactions" */
  ["transactions_sum_order_by"]: {
    amount?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    blockTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    nonce?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    slot?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** update columns of table "transactions" */
  ["transactions_update_column"]: transactions_update_column;
  ["transactions_updates"]: {
    /** append existing jsonb value of filtered columns with new jsonb value */
    _append?:
      | ValueTypes["transactions_append_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
    _delete_at_path?:
      | ValueTypes["transactions_delete_at_path_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
    _delete_elem?:
      | ValueTypes["transactions_delete_elem_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** delete key/value pair or string element. key/value pairs are matched based on their key value */
    _delete_key?:
      | ValueTypes["transactions_delete_key_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** increments the numeric columns with given value of the filtered values */
    _inc?:
      | ValueTypes["transactions_inc_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** prepend existing jsonb value of filtered columns with new jsonb value */
    _prepend?:
      | ValueTypes["transactions_prepend_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["transactions_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["transactions_bool_exp"] | Variable<any, string>;
  };
  /** aggregate var_pop on columns */
  ["transactions_var_pop_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by var_pop() on columns of table "transactions" */
  ["transactions_var_pop_order_by"]: {
    amount?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    blockTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    nonce?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    slot?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** aggregate var_samp on columns */
  ["transactions_var_samp_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by var_samp() on columns of table "transactions" */
  ["transactions_var_samp_order_by"]: {
    amount?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    blockTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    nonce?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    slot?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
  };
  /** aggregate variance on columns */
  ["transactions_variance_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by variance() on columns of table "transactions" */
  ["transactions_variance_order_by"]: {
    amount?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    blockTime?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    chainId?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fee?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    nonce?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    slot?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
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
  /** wallets info for clients */
  ["wallet"]: AliasType<{
    accounts?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["account_select_column"]>
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
          | Array<ValueTypes["account_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["account_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["account"],
    ];
    accounts_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["account_select_column"]>
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
          | Array<ValueTypes["account_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["account_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["account_aggregate"],
    ];
    /** An object relationship */
    client?: ValueTypes["client"];
    clientId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    secretPhase?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "wallet" */
  ["wallet_aggregate"]: AliasType<{
    aggregate?: ValueTypes["wallet_aggregate_fields"];
    nodes?: ValueTypes["wallet"];
    __typename?: boolean | `@${string}`;
  }>;
  ["wallet_aggregate_bool_exp"]: {
    count?:
      | ValueTypes["wallet_aggregate_bool_exp_count"]
      | undefined
      | null
      | Variable<any, string>;
  };
  ["wallet_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ValueTypes["wallet_select_column"]>
      | undefined
      | null
      | Variable<any, string>;
    distinct?: boolean | undefined | null | Variable<any, string>;
    filter?:
      | ValueTypes["wallet_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    predicate: ValueTypes["Int_comparison_exp"] | Variable<any, string>;
  };
  /** aggregate fields of "wallet" */
  ["wallet_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["wallet_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["wallet_max_fields"];
    min?: ValueTypes["wallet_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "wallet" */
  ["wallet_aggregate_order_by"]: {
    count?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    max?:
      | ValueTypes["wallet_max_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    min?:
      | ValueTypes["wallet_min_order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** input type for inserting array relation for remote table "wallet" */
  ["wallet_arr_rel_insert_input"]: {
    data: Array<ValueTypes["wallet_insert_input"]> | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["wallet_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Boolean expression to filter rows from the table "wallet". All fields are combined with a logical 'AND'. */
  ["wallet_bool_exp"]: {
    _and?:
      | Array<ValueTypes["wallet_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["wallet_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["wallet_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    accounts?:
      | ValueTypes["account_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    accounts_aggregate?:
      | ValueTypes["account_aggregate_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    client?:
      | ValueTypes["client_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    clientId?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    secretPhase?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "wallet" */
  ["wallet_constraint"]: wallet_constraint;
  /** input type for inserting data into table "wallet" */
  ["wallet_insert_input"]: {
    accounts?:
      | ValueTypes["account_arr_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    client?:
      | ValueTypes["client_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    clientId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    secretPhase?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["wallet_max_fields"]: AliasType<{
    clientId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    secretPhase?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "wallet" */
  ["wallet_max_order_by"]: {
    clientId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    secretPhase?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate min on columns */
  ["wallet_min_fields"]: AliasType<{
    clientId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    secretPhase?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "wallet" */
  ["wallet_min_order_by"]: {
    clientId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    secretPhase?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** response of any mutation on the table "wallet" */
  ["wallet_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["wallet"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "wallet" */
  ["wallet_obj_rel_insert_input"]: {
    data: ValueTypes["wallet_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["wallet_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "wallet" */
  ["wallet_on_conflict"]: {
    constraint: ValueTypes["wallet_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["wallet_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["wallet_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "wallet". */
  ["wallet_order_by"]: {
    accounts_aggregate?:
      | ValueTypes["account_aggregate_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    client?:
      | ValueTypes["client_order_by"]
      | undefined
      | null
      | Variable<any, string>;
    clientId?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    secretPhase?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: wallet */
  ["wallet_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "wallet" */
  ["wallet_select_column"]: wallet_select_column;
  /** input type for updating data in table "wallet" */
  ["wallet_set_input"]: {
    clientId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    secretPhase?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "wallet" */
  ["wallet_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["wallet_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["wallet_stream_cursor_value_input"]: {
    clientId?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    secretPhase?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "wallet" */
  ["wallet_update_column"]: wallet_update_column;
  ["wallet_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["wallet_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["wallet_bool_exp"] | Variable<any, string>;
  };
};

export type ResolverInputTypes = {
  ["schema"]: AliasType<{
    query?: ResolverInputTypes["query_root"];
    mutation?: ResolverInputTypes["mutation_root"];
    subscription?: ResolverInputTypes["subscription_root"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
  ["Boolean_comparison_exp"]: {
    _eq?: boolean | undefined | null;
    _gt?: boolean | undefined | null;
    _gte?: boolean | undefined | null;
    _in?: Array<boolean> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: boolean | undefined | null;
    _lte?: boolean | undefined | null;
    _neq?: boolean | undefined | null;
    _nin?: Array<boolean> | undefined | null;
  };
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined | null;
    _gt?: number | undefined | null;
    _gte?: number | undefined | null;
    _in?: Array<number> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: number | undefined | null;
    _lte?: number | undefined | null;
    _neq?: number | undefined | null;
    _nin?: Array<number> | undefined | null;
  };
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
  /** accounts in a wallet */
  ["account"]: AliasType<{
    /** An object relationship */
    bitcoin?: ResolverInputTypes["bitcoin"];
    /** An object relationship */
    client?: ResolverInputTypes["client"];
    clientId?: boolean | `@${string}`;
    /** An object relationship */
    eth?: ResolverInputTypes["eth"];
    id?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    /** An object relationship */
    sol?: ResolverInputTypes["sol"];
    /** An object relationship */
    wallet?: ResolverInputTypes["wallet"];
    walletId?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "account" */
  ["account_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["account_aggregate_fields"];
    nodes?: ResolverInputTypes["account"];
    __typename?: boolean | `@${string}`;
  }>;
  ["account_aggregate_bool_exp"]: {
    count?:
      | ResolverInputTypes["account_aggregate_bool_exp_count"]
      | undefined
      | null;
  };
  ["account_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ResolverInputTypes["account_select_column"]>
      | undefined
      | null;
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["account_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "account" */
  ["account_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["account_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["account_max_fields"];
    min?: ResolverInputTypes["account_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "account" */
  ["account_aggregate_order_by"]: {
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?: ResolverInputTypes["account_max_order_by"] | undefined | null;
    min?: ResolverInputTypes["account_min_order_by"] | undefined | null;
  };
  /** input type for inserting array relation for remote table "account" */
  ["account_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["account_insert_input"]>;
    /** upsert condition */
    on_conflict?: ResolverInputTypes["account_on_conflict"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "account". All fields are combined with a logical 'AND'. */
  ["account_bool_exp"]: {
    _and?: Array<ResolverInputTypes["account_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["account_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["account_bool_exp"]> | undefined | null;
    bitcoin?: ResolverInputTypes["bitcoin_bool_exp"] | undefined | null;
    client?: ResolverInputTypes["client_bool_exp"] | undefined | null;
    clientId?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    eth?: ResolverInputTypes["eth_bool_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    name?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    sol?: ResolverInputTypes["sol_bool_exp"] | undefined | null;
    wallet?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
    walletId?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "account" */
  ["account_constraint"]: account_constraint;
  /** input type for inserting data into table "account" */
  ["account_insert_input"]: {
    bitcoin?:
      | ResolverInputTypes["bitcoin_obj_rel_insert_input"]
      | undefined
      | null;
    client?:
      | ResolverInputTypes["client_obj_rel_insert_input"]
      | undefined
      | null;
    clientId?: ResolverInputTypes["uuid"] | undefined | null;
    eth?: ResolverInputTypes["eth_obj_rel_insert_input"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    name?: string | undefined | null;
    sol?: ResolverInputTypes["sol_obj_rel_insert_input"] | undefined | null;
    wallet?:
      | ResolverInputTypes["wallet_obj_rel_insert_input"]
      | undefined
      | null;
    walletId?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** aggregate max on columns */
  ["account_max_fields"]: AliasType<{
    clientId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    walletId?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "account" */
  ["account_max_order_by"]: {
    clientId?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    name?: ResolverInputTypes["order_by"] | undefined | null;
    walletId?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate min on columns */
  ["account_min_fields"]: AliasType<{
    clientId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    name?: boolean | `@${string}`;
    walletId?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "account" */
  ["account_min_order_by"]: {
    clientId?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    name?: ResolverInputTypes["order_by"] | undefined | null;
    walletId?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "account" */
  ["account_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["account"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "account" */
  ["account_obj_rel_insert_input"]: {
    data: ResolverInputTypes["account_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["account_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "account" */
  ["account_on_conflict"]: {
    constraint: ResolverInputTypes["account_constraint"];
    update_columns: Array<ResolverInputTypes["account_update_column"]>;
    where?: ResolverInputTypes["account_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "account". */
  ["account_order_by"]: {
    bitcoin?: ResolverInputTypes["bitcoin_order_by"] | undefined | null;
    client?: ResolverInputTypes["client_order_by"] | undefined | null;
    clientId?: ResolverInputTypes["order_by"] | undefined | null;
    eth?: ResolverInputTypes["eth_order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    name?: ResolverInputTypes["order_by"] | undefined | null;
    sol?: ResolverInputTypes["sol_order_by"] | undefined | null;
    wallet?: ResolverInputTypes["wallet_order_by"] | undefined | null;
    walletId?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: account */
  ["account_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "account" */
  ["account_select_column"]: account_select_column;
  /** input type for updating data in table "account" */
  ["account_set_input"]: {
    clientId?: ResolverInputTypes["uuid"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    name?: string | undefined | null;
    walletId?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** Streaming cursor of the table "account" */
  ["account_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["account_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["account_stream_cursor_value_input"]: {
    clientId?: ResolverInputTypes["uuid"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    name?: string | undefined | null;
    walletId?: ResolverInputTypes["uuid"] | undefined | null;
  };
  /** update columns of table "account" */
  ["account_update_column"]: account_update_column;
  ["account_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["account_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["account_bool_exp"];
  };
  /** different chain and there address */
  ["address"]: AliasType<{
    bitcoin?: boolean | `@${string}`;
    /** An object relationship */
    client?: ResolverInputTypes["client"];
    client_id?: boolean | `@${string}`;
    eth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    sol?: boolean | `@${string}`;
    usdc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "address" */
  ["address_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["address_aggregate_fields"];
    nodes?: ResolverInputTypes["address"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "address" */
  ["address_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["address_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["address_max_fields"];
    min?: ResolverInputTypes["address_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "address". All fields are combined with a logical 'AND'. */
  ["address_bool_exp"]: {
    _and?: Array<ResolverInputTypes["address_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["address_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["address_bool_exp"]> | undefined | null;
    bitcoin?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    client?: ResolverInputTypes["client_bool_exp"] | undefined | null;
    client_id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    eth?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    sol?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    usdc?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "address" */
  ["address_constraint"]: address_constraint;
  /** input type for inserting data into table "address" */
  ["address_insert_input"]: {
    bitcoin?: string | undefined | null;
    client?:
      | ResolverInputTypes["client_obj_rel_insert_input"]
      | undefined
      | null;
    client_id?: ResolverInputTypes["uuid"] | undefined | null;
    eth?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    sol?: string | undefined | null;
    usdc?: string | undefined | null;
  };
  /** aggregate max on columns */
  ["address_max_fields"]: AliasType<{
    bitcoin?: boolean | `@${string}`;
    client_id?: boolean | `@${string}`;
    eth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    sol?: boolean | `@${string}`;
    usdc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["address_min_fields"]: AliasType<{
    bitcoin?: boolean | `@${string}`;
    client_id?: boolean | `@${string}`;
    eth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    sol?: boolean | `@${string}`;
    usdc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "address" */
  ["address_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["address"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "address" */
  ["address_obj_rel_insert_input"]: {
    data: ResolverInputTypes["address_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["address_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "address" */
  ["address_on_conflict"]: {
    constraint: ResolverInputTypes["address_constraint"];
    update_columns: Array<ResolverInputTypes["address_update_column"]>;
    where?: ResolverInputTypes["address_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "address". */
  ["address_order_by"]: {
    bitcoin?: ResolverInputTypes["order_by"] | undefined | null;
    client?: ResolverInputTypes["client_order_by"] | undefined | null;
    client_id?: ResolverInputTypes["order_by"] | undefined | null;
    eth?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    sol?: ResolverInputTypes["order_by"] | undefined | null;
    usdc?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: address */
  ["address_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "address" */
  ["address_select_column"]: address_select_column;
  /** input type for updating data in table "address" */
  ["address_set_input"]: {
    bitcoin?: string | undefined | null;
    client_id?: ResolverInputTypes["uuid"] | undefined | null;
    eth?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    sol?: string | undefined | null;
    usdc?: string | undefined | null;
  };
  /** Streaming cursor of the table "address" */
  ["address_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["address_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["address_stream_cursor_value_input"]: {
    bitcoin?: string | undefined | null;
    client_id?: ResolverInputTypes["uuid"] | undefined | null;
    eth?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    sol?: string | undefined | null;
    usdc?: string | undefined | null;
  };
  /** update columns of table "address" */
  ["address_update_column"]: address_update_column;
  ["address_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["address_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["address_bool_exp"];
  };
  ["bigint"]: unknown;
  /** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
  ["bigint_comparison_exp"]: {
    _eq?: ResolverInputTypes["bigint"] | undefined | null;
    _gt?: ResolverInputTypes["bigint"] | undefined | null;
    _gte?: ResolverInputTypes["bigint"] | undefined | null;
    _in?: Array<ResolverInputTypes["bigint"]> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: ResolverInputTypes["bigint"] | undefined | null;
    _lte?: ResolverInputTypes["bigint"] | undefined | null;
    _neq?: ResolverInputTypes["bigint"] | undefined | null;
    _nin?: Array<ResolverInputTypes["bigint"]> | undefined | null;
  };
  /** bticoin address for client wallets */
  ["bitcoin"]: AliasType<{
    /** An object relationship */
    account?: ResolverInputTypes["account"];
    accountId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetBtc?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "bitcoin" */
  ["bitcoin_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["bitcoin_aggregate_fields"];
    nodes?: ResolverInputTypes["bitcoin"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "bitcoin" */
  ["bitcoin_aggregate_fields"]: AliasType<{
    avg?: ResolverInputTypes["bitcoin_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["bitcoin_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["bitcoin_max_fields"];
    min?: ResolverInputTypes["bitcoin_min_fields"];
    stddev?: ResolverInputTypes["bitcoin_stddev_fields"];
    stddev_pop?: ResolverInputTypes["bitcoin_stddev_pop_fields"];
    stddev_samp?: ResolverInputTypes["bitcoin_stddev_samp_fields"];
    sum?: ResolverInputTypes["bitcoin_sum_fields"];
    var_pop?: ResolverInputTypes["bitcoin_var_pop_fields"];
    var_samp?: ResolverInputTypes["bitcoin_var_samp_fields"];
    variance?: ResolverInputTypes["bitcoin_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["bitcoin_avg_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "bitcoin". All fields are combined with a logical 'AND'. */
  ["bitcoin_bool_exp"]: {
    _and?: Array<ResolverInputTypes["bitcoin_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["bitcoin_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["bitcoin_bool_exp"]> | undefined | null;
    account?: ResolverInputTypes["account_bool_exp"] | undefined | null;
    accountId?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    mainnetBtc?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
    privateKey?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    publicKey?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    regtestBtc?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
    textnetBtc?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "bitcoin" */
  ["bitcoin_constraint"]: bitcoin_constraint;
  /** input type for incrementing numeric columns in table "bitcoin" */
  ["bitcoin_inc_input"]: {
    mainnetBtc?: ResolverInputTypes["float8"] | undefined | null;
    regtestBtc?: ResolverInputTypes["float8"] | undefined | null;
    textnetBtc?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** input type for inserting data into table "bitcoin" */
  ["bitcoin_insert_input"]: {
    account?:
      | ResolverInputTypes["account_obj_rel_insert_input"]
      | undefined
      | null;
    accountId?: ResolverInputTypes["uuid"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    mainnetBtc?: ResolverInputTypes["float8"] | undefined | null;
    privateKey?: string | undefined | null;
    publicKey?: string | undefined | null;
    regtestBtc?: ResolverInputTypes["float8"] | undefined | null;
    textnetBtc?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** aggregate max on columns */
  ["bitcoin_max_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetBtc?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["bitcoin_min_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetBtc?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "bitcoin" */
  ["bitcoin_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["bitcoin"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "bitcoin" */
  ["bitcoin_obj_rel_insert_input"]: {
    data: ResolverInputTypes["bitcoin_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["bitcoin_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "bitcoin" */
  ["bitcoin_on_conflict"]: {
    constraint: ResolverInputTypes["bitcoin_constraint"];
    update_columns: Array<ResolverInputTypes["bitcoin_update_column"]>;
    where?: ResolverInputTypes["bitcoin_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "bitcoin". */
  ["bitcoin_order_by"]: {
    account?: ResolverInputTypes["account_order_by"] | undefined | null;
    accountId?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    mainnetBtc?: ResolverInputTypes["order_by"] | undefined | null;
    privateKey?: ResolverInputTypes["order_by"] | undefined | null;
    publicKey?: ResolverInputTypes["order_by"] | undefined | null;
    regtestBtc?: ResolverInputTypes["order_by"] | undefined | null;
    textnetBtc?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: bitcoin */
  ["bitcoin_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "bitcoin" */
  ["bitcoin_select_column"]: bitcoin_select_column;
  /** input type for updating data in table "bitcoin" */
  ["bitcoin_set_input"]: {
    accountId?: ResolverInputTypes["uuid"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    mainnetBtc?: ResolverInputTypes["float8"] | undefined | null;
    privateKey?: string | undefined | null;
    publicKey?: string | undefined | null;
    regtestBtc?: ResolverInputTypes["float8"] | undefined | null;
    textnetBtc?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** aggregate stddev on columns */
  ["bitcoin_stddev_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["bitcoin_stddev_pop_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["bitcoin_stddev_samp_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "bitcoin" */
  ["bitcoin_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["bitcoin_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["bitcoin_stream_cursor_value_input"]: {
    accountId?: ResolverInputTypes["uuid"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    mainnetBtc?: ResolverInputTypes["float8"] | undefined | null;
    privateKey?: string | undefined | null;
    publicKey?: string | undefined | null;
    regtestBtc?: ResolverInputTypes["float8"] | undefined | null;
    textnetBtc?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** aggregate sum on columns */
  ["bitcoin_sum_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "bitcoin" */
  ["bitcoin_update_column"]: bitcoin_update_column;
  ["bitcoin_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ResolverInputTypes["bitcoin_inc_input"] | undefined | null;
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["bitcoin_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["bitcoin_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["bitcoin_var_pop_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["bitcoin_var_samp_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["bitcoin_variance_fields"]: AliasType<{
    mainnetBtc?: boolean | `@${string}`;
    regtestBtc?: boolean | `@${string}`;
    textnetBtc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** subscriber for paybox */
  ["client"]: AliasType<{
    accounts?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["account_select_column"]>
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
          | Array<ResolverInputTypes["account_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["account_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["account"],
    ];
    accounts_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["account_select_column"]>
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
          | Array<ResolverInputTypes["account_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["account_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["account_aggregate"],
    ];
    /** An object relationship */
    address?: ResolverInputTypes["address"];
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    mobile?: boolean | `@${string}`;
    password?: boolean | `@${string}`;
    transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["transactions_select_column"]>
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
          | Array<ResolverInputTypes["transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["transactions"],
    ];
    transactions_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["transactions_select_column"]>
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
          | Array<ResolverInputTypes["transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["transactions_aggregate"],
    ];
    username?: boolean | `@${string}`;
    valid?: boolean | `@${string}`;
    wallets?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["wallet_select_column"]>
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
          | Array<ResolverInputTypes["wallet_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["wallet"],
    ];
    wallets_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["wallet_select_column"]>
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
          | Array<ResolverInputTypes["wallet_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["wallet_aggregate"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "client" */
  ["client_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["client_aggregate_fields"];
    nodes?: ResolverInputTypes["client"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "client" */
  ["client_aggregate_fields"]: AliasType<{
    avg?: ResolverInputTypes["client_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["client_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["client_max_fields"];
    min?: ResolverInputTypes["client_min_fields"];
    stddev?: ResolverInputTypes["client_stddev_fields"];
    stddev_pop?: ResolverInputTypes["client_stddev_pop_fields"];
    stddev_samp?: ResolverInputTypes["client_stddev_samp_fields"];
    sum?: ResolverInputTypes["client_sum_fields"];
    var_pop?: ResolverInputTypes["client_var_pop_fields"];
    var_samp?: ResolverInputTypes["client_var_samp_fields"];
    variance?: ResolverInputTypes["client_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["client_avg_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "client". All fields are combined with a logical 'AND'. */
  ["client_bool_exp"]: {
    _and?: Array<ResolverInputTypes["client_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["client_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["client_bool_exp"]> | undefined | null;
    accounts?: ResolverInputTypes["account_bool_exp"] | undefined | null;
    accounts_aggregate?:
      | ResolverInputTypes["account_aggregate_bool_exp"]
      | undefined
      | null;
    address?: ResolverInputTypes["address_bool_exp"] | undefined | null;
    email?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    firstname?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    lastname?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    mobile?: ResolverInputTypes["bigint_comparison_exp"] | undefined | null;
    password?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    transactions?:
      | ResolverInputTypes["transactions_bool_exp"]
      | undefined
      | null;
    transactions_aggregate?:
      | ResolverInputTypes["transactions_aggregate_bool_exp"]
      | undefined
      | null;
    username?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    valid?: ResolverInputTypes["Boolean_comparison_exp"] | undefined | null;
    wallets?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
    wallets_aggregate?:
      | ResolverInputTypes["wallet_aggregate_bool_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "client" */
  ["client_constraint"]: client_constraint;
  /** input type for incrementing numeric columns in table "client" */
  ["client_inc_input"]: {
    mobile?: ResolverInputTypes["bigint"] | undefined | null;
  };
  /** input type for inserting data into table "client" */
  ["client_insert_input"]: {
    accounts?:
      | ResolverInputTypes["account_arr_rel_insert_input"]
      | undefined
      | null;
    address?:
      | ResolverInputTypes["address_obj_rel_insert_input"]
      | undefined
      | null;
    email?: string | undefined | null;
    firstname?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    lastname?: string | undefined | null;
    mobile?: ResolverInputTypes["bigint"] | undefined | null;
    password?: string | undefined | null;
    transactions?:
      | ResolverInputTypes["transactions_arr_rel_insert_input"]
      | undefined
      | null;
    username?: string | undefined | null;
    valid?: boolean | undefined | null;
    wallets?:
      | ResolverInputTypes["wallet_arr_rel_insert_input"]
      | undefined
      | null;
  };
  /** aggregate max on columns */
  ["client_max_fields"]: AliasType<{
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    mobile?: boolean | `@${string}`;
    password?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["client_min_fields"]: AliasType<{
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    mobile?: boolean | `@${string}`;
    password?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "client" */
  ["client_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["client"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "client" */
  ["client_obj_rel_insert_input"]: {
    data: ResolverInputTypes["client_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["client_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "client" */
  ["client_on_conflict"]: {
    constraint: ResolverInputTypes["client_constraint"];
    update_columns: Array<ResolverInputTypes["client_update_column"]>;
    where?: ResolverInputTypes["client_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "client". */
  ["client_order_by"]: {
    accounts_aggregate?:
      | ResolverInputTypes["account_aggregate_order_by"]
      | undefined
      | null;
    address?: ResolverInputTypes["address_order_by"] | undefined | null;
    email?: ResolverInputTypes["order_by"] | undefined | null;
    firstname?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    lastname?: ResolverInputTypes["order_by"] | undefined | null;
    mobile?: ResolverInputTypes["order_by"] | undefined | null;
    password?: ResolverInputTypes["order_by"] | undefined | null;
    transactions_aggregate?:
      | ResolverInputTypes["transactions_aggregate_order_by"]
      | undefined
      | null;
    username?: ResolverInputTypes["order_by"] | undefined | null;
    valid?: ResolverInputTypes["order_by"] | undefined | null;
    wallets_aggregate?:
      | ResolverInputTypes["wallet_aggregate_order_by"]
      | undefined
      | null;
  };
  /** primary key columns input for table: client */
  ["client_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "client" */
  ["client_select_column"]: client_select_column;
  /** input type for updating data in table "client" */
  ["client_set_input"]: {
    email?: string | undefined | null;
    firstname?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    lastname?: string | undefined | null;
    mobile?: ResolverInputTypes["bigint"] | undefined | null;
    password?: string | undefined | null;
    username?: string | undefined | null;
    valid?: boolean | undefined | null;
  };
  /** aggregate stddev on columns */
  ["client_stddev_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["client_stddev_pop_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["client_stddev_samp_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "client" */
  ["client_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["client_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["client_stream_cursor_value_input"]: {
    email?: string | undefined | null;
    firstname?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    lastname?: string | undefined | null;
    mobile?: ResolverInputTypes["bigint"] | undefined | null;
    password?: string | undefined | null;
    username?: string | undefined | null;
    valid?: boolean | undefined | null;
  };
  /** aggregate sum on columns */
  ["client_sum_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "client" */
  ["client_update_column"]: client_update_column;
  ["client_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ResolverInputTypes["client_inc_input"] | undefined | null;
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["client_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["client_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["client_var_pop_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["client_var_samp_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["client_variance_fields"]: AliasType<{
    mobile?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  ["date"]: unknown;
  /** Boolean expression to compare columns of type "date". All fields are combined with logical 'AND'. */
  ["date_comparison_exp"]: {
    _eq?: ResolverInputTypes["date"] | undefined | null;
    _gt?: ResolverInputTypes["date"] | undefined | null;
    _gte?: ResolverInputTypes["date"] | undefined | null;
    _in?: Array<ResolverInputTypes["date"]> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: ResolverInputTypes["date"] | undefined | null;
    _lte?: ResolverInputTypes["date"] | undefined | null;
    _neq?: ResolverInputTypes["date"] | undefined | null;
    _nin?: Array<ResolverInputTypes["date"]> | undefined | null;
  };
  /** eth address and token for client wallets */
  ["eth"]: AliasType<{
    /** An object relationship */
    account?: ResolverInputTypes["account"];
    accountId?: boolean | `@${string}`;
    goerliEth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "eth" */
  ["eth_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["eth_aggregate_fields"];
    nodes?: ResolverInputTypes["eth"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "eth" */
  ["eth_aggregate_fields"]: AliasType<{
    avg?: ResolverInputTypes["eth_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["eth_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["eth_max_fields"];
    min?: ResolverInputTypes["eth_min_fields"];
    stddev?: ResolverInputTypes["eth_stddev_fields"];
    stddev_pop?: ResolverInputTypes["eth_stddev_pop_fields"];
    stddev_samp?: ResolverInputTypes["eth_stddev_samp_fields"];
    sum?: ResolverInputTypes["eth_sum_fields"];
    var_pop?: ResolverInputTypes["eth_var_pop_fields"];
    var_samp?: ResolverInputTypes["eth_var_samp_fields"];
    variance?: ResolverInputTypes["eth_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["eth_avg_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "eth". All fields are combined with a logical 'AND'. */
  ["eth_bool_exp"]: {
    _and?: Array<ResolverInputTypes["eth_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["eth_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["eth_bool_exp"]> | undefined | null;
    account?: ResolverInputTypes["account_bool_exp"] | undefined | null;
    accountId?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    goerliEth?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    kovanEth?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
    mainnetEth?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
    privateKey?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    publicKey?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    rinkebyEth?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
    ropstenEth?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
    sepoliaEth?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "eth" */
  ["eth_constraint"]: eth_constraint;
  /** input type for incrementing numeric columns in table "eth" */
  ["eth_inc_input"]: {
    goerliEth?: ResolverInputTypes["float8"] | undefined | null;
    kovanEth?: ResolverInputTypes["float8"] | undefined | null;
    mainnetEth?: ResolverInputTypes["float8"] | undefined | null;
    rinkebyEth?: ResolverInputTypes["float8"] | undefined | null;
    ropstenEth?: ResolverInputTypes["float8"] | undefined | null;
    sepoliaEth?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** input type for inserting data into table "eth" */
  ["eth_insert_input"]: {
    account?:
      | ResolverInputTypes["account_obj_rel_insert_input"]
      | undefined
      | null;
    accountId?: ResolverInputTypes["uuid"] | undefined | null;
    goerliEth?: ResolverInputTypes["float8"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    kovanEth?: ResolverInputTypes["float8"] | undefined | null;
    mainnetEth?: ResolverInputTypes["float8"] | undefined | null;
    privateKey?: string | undefined | null;
    publicKey?: string | undefined | null;
    rinkebyEth?: ResolverInputTypes["float8"] | undefined | null;
    ropstenEth?: ResolverInputTypes["float8"] | undefined | null;
    sepoliaEth?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** aggregate max on columns */
  ["eth_max_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    goerliEth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["eth_min_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    goerliEth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "eth" */
  ["eth_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["eth"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "eth" */
  ["eth_obj_rel_insert_input"]: {
    data: ResolverInputTypes["eth_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["eth_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "eth" */
  ["eth_on_conflict"]: {
    constraint: ResolverInputTypes["eth_constraint"];
    update_columns: Array<ResolverInputTypes["eth_update_column"]>;
    where?: ResolverInputTypes["eth_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "eth". */
  ["eth_order_by"]: {
    account?: ResolverInputTypes["account_order_by"] | undefined | null;
    accountId?: ResolverInputTypes["order_by"] | undefined | null;
    goerliEth?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    kovanEth?: ResolverInputTypes["order_by"] | undefined | null;
    mainnetEth?: ResolverInputTypes["order_by"] | undefined | null;
    privateKey?: ResolverInputTypes["order_by"] | undefined | null;
    publicKey?: ResolverInputTypes["order_by"] | undefined | null;
    rinkebyEth?: ResolverInputTypes["order_by"] | undefined | null;
    ropstenEth?: ResolverInputTypes["order_by"] | undefined | null;
    sepoliaEth?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: eth */
  ["eth_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "eth" */
  ["eth_select_column"]: eth_select_column;
  /** input type for updating data in table "eth" */
  ["eth_set_input"]: {
    accountId?: ResolverInputTypes["uuid"] | undefined | null;
    goerliEth?: ResolverInputTypes["float8"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    kovanEth?: ResolverInputTypes["float8"] | undefined | null;
    mainnetEth?: ResolverInputTypes["float8"] | undefined | null;
    privateKey?: string | undefined | null;
    publicKey?: string | undefined | null;
    rinkebyEth?: ResolverInputTypes["float8"] | undefined | null;
    ropstenEth?: ResolverInputTypes["float8"] | undefined | null;
    sepoliaEth?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** aggregate stddev on columns */
  ["eth_stddev_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["eth_stddev_pop_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["eth_stddev_samp_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "eth" */
  ["eth_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["eth_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["eth_stream_cursor_value_input"]: {
    accountId?: ResolverInputTypes["uuid"] | undefined | null;
    goerliEth?: ResolverInputTypes["float8"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    kovanEth?: ResolverInputTypes["float8"] | undefined | null;
    mainnetEth?: ResolverInputTypes["float8"] | undefined | null;
    privateKey?: string | undefined | null;
    publicKey?: string | undefined | null;
    rinkebyEth?: ResolverInputTypes["float8"] | undefined | null;
    ropstenEth?: ResolverInputTypes["float8"] | undefined | null;
    sepoliaEth?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** aggregate sum on columns */
  ["eth_sum_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "eth" */
  ["eth_update_column"]: eth_update_column;
  ["eth_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ResolverInputTypes["eth_inc_input"] | undefined | null;
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["eth_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["eth_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["eth_var_pop_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["eth_var_samp_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["eth_variance_fields"]: AliasType<{
    goerliEth?: boolean | `@${string}`;
    kovanEth?: boolean | `@${string}`;
    mainnetEth?: boolean | `@${string}`;
    rinkebyEth?: boolean | `@${string}`;
    ropstenEth?: boolean | `@${string}`;
    sepoliaEth?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["float8"]: unknown;
  /** Boolean expression to compare columns of type "float8". All fields are combined with logical 'AND'. */
  ["float8_comparison_exp"]: {
    _eq?: ResolverInputTypes["float8"] | undefined | null;
    _gt?: ResolverInputTypes["float8"] | undefined | null;
    _gte?: ResolverInputTypes["float8"] | undefined | null;
    _in?: Array<ResolverInputTypes["float8"]> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: ResolverInputTypes["float8"] | undefined | null;
    _lte?: ResolverInputTypes["float8"] | undefined | null;
    _neq?: ResolverInputTypes["float8"] | undefined | null;
    _nin?: Array<ResolverInputTypes["float8"]> | undefined | null;
  };
  ["jsonb"]: unknown;
  ["jsonb_cast_exp"]: {
    String?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
  ["jsonb_comparison_exp"]: {
    _cast?: ResolverInputTypes["jsonb_cast_exp"] | undefined | null;
    /** is the column contained in the given json value */
    _contained_in?: ResolverInputTypes["jsonb"] | undefined | null;
    /** does the column contain the given json value at the top level */
    _contains?: ResolverInputTypes["jsonb"] | undefined | null;
    _eq?: ResolverInputTypes["jsonb"] | undefined | null;
    _gt?: ResolverInputTypes["jsonb"] | undefined | null;
    _gte?: ResolverInputTypes["jsonb"] | undefined | null;
    /** does the string exist as a top-level key in the column */
    _has_key?: string | undefined | null;
    /** do all of these strings exist as top-level keys in the column */
    _has_keys_all?: Array<string> | undefined | null;
    /** do any of these strings exist as top-level keys in the column */
    _has_keys_any?: Array<string> | undefined | null;
    _in?: Array<ResolverInputTypes["jsonb"]> | undefined | null;
    _is_null?: boolean | undefined | null;
    _lt?: ResolverInputTypes["jsonb"] | undefined | null;
    _lte?: ResolverInputTypes["jsonb"] | undefined | null;
    _neq?: ResolverInputTypes["jsonb"] | undefined | null;
    _nin?: Array<ResolverInputTypes["jsonb"]> | undefined | null;
  };
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_account?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["account_bool_exp"];
      },
      ResolverInputTypes["account_mutation_response"],
    ];
    delete_account_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["account"],
    ];
    delete_address?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["address_bool_exp"];
      },
      ResolverInputTypes["address_mutation_response"],
    ];
    delete_address_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["address"],
    ];
    delete_bitcoin?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["bitcoin_bool_exp"];
      },
      ResolverInputTypes["bitcoin_mutation_response"],
    ];
    delete_bitcoin_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["bitcoin"],
    ];
    delete_client?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["client_bool_exp"];
      },
      ResolverInputTypes["client_mutation_response"],
    ];
    delete_client_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["client"],
    ];
    delete_eth?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["eth_bool_exp"];
      },
      ResolverInputTypes["eth_mutation_response"],
    ];
    delete_eth_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["eth"],
    ];
    delete_sol?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["sol_bool_exp"];
      },
      ResolverInputTypes["sol_mutation_response"],
    ];
    delete_sol_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["sol"],
    ];
    delete_transactions?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["transactions_bool_exp"];
      },
      ResolverInputTypes["transactions_mutation_response"],
    ];
    delete_transactions_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["transactions"],
    ];
    delete_wallet?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["wallet_bool_exp"];
      },
      ResolverInputTypes["wallet_mutation_response"],
    ];
    delete_wallet_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["wallet"],
    ];
    insert_account?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["account_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["account_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["account_mutation_response"],
    ];
    insert_account_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["account_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["account_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["account"],
    ];
    insert_address?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["address_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["address_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["address_mutation_response"],
    ];
    insert_address_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["address_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["address_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["address"],
    ];
    insert_bitcoin?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["bitcoin_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["bitcoin_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["bitcoin_mutation_response"],
    ];
    insert_bitcoin_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["bitcoin_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["bitcoin_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["bitcoin"],
    ];
    insert_client?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["client_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["client_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["client_mutation_response"],
    ];
    insert_client_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["client_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["client_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["client"],
    ];
    insert_eth?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["eth_insert_input"]
        > /** upsert condition */;
        on_conflict?: ResolverInputTypes["eth_on_conflict"] | undefined | null;
      },
      ResolverInputTypes["eth_mutation_response"],
    ];
    insert_eth_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["eth_insert_input"] /** upsert condition */;
        on_conflict?: ResolverInputTypes["eth_on_conflict"] | undefined | null;
      },
      ResolverInputTypes["eth"],
    ];
    insert_sol?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["sol_insert_input"]
        > /** upsert condition */;
        on_conflict?: ResolverInputTypes["sol_on_conflict"] | undefined | null;
      },
      ResolverInputTypes["sol_mutation_response"],
    ];
    insert_sol_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["sol_insert_input"] /** upsert condition */;
        on_conflict?: ResolverInputTypes["sol_on_conflict"] | undefined | null;
      },
      ResolverInputTypes["sol"],
    ];
    insert_transactions?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["transactions_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["transactions_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["transactions_mutation_response"],
    ];
    insert_transactions_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["transactions_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["transactions_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["transactions"],
    ];
    insert_wallet?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["wallet_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["wallet_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["wallet_mutation_response"],
    ];
    insert_wallet_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["wallet_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["wallet_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["wallet"],
    ];
    update_account?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["account_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["account_bool_exp"];
      },
      ResolverInputTypes["account_mutation_response"],
    ];
    update_account_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["account_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["account_pk_columns_input"];
      },
      ResolverInputTypes["account"],
    ];
    update_account_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["account_updates"]>;
      },
      ResolverInputTypes["account_mutation_response"],
    ];
    update_address?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["address_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["address_bool_exp"];
      },
      ResolverInputTypes["address_mutation_response"],
    ];
    update_address_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["address_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["address_pk_columns_input"];
      },
      ResolverInputTypes["address"],
    ];
    update_address_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["address_updates"]>;
      },
      ResolverInputTypes["address_mutation_response"],
    ];
    update_bitcoin?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["bitcoin_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["bitcoin_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["bitcoin_bool_exp"];
      },
      ResolverInputTypes["bitcoin_mutation_response"],
    ];
    update_bitcoin_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["bitcoin_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?: ResolverInputTypes["bitcoin_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["bitcoin_pk_columns_input"];
      },
      ResolverInputTypes["bitcoin"],
    ];
    update_bitcoin_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["bitcoin_updates"]>;
      },
      ResolverInputTypes["bitcoin_mutation_response"],
    ];
    update_client?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["client_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["client_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["client_bool_exp"];
      },
      ResolverInputTypes["client_mutation_response"],
    ];
    update_client_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["client_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?: ResolverInputTypes["client_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["client_pk_columns_input"];
      },
      ResolverInputTypes["client"],
    ];
    update_client_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["client_updates"]>;
      },
      ResolverInputTypes["client_mutation_response"],
    ];
    update_eth?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["eth_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["eth_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["eth_bool_exp"];
      },
      ResolverInputTypes["eth_mutation_response"],
    ];
    update_eth_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["eth_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?: ResolverInputTypes["eth_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["eth_pk_columns_input"];
      },
      ResolverInputTypes["eth"],
    ];
    update_eth_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["eth_updates"]>;
      },
      ResolverInputTypes["eth_mutation_response"],
    ];
    update_sol?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["sol_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["sol_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["sol_bool_exp"];
      },
      ResolverInputTypes["sol_mutation_response"],
    ];
    update_sol_by_pk?: [
      {
        /** increments the numeric columns with given value of the filtered values */
        _inc?:
          | ResolverInputTypes["sol_inc_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?: ResolverInputTypes["sol_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["sol_pk_columns_input"];
      },
      ResolverInputTypes["sol"],
    ];
    update_sol_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["sol_updates"]>;
      },
      ResolverInputTypes["sol_mutation_response"],
    ];
    update_transactions?: [
      {
        /** append existing jsonb value of filtered columns with new jsonb value */
        _append?:
          | ResolverInputTypes["transactions_append_input"]
          | undefined
          | null /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */;
        _delete_at_path?:
          | ResolverInputTypes["transactions_delete_at_path_input"]
          | undefined
          | null /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */;
        _delete_elem?:
          | ResolverInputTypes["transactions_delete_elem_input"]
          | undefined
          | null /** delete key/value pair or string element. key/value pairs are matched based on their key value */;
        _delete_key?:
          | ResolverInputTypes["transactions_delete_key_input"]
          | undefined
          | null /** increments the numeric columns with given value of the filtered values */;
        _inc?:
          | ResolverInputTypes["transactions_inc_input"]
          | undefined
          | null /** prepend existing jsonb value of filtered columns with new jsonb value */;
        _prepend?:
          | ResolverInputTypes["transactions_prepend_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?:
          | ResolverInputTypes["transactions_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["transactions_bool_exp"];
      },
      ResolverInputTypes["transactions_mutation_response"],
    ];
    update_transactions_by_pk?: [
      {
        /** append existing jsonb value of filtered columns with new jsonb value */
        _append?:
          | ResolverInputTypes["transactions_append_input"]
          | undefined
          | null /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */;
        _delete_at_path?:
          | ResolverInputTypes["transactions_delete_at_path_input"]
          | undefined
          | null /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */;
        _delete_elem?:
          | ResolverInputTypes["transactions_delete_elem_input"]
          | undefined
          | null /** delete key/value pair or string element. key/value pairs are matched based on their key value */;
        _delete_key?:
          | ResolverInputTypes["transactions_delete_key_input"]
          | undefined
          | null /** increments the numeric columns with given value of the filtered values */;
        _inc?:
          | ResolverInputTypes["transactions_inc_input"]
          | undefined
          | null /** prepend existing jsonb value of filtered columns with new jsonb value */;
        _prepend?:
          | ResolverInputTypes["transactions_prepend_input"]
          | undefined
          | null /** sets the columns of the filtered rows to the given values */;
        _set?: ResolverInputTypes["transactions_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["transactions_pk_columns_input"];
      },
      ResolverInputTypes["transactions"],
    ];
    update_transactions_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["transactions_updates"]>;
      },
      ResolverInputTypes["transactions_mutation_response"],
    ];
    update_wallet?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["wallet_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["wallet_bool_exp"];
      },
      ResolverInputTypes["wallet_mutation_response"],
    ];
    update_wallet_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["wallet_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["wallet_pk_columns_input"];
      },
      ResolverInputTypes["wallet"],
    ];
    update_wallet_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["wallet_updates"]>;
      },
      ResolverInputTypes["wallet_mutation_response"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    account?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["account_select_column"]>
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
          | Array<ResolverInputTypes["account_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["account_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["account"],
    ];
    account_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["account_select_column"]>
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
          | Array<ResolverInputTypes["account_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["account_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["account_aggregate"],
    ];
    account_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["account"],
    ];
    address?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["address_select_column"]>
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
          | Array<ResolverInputTypes["address_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["address_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["address"],
    ];
    address_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["address_select_column"]>
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
          | Array<ResolverInputTypes["address_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["address_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["address_aggregate"],
    ];
    address_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["address"],
    ];
    bitcoin?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["bitcoin_select_column"]>
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
          | Array<ResolverInputTypes["bitcoin_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["bitcoin_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["bitcoin"],
    ];
    bitcoin_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["bitcoin_select_column"]>
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
          | Array<ResolverInputTypes["bitcoin_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["bitcoin_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["bitcoin_aggregate"],
    ];
    bitcoin_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["bitcoin"],
    ];
    client?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["client_select_column"]>
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
          | Array<ResolverInputTypes["client_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["client_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["client"],
    ];
    client_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["client_select_column"]>
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
          | Array<ResolverInputTypes["client_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["client_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["client_aggregate"],
    ];
    client_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["client"],
    ];
    eth?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["eth_select_column"]>
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
          | Array<ResolverInputTypes["eth_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["eth_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["eth"],
    ];
    eth_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["eth_select_column"]>
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
          | Array<ResolverInputTypes["eth_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["eth_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["eth_aggregate"],
    ];
    eth_by_pk?: [{ id: ResolverInputTypes["uuid"] }, ResolverInputTypes["eth"]];
    sol?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["sol_select_column"]>
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
          | Array<ResolverInputTypes["sol_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["sol_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["sol"],
    ];
    sol_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["sol_select_column"]>
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
          | Array<ResolverInputTypes["sol_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["sol_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["sol_aggregate"],
    ];
    sol_by_pk?: [{ id: ResolverInputTypes["uuid"] }, ResolverInputTypes["sol"]];
    transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["transactions_select_column"]>
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
          | Array<ResolverInputTypes["transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["transactions"],
    ];
    transactions_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["transactions_select_column"]>
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
          | Array<ResolverInputTypes["transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["transactions_aggregate"],
    ];
    transactions_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["transactions"],
    ];
    wallet?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["wallet_select_column"]>
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
          | Array<ResolverInputTypes["wallet_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["wallet"],
    ];
    wallet_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["wallet_select_column"]>
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
          | Array<ResolverInputTypes["wallet_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["wallet_aggregate"],
    ];
    wallet_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["wallet"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** solana address for client wallets */
  ["sol"]: AliasType<{
    /** An object relationship */
    account?: ResolverInputTypes["account"];
    accountId?: boolean | `@${string}`;
    devnetSol?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "sol" */
  ["sol_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["sol_aggregate_fields"];
    nodes?: ResolverInputTypes["sol"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "sol" */
  ["sol_aggregate_fields"]: AliasType<{
    avg?: ResolverInputTypes["sol_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["sol_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["sol_max_fields"];
    min?: ResolverInputTypes["sol_min_fields"];
    stddev?: ResolverInputTypes["sol_stddev_fields"];
    stddev_pop?: ResolverInputTypes["sol_stddev_pop_fields"];
    stddev_samp?: ResolverInputTypes["sol_stddev_samp_fields"];
    sum?: ResolverInputTypes["sol_sum_fields"];
    var_pop?: ResolverInputTypes["sol_var_pop_fields"];
    var_samp?: ResolverInputTypes["sol_var_samp_fields"];
    variance?: ResolverInputTypes["sol_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate avg on columns */
  ["sol_avg_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "sol". All fields are combined with a logical 'AND'. */
  ["sol_bool_exp"]: {
    _and?: Array<ResolverInputTypes["sol_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["sol_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["sol_bool_exp"]> | undefined | null;
    account?: ResolverInputTypes["account_bool_exp"] | undefined | null;
    accountId?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    devnetSol?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    mainnetSol?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
    privateKey?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    publicKey?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    testnetSol?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "sol" */
  ["sol_constraint"]: sol_constraint;
  /** input type for incrementing numeric columns in table "sol" */
  ["sol_inc_input"]: {
    devnetSol?: ResolverInputTypes["float8"] | undefined | null;
    mainnetSol?: ResolverInputTypes["float8"] | undefined | null;
    testnetSol?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** input type for inserting data into table "sol" */
  ["sol_insert_input"]: {
    account?:
      | ResolverInputTypes["account_obj_rel_insert_input"]
      | undefined
      | null;
    accountId?: ResolverInputTypes["uuid"] | undefined | null;
    devnetSol?: ResolverInputTypes["float8"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    mainnetSol?: ResolverInputTypes["float8"] | undefined | null;
    privateKey?: string | undefined | null;
    publicKey?: string | undefined | null;
    testnetSol?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** aggregate max on columns */
  ["sol_max_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    devnetSol?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["sol_min_fields"]: AliasType<{
    accountId?: boolean | `@${string}`;
    devnetSol?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    privateKey?: boolean | `@${string}`;
    publicKey?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "sol" */
  ["sol_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["sol"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "sol" */
  ["sol_obj_rel_insert_input"]: {
    data: ResolverInputTypes["sol_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["sol_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "sol" */
  ["sol_on_conflict"]: {
    constraint: ResolverInputTypes["sol_constraint"];
    update_columns: Array<ResolverInputTypes["sol_update_column"]>;
    where?: ResolverInputTypes["sol_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "sol". */
  ["sol_order_by"]: {
    account?: ResolverInputTypes["account_order_by"] | undefined | null;
    accountId?: ResolverInputTypes["order_by"] | undefined | null;
    devnetSol?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    mainnetSol?: ResolverInputTypes["order_by"] | undefined | null;
    privateKey?: ResolverInputTypes["order_by"] | undefined | null;
    publicKey?: ResolverInputTypes["order_by"] | undefined | null;
    testnetSol?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: sol */
  ["sol_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "sol" */
  ["sol_select_column"]: sol_select_column;
  /** input type for updating data in table "sol" */
  ["sol_set_input"]: {
    accountId?: ResolverInputTypes["uuid"] | undefined | null;
    devnetSol?: ResolverInputTypes["float8"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    mainnetSol?: ResolverInputTypes["float8"] | undefined | null;
    privateKey?: string | undefined | null;
    publicKey?: string | undefined | null;
    testnetSol?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** aggregate stddev on columns */
  ["sol_stddev_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_pop on columns */
  ["sol_stddev_pop_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate stddev_samp on columns */
  ["sol_stddev_samp_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** Streaming cursor of the table "sol" */
  ["sol_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["sol_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["sol_stream_cursor_value_input"]: {
    accountId?: ResolverInputTypes["uuid"] | undefined | null;
    devnetSol?: ResolverInputTypes["float8"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    mainnetSol?: ResolverInputTypes["float8"] | undefined | null;
    privateKey?: string | undefined | null;
    publicKey?: string | undefined | null;
    testnetSol?: ResolverInputTypes["float8"] | undefined | null;
  };
  /** aggregate sum on columns */
  ["sol_sum_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** update columns of table "sol" */
  ["sol_update_column"]: sol_update_column;
  ["sol_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ResolverInputTypes["sol_inc_input"] | undefined | null;
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["sol_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["sol_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["sol_var_pop_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate var_samp on columns */
  ["sol_var_samp_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate variance on columns */
  ["sol_variance_fields"]: AliasType<{
    devnetSol?: boolean | `@${string}`;
    mainnetSol?: boolean | `@${string}`;
    testnetSol?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    account?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["account_select_column"]>
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
          | Array<ResolverInputTypes["account_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["account_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["account"],
    ];
    account_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["account_select_column"]>
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
          | Array<ResolverInputTypes["account_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["account_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["account_aggregate"],
    ];
    account_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["account"],
    ];
    account_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["account_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["account_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["account"],
    ];
    address?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["address_select_column"]>
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
          | Array<ResolverInputTypes["address_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["address_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["address"],
    ];
    address_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["address_select_column"]>
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
          | Array<ResolverInputTypes["address_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["address_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["address_aggregate"],
    ];
    address_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["address"],
    ];
    address_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["address_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["address_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["address"],
    ];
    bitcoin?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["bitcoin_select_column"]>
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
          | Array<ResolverInputTypes["bitcoin_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["bitcoin_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["bitcoin"],
    ];
    bitcoin_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["bitcoin_select_column"]>
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
          | Array<ResolverInputTypes["bitcoin_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["bitcoin_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["bitcoin_aggregate"],
    ];
    bitcoin_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["bitcoin"],
    ];
    bitcoin_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["bitcoin_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["bitcoin_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["bitcoin"],
    ];
    client?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["client_select_column"]>
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
          | Array<ResolverInputTypes["client_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["client_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["client"],
    ];
    client_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["client_select_column"]>
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
          | Array<ResolverInputTypes["client_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["client_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["client_aggregate"],
    ];
    client_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["client"],
    ];
    client_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["client_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["client_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["client"],
    ];
    eth?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["eth_select_column"]>
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
          | Array<ResolverInputTypes["eth_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["eth_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["eth"],
    ];
    eth_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["eth_select_column"]>
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
          | Array<ResolverInputTypes["eth_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["eth_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["eth_aggregate"],
    ];
    eth_by_pk?: [{ id: ResolverInputTypes["uuid"] }, ResolverInputTypes["eth"]];
    eth_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["eth_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["eth_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["eth"],
    ];
    sol?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["sol_select_column"]>
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
          | Array<ResolverInputTypes["sol_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["sol_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["sol"],
    ];
    sol_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["sol_select_column"]>
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
          | Array<ResolverInputTypes["sol_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["sol_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["sol_aggregate"],
    ];
    sol_by_pk?: [{ id: ResolverInputTypes["uuid"] }, ResolverInputTypes["sol"]];
    sol_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["sol_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["sol_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["sol"],
    ];
    transactions?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["transactions_select_column"]>
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
          | Array<ResolverInputTypes["transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["transactions"],
    ];
    transactions_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["transactions_select_column"]>
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
          | Array<ResolverInputTypes["transactions_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["transactions_aggregate"],
    ];
    transactions_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["transactions"],
    ];
    transactions_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["transactions_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["transactions"],
    ];
    wallet?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["wallet_select_column"]>
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
          | Array<ResolverInputTypes["wallet_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["wallet"],
    ];
    wallet_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["wallet_select_column"]>
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
          | Array<ResolverInputTypes["wallet_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["wallet_aggregate"],
    ];
    wallet_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["wallet"],
    ];
    wallet_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["wallet_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["wallet"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** transactions table  */
  ["transactions"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    /** An object relationship */
    client?: ResolverInputTypes["client"];
    clientId?: boolean | `@${string}`;
    cluster?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    hash?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    network?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    postBalances?: [
      {
        /** JSON select path */ path?: string | undefined | null;
      },
      boolean | `@${string}`,
    ];
    preBalances?: [
      {
        /** JSON select path */ path?: string | undefined | null;
      },
      boolean | `@${string}`,
    ];
    recentBlockhash?: boolean | `@${string}`;
    signature?: [
      {
        /** JSON select path */ path?: string | undefined | null;
      },
      boolean | `@${string}`,
    ];
    slot?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "transactions" */
  ["transactions_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["transactions_aggregate_fields"];
    nodes?: ResolverInputTypes["transactions"];
    __typename?: boolean | `@${string}`;
  }>;
  ["transactions_aggregate_bool_exp"]: {
    avg?:
      | ResolverInputTypes["transactions_aggregate_bool_exp_avg"]
      | undefined
      | null;
    corr?:
      | ResolverInputTypes["transactions_aggregate_bool_exp_corr"]
      | undefined
      | null;
    count?:
      | ResolverInputTypes["transactions_aggregate_bool_exp_count"]
      | undefined
      | null;
    covar_samp?:
      | ResolverInputTypes["transactions_aggregate_bool_exp_covar_samp"]
      | undefined
      | null;
    max?:
      | ResolverInputTypes["transactions_aggregate_bool_exp_max"]
      | undefined
      | null;
    min?:
      | ResolverInputTypes["transactions_aggregate_bool_exp_min"]
      | undefined
      | null;
    stddev_samp?:
      | ResolverInputTypes["transactions_aggregate_bool_exp_stddev_samp"]
      | undefined
      | null;
    sum?:
      | ResolverInputTypes["transactions_aggregate_bool_exp_sum"]
      | undefined
      | null;
    var_samp?:
      | ResolverInputTypes["transactions_aggregate_bool_exp_var_samp"]
      | undefined
      | null;
  };
  ["transactions_aggregate_bool_exp_avg"]: {
    arguments: ResolverInputTypes["transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns"];
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_corr"]: {
    arguments: ResolverInputTypes["transactions_aggregate_bool_exp_corr_arguments"];
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_corr_arguments"]: {
    X: ResolverInputTypes["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"];
    Y: ResolverInputTypes["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"];
  };
  ["transactions_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ResolverInputTypes["transactions_select_column"]>
      | undefined
      | null;
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["Int_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_covar_samp"]: {
    arguments: ResolverInputTypes["transactions_aggregate_bool_exp_covar_samp_arguments"];
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_covar_samp_arguments"]: {
    X: ResolverInputTypes["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"];
    Y: ResolverInputTypes["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"];
  };
  ["transactions_aggregate_bool_exp_max"]: {
    arguments: ResolverInputTypes["transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns"];
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_min"]: {
    arguments: ResolverInputTypes["transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns"];
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_stddev_samp"]: {
    arguments: ResolverInputTypes["transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns"];
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_sum"]: {
    arguments: ResolverInputTypes["transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns"];
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_var_samp"]: {
    arguments: ResolverInputTypes["transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns"];
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["float8_comparison_exp"];
  };
  /** aggregate fields of "transactions" */
  ["transactions_aggregate_fields"]: AliasType<{
    avg?: ResolverInputTypes["transactions_avg_fields"];
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["transactions_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["transactions_max_fields"];
    min?: ResolverInputTypes["transactions_min_fields"];
    stddev?: ResolverInputTypes["transactions_stddev_fields"];
    stddev_pop?: ResolverInputTypes["transactions_stddev_pop_fields"];
    stddev_samp?: ResolverInputTypes["transactions_stddev_samp_fields"];
    sum?: ResolverInputTypes["transactions_sum_fields"];
    var_pop?: ResolverInputTypes["transactions_var_pop_fields"];
    var_samp?: ResolverInputTypes["transactions_var_samp_fields"];
    variance?: ResolverInputTypes["transactions_variance_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "transactions" */
  ["transactions_aggregate_order_by"]: {
    avg?: ResolverInputTypes["transactions_avg_order_by"] | undefined | null;
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?: ResolverInputTypes["transactions_max_order_by"] | undefined | null;
    min?: ResolverInputTypes["transactions_min_order_by"] | undefined | null;
    stddev?:
      | ResolverInputTypes["transactions_stddev_order_by"]
      | undefined
      | null;
    stddev_pop?:
      | ResolverInputTypes["transactions_stddev_pop_order_by"]
      | undefined
      | null;
    stddev_samp?:
      | ResolverInputTypes["transactions_stddev_samp_order_by"]
      | undefined
      | null;
    sum?: ResolverInputTypes["transactions_sum_order_by"] | undefined | null;
    var_pop?:
      | ResolverInputTypes["transactions_var_pop_order_by"]
      | undefined
      | null;
    var_samp?:
      | ResolverInputTypes["transactions_var_samp_order_by"]
      | undefined
      | null;
    variance?:
      | ResolverInputTypes["transactions_variance_order_by"]
      | undefined
      | null;
  };
  /** append existing jsonb value of filtered columns with new jsonb value */
  ["transactions_append_input"]: {
    postBalances?: ResolverInputTypes["jsonb"] | undefined | null;
    preBalances?: ResolverInputTypes["jsonb"] | undefined | null;
    signature?: ResolverInputTypes["jsonb"] | undefined | null;
  };
  /** input type for inserting array relation for remote table "transactions" */
  ["transactions_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["transactions_insert_input"]>;
    /** upsert condition */
    on_conflict?:
      | ResolverInputTypes["transactions_on_conflict"]
      | undefined
      | null;
  };
  /** aggregate avg on columns */
  ["transactions_avg_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by avg() on columns of table "transactions" */
  ["transactions_avg_order_by"]: {
    amount?: ResolverInputTypes["order_by"] | undefined | null;
    blockTime?: ResolverInputTypes["order_by"] | undefined | null;
    chainId?: ResolverInputTypes["order_by"] | undefined | null;
    fee?: ResolverInputTypes["order_by"] | undefined | null;
    nonce?: ResolverInputTypes["order_by"] | undefined | null;
    slot?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "transactions". All fields are combined with a logical 'AND'. */
  ["transactions_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["transactions_bool_exp"]>
      | undefined
      | null;
    _not?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["transactions_bool_exp"]> | undefined | null;
    amount?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
    blockTime?: ResolverInputTypes["bigint_comparison_exp"] | undefined | null;
    chainId?: ResolverInputTypes["bigint_comparison_exp"] | undefined | null;
    client?: ResolverInputTypes["client_bool_exp"] | undefined | null;
    clientId?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    cluster?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    date?: ResolverInputTypes["date_comparison_exp"] | undefined | null;
    fee?: ResolverInputTypes["float8_comparison_exp"] | undefined | null;
    from?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    hash?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    network?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    nonce?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    postBalances?:
      | ResolverInputTypes["jsonb_comparison_exp"]
      | undefined
      | null;
    preBalances?: ResolverInputTypes["jsonb_comparison_exp"] | undefined | null;
    recentBlockhash?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    signature?: ResolverInputTypes["jsonb_comparison_exp"] | undefined | null;
    slot?: ResolverInputTypes["bigint_comparison_exp"] | undefined | null;
    status?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    to?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "transactions" */
  ["transactions_constraint"]: transactions_constraint;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  ["transactions_delete_at_path_input"]: {
    postBalances?: Array<string> | undefined | null;
    preBalances?: Array<string> | undefined | null;
    signature?: Array<string> | undefined | null;
  };
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  ["transactions_delete_elem_input"]: {
    postBalances?: number | undefined | null;
    preBalances?: number | undefined | null;
    signature?: number | undefined | null;
  };
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  ["transactions_delete_key_input"]: {
    postBalances?: string | undefined | null;
    preBalances?: string | undefined | null;
    signature?: string | undefined | null;
  };
  /** input type for incrementing numeric columns in table "transactions" */
  ["transactions_inc_input"]: {
    amount?: ResolverInputTypes["float8"] | undefined | null;
    blockTime?: ResolverInputTypes["bigint"] | undefined | null;
    chainId?: ResolverInputTypes["bigint"] | undefined | null;
    fee?: ResolverInputTypes["float8"] | undefined | null;
    nonce?: number | undefined | null;
    slot?: ResolverInputTypes["bigint"] | undefined | null;
  };
  /** input type for inserting data into table "transactions" */
  ["transactions_insert_input"]: {
    amount?: ResolverInputTypes["float8"] | undefined | null;
    blockTime?: ResolverInputTypes["bigint"] | undefined | null;
    chainId?: ResolverInputTypes["bigint"] | undefined | null;
    client?:
      | ResolverInputTypes["client_obj_rel_insert_input"]
      | undefined
      | null;
    clientId?: ResolverInputTypes["uuid"] | undefined | null;
    cluster?: string | undefined | null;
    date?: ResolverInputTypes["date"] | undefined | null;
    fee?: ResolverInputTypes["float8"] | undefined | null;
    from?: string | undefined | null;
    hash?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    network?: string | undefined | null;
    nonce?: number | undefined | null;
    postBalances?: ResolverInputTypes["jsonb"] | undefined | null;
    preBalances?: ResolverInputTypes["jsonb"] | undefined | null;
    recentBlockhash?: string | undefined | null;
    signature?: ResolverInputTypes["jsonb"] | undefined | null;
    slot?: ResolverInputTypes["bigint"] | undefined | null;
    status?: string | undefined | null;
    to?: string | undefined | null;
  };
  /** aggregate max on columns */
  ["transactions_max_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    clientId?: boolean | `@${string}`;
    cluster?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    hash?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    network?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    recentBlockhash?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "transactions" */
  ["transactions_max_order_by"]: {
    amount?: ResolverInputTypes["order_by"] | undefined | null;
    blockTime?: ResolverInputTypes["order_by"] | undefined | null;
    chainId?: ResolverInputTypes["order_by"] | undefined | null;
    clientId?: ResolverInputTypes["order_by"] | undefined | null;
    cluster?: ResolverInputTypes["order_by"] | undefined | null;
    date?: ResolverInputTypes["order_by"] | undefined | null;
    fee?: ResolverInputTypes["order_by"] | undefined | null;
    from?: ResolverInputTypes["order_by"] | undefined | null;
    hash?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    network?: ResolverInputTypes["order_by"] | undefined | null;
    nonce?: ResolverInputTypes["order_by"] | undefined | null;
    recentBlockhash?: ResolverInputTypes["order_by"] | undefined | null;
    slot?: ResolverInputTypes["order_by"] | undefined | null;
    status?: ResolverInputTypes["order_by"] | undefined | null;
    to?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate min on columns */
  ["transactions_min_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    clientId?: boolean | `@${string}`;
    cluster?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    from?: boolean | `@${string}`;
    hash?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    network?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    recentBlockhash?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    status?: boolean | `@${string}`;
    to?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "transactions" */
  ["transactions_min_order_by"]: {
    amount?: ResolverInputTypes["order_by"] | undefined | null;
    blockTime?: ResolverInputTypes["order_by"] | undefined | null;
    chainId?: ResolverInputTypes["order_by"] | undefined | null;
    clientId?: ResolverInputTypes["order_by"] | undefined | null;
    cluster?: ResolverInputTypes["order_by"] | undefined | null;
    date?: ResolverInputTypes["order_by"] | undefined | null;
    fee?: ResolverInputTypes["order_by"] | undefined | null;
    from?: ResolverInputTypes["order_by"] | undefined | null;
    hash?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    network?: ResolverInputTypes["order_by"] | undefined | null;
    nonce?: ResolverInputTypes["order_by"] | undefined | null;
    recentBlockhash?: ResolverInputTypes["order_by"] | undefined | null;
    slot?: ResolverInputTypes["order_by"] | undefined | null;
    status?: ResolverInputTypes["order_by"] | undefined | null;
    to?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "transactions" */
  ["transactions_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["transactions"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "transactions" */
  ["transactions_on_conflict"]: {
    constraint: ResolverInputTypes["transactions_constraint"];
    update_columns: Array<ResolverInputTypes["transactions_update_column"]>;
    where?: ResolverInputTypes["transactions_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "transactions". */
  ["transactions_order_by"]: {
    amount?: ResolverInputTypes["order_by"] | undefined | null;
    blockTime?: ResolverInputTypes["order_by"] | undefined | null;
    chainId?: ResolverInputTypes["order_by"] | undefined | null;
    client?: ResolverInputTypes["client_order_by"] | undefined | null;
    clientId?: ResolverInputTypes["order_by"] | undefined | null;
    cluster?: ResolverInputTypes["order_by"] | undefined | null;
    date?: ResolverInputTypes["order_by"] | undefined | null;
    fee?: ResolverInputTypes["order_by"] | undefined | null;
    from?: ResolverInputTypes["order_by"] | undefined | null;
    hash?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    network?: ResolverInputTypes["order_by"] | undefined | null;
    nonce?: ResolverInputTypes["order_by"] | undefined | null;
    postBalances?: ResolverInputTypes["order_by"] | undefined | null;
    preBalances?: ResolverInputTypes["order_by"] | undefined | null;
    recentBlockhash?: ResolverInputTypes["order_by"] | undefined | null;
    signature?: ResolverInputTypes["order_by"] | undefined | null;
    slot?: ResolverInputTypes["order_by"] | undefined | null;
    status?: ResolverInputTypes["order_by"] | undefined | null;
    to?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: transactions */
  ["transactions_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  ["transactions_prepend_input"]: {
    postBalances?: ResolverInputTypes["jsonb"] | undefined | null;
    preBalances?: ResolverInputTypes["jsonb"] | undefined | null;
    signature?: ResolverInputTypes["jsonb"] | undefined | null;
  };
  /** select columns of table "transactions" */
  ["transactions_select_column"]: transactions_select_column;
  /** select "transactions_aggregate_bool_exp_avg_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns;
  /** select "transactions_aggregate_bool_exp_corr_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns;
  /** select "transactions_aggregate_bool_exp_covar_samp_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns;
  /** select "transactions_aggregate_bool_exp_max_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns;
  /** select "transactions_aggregate_bool_exp_min_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns;
  /** select "transactions_aggregate_bool_exp_stddev_samp_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns;
  /** select "transactions_aggregate_bool_exp_sum_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns;
  /** select "transactions_aggregate_bool_exp_var_samp_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns;
  /** input type for updating data in table "transactions" */
  ["transactions_set_input"]: {
    amount?: ResolverInputTypes["float8"] | undefined | null;
    blockTime?: ResolverInputTypes["bigint"] | undefined | null;
    chainId?: ResolverInputTypes["bigint"] | undefined | null;
    clientId?: ResolverInputTypes["uuid"] | undefined | null;
    cluster?: string | undefined | null;
    date?: ResolverInputTypes["date"] | undefined | null;
    fee?: ResolverInputTypes["float8"] | undefined | null;
    from?: string | undefined | null;
    hash?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    network?: string | undefined | null;
    nonce?: number | undefined | null;
    postBalances?: ResolverInputTypes["jsonb"] | undefined | null;
    preBalances?: ResolverInputTypes["jsonb"] | undefined | null;
    recentBlockhash?: string | undefined | null;
    signature?: ResolverInputTypes["jsonb"] | undefined | null;
    slot?: ResolverInputTypes["bigint"] | undefined | null;
    status?: string | undefined | null;
    to?: string | undefined | null;
  };
  /** aggregate stddev on columns */
  ["transactions_stddev_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev() on columns of table "transactions" */
  ["transactions_stddev_order_by"]: {
    amount?: ResolverInputTypes["order_by"] | undefined | null;
    blockTime?: ResolverInputTypes["order_by"] | undefined | null;
    chainId?: ResolverInputTypes["order_by"] | undefined | null;
    fee?: ResolverInputTypes["order_by"] | undefined | null;
    nonce?: ResolverInputTypes["order_by"] | undefined | null;
    slot?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate stddev_pop on columns */
  ["transactions_stddev_pop_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev_pop() on columns of table "transactions" */
  ["transactions_stddev_pop_order_by"]: {
    amount?: ResolverInputTypes["order_by"] | undefined | null;
    blockTime?: ResolverInputTypes["order_by"] | undefined | null;
    chainId?: ResolverInputTypes["order_by"] | undefined | null;
    fee?: ResolverInputTypes["order_by"] | undefined | null;
    nonce?: ResolverInputTypes["order_by"] | undefined | null;
    slot?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate stddev_samp on columns */
  ["transactions_stddev_samp_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by stddev_samp() on columns of table "transactions" */
  ["transactions_stddev_samp_order_by"]: {
    amount?: ResolverInputTypes["order_by"] | undefined | null;
    blockTime?: ResolverInputTypes["order_by"] | undefined | null;
    chainId?: ResolverInputTypes["order_by"] | undefined | null;
    fee?: ResolverInputTypes["order_by"] | undefined | null;
    nonce?: ResolverInputTypes["order_by"] | undefined | null;
    slot?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** Streaming cursor of the table "transactions" */
  ["transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["transactions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["transactions_stream_cursor_value_input"]: {
    amount?: ResolverInputTypes["float8"] | undefined | null;
    blockTime?: ResolverInputTypes["bigint"] | undefined | null;
    chainId?: ResolverInputTypes["bigint"] | undefined | null;
    clientId?: ResolverInputTypes["uuid"] | undefined | null;
    cluster?: string | undefined | null;
    date?: ResolverInputTypes["date"] | undefined | null;
    fee?: ResolverInputTypes["float8"] | undefined | null;
    from?: string | undefined | null;
    hash?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    network?: string | undefined | null;
    nonce?: number | undefined | null;
    postBalances?: ResolverInputTypes["jsonb"] | undefined | null;
    preBalances?: ResolverInputTypes["jsonb"] | undefined | null;
    recentBlockhash?: string | undefined | null;
    signature?: ResolverInputTypes["jsonb"] | undefined | null;
    slot?: ResolverInputTypes["bigint"] | undefined | null;
    status?: string | undefined | null;
    to?: string | undefined | null;
  };
  /** aggregate sum on columns */
  ["transactions_sum_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by sum() on columns of table "transactions" */
  ["transactions_sum_order_by"]: {
    amount?: ResolverInputTypes["order_by"] | undefined | null;
    blockTime?: ResolverInputTypes["order_by"] | undefined | null;
    chainId?: ResolverInputTypes["order_by"] | undefined | null;
    fee?: ResolverInputTypes["order_by"] | undefined | null;
    nonce?: ResolverInputTypes["order_by"] | undefined | null;
    slot?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** update columns of table "transactions" */
  ["transactions_update_column"]: transactions_update_column;
  ["transactions_updates"]: {
    /** append existing jsonb value of filtered columns with new jsonb value */
    _append?:
      | ResolverInputTypes["transactions_append_input"]
      | undefined
      | null;
    /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
    _delete_at_path?:
      | ResolverInputTypes["transactions_delete_at_path_input"]
      | undefined
      | null;
    /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
    _delete_elem?:
      | ResolverInputTypes["transactions_delete_elem_input"]
      | undefined
      | null;
    /** delete key/value pair or string element. key/value pairs are matched based on their key value */
    _delete_key?:
      | ResolverInputTypes["transactions_delete_key_input"]
      | undefined
      | null;
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ResolverInputTypes["transactions_inc_input"] | undefined | null;
    /** prepend existing jsonb value of filtered columns with new jsonb value */
    _prepend?:
      | ResolverInputTypes["transactions_prepend_input"]
      | undefined
      | null;
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["transactions_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["transactions_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["transactions_var_pop_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by var_pop() on columns of table "transactions" */
  ["transactions_var_pop_order_by"]: {
    amount?: ResolverInputTypes["order_by"] | undefined | null;
    blockTime?: ResolverInputTypes["order_by"] | undefined | null;
    chainId?: ResolverInputTypes["order_by"] | undefined | null;
    fee?: ResolverInputTypes["order_by"] | undefined | null;
    nonce?: ResolverInputTypes["order_by"] | undefined | null;
    slot?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate var_samp on columns */
  ["transactions_var_samp_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by var_samp() on columns of table "transactions" */
  ["transactions_var_samp_order_by"]: {
    amount?: ResolverInputTypes["order_by"] | undefined | null;
    blockTime?: ResolverInputTypes["order_by"] | undefined | null;
    chainId?: ResolverInputTypes["order_by"] | undefined | null;
    fee?: ResolverInputTypes["order_by"] | undefined | null;
    nonce?: ResolverInputTypes["order_by"] | undefined | null;
    slot?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate variance on columns */
  ["transactions_variance_fields"]: AliasType<{
    amount?: boolean | `@${string}`;
    blockTime?: boolean | `@${string}`;
    chainId?: boolean | `@${string}`;
    fee?: boolean | `@${string}`;
    nonce?: boolean | `@${string}`;
    slot?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by variance() on columns of table "transactions" */
  ["transactions_variance_order_by"]: {
    amount?: ResolverInputTypes["order_by"] | undefined | null;
    blockTime?: ResolverInputTypes["order_by"] | undefined | null;
    chainId?: ResolverInputTypes["order_by"] | undefined | null;
    fee?: ResolverInputTypes["order_by"] | undefined | null;
    nonce?: ResolverInputTypes["order_by"] | undefined | null;
    slot?: ResolverInputTypes["order_by"] | undefined | null;
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
  /** wallets info for clients */
  ["wallet"]: AliasType<{
    accounts?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["account_select_column"]>
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
          | Array<ResolverInputTypes["account_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["account_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["account"],
    ];
    accounts_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["account_select_column"]>
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
          | Array<ResolverInputTypes["account_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["account_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["account_aggregate"],
    ];
    /** An object relationship */
    client?: ResolverInputTypes["client"];
    clientId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    secretPhase?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "wallet" */
  ["wallet_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["wallet_aggregate_fields"];
    nodes?: ResolverInputTypes["wallet"];
    __typename?: boolean | `@${string}`;
  }>;
  ["wallet_aggregate_bool_exp"]: {
    count?:
      | ResolverInputTypes["wallet_aggregate_bool_exp_count"]
      | undefined
      | null;
  };
  ["wallet_aggregate_bool_exp_count"]: {
    arguments?:
      | Array<ResolverInputTypes["wallet_select_column"]>
      | undefined
      | null;
    distinct?: boolean | undefined | null;
    filter?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
    predicate: ResolverInputTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "wallet" */
  ["wallet_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["wallet_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["wallet_max_fields"];
    min?: ResolverInputTypes["wallet_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** order by aggregate values of table "wallet" */
  ["wallet_aggregate_order_by"]: {
    count?: ResolverInputTypes["order_by"] | undefined | null;
    max?: ResolverInputTypes["wallet_max_order_by"] | undefined | null;
    min?: ResolverInputTypes["wallet_min_order_by"] | undefined | null;
  };
  /** input type for inserting array relation for remote table "wallet" */
  ["wallet_arr_rel_insert_input"]: {
    data: Array<ResolverInputTypes["wallet_insert_input"]>;
    /** upsert condition */
    on_conflict?: ResolverInputTypes["wallet_on_conflict"] | undefined | null;
  };
  /** Boolean expression to filter rows from the table "wallet". All fields are combined with a logical 'AND'. */
  ["wallet_bool_exp"]: {
    _and?: Array<ResolverInputTypes["wallet_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["wallet_bool_exp"]> | undefined | null;
    accounts?: ResolverInputTypes["account_bool_exp"] | undefined | null;
    accounts_aggregate?:
      | ResolverInputTypes["account_aggregate_bool_exp"]
      | undefined
      | null;
    client?: ResolverInputTypes["client_bool_exp"] | undefined | null;
    clientId?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    secretPhase?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "wallet" */
  ["wallet_constraint"]: wallet_constraint;
  /** input type for inserting data into table "wallet" */
  ["wallet_insert_input"]: {
    accounts?:
      | ResolverInputTypes["account_arr_rel_insert_input"]
      | undefined
      | null;
    client?:
      | ResolverInputTypes["client_obj_rel_insert_input"]
      | undefined
      | null;
    clientId?: ResolverInputTypes["uuid"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    secretPhase?: string | undefined | null;
  };
  /** aggregate max on columns */
  ["wallet_max_fields"]: AliasType<{
    clientId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    secretPhase?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by max() on columns of table "wallet" */
  ["wallet_max_order_by"]: {
    clientId?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    secretPhase?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** aggregate min on columns */
  ["wallet_min_fields"]: AliasType<{
    clientId?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    secretPhase?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** order by min() on columns of table "wallet" */
  ["wallet_min_order_by"]: {
    clientId?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    secretPhase?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** response of any mutation on the table "wallet" */
  ["wallet_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["wallet"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "wallet" */
  ["wallet_obj_rel_insert_input"]: {
    data: ResolverInputTypes["wallet_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["wallet_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "wallet" */
  ["wallet_on_conflict"]: {
    constraint: ResolverInputTypes["wallet_constraint"];
    update_columns: Array<ResolverInputTypes["wallet_update_column"]>;
    where?: ResolverInputTypes["wallet_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "wallet". */
  ["wallet_order_by"]: {
    accounts_aggregate?:
      | ResolverInputTypes["account_aggregate_order_by"]
      | undefined
      | null;
    client?: ResolverInputTypes["client_order_by"] | undefined | null;
    clientId?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    secretPhase?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: wallet */
  ["wallet_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "wallet" */
  ["wallet_select_column"]: wallet_select_column;
  /** input type for updating data in table "wallet" */
  ["wallet_set_input"]: {
    clientId?: ResolverInputTypes["uuid"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    secretPhase?: string | undefined | null;
  };
  /** Streaming cursor of the table "wallet" */
  ["wallet_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["wallet_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["wallet_stream_cursor_value_input"]: {
    clientId?: ResolverInputTypes["uuid"] | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    secretPhase?: string | undefined | null;
  };
  /** update columns of table "wallet" */
  ["wallet_update_column"]: wallet_update_column;
  ["wallet_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["wallet_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["wallet_bool_exp"];
  };
};

export type ModelTypes = {
  ["schema"]: {
    query?: ModelTypes["query_root"] | undefined;
    mutation?: ModelTypes["mutation_root"] | undefined;
    subscription?: ModelTypes["subscription_root"] | undefined;
  };
  /** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
  ["Boolean_comparison_exp"]: {
    _eq?: boolean | undefined;
    _gt?: boolean | undefined;
    _gte?: boolean | undefined;
    _in?: Array<boolean> | undefined;
    _is_null?: boolean | undefined;
    _lt?: boolean | undefined;
    _lte?: boolean | undefined;
    _neq?: boolean | undefined;
    _nin?: Array<boolean> | undefined;
  };
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined;
    _gt?: number | undefined;
    _gte?: number | undefined;
    _in?: Array<number> | undefined;
    _is_null?: boolean | undefined;
    _lt?: number | undefined;
    _lte?: number | undefined;
    _neq?: number | undefined;
    _nin?: Array<number> | undefined;
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
  /** accounts in a wallet */
  ["account"]: {
    /** An object relationship */
    bitcoin?: ModelTypes["bitcoin"] | undefined;
    /** An object relationship */
    client: ModelTypes["client"];
    clientId: ModelTypes["uuid"];
    /** An object relationship */
    eth?: ModelTypes["eth"] | undefined;
    id: ModelTypes["uuid"];
    name: string;
    /** An object relationship */
    sol?: ModelTypes["sol"] | undefined;
    /** An object relationship */
    wallet: ModelTypes["wallet"];
    walletId: ModelTypes["uuid"];
  };
  /** aggregated selection of "account" */
  ["account_aggregate"]: {
    aggregate?: ModelTypes["account_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["account"]>;
  };
  ["account_aggregate_bool_exp"]: {
    count?: ModelTypes["account_aggregate_bool_exp_count"] | undefined;
  };
  ["account_aggregate_bool_exp_count"]: {
    arguments?: Array<ModelTypes["account_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: ModelTypes["account_bool_exp"] | undefined;
    predicate: ModelTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "account" */
  ["account_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["account_max_fields"] | undefined;
    min?: ModelTypes["account_min_fields"] | undefined;
  };
  /** order by aggregate values of table "account" */
  ["account_aggregate_order_by"]: {
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["account_max_order_by"] | undefined;
    min?: ModelTypes["account_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "account" */
  ["account_arr_rel_insert_input"]: {
    data: Array<ModelTypes["account_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["account_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "account". All fields are combined with a logical 'AND'. */
  ["account_bool_exp"]: {
    _and?: Array<ModelTypes["account_bool_exp"]> | undefined;
    _not?: ModelTypes["account_bool_exp"] | undefined;
    _or?: Array<ModelTypes["account_bool_exp"]> | undefined;
    bitcoin?: ModelTypes["bitcoin_bool_exp"] | undefined;
    client?: ModelTypes["client_bool_exp"] | undefined;
    clientId?: ModelTypes["uuid_comparison_exp"] | undefined;
    eth?: ModelTypes["eth_bool_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    name?: ModelTypes["String_comparison_exp"] | undefined;
    sol?: ModelTypes["sol_bool_exp"] | undefined;
    wallet?: ModelTypes["wallet_bool_exp"] | undefined;
    walletId?: ModelTypes["uuid_comparison_exp"] | undefined;
  };
  ["account_constraint"]: account_constraint;
  /** input type for inserting data into table "account" */
  ["account_insert_input"]: {
    bitcoin?: ModelTypes["bitcoin_obj_rel_insert_input"] | undefined;
    client?: ModelTypes["client_obj_rel_insert_input"] | undefined;
    clientId?: ModelTypes["uuid"] | undefined;
    eth?: ModelTypes["eth_obj_rel_insert_input"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    name?: string | undefined;
    sol?: ModelTypes["sol_obj_rel_insert_input"] | undefined;
    wallet?: ModelTypes["wallet_obj_rel_insert_input"] | undefined;
    walletId?: ModelTypes["uuid"] | undefined;
  };
  /** aggregate max on columns */
  ["account_max_fields"]: {
    clientId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    name?: string | undefined;
    walletId?: ModelTypes["uuid"] | undefined;
  };
  /** order by max() on columns of table "account" */
  ["account_max_order_by"]: {
    clientId?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    name?: ModelTypes["order_by"] | undefined;
    walletId?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["account_min_fields"]: {
    clientId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    name?: string | undefined;
    walletId?: ModelTypes["uuid"] | undefined;
  };
  /** order by min() on columns of table "account" */
  ["account_min_order_by"]: {
    clientId?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    name?: ModelTypes["order_by"] | undefined;
    walletId?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "account" */
  ["account_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["account"]>;
  };
  /** input type for inserting object relation for remote table "account" */
  ["account_obj_rel_insert_input"]: {
    data: ModelTypes["account_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["account_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "account" */
  ["account_on_conflict"]: {
    constraint: ModelTypes["account_constraint"];
    update_columns: Array<ModelTypes["account_update_column"]>;
    where?: ModelTypes["account_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "account". */
  ["account_order_by"]: {
    bitcoin?: ModelTypes["bitcoin_order_by"] | undefined;
    client?: ModelTypes["client_order_by"] | undefined;
    clientId?: ModelTypes["order_by"] | undefined;
    eth?: ModelTypes["eth_order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    name?: ModelTypes["order_by"] | undefined;
    sol?: ModelTypes["sol_order_by"] | undefined;
    wallet?: ModelTypes["wallet_order_by"] | undefined;
    walletId?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: account */
  ["account_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["account_select_column"]: account_select_column;
  /** input type for updating data in table "account" */
  ["account_set_input"]: {
    clientId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    name?: string | undefined;
    walletId?: ModelTypes["uuid"] | undefined;
  };
  /** Streaming cursor of the table "account" */
  ["account_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["account_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["account_stream_cursor_value_input"]: {
    clientId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    name?: string | undefined;
    walletId?: ModelTypes["uuid"] | undefined;
  };
  ["account_update_column"]: account_update_column;
  ["account_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["account_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["account_bool_exp"];
  };
  /** different chain and there address */
  ["address"]: {
    bitcoin?: string | undefined;
    /** An object relationship */
    client: ModelTypes["client"];
    client_id: ModelTypes["uuid"];
    eth: string;
    id: ModelTypes["uuid"];
    sol: string;
    usdc?: string | undefined;
  };
  /** aggregated selection of "address" */
  ["address_aggregate"]: {
    aggregate?: ModelTypes["address_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["address"]>;
  };
  /** aggregate fields of "address" */
  ["address_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["address_max_fields"] | undefined;
    min?: ModelTypes["address_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "address". All fields are combined with a logical 'AND'. */
  ["address_bool_exp"]: {
    _and?: Array<ModelTypes["address_bool_exp"]> | undefined;
    _not?: ModelTypes["address_bool_exp"] | undefined;
    _or?: Array<ModelTypes["address_bool_exp"]> | undefined;
    bitcoin?: ModelTypes["String_comparison_exp"] | undefined;
    client?: ModelTypes["client_bool_exp"] | undefined;
    client_id?: ModelTypes["uuid_comparison_exp"] | undefined;
    eth?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    sol?: ModelTypes["String_comparison_exp"] | undefined;
    usdc?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["address_constraint"]: address_constraint;
  /** input type for inserting data into table "address" */
  ["address_insert_input"]: {
    bitcoin?: string | undefined;
    client?: ModelTypes["client_obj_rel_insert_input"] | undefined;
    client_id?: ModelTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** aggregate max on columns */
  ["address_max_fields"]: {
    bitcoin?: string | undefined;
    client_id?: ModelTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** aggregate min on columns */
  ["address_min_fields"]: {
    bitcoin?: string | undefined;
    client_id?: ModelTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** response of any mutation on the table "address" */
  ["address_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["address"]>;
  };
  /** input type for inserting object relation for remote table "address" */
  ["address_obj_rel_insert_input"]: {
    data: ModelTypes["address_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["address_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "address" */
  ["address_on_conflict"]: {
    constraint: ModelTypes["address_constraint"];
    update_columns: Array<ModelTypes["address_update_column"]>;
    where?: ModelTypes["address_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "address". */
  ["address_order_by"]: {
    bitcoin?: ModelTypes["order_by"] | undefined;
    client?: ModelTypes["client_order_by"] | undefined;
    client_id?: ModelTypes["order_by"] | undefined;
    eth?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    sol?: ModelTypes["order_by"] | undefined;
    usdc?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: address */
  ["address_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["address_select_column"]: address_select_column;
  /** input type for updating data in table "address" */
  ["address_set_input"]: {
    bitcoin?: string | undefined;
    client_id?: ModelTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** Streaming cursor of the table "address" */
  ["address_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["address_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["address_stream_cursor_value_input"]: {
    bitcoin?: string | undefined;
    client_id?: ModelTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  ["address_update_column"]: address_update_column;
  ["address_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["address_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["address_bool_exp"];
  };
  ["bigint"]: any;
  /** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
  ["bigint_comparison_exp"]: {
    _eq?: ModelTypes["bigint"] | undefined;
    _gt?: ModelTypes["bigint"] | undefined;
    _gte?: ModelTypes["bigint"] | undefined;
    _in?: Array<ModelTypes["bigint"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: ModelTypes["bigint"] | undefined;
    _lte?: ModelTypes["bigint"] | undefined;
    _neq?: ModelTypes["bigint"] | undefined;
    _nin?: Array<ModelTypes["bigint"]> | undefined;
  };
  /** bticoin address for client wallets */
  ["bitcoin"]: {
    /** An object relationship */
    account: ModelTypes["account"];
    accountId: ModelTypes["uuid"];
    id: ModelTypes["uuid"];
    mainnetBtc: ModelTypes["float8"];
    privateKey: string;
    publicKey: string;
    regtestBtc: ModelTypes["float8"];
    textnetBtc: ModelTypes["float8"];
  };
  /** aggregated selection of "bitcoin" */
  ["bitcoin_aggregate"]: {
    aggregate?: ModelTypes["bitcoin_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["bitcoin"]>;
  };
  /** aggregate fields of "bitcoin" */
  ["bitcoin_aggregate_fields"]: {
    avg?: ModelTypes["bitcoin_avg_fields"] | undefined;
    count: number;
    max?: ModelTypes["bitcoin_max_fields"] | undefined;
    min?: ModelTypes["bitcoin_min_fields"] | undefined;
    stddev?: ModelTypes["bitcoin_stddev_fields"] | undefined;
    stddev_pop?: ModelTypes["bitcoin_stddev_pop_fields"] | undefined;
    stddev_samp?: ModelTypes["bitcoin_stddev_samp_fields"] | undefined;
    sum?: ModelTypes["bitcoin_sum_fields"] | undefined;
    var_pop?: ModelTypes["bitcoin_var_pop_fields"] | undefined;
    var_samp?: ModelTypes["bitcoin_var_samp_fields"] | undefined;
    variance?: ModelTypes["bitcoin_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["bitcoin_avg_fields"]: {
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "bitcoin". All fields are combined with a logical 'AND'. */
  ["bitcoin_bool_exp"]: {
    _and?: Array<ModelTypes["bitcoin_bool_exp"]> | undefined;
    _not?: ModelTypes["bitcoin_bool_exp"] | undefined;
    _or?: Array<ModelTypes["bitcoin_bool_exp"]> | undefined;
    account?: ModelTypes["account_bool_exp"] | undefined;
    accountId?: ModelTypes["uuid_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    mainnetBtc?: ModelTypes["float8_comparison_exp"] | undefined;
    privateKey?: ModelTypes["String_comparison_exp"] | undefined;
    publicKey?: ModelTypes["String_comparison_exp"] | undefined;
    regtestBtc?: ModelTypes["float8_comparison_exp"] | undefined;
    textnetBtc?: ModelTypes["float8_comparison_exp"] | undefined;
  };
  ["bitcoin_constraint"]: bitcoin_constraint;
  /** input type for incrementing numeric columns in table "bitcoin" */
  ["bitcoin_inc_input"]: {
    mainnetBtc?: ModelTypes["float8"] | undefined;
    regtestBtc?: ModelTypes["float8"] | undefined;
    textnetBtc?: ModelTypes["float8"] | undefined;
  };
  /** input type for inserting data into table "bitcoin" */
  ["bitcoin_insert_input"]: {
    account?: ModelTypes["account_obj_rel_insert_input"] | undefined;
    accountId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    mainnetBtc?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    regtestBtc?: ModelTypes["float8"] | undefined;
    textnetBtc?: ModelTypes["float8"] | undefined;
  };
  /** aggregate max on columns */
  ["bitcoin_max_fields"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    mainnetBtc?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    regtestBtc?: ModelTypes["float8"] | undefined;
    textnetBtc?: ModelTypes["float8"] | undefined;
  };
  /** aggregate min on columns */
  ["bitcoin_min_fields"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    mainnetBtc?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    regtestBtc?: ModelTypes["float8"] | undefined;
    textnetBtc?: ModelTypes["float8"] | undefined;
  };
  /** response of any mutation on the table "bitcoin" */
  ["bitcoin_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["bitcoin"]>;
  };
  /** input type for inserting object relation for remote table "bitcoin" */
  ["bitcoin_obj_rel_insert_input"]: {
    data: ModelTypes["bitcoin_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["bitcoin_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "bitcoin" */
  ["bitcoin_on_conflict"]: {
    constraint: ModelTypes["bitcoin_constraint"];
    update_columns: Array<ModelTypes["bitcoin_update_column"]>;
    where?: ModelTypes["bitcoin_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "bitcoin". */
  ["bitcoin_order_by"]: {
    account?: ModelTypes["account_order_by"] | undefined;
    accountId?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    mainnetBtc?: ModelTypes["order_by"] | undefined;
    privateKey?: ModelTypes["order_by"] | undefined;
    publicKey?: ModelTypes["order_by"] | undefined;
    regtestBtc?: ModelTypes["order_by"] | undefined;
    textnetBtc?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: bitcoin */
  ["bitcoin_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["bitcoin_select_column"]: bitcoin_select_column;
  /** input type for updating data in table "bitcoin" */
  ["bitcoin_set_input"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    mainnetBtc?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    regtestBtc?: ModelTypes["float8"] | undefined;
    textnetBtc?: ModelTypes["float8"] | undefined;
  };
  /** aggregate stddev on columns */
  ["bitcoin_stddev_fields"]: {
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["bitcoin_stddev_pop_fields"]: {
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["bitcoin_stddev_samp_fields"]: {
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** Streaming cursor of the table "bitcoin" */
  ["bitcoin_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["bitcoin_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["bitcoin_stream_cursor_value_input"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    mainnetBtc?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    regtestBtc?: ModelTypes["float8"] | undefined;
    textnetBtc?: ModelTypes["float8"] | undefined;
  };
  /** aggregate sum on columns */
  ["bitcoin_sum_fields"]: {
    mainnetBtc?: ModelTypes["float8"] | undefined;
    regtestBtc?: ModelTypes["float8"] | undefined;
    textnetBtc?: ModelTypes["float8"] | undefined;
  };
  ["bitcoin_update_column"]: bitcoin_update_column;
  ["bitcoin_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["bitcoin_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["bitcoin_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["bitcoin_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["bitcoin_var_pop_fields"]: {
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["bitcoin_var_samp_fields"]: {
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** aggregate variance on columns */
  ["bitcoin_variance_fields"]: {
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** subscriber for paybox */
  ["client"]: {
    /** An array relationship */
    accounts: Array<ModelTypes["account"]>;
    /** An aggregate relationship */
    accounts_aggregate: ModelTypes["account_aggregate"];
    /** An object relationship */
    address?: ModelTypes["address"] | undefined;
    email: string;
    firstname?: string | undefined;
    id: ModelTypes["uuid"];
    lastname?: string | undefined;
    mobile?: ModelTypes["bigint"] | undefined;
    password: string;
    /** An array relationship */
    transactions: Array<ModelTypes["transactions"]>;
    /** An aggregate relationship */
    transactions_aggregate: ModelTypes["transactions_aggregate"];
    username?: string | undefined;
    valid: boolean;
    /** An array relationship */
    wallets: Array<ModelTypes["wallet"]>;
    /** An aggregate relationship */
    wallets_aggregate: ModelTypes["wallet_aggregate"];
  };
  /** aggregated selection of "client" */
  ["client_aggregate"]: {
    aggregate?: ModelTypes["client_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["client"]>;
  };
  /** aggregate fields of "client" */
  ["client_aggregate_fields"]: {
    avg?: ModelTypes["client_avg_fields"] | undefined;
    count: number;
    max?: ModelTypes["client_max_fields"] | undefined;
    min?: ModelTypes["client_min_fields"] | undefined;
    stddev?: ModelTypes["client_stddev_fields"] | undefined;
    stddev_pop?: ModelTypes["client_stddev_pop_fields"] | undefined;
    stddev_samp?: ModelTypes["client_stddev_samp_fields"] | undefined;
    sum?: ModelTypes["client_sum_fields"] | undefined;
    var_pop?: ModelTypes["client_var_pop_fields"] | undefined;
    var_samp?: ModelTypes["client_var_samp_fields"] | undefined;
    variance?: ModelTypes["client_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["client_avg_fields"]: {
    mobile?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "client". All fields are combined with a logical 'AND'. */
  ["client_bool_exp"]: {
    _and?: Array<ModelTypes["client_bool_exp"]> | undefined;
    _not?: ModelTypes["client_bool_exp"] | undefined;
    _or?: Array<ModelTypes["client_bool_exp"]> | undefined;
    accounts?: ModelTypes["account_bool_exp"] | undefined;
    accounts_aggregate?: ModelTypes["account_aggregate_bool_exp"] | undefined;
    address?: ModelTypes["address_bool_exp"] | undefined;
    email?: ModelTypes["String_comparison_exp"] | undefined;
    firstname?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    lastname?: ModelTypes["String_comparison_exp"] | undefined;
    mobile?: ModelTypes["bigint_comparison_exp"] | undefined;
    password?: ModelTypes["String_comparison_exp"] | undefined;
    transactions?: ModelTypes["transactions_bool_exp"] | undefined;
    transactions_aggregate?:
      | ModelTypes["transactions_aggregate_bool_exp"]
      | undefined;
    username?: ModelTypes["String_comparison_exp"] | undefined;
    valid?: ModelTypes["Boolean_comparison_exp"] | undefined;
    wallets?: ModelTypes["wallet_bool_exp"] | undefined;
    wallets_aggregate?: ModelTypes["wallet_aggregate_bool_exp"] | undefined;
  };
  ["client_constraint"]: client_constraint;
  /** input type for incrementing numeric columns in table "client" */
  ["client_inc_input"]: {
    mobile?: ModelTypes["bigint"] | undefined;
  };
  /** input type for inserting data into table "client" */
  ["client_insert_input"]: {
    accounts?: ModelTypes["account_arr_rel_insert_input"] | undefined;
    address?: ModelTypes["address_obj_rel_insert_input"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: ModelTypes["bigint"] | undefined;
    password?: string | undefined;
    transactions?: ModelTypes["transactions_arr_rel_insert_input"] | undefined;
    username?: string | undefined;
    valid?: boolean | undefined;
    wallets?: ModelTypes["wallet_arr_rel_insert_input"] | undefined;
  };
  /** aggregate max on columns */
  ["client_max_fields"]: {
    email?: string | undefined;
    firstname?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: ModelTypes["bigint"] | undefined;
    password?: string | undefined;
    username?: string | undefined;
  };
  /** aggregate min on columns */
  ["client_min_fields"]: {
    email?: string | undefined;
    firstname?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: ModelTypes["bigint"] | undefined;
    password?: string | undefined;
    username?: string | undefined;
  };
  /** response of any mutation on the table "client" */
  ["client_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["client"]>;
  };
  /** input type for inserting object relation for remote table "client" */
  ["client_obj_rel_insert_input"]: {
    data: ModelTypes["client_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["client_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "client" */
  ["client_on_conflict"]: {
    constraint: ModelTypes["client_constraint"];
    update_columns: Array<ModelTypes["client_update_column"]>;
    where?: ModelTypes["client_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "client". */
  ["client_order_by"]: {
    accounts_aggregate?: ModelTypes["account_aggregate_order_by"] | undefined;
    address?: ModelTypes["address_order_by"] | undefined;
    email?: ModelTypes["order_by"] | undefined;
    firstname?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    lastname?: ModelTypes["order_by"] | undefined;
    mobile?: ModelTypes["order_by"] | undefined;
    password?: ModelTypes["order_by"] | undefined;
    transactions_aggregate?:
      | ModelTypes["transactions_aggregate_order_by"]
      | undefined;
    username?: ModelTypes["order_by"] | undefined;
    valid?: ModelTypes["order_by"] | undefined;
    wallets_aggregate?: ModelTypes["wallet_aggregate_order_by"] | undefined;
  };
  /** primary key columns input for table: client */
  ["client_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["client_select_column"]: client_select_column;
  /** input type for updating data in table "client" */
  ["client_set_input"]: {
    email?: string | undefined;
    firstname?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: ModelTypes["bigint"] | undefined;
    password?: string | undefined;
    username?: string | undefined;
    valid?: boolean | undefined;
  };
  /** aggregate stddev on columns */
  ["client_stddev_fields"]: {
    mobile?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["client_stddev_pop_fields"]: {
    mobile?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["client_stddev_samp_fields"]: {
    mobile?: number | undefined;
  };
  /** Streaming cursor of the table "client" */
  ["client_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["client_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["client_stream_cursor_value_input"]: {
    email?: string | undefined;
    firstname?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: ModelTypes["bigint"] | undefined;
    password?: string | undefined;
    username?: string | undefined;
    valid?: boolean | undefined;
  };
  /** aggregate sum on columns */
  ["client_sum_fields"]: {
    mobile?: ModelTypes["bigint"] | undefined;
  };
  ["client_update_column"]: client_update_column;
  ["client_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["client_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["client_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["client_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["client_var_pop_fields"]: {
    mobile?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["client_var_samp_fields"]: {
    mobile?: number | undefined;
  };
  /** aggregate variance on columns */
  ["client_variance_fields"]: {
    mobile?: number | undefined;
  };
  ["cursor_ordering"]: cursor_ordering;
  ["date"]: any;
  /** Boolean expression to compare columns of type "date". All fields are combined with logical 'AND'. */
  ["date_comparison_exp"]: {
    _eq?: ModelTypes["date"] | undefined;
    _gt?: ModelTypes["date"] | undefined;
    _gte?: ModelTypes["date"] | undefined;
    _in?: Array<ModelTypes["date"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: ModelTypes["date"] | undefined;
    _lte?: ModelTypes["date"] | undefined;
    _neq?: ModelTypes["date"] | undefined;
    _nin?: Array<ModelTypes["date"]> | undefined;
  };
  /** eth address and token for client wallets */
  ["eth"]: {
    /** An object relationship */
    account: ModelTypes["account"];
    accountId: ModelTypes["uuid"];
    goerliEth: ModelTypes["float8"];
    id: ModelTypes["uuid"];
    kovanEth: ModelTypes["float8"];
    mainnetEth: ModelTypes["float8"];
    privateKey: string;
    publicKey: string;
    rinkebyEth: ModelTypes["float8"];
    ropstenEth: ModelTypes["float8"];
    sepoliaEth: ModelTypes["float8"];
  };
  /** aggregated selection of "eth" */
  ["eth_aggregate"]: {
    aggregate?: ModelTypes["eth_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["eth"]>;
  };
  /** aggregate fields of "eth" */
  ["eth_aggregate_fields"]: {
    avg?: ModelTypes["eth_avg_fields"] | undefined;
    count: number;
    max?: ModelTypes["eth_max_fields"] | undefined;
    min?: ModelTypes["eth_min_fields"] | undefined;
    stddev?: ModelTypes["eth_stddev_fields"] | undefined;
    stddev_pop?: ModelTypes["eth_stddev_pop_fields"] | undefined;
    stddev_samp?: ModelTypes["eth_stddev_samp_fields"] | undefined;
    sum?: ModelTypes["eth_sum_fields"] | undefined;
    var_pop?: ModelTypes["eth_var_pop_fields"] | undefined;
    var_samp?: ModelTypes["eth_var_samp_fields"] | undefined;
    variance?: ModelTypes["eth_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["eth_avg_fields"]: {
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "eth". All fields are combined with a logical 'AND'. */
  ["eth_bool_exp"]: {
    _and?: Array<ModelTypes["eth_bool_exp"]> | undefined;
    _not?: ModelTypes["eth_bool_exp"] | undefined;
    _or?: Array<ModelTypes["eth_bool_exp"]> | undefined;
    account?: ModelTypes["account_bool_exp"] | undefined;
    accountId?: ModelTypes["uuid_comparison_exp"] | undefined;
    goerliEth?: ModelTypes["float8_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    kovanEth?: ModelTypes["float8_comparison_exp"] | undefined;
    mainnetEth?: ModelTypes["float8_comparison_exp"] | undefined;
    privateKey?: ModelTypes["String_comparison_exp"] | undefined;
    publicKey?: ModelTypes["String_comparison_exp"] | undefined;
    rinkebyEth?: ModelTypes["float8_comparison_exp"] | undefined;
    ropstenEth?: ModelTypes["float8_comparison_exp"] | undefined;
    sepoliaEth?: ModelTypes["float8_comparison_exp"] | undefined;
  };
  ["eth_constraint"]: eth_constraint;
  /** input type for incrementing numeric columns in table "eth" */
  ["eth_inc_input"]: {
    goerliEth?: ModelTypes["float8"] | undefined;
    kovanEth?: ModelTypes["float8"] | undefined;
    mainnetEth?: ModelTypes["float8"] | undefined;
    rinkebyEth?: ModelTypes["float8"] | undefined;
    ropstenEth?: ModelTypes["float8"] | undefined;
    sepoliaEth?: ModelTypes["float8"] | undefined;
  };
  /** input type for inserting data into table "eth" */
  ["eth_insert_input"]: {
    account?: ModelTypes["account_obj_rel_insert_input"] | undefined;
    accountId?: ModelTypes["uuid"] | undefined;
    goerliEth?: ModelTypes["float8"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    kovanEth?: ModelTypes["float8"] | undefined;
    mainnetEth?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    rinkebyEth?: ModelTypes["float8"] | undefined;
    ropstenEth?: ModelTypes["float8"] | undefined;
    sepoliaEth?: ModelTypes["float8"] | undefined;
  };
  /** aggregate max on columns */
  ["eth_max_fields"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    goerliEth?: ModelTypes["float8"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    kovanEth?: ModelTypes["float8"] | undefined;
    mainnetEth?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    rinkebyEth?: ModelTypes["float8"] | undefined;
    ropstenEth?: ModelTypes["float8"] | undefined;
    sepoliaEth?: ModelTypes["float8"] | undefined;
  };
  /** aggregate min on columns */
  ["eth_min_fields"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    goerliEth?: ModelTypes["float8"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    kovanEth?: ModelTypes["float8"] | undefined;
    mainnetEth?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    rinkebyEth?: ModelTypes["float8"] | undefined;
    ropstenEth?: ModelTypes["float8"] | undefined;
    sepoliaEth?: ModelTypes["float8"] | undefined;
  };
  /** response of any mutation on the table "eth" */
  ["eth_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["eth"]>;
  };
  /** input type for inserting object relation for remote table "eth" */
  ["eth_obj_rel_insert_input"]: {
    data: ModelTypes["eth_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["eth_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "eth" */
  ["eth_on_conflict"]: {
    constraint: ModelTypes["eth_constraint"];
    update_columns: Array<ModelTypes["eth_update_column"]>;
    where?: ModelTypes["eth_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "eth". */
  ["eth_order_by"]: {
    account?: ModelTypes["account_order_by"] | undefined;
    accountId?: ModelTypes["order_by"] | undefined;
    goerliEth?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    kovanEth?: ModelTypes["order_by"] | undefined;
    mainnetEth?: ModelTypes["order_by"] | undefined;
    privateKey?: ModelTypes["order_by"] | undefined;
    publicKey?: ModelTypes["order_by"] | undefined;
    rinkebyEth?: ModelTypes["order_by"] | undefined;
    ropstenEth?: ModelTypes["order_by"] | undefined;
    sepoliaEth?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: eth */
  ["eth_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["eth_select_column"]: eth_select_column;
  /** input type for updating data in table "eth" */
  ["eth_set_input"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    goerliEth?: ModelTypes["float8"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    kovanEth?: ModelTypes["float8"] | undefined;
    mainnetEth?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    rinkebyEth?: ModelTypes["float8"] | undefined;
    ropstenEth?: ModelTypes["float8"] | undefined;
    sepoliaEth?: ModelTypes["float8"] | undefined;
  };
  /** aggregate stddev on columns */
  ["eth_stddev_fields"]: {
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["eth_stddev_pop_fields"]: {
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["eth_stddev_samp_fields"]: {
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** Streaming cursor of the table "eth" */
  ["eth_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["eth_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["eth_stream_cursor_value_input"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    goerliEth?: ModelTypes["float8"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    kovanEth?: ModelTypes["float8"] | undefined;
    mainnetEth?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    rinkebyEth?: ModelTypes["float8"] | undefined;
    ropstenEth?: ModelTypes["float8"] | undefined;
    sepoliaEth?: ModelTypes["float8"] | undefined;
  };
  /** aggregate sum on columns */
  ["eth_sum_fields"]: {
    goerliEth?: ModelTypes["float8"] | undefined;
    kovanEth?: ModelTypes["float8"] | undefined;
    mainnetEth?: ModelTypes["float8"] | undefined;
    rinkebyEth?: ModelTypes["float8"] | undefined;
    ropstenEth?: ModelTypes["float8"] | undefined;
    sepoliaEth?: ModelTypes["float8"] | undefined;
  };
  ["eth_update_column"]: eth_update_column;
  ["eth_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["eth_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["eth_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["eth_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["eth_var_pop_fields"]: {
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["eth_var_samp_fields"]: {
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** aggregate variance on columns */
  ["eth_variance_fields"]: {
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  ["float8"]: any;
  /** Boolean expression to compare columns of type "float8". All fields are combined with logical 'AND'. */
  ["float8_comparison_exp"]: {
    _eq?: ModelTypes["float8"] | undefined;
    _gt?: ModelTypes["float8"] | undefined;
    _gte?: ModelTypes["float8"] | undefined;
    _in?: Array<ModelTypes["float8"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: ModelTypes["float8"] | undefined;
    _lte?: ModelTypes["float8"] | undefined;
    _neq?: ModelTypes["float8"] | undefined;
    _nin?: Array<ModelTypes["float8"]> | undefined;
  };
  ["jsonb"]: any;
  ["jsonb_cast_exp"]: {
    String?: ModelTypes["String_comparison_exp"] | undefined;
  };
  /** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
  ["jsonb_comparison_exp"]: {
    _cast?: ModelTypes["jsonb_cast_exp"] | undefined;
    /** is the column contained in the given json value */
    _contained_in?: ModelTypes["jsonb"] | undefined;
    /** does the column contain the given json value at the top level */
    _contains?: ModelTypes["jsonb"] | undefined;
    _eq?: ModelTypes["jsonb"] | undefined;
    _gt?: ModelTypes["jsonb"] | undefined;
    _gte?: ModelTypes["jsonb"] | undefined;
    /** does the string exist as a top-level key in the column */
    _has_key?: string | undefined;
    /** do all of these strings exist as top-level keys in the column */
    _has_keys_all?: Array<string> | undefined;
    /** do any of these strings exist as top-level keys in the column */
    _has_keys_any?: Array<string> | undefined;
    _in?: Array<ModelTypes["jsonb"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: ModelTypes["jsonb"] | undefined;
    _lte?: ModelTypes["jsonb"] | undefined;
    _neq?: ModelTypes["jsonb"] | undefined;
    _nin?: Array<ModelTypes["jsonb"]> | undefined;
  };
  /** mutation root */
  ["mutation_root"]: {
    /** delete data from the table: "account" */
    delete_account?: ModelTypes["account_mutation_response"] | undefined;
    /** delete single row from the table: "account" */
    delete_account_by_pk?: ModelTypes["account"] | undefined;
    /** delete data from the table: "address" */
    delete_address?: ModelTypes["address_mutation_response"] | undefined;
    /** delete single row from the table: "address" */
    delete_address_by_pk?: ModelTypes["address"] | undefined;
    /** delete data from the table: "bitcoin" */
    delete_bitcoin?: ModelTypes["bitcoin_mutation_response"] | undefined;
    /** delete single row from the table: "bitcoin" */
    delete_bitcoin_by_pk?: ModelTypes["bitcoin"] | undefined;
    /** delete data from the table: "client" */
    delete_client?: ModelTypes["client_mutation_response"] | undefined;
    /** delete single row from the table: "client" */
    delete_client_by_pk?: ModelTypes["client"] | undefined;
    /** delete data from the table: "eth" */
    delete_eth?: ModelTypes["eth_mutation_response"] | undefined;
    /** delete single row from the table: "eth" */
    delete_eth_by_pk?: ModelTypes["eth"] | undefined;
    /** delete data from the table: "sol" */
    delete_sol?: ModelTypes["sol_mutation_response"] | undefined;
    /** delete single row from the table: "sol" */
    delete_sol_by_pk?: ModelTypes["sol"] | undefined;
    /** delete data from the table: "transactions" */
    delete_transactions?:
      | ModelTypes["transactions_mutation_response"]
      | undefined;
    /** delete single row from the table: "transactions" */
    delete_transactions_by_pk?: ModelTypes["transactions"] | undefined;
    /** delete data from the table: "wallet" */
    delete_wallet?: ModelTypes["wallet_mutation_response"] | undefined;
    /** delete single row from the table: "wallet" */
    delete_wallet_by_pk?: ModelTypes["wallet"] | undefined;
    /** insert data into the table: "account" */
    insert_account?: ModelTypes["account_mutation_response"] | undefined;
    /** insert a single row into the table: "account" */
    insert_account_one?: ModelTypes["account"] | undefined;
    /** insert data into the table: "address" */
    insert_address?: ModelTypes["address_mutation_response"] | undefined;
    /** insert a single row into the table: "address" */
    insert_address_one?: ModelTypes["address"] | undefined;
    /** insert data into the table: "bitcoin" */
    insert_bitcoin?: ModelTypes["bitcoin_mutation_response"] | undefined;
    /** insert a single row into the table: "bitcoin" */
    insert_bitcoin_one?: ModelTypes["bitcoin"] | undefined;
    /** insert data into the table: "client" */
    insert_client?: ModelTypes["client_mutation_response"] | undefined;
    /** insert a single row into the table: "client" */
    insert_client_one?: ModelTypes["client"] | undefined;
    /** insert data into the table: "eth" */
    insert_eth?: ModelTypes["eth_mutation_response"] | undefined;
    /** insert a single row into the table: "eth" */
    insert_eth_one?: ModelTypes["eth"] | undefined;
    /** insert data into the table: "sol" */
    insert_sol?: ModelTypes["sol_mutation_response"] | undefined;
    /** insert a single row into the table: "sol" */
    insert_sol_one?: ModelTypes["sol"] | undefined;
    /** insert data into the table: "transactions" */
    insert_transactions?:
      | ModelTypes["transactions_mutation_response"]
      | undefined;
    /** insert a single row into the table: "transactions" */
    insert_transactions_one?: ModelTypes["transactions"] | undefined;
    /** insert data into the table: "wallet" */
    insert_wallet?: ModelTypes["wallet_mutation_response"] | undefined;
    /** insert a single row into the table: "wallet" */
    insert_wallet_one?: ModelTypes["wallet"] | undefined;
    /** update data of the table: "account" */
    update_account?: ModelTypes["account_mutation_response"] | undefined;
    /** update single row of the table: "account" */
    update_account_by_pk?: ModelTypes["account"] | undefined;
    /** update multiples rows of table: "account" */
    update_account_many?:
      | Array<ModelTypes["account_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "address" */
    update_address?: ModelTypes["address_mutation_response"] | undefined;
    /** update single row of the table: "address" */
    update_address_by_pk?: ModelTypes["address"] | undefined;
    /** update multiples rows of table: "address" */
    update_address_many?:
      | Array<ModelTypes["address_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "bitcoin" */
    update_bitcoin?: ModelTypes["bitcoin_mutation_response"] | undefined;
    /** update single row of the table: "bitcoin" */
    update_bitcoin_by_pk?: ModelTypes["bitcoin"] | undefined;
    /** update multiples rows of table: "bitcoin" */
    update_bitcoin_many?:
      | Array<ModelTypes["bitcoin_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "client" */
    update_client?: ModelTypes["client_mutation_response"] | undefined;
    /** update single row of the table: "client" */
    update_client_by_pk?: ModelTypes["client"] | undefined;
    /** update multiples rows of table: "client" */
    update_client_many?:
      | Array<ModelTypes["client_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "eth" */
    update_eth?: ModelTypes["eth_mutation_response"] | undefined;
    /** update single row of the table: "eth" */
    update_eth_by_pk?: ModelTypes["eth"] | undefined;
    /** update multiples rows of table: "eth" */
    update_eth_many?:
      | Array<ModelTypes["eth_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "sol" */
    update_sol?: ModelTypes["sol_mutation_response"] | undefined;
    /** update single row of the table: "sol" */
    update_sol_by_pk?: ModelTypes["sol"] | undefined;
    /** update multiples rows of table: "sol" */
    update_sol_many?:
      | Array<ModelTypes["sol_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "transactions" */
    update_transactions?:
      | ModelTypes["transactions_mutation_response"]
      | undefined;
    /** update single row of the table: "transactions" */
    update_transactions_by_pk?: ModelTypes["transactions"] | undefined;
    /** update multiples rows of table: "transactions" */
    update_transactions_many?:
      | Array<ModelTypes["transactions_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "wallet" */
    update_wallet?: ModelTypes["wallet_mutation_response"] | undefined;
    /** update single row of the table: "wallet" */
    update_wallet_by_pk?: ModelTypes["wallet"] | undefined;
    /** update multiples rows of table: "wallet" */
    update_wallet_many?:
      | Array<ModelTypes["wallet_mutation_response"] | undefined>
      | undefined;
  };
  ["order_by"]: order_by;
  ["query_root"]: {
    /** fetch data from the table: "account" */
    account: Array<ModelTypes["account"]>;
    /** fetch aggregated fields from the table: "account" */
    account_aggregate: ModelTypes["account_aggregate"];
    /** fetch data from the table: "account" using primary key columns */
    account_by_pk?: ModelTypes["account"] | undefined;
    /** fetch data from the table: "address" */
    address: Array<ModelTypes["address"]>;
    /** fetch aggregated fields from the table: "address" */
    address_aggregate: ModelTypes["address_aggregate"];
    /** fetch data from the table: "address" using primary key columns */
    address_by_pk?: ModelTypes["address"] | undefined;
    /** fetch data from the table: "bitcoin" */
    bitcoin: Array<ModelTypes["bitcoin"]>;
    /** fetch aggregated fields from the table: "bitcoin" */
    bitcoin_aggregate: ModelTypes["bitcoin_aggregate"];
    /** fetch data from the table: "bitcoin" using primary key columns */
    bitcoin_by_pk?: ModelTypes["bitcoin"] | undefined;
    /** fetch data from the table: "client" */
    client: Array<ModelTypes["client"]>;
    /** fetch aggregated fields from the table: "client" */
    client_aggregate: ModelTypes["client_aggregate"];
    /** fetch data from the table: "client" using primary key columns */
    client_by_pk?: ModelTypes["client"] | undefined;
    /** fetch data from the table: "eth" */
    eth: Array<ModelTypes["eth"]>;
    /** fetch aggregated fields from the table: "eth" */
    eth_aggregate: ModelTypes["eth_aggregate"];
    /** fetch data from the table: "eth" using primary key columns */
    eth_by_pk?: ModelTypes["eth"] | undefined;
    /** fetch data from the table: "sol" */
    sol: Array<ModelTypes["sol"]>;
    /** fetch aggregated fields from the table: "sol" */
    sol_aggregate: ModelTypes["sol_aggregate"];
    /** fetch data from the table: "sol" using primary key columns */
    sol_by_pk?: ModelTypes["sol"] | undefined;
    /** An array relationship */
    transactions: Array<ModelTypes["transactions"]>;
    /** An aggregate relationship */
    transactions_aggregate: ModelTypes["transactions_aggregate"];
    /** fetch data from the table: "transactions" using primary key columns */
    transactions_by_pk?: ModelTypes["transactions"] | undefined;
    /** fetch data from the table: "wallet" */
    wallet: Array<ModelTypes["wallet"]>;
    /** fetch aggregated fields from the table: "wallet" */
    wallet_aggregate: ModelTypes["wallet_aggregate"];
    /** fetch data from the table: "wallet" using primary key columns */
    wallet_by_pk?: ModelTypes["wallet"] | undefined;
  };
  /** solana address for client wallets */
  ["sol"]: {
    /** An object relationship */
    account: ModelTypes["account"];
    accountId: ModelTypes["uuid"];
    devnetSol: ModelTypes["float8"];
    id: ModelTypes["uuid"];
    mainnetSol: ModelTypes["float8"];
    privateKey: string;
    publicKey: string;
    testnetSol: ModelTypes["float8"];
  };
  /** aggregated selection of "sol" */
  ["sol_aggregate"]: {
    aggregate?: ModelTypes["sol_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["sol"]>;
  };
  /** aggregate fields of "sol" */
  ["sol_aggregate_fields"]: {
    avg?: ModelTypes["sol_avg_fields"] | undefined;
    count: number;
    max?: ModelTypes["sol_max_fields"] | undefined;
    min?: ModelTypes["sol_min_fields"] | undefined;
    stddev?: ModelTypes["sol_stddev_fields"] | undefined;
    stddev_pop?: ModelTypes["sol_stddev_pop_fields"] | undefined;
    stddev_samp?: ModelTypes["sol_stddev_samp_fields"] | undefined;
    sum?: ModelTypes["sol_sum_fields"] | undefined;
    var_pop?: ModelTypes["sol_var_pop_fields"] | undefined;
    var_samp?: ModelTypes["sol_var_samp_fields"] | undefined;
    variance?: ModelTypes["sol_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["sol_avg_fields"]: {
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "sol". All fields are combined with a logical 'AND'. */
  ["sol_bool_exp"]: {
    _and?: Array<ModelTypes["sol_bool_exp"]> | undefined;
    _not?: ModelTypes["sol_bool_exp"] | undefined;
    _or?: Array<ModelTypes["sol_bool_exp"]> | undefined;
    account?: ModelTypes["account_bool_exp"] | undefined;
    accountId?: ModelTypes["uuid_comparison_exp"] | undefined;
    devnetSol?: ModelTypes["float8_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    mainnetSol?: ModelTypes["float8_comparison_exp"] | undefined;
    privateKey?: ModelTypes["String_comparison_exp"] | undefined;
    publicKey?: ModelTypes["String_comparison_exp"] | undefined;
    testnetSol?: ModelTypes["float8_comparison_exp"] | undefined;
  };
  ["sol_constraint"]: sol_constraint;
  /** input type for incrementing numeric columns in table "sol" */
  ["sol_inc_input"]: {
    devnetSol?: ModelTypes["float8"] | undefined;
    mainnetSol?: ModelTypes["float8"] | undefined;
    testnetSol?: ModelTypes["float8"] | undefined;
  };
  /** input type for inserting data into table "sol" */
  ["sol_insert_input"]: {
    account?: ModelTypes["account_obj_rel_insert_input"] | undefined;
    accountId?: ModelTypes["uuid"] | undefined;
    devnetSol?: ModelTypes["float8"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    mainnetSol?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    testnetSol?: ModelTypes["float8"] | undefined;
  };
  /** aggregate max on columns */
  ["sol_max_fields"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    devnetSol?: ModelTypes["float8"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    mainnetSol?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    testnetSol?: ModelTypes["float8"] | undefined;
  };
  /** aggregate min on columns */
  ["sol_min_fields"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    devnetSol?: ModelTypes["float8"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    mainnetSol?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    testnetSol?: ModelTypes["float8"] | undefined;
  };
  /** response of any mutation on the table "sol" */
  ["sol_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["sol"]>;
  };
  /** input type for inserting object relation for remote table "sol" */
  ["sol_obj_rel_insert_input"]: {
    data: ModelTypes["sol_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["sol_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "sol" */
  ["sol_on_conflict"]: {
    constraint: ModelTypes["sol_constraint"];
    update_columns: Array<ModelTypes["sol_update_column"]>;
    where?: ModelTypes["sol_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "sol". */
  ["sol_order_by"]: {
    account?: ModelTypes["account_order_by"] | undefined;
    accountId?: ModelTypes["order_by"] | undefined;
    devnetSol?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    mainnetSol?: ModelTypes["order_by"] | undefined;
    privateKey?: ModelTypes["order_by"] | undefined;
    publicKey?: ModelTypes["order_by"] | undefined;
    testnetSol?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: sol */
  ["sol_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["sol_select_column"]: sol_select_column;
  /** input type for updating data in table "sol" */
  ["sol_set_input"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    devnetSol?: ModelTypes["float8"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    mainnetSol?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    testnetSol?: ModelTypes["float8"] | undefined;
  };
  /** aggregate stddev on columns */
  ["sol_stddev_fields"]: {
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["sol_stddev_pop_fields"]: {
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["sol_stddev_samp_fields"]: {
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** Streaming cursor of the table "sol" */
  ["sol_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["sol_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["sol_stream_cursor_value_input"]: {
    accountId?: ModelTypes["uuid"] | undefined;
    devnetSol?: ModelTypes["float8"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    mainnetSol?: ModelTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    testnetSol?: ModelTypes["float8"] | undefined;
  };
  /** aggregate sum on columns */
  ["sol_sum_fields"]: {
    devnetSol?: ModelTypes["float8"] | undefined;
    mainnetSol?: ModelTypes["float8"] | undefined;
    testnetSol?: ModelTypes["float8"] | undefined;
  };
  ["sol_update_column"]: sol_update_column;
  ["sol_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["sol_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["sol_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["sol_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["sol_var_pop_fields"]: {
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["sol_var_samp_fields"]: {
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** aggregate variance on columns */
  ["sol_variance_fields"]: {
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  ["subscription_root"]: {
    /** fetch data from the table: "account" */
    account: Array<ModelTypes["account"]>;
    /** fetch aggregated fields from the table: "account" */
    account_aggregate: ModelTypes["account_aggregate"];
    /** fetch data from the table: "account" using primary key columns */
    account_by_pk?: ModelTypes["account"] | undefined;
    /** fetch data from the table in a streaming manner: "account" */
    account_stream: Array<ModelTypes["account"]>;
    /** fetch data from the table: "address" */
    address: Array<ModelTypes["address"]>;
    /** fetch aggregated fields from the table: "address" */
    address_aggregate: ModelTypes["address_aggregate"];
    /** fetch data from the table: "address" using primary key columns */
    address_by_pk?: ModelTypes["address"] | undefined;
    /** fetch data from the table in a streaming manner: "address" */
    address_stream: Array<ModelTypes["address"]>;
    /** fetch data from the table: "bitcoin" */
    bitcoin: Array<ModelTypes["bitcoin"]>;
    /** fetch aggregated fields from the table: "bitcoin" */
    bitcoin_aggregate: ModelTypes["bitcoin_aggregate"];
    /** fetch data from the table: "bitcoin" using primary key columns */
    bitcoin_by_pk?: ModelTypes["bitcoin"] | undefined;
    /** fetch data from the table in a streaming manner: "bitcoin" */
    bitcoin_stream: Array<ModelTypes["bitcoin"]>;
    /** fetch data from the table: "client" */
    client: Array<ModelTypes["client"]>;
    /** fetch aggregated fields from the table: "client" */
    client_aggregate: ModelTypes["client_aggregate"];
    /** fetch data from the table: "client" using primary key columns */
    client_by_pk?: ModelTypes["client"] | undefined;
    /** fetch data from the table in a streaming manner: "client" */
    client_stream: Array<ModelTypes["client"]>;
    /** fetch data from the table: "eth" */
    eth: Array<ModelTypes["eth"]>;
    /** fetch aggregated fields from the table: "eth" */
    eth_aggregate: ModelTypes["eth_aggregate"];
    /** fetch data from the table: "eth" using primary key columns */
    eth_by_pk?: ModelTypes["eth"] | undefined;
    /** fetch data from the table in a streaming manner: "eth" */
    eth_stream: Array<ModelTypes["eth"]>;
    /** fetch data from the table: "sol" */
    sol: Array<ModelTypes["sol"]>;
    /** fetch aggregated fields from the table: "sol" */
    sol_aggregate: ModelTypes["sol_aggregate"];
    /** fetch data from the table: "sol" using primary key columns */
    sol_by_pk?: ModelTypes["sol"] | undefined;
    /** fetch data from the table in a streaming manner: "sol" */
    sol_stream: Array<ModelTypes["sol"]>;
    /** An array relationship */
    transactions: Array<ModelTypes["transactions"]>;
    /** An aggregate relationship */
    transactions_aggregate: ModelTypes["transactions_aggregate"];
    /** fetch data from the table: "transactions" using primary key columns */
    transactions_by_pk?: ModelTypes["transactions"] | undefined;
    /** fetch data from the table in a streaming manner: "transactions" */
    transactions_stream: Array<ModelTypes["transactions"]>;
    /** fetch data from the table: "wallet" */
    wallet: Array<ModelTypes["wallet"]>;
    /** fetch aggregated fields from the table: "wallet" */
    wallet_aggregate: ModelTypes["wallet_aggregate"];
    /** fetch data from the table: "wallet" using primary key columns */
    wallet_by_pk?: ModelTypes["wallet"] | undefined;
    /** fetch data from the table in a streaming manner: "wallet" */
    wallet_stream: Array<ModelTypes["wallet"]>;
  };
  /** transactions table  */
  ["transactions"]: {
    amount: ModelTypes["float8"];
    blockTime: ModelTypes["bigint"];
    chainId?: ModelTypes["bigint"] | undefined;
    /** An object relationship */
    client: ModelTypes["client"];
    clientId: ModelTypes["uuid"];
    cluster?: string | undefined;
    date: ModelTypes["date"];
    fee: ModelTypes["float8"];
    from: string;
    hash?: string | undefined;
    id: ModelTypes["uuid"];
    network: string;
    nonce?: number | undefined;
    postBalances?: ModelTypes["jsonb"] | undefined;
    preBalances?: ModelTypes["jsonb"] | undefined;
    recentBlockhash: string;
    signature: ModelTypes["jsonb"];
    slot?: ModelTypes["bigint"] | undefined;
    status: string;
    to: string;
  };
  /** aggregated selection of "transactions" */
  ["transactions_aggregate"]: {
    aggregate?: ModelTypes["transactions_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["transactions"]>;
  };
  ["transactions_aggregate_bool_exp"]: {
    avg?: ModelTypes["transactions_aggregate_bool_exp_avg"] | undefined;
    corr?: ModelTypes["transactions_aggregate_bool_exp_corr"] | undefined;
    count?: ModelTypes["transactions_aggregate_bool_exp_count"] | undefined;
    covar_samp?:
      | ModelTypes["transactions_aggregate_bool_exp_covar_samp"]
      | undefined;
    max?: ModelTypes["transactions_aggregate_bool_exp_max"] | undefined;
    min?: ModelTypes["transactions_aggregate_bool_exp_min"] | undefined;
    stddev_samp?:
      | ModelTypes["transactions_aggregate_bool_exp_stddev_samp"]
      | undefined;
    sum?: ModelTypes["transactions_aggregate_bool_exp_sum"] | undefined;
    var_samp?:
      | ModelTypes["transactions_aggregate_bool_exp_var_samp"]
      | undefined;
  };
  ["transactions_aggregate_bool_exp_avg"]: {
    arguments: ModelTypes["transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: ModelTypes["transactions_bool_exp"] | undefined;
    predicate: ModelTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_corr"]: {
    arguments: ModelTypes["transactions_aggregate_bool_exp_corr_arguments"];
    distinct?: boolean | undefined;
    filter?: ModelTypes["transactions_bool_exp"] | undefined;
    predicate: ModelTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_corr_arguments"]: {
    X: ModelTypes["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"];
    Y: ModelTypes["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"];
  };
  ["transactions_aggregate_bool_exp_count"]: {
    arguments?: Array<ModelTypes["transactions_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: ModelTypes["transactions_bool_exp"] | undefined;
    predicate: ModelTypes["Int_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_covar_samp"]: {
    arguments: ModelTypes["transactions_aggregate_bool_exp_covar_samp_arguments"];
    distinct?: boolean | undefined;
    filter?: ModelTypes["transactions_bool_exp"] | undefined;
    predicate: ModelTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_covar_samp_arguments"]: {
    X: ModelTypes["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"];
    Y: ModelTypes["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"];
  };
  ["transactions_aggregate_bool_exp_max"]: {
    arguments: ModelTypes["transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: ModelTypes["transactions_bool_exp"] | undefined;
    predicate: ModelTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_min"]: {
    arguments: ModelTypes["transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: ModelTypes["transactions_bool_exp"] | undefined;
    predicate: ModelTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_stddev_samp"]: {
    arguments: ModelTypes["transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: ModelTypes["transactions_bool_exp"] | undefined;
    predicate: ModelTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_sum"]: {
    arguments: ModelTypes["transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: ModelTypes["transactions_bool_exp"] | undefined;
    predicate: ModelTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_var_samp"]: {
    arguments: ModelTypes["transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: ModelTypes["transactions_bool_exp"] | undefined;
    predicate: ModelTypes["float8_comparison_exp"];
  };
  /** aggregate fields of "transactions" */
  ["transactions_aggregate_fields"]: {
    avg?: ModelTypes["transactions_avg_fields"] | undefined;
    count: number;
    max?: ModelTypes["transactions_max_fields"] | undefined;
    min?: ModelTypes["transactions_min_fields"] | undefined;
    stddev?: ModelTypes["transactions_stddev_fields"] | undefined;
    stddev_pop?: ModelTypes["transactions_stddev_pop_fields"] | undefined;
    stddev_samp?: ModelTypes["transactions_stddev_samp_fields"] | undefined;
    sum?: ModelTypes["transactions_sum_fields"] | undefined;
    var_pop?: ModelTypes["transactions_var_pop_fields"] | undefined;
    var_samp?: ModelTypes["transactions_var_samp_fields"] | undefined;
    variance?: ModelTypes["transactions_variance_fields"] | undefined;
  };
  /** order by aggregate values of table "transactions" */
  ["transactions_aggregate_order_by"]: {
    avg?: ModelTypes["transactions_avg_order_by"] | undefined;
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["transactions_max_order_by"] | undefined;
    min?: ModelTypes["transactions_min_order_by"] | undefined;
    stddev?: ModelTypes["transactions_stddev_order_by"] | undefined;
    stddev_pop?: ModelTypes["transactions_stddev_pop_order_by"] | undefined;
    stddev_samp?: ModelTypes["transactions_stddev_samp_order_by"] | undefined;
    sum?: ModelTypes["transactions_sum_order_by"] | undefined;
    var_pop?: ModelTypes["transactions_var_pop_order_by"] | undefined;
    var_samp?: ModelTypes["transactions_var_samp_order_by"] | undefined;
    variance?: ModelTypes["transactions_variance_order_by"] | undefined;
  };
  /** append existing jsonb value of filtered columns with new jsonb value */
  ["transactions_append_input"]: {
    postBalances?: ModelTypes["jsonb"] | undefined;
    preBalances?: ModelTypes["jsonb"] | undefined;
    signature?: ModelTypes["jsonb"] | undefined;
  };
  /** input type for inserting array relation for remote table "transactions" */
  ["transactions_arr_rel_insert_input"]: {
    data: Array<ModelTypes["transactions_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["transactions_on_conflict"] | undefined;
  };
  /** aggregate avg on columns */
  ["transactions_avg_fields"]: {
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by avg() on columns of table "transactions" */
  ["transactions_avg_order_by"]: {
    amount?: ModelTypes["order_by"] | undefined;
    blockTime?: ModelTypes["order_by"] | undefined;
    chainId?: ModelTypes["order_by"] | undefined;
    fee?: ModelTypes["order_by"] | undefined;
    nonce?: ModelTypes["order_by"] | undefined;
    slot?: ModelTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "transactions". All fields are combined with a logical 'AND'. */
  ["transactions_bool_exp"]: {
    _and?: Array<ModelTypes["transactions_bool_exp"]> | undefined;
    _not?: ModelTypes["transactions_bool_exp"] | undefined;
    _or?: Array<ModelTypes["transactions_bool_exp"]> | undefined;
    amount?: ModelTypes["float8_comparison_exp"] | undefined;
    blockTime?: ModelTypes["bigint_comparison_exp"] | undefined;
    chainId?: ModelTypes["bigint_comparison_exp"] | undefined;
    client?: ModelTypes["client_bool_exp"] | undefined;
    clientId?: ModelTypes["uuid_comparison_exp"] | undefined;
    cluster?: ModelTypes["String_comparison_exp"] | undefined;
    date?: ModelTypes["date_comparison_exp"] | undefined;
    fee?: ModelTypes["float8_comparison_exp"] | undefined;
    from?: ModelTypes["String_comparison_exp"] | undefined;
    hash?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    network?: ModelTypes["String_comparison_exp"] | undefined;
    nonce?: ModelTypes["Int_comparison_exp"] | undefined;
    postBalances?: ModelTypes["jsonb_comparison_exp"] | undefined;
    preBalances?: ModelTypes["jsonb_comparison_exp"] | undefined;
    recentBlockhash?: ModelTypes["String_comparison_exp"] | undefined;
    signature?: ModelTypes["jsonb_comparison_exp"] | undefined;
    slot?: ModelTypes["bigint_comparison_exp"] | undefined;
    status?: ModelTypes["String_comparison_exp"] | undefined;
    to?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["transactions_constraint"]: transactions_constraint;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  ["transactions_delete_at_path_input"]: {
    postBalances?: Array<string> | undefined;
    preBalances?: Array<string> | undefined;
    signature?: Array<string> | undefined;
  };
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  ["transactions_delete_elem_input"]: {
    postBalances?: number | undefined;
    preBalances?: number | undefined;
    signature?: number | undefined;
  };
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  ["transactions_delete_key_input"]: {
    postBalances?: string | undefined;
    preBalances?: string | undefined;
    signature?: string | undefined;
  };
  /** input type for incrementing numeric columns in table "transactions" */
  ["transactions_inc_input"]: {
    amount?: ModelTypes["float8"] | undefined;
    blockTime?: ModelTypes["bigint"] | undefined;
    chainId?: ModelTypes["bigint"] | undefined;
    fee?: ModelTypes["float8"] | undefined;
    nonce?: number | undefined;
    slot?: ModelTypes["bigint"] | undefined;
  };
  /** input type for inserting data into table "transactions" */
  ["transactions_insert_input"]: {
    amount?: ModelTypes["float8"] | undefined;
    blockTime?: ModelTypes["bigint"] | undefined;
    chainId?: ModelTypes["bigint"] | undefined;
    client?: ModelTypes["client_obj_rel_insert_input"] | undefined;
    clientId?: ModelTypes["uuid"] | undefined;
    cluster?: string | undefined;
    date?: ModelTypes["date"] | undefined;
    fee?: ModelTypes["float8"] | undefined;
    from?: string | undefined;
    hash?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    network?: string | undefined;
    nonce?: number | undefined;
    postBalances?: ModelTypes["jsonb"] | undefined;
    preBalances?: ModelTypes["jsonb"] | undefined;
    recentBlockhash?: string | undefined;
    signature?: ModelTypes["jsonb"] | undefined;
    slot?: ModelTypes["bigint"] | undefined;
    status?: string | undefined;
    to?: string | undefined;
  };
  /** aggregate max on columns */
  ["transactions_max_fields"]: {
    amount?: ModelTypes["float8"] | undefined;
    blockTime?: ModelTypes["bigint"] | undefined;
    chainId?: ModelTypes["bigint"] | undefined;
    clientId?: ModelTypes["uuid"] | undefined;
    cluster?: string | undefined;
    date?: ModelTypes["date"] | undefined;
    fee?: ModelTypes["float8"] | undefined;
    from?: string | undefined;
    hash?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    network?: string | undefined;
    nonce?: number | undefined;
    recentBlockhash?: string | undefined;
    slot?: ModelTypes["bigint"] | undefined;
    status?: string | undefined;
    to?: string | undefined;
  };
  /** order by max() on columns of table "transactions" */
  ["transactions_max_order_by"]: {
    amount?: ModelTypes["order_by"] | undefined;
    blockTime?: ModelTypes["order_by"] | undefined;
    chainId?: ModelTypes["order_by"] | undefined;
    clientId?: ModelTypes["order_by"] | undefined;
    cluster?: ModelTypes["order_by"] | undefined;
    date?: ModelTypes["order_by"] | undefined;
    fee?: ModelTypes["order_by"] | undefined;
    from?: ModelTypes["order_by"] | undefined;
    hash?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    network?: ModelTypes["order_by"] | undefined;
    nonce?: ModelTypes["order_by"] | undefined;
    recentBlockhash?: ModelTypes["order_by"] | undefined;
    slot?: ModelTypes["order_by"] | undefined;
    status?: ModelTypes["order_by"] | undefined;
    to?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["transactions_min_fields"]: {
    amount?: ModelTypes["float8"] | undefined;
    blockTime?: ModelTypes["bigint"] | undefined;
    chainId?: ModelTypes["bigint"] | undefined;
    clientId?: ModelTypes["uuid"] | undefined;
    cluster?: string | undefined;
    date?: ModelTypes["date"] | undefined;
    fee?: ModelTypes["float8"] | undefined;
    from?: string | undefined;
    hash?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    network?: string | undefined;
    nonce?: number | undefined;
    recentBlockhash?: string | undefined;
    slot?: ModelTypes["bigint"] | undefined;
    status?: string | undefined;
    to?: string | undefined;
  };
  /** order by min() on columns of table "transactions" */
  ["transactions_min_order_by"]: {
    amount?: ModelTypes["order_by"] | undefined;
    blockTime?: ModelTypes["order_by"] | undefined;
    chainId?: ModelTypes["order_by"] | undefined;
    clientId?: ModelTypes["order_by"] | undefined;
    cluster?: ModelTypes["order_by"] | undefined;
    date?: ModelTypes["order_by"] | undefined;
    fee?: ModelTypes["order_by"] | undefined;
    from?: ModelTypes["order_by"] | undefined;
    hash?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    network?: ModelTypes["order_by"] | undefined;
    nonce?: ModelTypes["order_by"] | undefined;
    recentBlockhash?: ModelTypes["order_by"] | undefined;
    slot?: ModelTypes["order_by"] | undefined;
    status?: ModelTypes["order_by"] | undefined;
    to?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "transactions" */
  ["transactions_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["transactions"]>;
  };
  /** on_conflict condition type for table "transactions" */
  ["transactions_on_conflict"]: {
    constraint: ModelTypes["transactions_constraint"];
    update_columns: Array<ModelTypes["transactions_update_column"]>;
    where?: ModelTypes["transactions_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "transactions". */
  ["transactions_order_by"]: {
    amount?: ModelTypes["order_by"] | undefined;
    blockTime?: ModelTypes["order_by"] | undefined;
    chainId?: ModelTypes["order_by"] | undefined;
    client?: ModelTypes["client_order_by"] | undefined;
    clientId?: ModelTypes["order_by"] | undefined;
    cluster?: ModelTypes["order_by"] | undefined;
    date?: ModelTypes["order_by"] | undefined;
    fee?: ModelTypes["order_by"] | undefined;
    from?: ModelTypes["order_by"] | undefined;
    hash?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    network?: ModelTypes["order_by"] | undefined;
    nonce?: ModelTypes["order_by"] | undefined;
    postBalances?: ModelTypes["order_by"] | undefined;
    preBalances?: ModelTypes["order_by"] | undefined;
    recentBlockhash?: ModelTypes["order_by"] | undefined;
    signature?: ModelTypes["order_by"] | undefined;
    slot?: ModelTypes["order_by"] | undefined;
    status?: ModelTypes["order_by"] | undefined;
    to?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: transactions */
  ["transactions_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  ["transactions_prepend_input"]: {
    postBalances?: ModelTypes["jsonb"] | undefined;
    preBalances?: ModelTypes["jsonb"] | undefined;
    signature?: ModelTypes["jsonb"] | undefined;
  };
  ["transactions_select_column"]: transactions_select_column;
  ["transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns;
  ["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns;
  ["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns;
  ["transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns;
  ["transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns;
  ["transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns;
  ["transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns;
  ["transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns;
  /** input type for updating data in table "transactions" */
  ["transactions_set_input"]: {
    amount?: ModelTypes["float8"] | undefined;
    blockTime?: ModelTypes["bigint"] | undefined;
    chainId?: ModelTypes["bigint"] | undefined;
    clientId?: ModelTypes["uuid"] | undefined;
    cluster?: string | undefined;
    date?: ModelTypes["date"] | undefined;
    fee?: ModelTypes["float8"] | undefined;
    from?: string | undefined;
    hash?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    network?: string | undefined;
    nonce?: number | undefined;
    postBalances?: ModelTypes["jsonb"] | undefined;
    preBalances?: ModelTypes["jsonb"] | undefined;
    recentBlockhash?: string | undefined;
    signature?: ModelTypes["jsonb"] | undefined;
    slot?: ModelTypes["bigint"] | undefined;
    status?: string | undefined;
    to?: string | undefined;
  };
  /** aggregate stddev on columns */
  ["transactions_stddev_fields"]: {
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by stddev() on columns of table "transactions" */
  ["transactions_stddev_order_by"]: {
    amount?: ModelTypes["order_by"] | undefined;
    blockTime?: ModelTypes["order_by"] | undefined;
    chainId?: ModelTypes["order_by"] | undefined;
    fee?: ModelTypes["order_by"] | undefined;
    nonce?: ModelTypes["order_by"] | undefined;
    slot?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["transactions_stddev_pop_fields"]: {
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by stddev_pop() on columns of table "transactions" */
  ["transactions_stddev_pop_order_by"]: {
    amount?: ModelTypes["order_by"] | undefined;
    blockTime?: ModelTypes["order_by"] | undefined;
    chainId?: ModelTypes["order_by"] | undefined;
    fee?: ModelTypes["order_by"] | undefined;
    nonce?: ModelTypes["order_by"] | undefined;
    slot?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["transactions_stddev_samp_fields"]: {
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by stddev_samp() on columns of table "transactions" */
  ["transactions_stddev_samp_order_by"]: {
    amount?: ModelTypes["order_by"] | undefined;
    blockTime?: ModelTypes["order_by"] | undefined;
    chainId?: ModelTypes["order_by"] | undefined;
    fee?: ModelTypes["order_by"] | undefined;
    nonce?: ModelTypes["order_by"] | undefined;
    slot?: ModelTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "transactions" */
  ["transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["transactions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["transactions_stream_cursor_value_input"]: {
    amount?: ModelTypes["float8"] | undefined;
    blockTime?: ModelTypes["bigint"] | undefined;
    chainId?: ModelTypes["bigint"] | undefined;
    clientId?: ModelTypes["uuid"] | undefined;
    cluster?: string | undefined;
    date?: ModelTypes["date"] | undefined;
    fee?: ModelTypes["float8"] | undefined;
    from?: string | undefined;
    hash?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    network?: string | undefined;
    nonce?: number | undefined;
    postBalances?: ModelTypes["jsonb"] | undefined;
    preBalances?: ModelTypes["jsonb"] | undefined;
    recentBlockhash?: string | undefined;
    signature?: ModelTypes["jsonb"] | undefined;
    slot?: ModelTypes["bigint"] | undefined;
    status?: string | undefined;
    to?: string | undefined;
  };
  /** aggregate sum on columns */
  ["transactions_sum_fields"]: {
    amount?: ModelTypes["float8"] | undefined;
    blockTime?: ModelTypes["bigint"] | undefined;
    chainId?: ModelTypes["bigint"] | undefined;
    fee?: ModelTypes["float8"] | undefined;
    nonce?: number | undefined;
    slot?: ModelTypes["bigint"] | undefined;
  };
  /** order by sum() on columns of table "transactions" */
  ["transactions_sum_order_by"]: {
    amount?: ModelTypes["order_by"] | undefined;
    blockTime?: ModelTypes["order_by"] | undefined;
    chainId?: ModelTypes["order_by"] | undefined;
    fee?: ModelTypes["order_by"] | undefined;
    nonce?: ModelTypes["order_by"] | undefined;
    slot?: ModelTypes["order_by"] | undefined;
  };
  ["transactions_update_column"]: transactions_update_column;
  ["transactions_updates"]: {
    /** append existing jsonb value of filtered columns with new jsonb value */
    _append?: ModelTypes["transactions_append_input"] | undefined;
    /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
    _delete_at_path?:
      | ModelTypes["transactions_delete_at_path_input"]
      | undefined;
    /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
    _delete_elem?: ModelTypes["transactions_delete_elem_input"] | undefined;
    /** delete key/value pair or string element. key/value pairs are matched based on their key value */
    _delete_key?: ModelTypes["transactions_delete_key_input"] | undefined;
    /** increments the numeric columns with given value of the filtered values */
    _inc?: ModelTypes["transactions_inc_input"] | undefined;
    /** prepend existing jsonb value of filtered columns with new jsonb value */
    _prepend?: ModelTypes["transactions_prepend_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["transactions_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["transactions_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["transactions_var_pop_fields"]: {
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by var_pop() on columns of table "transactions" */
  ["transactions_var_pop_order_by"]: {
    amount?: ModelTypes["order_by"] | undefined;
    blockTime?: ModelTypes["order_by"] | undefined;
    chainId?: ModelTypes["order_by"] | undefined;
    fee?: ModelTypes["order_by"] | undefined;
    nonce?: ModelTypes["order_by"] | undefined;
    slot?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate var_samp on columns */
  ["transactions_var_samp_fields"]: {
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by var_samp() on columns of table "transactions" */
  ["transactions_var_samp_order_by"]: {
    amount?: ModelTypes["order_by"] | undefined;
    blockTime?: ModelTypes["order_by"] | undefined;
    chainId?: ModelTypes["order_by"] | undefined;
    fee?: ModelTypes["order_by"] | undefined;
    nonce?: ModelTypes["order_by"] | undefined;
    slot?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate variance on columns */
  ["transactions_variance_fields"]: {
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by variance() on columns of table "transactions" */
  ["transactions_variance_order_by"]: {
    amount?: ModelTypes["order_by"] | undefined;
    blockTime?: ModelTypes["order_by"] | undefined;
    chainId?: ModelTypes["order_by"] | undefined;
    fee?: ModelTypes["order_by"] | undefined;
    nonce?: ModelTypes["order_by"] | undefined;
    slot?: ModelTypes["order_by"] | undefined;
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
  /** wallets info for clients */
  ["wallet"]: {
    /** An array relationship */
    accounts: Array<ModelTypes["account"]>;
    /** An aggregate relationship */
    accounts_aggregate: ModelTypes["account_aggregate"];
    /** An object relationship */
    client: ModelTypes["client"];
    clientId: ModelTypes["uuid"];
    id: ModelTypes["uuid"];
    secretPhase: string;
  };
  /** aggregated selection of "wallet" */
  ["wallet_aggregate"]: {
    aggregate?: ModelTypes["wallet_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["wallet"]>;
  };
  ["wallet_aggregate_bool_exp"]: {
    count?: ModelTypes["wallet_aggregate_bool_exp_count"] | undefined;
  };
  ["wallet_aggregate_bool_exp_count"]: {
    arguments?: Array<ModelTypes["wallet_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: ModelTypes["wallet_bool_exp"] | undefined;
    predicate: ModelTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "wallet" */
  ["wallet_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["wallet_max_fields"] | undefined;
    min?: ModelTypes["wallet_min_fields"] | undefined;
  };
  /** order by aggregate values of table "wallet" */
  ["wallet_aggregate_order_by"]: {
    count?: ModelTypes["order_by"] | undefined;
    max?: ModelTypes["wallet_max_order_by"] | undefined;
    min?: ModelTypes["wallet_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "wallet" */
  ["wallet_arr_rel_insert_input"]: {
    data: Array<ModelTypes["wallet_insert_input"]>;
    /** upsert condition */
    on_conflict?: ModelTypes["wallet_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "wallet". All fields are combined with a logical 'AND'. */
  ["wallet_bool_exp"]: {
    _and?: Array<ModelTypes["wallet_bool_exp"]> | undefined;
    _not?: ModelTypes["wallet_bool_exp"] | undefined;
    _or?: Array<ModelTypes["wallet_bool_exp"]> | undefined;
    accounts?: ModelTypes["account_bool_exp"] | undefined;
    accounts_aggregate?: ModelTypes["account_aggregate_bool_exp"] | undefined;
    client?: ModelTypes["client_bool_exp"] | undefined;
    clientId?: ModelTypes["uuid_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    secretPhase?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["wallet_constraint"]: wallet_constraint;
  /** input type for inserting data into table "wallet" */
  ["wallet_insert_input"]: {
    accounts?: ModelTypes["account_arr_rel_insert_input"] | undefined;
    client?: ModelTypes["client_obj_rel_insert_input"] | undefined;
    clientId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    secretPhase?: string | undefined;
  };
  /** aggregate max on columns */
  ["wallet_max_fields"]: {
    clientId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    secretPhase?: string | undefined;
  };
  /** order by max() on columns of table "wallet" */
  ["wallet_max_order_by"]: {
    clientId?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    secretPhase?: ModelTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["wallet_min_fields"]: {
    clientId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    secretPhase?: string | undefined;
  };
  /** order by min() on columns of table "wallet" */
  ["wallet_min_order_by"]: {
    clientId?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    secretPhase?: ModelTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "wallet" */
  ["wallet_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["wallet"]>;
  };
  /** input type for inserting object relation for remote table "wallet" */
  ["wallet_obj_rel_insert_input"]: {
    data: ModelTypes["wallet_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["wallet_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "wallet" */
  ["wallet_on_conflict"]: {
    constraint: ModelTypes["wallet_constraint"];
    update_columns: Array<ModelTypes["wallet_update_column"]>;
    where?: ModelTypes["wallet_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "wallet". */
  ["wallet_order_by"]: {
    accounts_aggregate?: ModelTypes["account_aggregate_order_by"] | undefined;
    client?: ModelTypes["client_order_by"] | undefined;
    clientId?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    secretPhase?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: wallet */
  ["wallet_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["wallet_select_column"]: wallet_select_column;
  /** input type for updating data in table "wallet" */
  ["wallet_set_input"]: {
    clientId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    secretPhase?: string | undefined;
  };
  /** Streaming cursor of the table "wallet" */
  ["wallet_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["wallet_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["wallet_stream_cursor_value_input"]: {
    clientId?: ModelTypes["uuid"] | undefined;
    id?: ModelTypes["uuid"] | undefined;
    secretPhase?: string | undefined;
  };
  ["wallet_update_column"]: wallet_update_column;
  ["wallet_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["wallet_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["wallet_bool_exp"];
  };
};

export type GraphQLTypes = {
  /** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
  ["Boolean_comparison_exp"]: {
    _eq?: boolean | undefined;
    _gt?: boolean | undefined;
    _gte?: boolean | undefined;
    _in?: Array<boolean> | undefined;
    _is_null?: boolean | undefined;
    _lt?: boolean | undefined;
    _lte?: boolean | undefined;
    _neq?: boolean | undefined;
    _nin?: Array<boolean> | undefined;
  };
  /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
  ["Int_comparison_exp"]: {
    _eq?: number | undefined;
    _gt?: number | undefined;
    _gte?: number | undefined;
    _in?: Array<number> | undefined;
    _is_null?: boolean | undefined;
    _lt?: number | undefined;
    _lte?: number | undefined;
    _neq?: number | undefined;
    _nin?: Array<number> | undefined;
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
  /** accounts in a wallet */
  ["account"]: {
    __typename: "account";
    /** An object relationship */
    bitcoin?: GraphQLTypes["bitcoin"] | undefined;
    /** An object relationship */
    client: GraphQLTypes["client"];
    clientId: GraphQLTypes["uuid"];
    /** An object relationship */
    eth?: GraphQLTypes["eth"] | undefined;
    id: GraphQLTypes["uuid"];
    name: string;
    /** An object relationship */
    sol?: GraphQLTypes["sol"] | undefined;
    /** An object relationship */
    wallet: GraphQLTypes["wallet"];
    walletId: GraphQLTypes["uuid"];
  };
  /** aggregated selection of "account" */
  ["account_aggregate"]: {
    __typename: "account_aggregate";
    aggregate?: GraphQLTypes["account_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["account"]>;
  };
  ["account_aggregate_bool_exp"]: {
    count?: GraphQLTypes["account_aggregate_bool_exp_count"] | undefined;
  };
  ["account_aggregate_bool_exp_count"]: {
    arguments?: Array<GraphQLTypes["account_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["account_bool_exp"] | undefined;
    predicate: GraphQLTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "account" */
  ["account_aggregate_fields"]: {
    __typename: "account_aggregate_fields";
    count: number;
    max?: GraphQLTypes["account_max_fields"] | undefined;
    min?: GraphQLTypes["account_min_fields"] | undefined;
  };
  /** order by aggregate values of table "account" */
  ["account_aggregate_order_by"]: {
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["account_max_order_by"] | undefined;
    min?: GraphQLTypes["account_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "account" */
  ["account_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["account_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["account_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "account". All fields are combined with a logical 'AND'. */
  ["account_bool_exp"]: {
    _and?: Array<GraphQLTypes["account_bool_exp"]> | undefined;
    _not?: GraphQLTypes["account_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["account_bool_exp"]> | undefined;
    bitcoin?: GraphQLTypes["bitcoin_bool_exp"] | undefined;
    client?: GraphQLTypes["client_bool_exp"] | undefined;
    clientId?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    eth?: GraphQLTypes["eth_bool_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    name?: GraphQLTypes["String_comparison_exp"] | undefined;
    sol?: GraphQLTypes["sol_bool_exp"] | undefined;
    wallet?: GraphQLTypes["wallet_bool_exp"] | undefined;
    walletId?: GraphQLTypes["uuid_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "account" */
  ["account_constraint"]: account_constraint;
  /** input type for inserting data into table "account" */
  ["account_insert_input"]: {
    bitcoin?: GraphQLTypes["bitcoin_obj_rel_insert_input"] | undefined;
    client?: GraphQLTypes["client_obj_rel_insert_input"] | undefined;
    clientId?: GraphQLTypes["uuid"] | undefined;
    eth?: GraphQLTypes["eth_obj_rel_insert_input"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    name?: string | undefined;
    sol?: GraphQLTypes["sol_obj_rel_insert_input"] | undefined;
    wallet?: GraphQLTypes["wallet_obj_rel_insert_input"] | undefined;
    walletId?: GraphQLTypes["uuid"] | undefined;
  };
  /** aggregate max on columns */
  ["account_max_fields"]: {
    __typename: "account_max_fields";
    clientId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    name?: string | undefined;
    walletId?: GraphQLTypes["uuid"] | undefined;
  };
  /** order by max() on columns of table "account" */
  ["account_max_order_by"]: {
    clientId?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    name?: GraphQLTypes["order_by"] | undefined;
    walletId?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["account_min_fields"]: {
    __typename: "account_min_fields";
    clientId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    name?: string | undefined;
    walletId?: GraphQLTypes["uuid"] | undefined;
  };
  /** order by min() on columns of table "account" */
  ["account_min_order_by"]: {
    clientId?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    name?: GraphQLTypes["order_by"] | undefined;
    walletId?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "account" */
  ["account_mutation_response"]: {
    __typename: "account_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["account"]>;
  };
  /** input type for inserting object relation for remote table "account" */
  ["account_obj_rel_insert_input"]: {
    data: GraphQLTypes["account_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["account_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "account" */
  ["account_on_conflict"]: {
    constraint: GraphQLTypes["account_constraint"];
    update_columns: Array<GraphQLTypes["account_update_column"]>;
    where?: GraphQLTypes["account_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "account". */
  ["account_order_by"]: {
    bitcoin?: GraphQLTypes["bitcoin_order_by"] | undefined;
    client?: GraphQLTypes["client_order_by"] | undefined;
    clientId?: GraphQLTypes["order_by"] | undefined;
    eth?: GraphQLTypes["eth_order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    name?: GraphQLTypes["order_by"] | undefined;
    sol?: GraphQLTypes["sol_order_by"] | undefined;
    wallet?: GraphQLTypes["wallet_order_by"] | undefined;
    walletId?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: account */
  ["account_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "account" */
  ["account_select_column"]: account_select_column;
  /** input type for updating data in table "account" */
  ["account_set_input"]: {
    clientId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    name?: string | undefined;
    walletId?: GraphQLTypes["uuid"] | undefined;
  };
  /** Streaming cursor of the table "account" */
  ["account_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["account_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["account_stream_cursor_value_input"]: {
    clientId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    name?: string | undefined;
    walletId?: GraphQLTypes["uuid"] | undefined;
  };
  /** update columns of table "account" */
  ["account_update_column"]: account_update_column;
  ["account_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["account_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["account_bool_exp"];
  };
  /** different chain and there address */
  ["address"]: {
    __typename: "address";
    bitcoin?: string | undefined;
    /** An object relationship */
    client: GraphQLTypes["client"];
    client_id: GraphQLTypes["uuid"];
    eth: string;
    id: GraphQLTypes["uuid"];
    sol: string;
    usdc?: string | undefined;
  };
  /** aggregated selection of "address" */
  ["address_aggregate"]: {
    __typename: "address_aggregate";
    aggregate?: GraphQLTypes["address_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["address"]>;
  };
  /** aggregate fields of "address" */
  ["address_aggregate_fields"]: {
    __typename: "address_aggregate_fields";
    count: number;
    max?: GraphQLTypes["address_max_fields"] | undefined;
    min?: GraphQLTypes["address_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "address". All fields are combined with a logical 'AND'. */
  ["address_bool_exp"]: {
    _and?: Array<GraphQLTypes["address_bool_exp"]> | undefined;
    _not?: GraphQLTypes["address_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["address_bool_exp"]> | undefined;
    bitcoin?: GraphQLTypes["String_comparison_exp"] | undefined;
    client?: GraphQLTypes["client_bool_exp"] | undefined;
    client_id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    eth?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    sol?: GraphQLTypes["String_comparison_exp"] | undefined;
    usdc?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "address" */
  ["address_constraint"]: address_constraint;
  /** input type for inserting data into table "address" */
  ["address_insert_input"]: {
    bitcoin?: string | undefined;
    client?: GraphQLTypes["client_obj_rel_insert_input"] | undefined;
    client_id?: GraphQLTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** aggregate max on columns */
  ["address_max_fields"]: {
    __typename: "address_max_fields";
    bitcoin?: string | undefined;
    client_id?: GraphQLTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** aggregate min on columns */
  ["address_min_fields"]: {
    __typename: "address_min_fields";
    bitcoin?: string | undefined;
    client_id?: GraphQLTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** response of any mutation on the table "address" */
  ["address_mutation_response"]: {
    __typename: "address_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["address"]>;
  };
  /** input type for inserting object relation for remote table "address" */
  ["address_obj_rel_insert_input"]: {
    data: GraphQLTypes["address_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["address_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "address" */
  ["address_on_conflict"]: {
    constraint: GraphQLTypes["address_constraint"];
    update_columns: Array<GraphQLTypes["address_update_column"]>;
    where?: GraphQLTypes["address_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "address". */
  ["address_order_by"]: {
    bitcoin?: GraphQLTypes["order_by"] | undefined;
    client?: GraphQLTypes["client_order_by"] | undefined;
    client_id?: GraphQLTypes["order_by"] | undefined;
    eth?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    sol?: GraphQLTypes["order_by"] | undefined;
    usdc?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: address */
  ["address_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "address" */
  ["address_select_column"]: address_select_column;
  /** input type for updating data in table "address" */
  ["address_set_input"]: {
    bitcoin?: string | undefined;
    client_id?: GraphQLTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** Streaming cursor of the table "address" */
  ["address_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["address_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["address_stream_cursor_value_input"]: {
    bitcoin?: string | undefined;
    client_id?: GraphQLTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** update columns of table "address" */
  ["address_update_column"]: address_update_column;
  ["address_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["address_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["address_bool_exp"];
  };
  ["bigint"]: "scalar" & { name: "bigint" };
  /** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
  ["bigint_comparison_exp"]: {
    _eq?: GraphQLTypes["bigint"] | undefined;
    _gt?: GraphQLTypes["bigint"] | undefined;
    _gte?: GraphQLTypes["bigint"] | undefined;
    _in?: Array<GraphQLTypes["bigint"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: GraphQLTypes["bigint"] | undefined;
    _lte?: GraphQLTypes["bigint"] | undefined;
    _neq?: GraphQLTypes["bigint"] | undefined;
    _nin?: Array<GraphQLTypes["bigint"]> | undefined;
  };
  /** bticoin address for client wallets */
  ["bitcoin"]: {
    __typename: "bitcoin";
    /** An object relationship */
    account: GraphQLTypes["account"];
    accountId: GraphQLTypes["uuid"];
    id: GraphQLTypes["uuid"];
    mainnetBtc: GraphQLTypes["float8"];
    privateKey: string;
    publicKey: string;
    regtestBtc: GraphQLTypes["float8"];
    textnetBtc: GraphQLTypes["float8"];
  };
  /** aggregated selection of "bitcoin" */
  ["bitcoin_aggregate"]: {
    __typename: "bitcoin_aggregate";
    aggregate?: GraphQLTypes["bitcoin_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["bitcoin"]>;
  };
  /** aggregate fields of "bitcoin" */
  ["bitcoin_aggregate_fields"]: {
    __typename: "bitcoin_aggregate_fields";
    avg?: GraphQLTypes["bitcoin_avg_fields"] | undefined;
    count: number;
    max?: GraphQLTypes["bitcoin_max_fields"] | undefined;
    min?: GraphQLTypes["bitcoin_min_fields"] | undefined;
    stddev?: GraphQLTypes["bitcoin_stddev_fields"] | undefined;
    stddev_pop?: GraphQLTypes["bitcoin_stddev_pop_fields"] | undefined;
    stddev_samp?: GraphQLTypes["bitcoin_stddev_samp_fields"] | undefined;
    sum?: GraphQLTypes["bitcoin_sum_fields"] | undefined;
    var_pop?: GraphQLTypes["bitcoin_var_pop_fields"] | undefined;
    var_samp?: GraphQLTypes["bitcoin_var_samp_fields"] | undefined;
    variance?: GraphQLTypes["bitcoin_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["bitcoin_avg_fields"]: {
    __typename: "bitcoin_avg_fields";
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "bitcoin". All fields are combined with a logical 'AND'. */
  ["bitcoin_bool_exp"]: {
    _and?: Array<GraphQLTypes["bitcoin_bool_exp"]> | undefined;
    _not?: GraphQLTypes["bitcoin_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["bitcoin_bool_exp"]> | undefined;
    account?: GraphQLTypes["account_bool_exp"] | undefined;
    accountId?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    mainnetBtc?: GraphQLTypes["float8_comparison_exp"] | undefined;
    privateKey?: GraphQLTypes["String_comparison_exp"] | undefined;
    publicKey?: GraphQLTypes["String_comparison_exp"] | undefined;
    regtestBtc?: GraphQLTypes["float8_comparison_exp"] | undefined;
    textnetBtc?: GraphQLTypes["float8_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "bitcoin" */
  ["bitcoin_constraint"]: bitcoin_constraint;
  /** input type for incrementing numeric columns in table "bitcoin" */
  ["bitcoin_inc_input"]: {
    mainnetBtc?: GraphQLTypes["float8"] | undefined;
    regtestBtc?: GraphQLTypes["float8"] | undefined;
    textnetBtc?: GraphQLTypes["float8"] | undefined;
  };
  /** input type for inserting data into table "bitcoin" */
  ["bitcoin_insert_input"]: {
    account?: GraphQLTypes["account_obj_rel_insert_input"] | undefined;
    accountId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    mainnetBtc?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    regtestBtc?: GraphQLTypes["float8"] | undefined;
    textnetBtc?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate max on columns */
  ["bitcoin_max_fields"]: {
    __typename: "bitcoin_max_fields";
    accountId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    mainnetBtc?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    regtestBtc?: GraphQLTypes["float8"] | undefined;
    textnetBtc?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate min on columns */
  ["bitcoin_min_fields"]: {
    __typename: "bitcoin_min_fields";
    accountId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    mainnetBtc?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    regtestBtc?: GraphQLTypes["float8"] | undefined;
    textnetBtc?: GraphQLTypes["float8"] | undefined;
  };
  /** response of any mutation on the table "bitcoin" */
  ["bitcoin_mutation_response"]: {
    __typename: "bitcoin_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["bitcoin"]>;
  };
  /** input type for inserting object relation for remote table "bitcoin" */
  ["bitcoin_obj_rel_insert_input"]: {
    data: GraphQLTypes["bitcoin_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["bitcoin_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "bitcoin" */
  ["bitcoin_on_conflict"]: {
    constraint: GraphQLTypes["bitcoin_constraint"];
    update_columns: Array<GraphQLTypes["bitcoin_update_column"]>;
    where?: GraphQLTypes["bitcoin_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "bitcoin". */
  ["bitcoin_order_by"]: {
    account?: GraphQLTypes["account_order_by"] | undefined;
    accountId?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    mainnetBtc?: GraphQLTypes["order_by"] | undefined;
    privateKey?: GraphQLTypes["order_by"] | undefined;
    publicKey?: GraphQLTypes["order_by"] | undefined;
    regtestBtc?: GraphQLTypes["order_by"] | undefined;
    textnetBtc?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: bitcoin */
  ["bitcoin_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "bitcoin" */
  ["bitcoin_select_column"]: bitcoin_select_column;
  /** input type for updating data in table "bitcoin" */
  ["bitcoin_set_input"]: {
    accountId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    mainnetBtc?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    regtestBtc?: GraphQLTypes["float8"] | undefined;
    textnetBtc?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate stddev on columns */
  ["bitcoin_stddev_fields"]: {
    __typename: "bitcoin_stddev_fields";
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["bitcoin_stddev_pop_fields"]: {
    __typename: "bitcoin_stddev_pop_fields";
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["bitcoin_stddev_samp_fields"]: {
    __typename: "bitcoin_stddev_samp_fields";
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** Streaming cursor of the table "bitcoin" */
  ["bitcoin_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["bitcoin_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["bitcoin_stream_cursor_value_input"]: {
    accountId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    mainnetBtc?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    regtestBtc?: GraphQLTypes["float8"] | undefined;
    textnetBtc?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate sum on columns */
  ["bitcoin_sum_fields"]: {
    __typename: "bitcoin_sum_fields";
    mainnetBtc?: GraphQLTypes["float8"] | undefined;
    regtestBtc?: GraphQLTypes["float8"] | undefined;
    textnetBtc?: GraphQLTypes["float8"] | undefined;
  };
  /** update columns of table "bitcoin" */
  ["bitcoin_update_column"]: bitcoin_update_column;
  ["bitcoin_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["bitcoin_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["bitcoin_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["bitcoin_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["bitcoin_var_pop_fields"]: {
    __typename: "bitcoin_var_pop_fields";
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["bitcoin_var_samp_fields"]: {
    __typename: "bitcoin_var_samp_fields";
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** aggregate variance on columns */
  ["bitcoin_variance_fields"]: {
    __typename: "bitcoin_variance_fields";
    mainnetBtc?: number | undefined;
    regtestBtc?: number | undefined;
    textnetBtc?: number | undefined;
  };
  /** subscriber for paybox */
  ["client"]: {
    __typename: "client";
    /** An array relationship */
    accounts: Array<GraphQLTypes["account"]>;
    /** An aggregate relationship */
    accounts_aggregate: GraphQLTypes["account_aggregate"];
    /** An object relationship */
    address?: GraphQLTypes["address"] | undefined;
    email: string;
    firstname?: string | undefined;
    id: GraphQLTypes["uuid"];
    lastname?: string | undefined;
    mobile?: GraphQLTypes["bigint"] | undefined;
    password: string;
    /** An array relationship */
    transactions: Array<GraphQLTypes["transactions"]>;
    /** An aggregate relationship */
    transactions_aggregate: GraphQLTypes["transactions_aggregate"];
    username?: string | undefined;
    valid: boolean;
    /** An array relationship */
    wallets: Array<GraphQLTypes["wallet"]>;
    /** An aggregate relationship */
    wallets_aggregate: GraphQLTypes["wallet_aggregate"];
  };
  /** aggregated selection of "client" */
  ["client_aggregate"]: {
    __typename: "client_aggregate";
    aggregate?: GraphQLTypes["client_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["client"]>;
  };
  /** aggregate fields of "client" */
  ["client_aggregate_fields"]: {
    __typename: "client_aggregate_fields";
    avg?: GraphQLTypes["client_avg_fields"] | undefined;
    count: number;
    max?: GraphQLTypes["client_max_fields"] | undefined;
    min?: GraphQLTypes["client_min_fields"] | undefined;
    stddev?: GraphQLTypes["client_stddev_fields"] | undefined;
    stddev_pop?: GraphQLTypes["client_stddev_pop_fields"] | undefined;
    stddev_samp?: GraphQLTypes["client_stddev_samp_fields"] | undefined;
    sum?: GraphQLTypes["client_sum_fields"] | undefined;
    var_pop?: GraphQLTypes["client_var_pop_fields"] | undefined;
    var_samp?: GraphQLTypes["client_var_samp_fields"] | undefined;
    variance?: GraphQLTypes["client_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["client_avg_fields"]: {
    __typename: "client_avg_fields";
    mobile?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "client". All fields are combined with a logical 'AND'. */
  ["client_bool_exp"]: {
    _and?: Array<GraphQLTypes["client_bool_exp"]> | undefined;
    _not?: GraphQLTypes["client_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["client_bool_exp"]> | undefined;
    accounts?: GraphQLTypes["account_bool_exp"] | undefined;
    accounts_aggregate?: GraphQLTypes["account_aggregate_bool_exp"] | undefined;
    address?: GraphQLTypes["address_bool_exp"] | undefined;
    email?: GraphQLTypes["String_comparison_exp"] | undefined;
    firstname?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    lastname?: GraphQLTypes["String_comparison_exp"] | undefined;
    mobile?: GraphQLTypes["bigint_comparison_exp"] | undefined;
    password?: GraphQLTypes["String_comparison_exp"] | undefined;
    transactions?: GraphQLTypes["transactions_bool_exp"] | undefined;
    transactions_aggregate?:
      | GraphQLTypes["transactions_aggregate_bool_exp"]
      | undefined;
    username?: GraphQLTypes["String_comparison_exp"] | undefined;
    valid?: GraphQLTypes["Boolean_comparison_exp"] | undefined;
    wallets?: GraphQLTypes["wallet_bool_exp"] | undefined;
    wallets_aggregate?: GraphQLTypes["wallet_aggregate_bool_exp"] | undefined;
  };
  /** unique or primary key constraints on table "client" */
  ["client_constraint"]: client_constraint;
  /** input type for incrementing numeric columns in table "client" */
  ["client_inc_input"]: {
    mobile?: GraphQLTypes["bigint"] | undefined;
  };
  /** input type for inserting data into table "client" */
  ["client_insert_input"]: {
    accounts?: GraphQLTypes["account_arr_rel_insert_input"] | undefined;
    address?: GraphQLTypes["address_obj_rel_insert_input"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: GraphQLTypes["bigint"] | undefined;
    password?: string | undefined;
    transactions?:
      | GraphQLTypes["transactions_arr_rel_insert_input"]
      | undefined;
    username?: string | undefined;
    valid?: boolean | undefined;
    wallets?: GraphQLTypes["wallet_arr_rel_insert_input"] | undefined;
  };
  /** aggregate max on columns */
  ["client_max_fields"]: {
    __typename: "client_max_fields";
    email?: string | undefined;
    firstname?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: GraphQLTypes["bigint"] | undefined;
    password?: string | undefined;
    username?: string | undefined;
  };
  /** aggregate min on columns */
  ["client_min_fields"]: {
    __typename: "client_min_fields";
    email?: string | undefined;
    firstname?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: GraphQLTypes["bigint"] | undefined;
    password?: string | undefined;
    username?: string | undefined;
  };
  /** response of any mutation on the table "client" */
  ["client_mutation_response"]: {
    __typename: "client_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["client"]>;
  };
  /** input type for inserting object relation for remote table "client" */
  ["client_obj_rel_insert_input"]: {
    data: GraphQLTypes["client_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["client_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "client" */
  ["client_on_conflict"]: {
    constraint: GraphQLTypes["client_constraint"];
    update_columns: Array<GraphQLTypes["client_update_column"]>;
    where?: GraphQLTypes["client_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "client". */
  ["client_order_by"]: {
    accounts_aggregate?: GraphQLTypes["account_aggregate_order_by"] | undefined;
    address?: GraphQLTypes["address_order_by"] | undefined;
    email?: GraphQLTypes["order_by"] | undefined;
    firstname?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    lastname?: GraphQLTypes["order_by"] | undefined;
    mobile?: GraphQLTypes["order_by"] | undefined;
    password?: GraphQLTypes["order_by"] | undefined;
    transactions_aggregate?:
      | GraphQLTypes["transactions_aggregate_order_by"]
      | undefined;
    username?: GraphQLTypes["order_by"] | undefined;
    valid?: GraphQLTypes["order_by"] | undefined;
    wallets_aggregate?: GraphQLTypes["wallet_aggregate_order_by"] | undefined;
  };
  /** primary key columns input for table: client */
  ["client_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "client" */
  ["client_select_column"]: client_select_column;
  /** input type for updating data in table "client" */
  ["client_set_input"]: {
    email?: string | undefined;
    firstname?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: GraphQLTypes["bigint"] | undefined;
    password?: string | undefined;
    username?: string | undefined;
    valid?: boolean | undefined;
  };
  /** aggregate stddev on columns */
  ["client_stddev_fields"]: {
    __typename: "client_stddev_fields";
    mobile?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["client_stddev_pop_fields"]: {
    __typename: "client_stddev_pop_fields";
    mobile?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["client_stddev_samp_fields"]: {
    __typename: "client_stddev_samp_fields";
    mobile?: number | undefined;
  };
  /** Streaming cursor of the table "client" */
  ["client_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["client_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["client_stream_cursor_value_input"]: {
    email?: string | undefined;
    firstname?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: GraphQLTypes["bigint"] | undefined;
    password?: string | undefined;
    username?: string | undefined;
    valid?: boolean | undefined;
  };
  /** aggregate sum on columns */
  ["client_sum_fields"]: {
    __typename: "client_sum_fields";
    mobile?: GraphQLTypes["bigint"] | undefined;
  };
  /** update columns of table "client" */
  ["client_update_column"]: client_update_column;
  ["client_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["client_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["client_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["client_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["client_var_pop_fields"]: {
    __typename: "client_var_pop_fields";
    mobile?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["client_var_samp_fields"]: {
    __typename: "client_var_samp_fields";
    mobile?: number | undefined;
  };
  /** aggregate variance on columns */
  ["client_variance_fields"]: {
    __typename: "client_variance_fields";
    mobile?: number | undefined;
  };
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  ["date"]: "scalar" & { name: "date" };
  /** Boolean expression to compare columns of type "date". All fields are combined with logical 'AND'. */
  ["date_comparison_exp"]: {
    _eq?: GraphQLTypes["date"] | undefined;
    _gt?: GraphQLTypes["date"] | undefined;
    _gte?: GraphQLTypes["date"] | undefined;
    _in?: Array<GraphQLTypes["date"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: GraphQLTypes["date"] | undefined;
    _lte?: GraphQLTypes["date"] | undefined;
    _neq?: GraphQLTypes["date"] | undefined;
    _nin?: Array<GraphQLTypes["date"]> | undefined;
  };
  /** eth address and token for client wallets */
  ["eth"]: {
    __typename: "eth";
    /** An object relationship */
    account: GraphQLTypes["account"];
    accountId: GraphQLTypes["uuid"];
    goerliEth: GraphQLTypes["float8"];
    id: GraphQLTypes["uuid"];
    kovanEth: GraphQLTypes["float8"];
    mainnetEth: GraphQLTypes["float8"];
    privateKey: string;
    publicKey: string;
    rinkebyEth: GraphQLTypes["float8"];
    ropstenEth: GraphQLTypes["float8"];
    sepoliaEth: GraphQLTypes["float8"];
  };
  /** aggregated selection of "eth" */
  ["eth_aggregate"]: {
    __typename: "eth_aggregate";
    aggregate?: GraphQLTypes["eth_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["eth"]>;
  };
  /** aggregate fields of "eth" */
  ["eth_aggregate_fields"]: {
    __typename: "eth_aggregate_fields";
    avg?: GraphQLTypes["eth_avg_fields"] | undefined;
    count: number;
    max?: GraphQLTypes["eth_max_fields"] | undefined;
    min?: GraphQLTypes["eth_min_fields"] | undefined;
    stddev?: GraphQLTypes["eth_stddev_fields"] | undefined;
    stddev_pop?: GraphQLTypes["eth_stddev_pop_fields"] | undefined;
    stddev_samp?: GraphQLTypes["eth_stddev_samp_fields"] | undefined;
    sum?: GraphQLTypes["eth_sum_fields"] | undefined;
    var_pop?: GraphQLTypes["eth_var_pop_fields"] | undefined;
    var_samp?: GraphQLTypes["eth_var_samp_fields"] | undefined;
    variance?: GraphQLTypes["eth_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["eth_avg_fields"]: {
    __typename: "eth_avg_fields";
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "eth". All fields are combined with a logical 'AND'. */
  ["eth_bool_exp"]: {
    _and?: Array<GraphQLTypes["eth_bool_exp"]> | undefined;
    _not?: GraphQLTypes["eth_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["eth_bool_exp"]> | undefined;
    account?: GraphQLTypes["account_bool_exp"] | undefined;
    accountId?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    goerliEth?: GraphQLTypes["float8_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    kovanEth?: GraphQLTypes["float8_comparison_exp"] | undefined;
    mainnetEth?: GraphQLTypes["float8_comparison_exp"] | undefined;
    privateKey?: GraphQLTypes["String_comparison_exp"] | undefined;
    publicKey?: GraphQLTypes["String_comparison_exp"] | undefined;
    rinkebyEth?: GraphQLTypes["float8_comparison_exp"] | undefined;
    ropstenEth?: GraphQLTypes["float8_comparison_exp"] | undefined;
    sepoliaEth?: GraphQLTypes["float8_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "eth" */
  ["eth_constraint"]: eth_constraint;
  /** input type for incrementing numeric columns in table "eth" */
  ["eth_inc_input"]: {
    goerliEth?: GraphQLTypes["float8"] | undefined;
    kovanEth?: GraphQLTypes["float8"] | undefined;
    mainnetEth?: GraphQLTypes["float8"] | undefined;
    rinkebyEth?: GraphQLTypes["float8"] | undefined;
    ropstenEth?: GraphQLTypes["float8"] | undefined;
    sepoliaEth?: GraphQLTypes["float8"] | undefined;
  };
  /** input type for inserting data into table "eth" */
  ["eth_insert_input"]: {
    account?: GraphQLTypes["account_obj_rel_insert_input"] | undefined;
    accountId?: GraphQLTypes["uuid"] | undefined;
    goerliEth?: GraphQLTypes["float8"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    kovanEth?: GraphQLTypes["float8"] | undefined;
    mainnetEth?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    rinkebyEth?: GraphQLTypes["float8"] | undefined;
    ropstenEth?: GraphQLTypes["float8"] | undefined;
    sepoliaEth?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate max on columns */
  ["eth_max_fields"]: {
    __typename: "eth_max_fields";
    accountId?: GraphQLTypes["uuid"] | undefined;
    goerliEth?: GraphQLTypes["float8"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    kovanEth?: GraphQLTypes["float8"] | undefined;
    mainnetEth?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    rinkebyEth?: GraphQLTypes["float8"] | undefined;
    ropstenEth?: GraphQLTypes["float8"] | undefined;
    sepoliaEth?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate min on columns */
  ["eth_min_fields"]: {
    __typename: "eth_min_fields";
    accountId?: GraphQLTypes["uuid"] | undefined;
    goerliEth?: GraphQLTypes["float8"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    kovanEth?: GraphQLTypes["float8"] | undefined;
    mainnetEth?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    rinkebyEth?: GraphQLTypes["float8"] | undefined;
    ropstenEth?: GraphQLTypes["float8"] | undefined;
    sepoliaEth?: GraphQLTypes["float8"] | undefined;
  };
  /** response of any mutation on the table "eth" */
  ["eth_mutation_response"]: {
    __typename: "eth_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["eth"]>;
  };
  /** input type for inserting object relation for remote table "eth" */
  ["eth_obj_rel_insert_input"]: {
    data: GraphQLTypes["eth_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["eth_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "eth" */
  ["eth_on_conflict"]: {
    constraint: GraphQLTypes["eth_constraint"];
    update_columns: Array<GraphQLTypes["eth_update_column"]>;
    where?: GraphQLTypes["eth_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "eth". */
  ["eth_order_by"]: {
    account?: GraphQLTypes["account_order_by"] | undefined;
    accountId?: GraphQLTypes["order_by"] | undefined;
    goerliEth?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    kovanEth?: GraphQLTypes["order_by"] | undefined;
    mainnetEth?: GraphQLTypes["order_by"] | undefined;
    privateKey?: GraphQLTypes["order_by"] | undefined;
    publicKey?: GraphQLTypes["order_by"] | undefined;
    rinkebyEth?: GraphQLTypes["order_by"] | undefined;
    ropstenEth?: GraphQLTypes["order_by"] | undefined;
    sepoliaEth?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: eth */
  ["eth_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "eth" */
  ["eth_select_column"]: eth_select_column;
  /** input type for updating data in table "eth" */
  ["eth_set_input"]: {
    accountId?: GraphQLTypes["uuid"] | undefined;
    goerliEth?: GraphQLTypes["float8"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    kovanEth?: GraphQLTypes["float8"] | undefined;
    mainnetEth?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    rinkebyEth?: GraphQLTypes["float8"] | undefined;
    ropstenEth?: GraphQLTypes["float8"] | undefined;
    sepoliaEth?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate stddev on columns */
  ["eth_stddev_fields"]: {
    __typename: "eth_stddev_fields";
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["eth_stddev_pop_fields"]: {
    __typename: "eth_stddev_pop_fields";
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["eth_stddev_samp_fields"]: {
    __typename: "eth_stddev_samp_fields";
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** Streaming cursor of the table "eth" */
  ["eth_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["eth_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["eth_stream_cursor_value_input"]: {
    accountId?: GraphQLTypes["uuid"] | undefined;
    goerliEth?: GraphQLTypes["float8"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    kovanEth?: GraphQLTypes["float8"] | undefined;
    mainnetEth?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    rinkebyEth?: GraphQLTypes["float8"] | undefined;
    ropstenEth?: GraphQLTypes["float8"] | undefined;
    sepoliaEth?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate sum on columns */
  ["eth_sum_fields"]: {
    __typename: "eth_sum_fields";
    goerliEth?: GraphQLTypes["float8"] | undefined;
    kovanEth?: GraphQLTypes["float8"] | undefined;
    mainnetEth?: GraphQLTypes["float8"] | undefined;
    rinkebyEth?: GraphQLTypes["float8"] | undefined;
    ropstenEth?: GraphQLTypes["float8"] | undefined;
    sepoliaEth?: GraphQLTypes["float8"] | undefined;
  };
  /** update columns of table "eth" */
  ["eth_update_column"]: eth_update_column;
  ["eth_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["eth_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["eth_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["eth_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["eth_var_pop_fields"]: {
    __typename: "eth_var_pop_fields";
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["eth_var_samp_fields"]: {
    __typename: "eth_var_samp_fields";
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  /** aggregate variance on columns */
  ["eth_variance_fields"]: {
    __typename: "eth_variance_fields";
    goerliEth?: number | undefined;
    kovanEth?: number | undefined;
    mainnetEth?: number | undefined;
    rinkebyEth?: number | undefined;
    ropstenEth?: number | undefined;
    sepoliaEth?: number | undefined;
  };
  ["float8"]: "scalar" & { name: "float8" };
  /** Boolean expression to compare columns of type "float8". All fields are combined with logical 'AND'. */
  ["float8_comparison_exp"]: {
    _eq?: GraphQLTypes["float8"] | undefined;
    _gt?: GraphQLTypes["float8"] | undefined;
    _gte?: GraphQLTypes["float8"] | undefined;
    _in?: Array<GraphQLTypes["float8"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: GraphQLTypes["float8"] | undefined;
    _lte?: GraphQLTypes["float8"] | undefined;
    _neq?: GraphQLTypes["float8"] | undefined;
    _nin?: Array<GraphQLTypes["float8"]> | undefined;
  };
  ["jsonb"]: "scalar" & { name: "jsonb" };
  ["jsonb_cast_exp"]: {
    String?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
  ["jsonb_comparison_exp"]: {
    _cast?: GraphQLTypes["jsonb_cast_exp"] | undefined;
    /** is the column contained in the given json value */
    _contained_in?: GraphQLTypes["jsonb"] | undefined;
    /** does the column contain the given json value at the top level */
    _contains?: GraphQLTypes["jsonb"] | undefined;
    _eq?: GraphQLTypes["jsonb"] | undefined;
    _gt?: GraphQLTypes["jsonb"] | undefined;
    _gte?: GraphQLTypes["jsonb"] | undefined;
    /** does the string exist as a top-level key in the column */
    _has_key?: string | undefined;
    /** do all of these strings exist as top-level keys in the column */
    _has_keys_all?: Array<string> | undefined;
    /** do any of these strings exist as top-level keys in the column */
    _has_keys_any?: Array<string> | undefined;
    _in?: Array<GraphQLTypes["jsonb"]> | undefined;
    _is_null?: boolean | undefined;
    _lt?: GraphQLTypes["jsonb"] | undefined;
    _lte?: GraphQLTypes["jsonb"] | undefined;
    _neq?: GraphQLTypes["jsonb"] | undefined;
    _nin?: Array<GraphQLTypes["jsonb"]> | undefined;
  };
  /** mutation root */
  ["mutation_root"]: {
    __typename: "mutation_root";
    /** delete data from the table: "account" */
    delete_account?: GraphQLTypes["account_mutation_response"] | undefined;
    /** delete single row from the table: "account" */
    delete_account_by_pk?: GraphQLTypes["account"] | undefined;
    /** delete data from the table: "address" */
    delete_address?: GraphQLTypes["address_mutation_response"] | undefined;
    /** delete single row from the table: "address" */
    delete_address_by_pk?: GraphQLTypes["address"] | undefined;
    /** delete data from the table: "bitcoin" */
    delete_bitcoin?: GraphQLTypes["bitcoin_mutation_response"] | undefined;
    /** delete single row from the table: "bitcoin" */
    delete_bitcoin_by_pk?: GraphQLTypes["bitcoin"] | undefined;
    /** delete data from the table: "client" */
    delete_client?: GraphQLTypes["client_mutation_response"] | undefined;
    /** delete single row from the table: "client" */
    delete_client_by_pk?: GraphQLTypes["client"] | undefined;
    /** delete data from the table: "eth" */
    delete_eth?: GraphQLTypes["eth_mutation_response"] | undefined;
    /** delete single row from the table: "eth" */
    delete_eth_by_pk?: GraphQLTypes["eth"] | undefined;
    /** delete data from the table: "sol" */
    delete_sol?: GraphQLTypes["sol_mutation_response"] | undefined;
    /** delete single row from the table: "sol" */
    delete_sol_by_pk?: GraphQLTypes["sol"] | undefined;
    /** delete data from the table: "transactions" */
    delete_transactions?:
      | GraphQLTypes["transactions_mutation_response"]
      | undefined;
    /** delete single row from the table: "transactions" */
    delete_transactions_by_pk?: GraphQLTypes["transactions"] | undefined;
    /** delete data from the table: "wallet" */
    delete_wallet?: GraphQLTypes["wallet_mutation_response"] | undefined;
    /** delete single row from the table: "wallet" */
    delete_wallet_by_pk?: GraphQLTypes["wallet"] | undefined;
    /** insert data into the table: "account" */
    insert_account?: GraphQLTypes["account_mutation_response"] | undefined;
    /** insert a single row into the table: "account" */
    insert_account_one?: GraphQLTypes["account"] | undefined;
    /** insert data into the table: "address" */
    insert_address?: GraphQLTypes["address_mutation_response"] | undefined;
    /** insert a single row into the table: "address" */
    insert_address_one?: GraphQLTypes["address"] | undefined;
    /** insert data into the table: "bitcoin" */
    insert_bitcoin?: GraphQLTypes["bitcoin_mutation_response"] | undefined;
    /** insert a single row into the table: "bitcoin" */
    insert_bitcoin_one?: GraphQLTypes["bitcoin"] | undefined;
    /** insert data into the table: "client" */
    insert_client?: GraphQLTypes["client_mutation_response"] | undefined;
    /** insert a single row into the table: "client" */
    insert_client_one?: GraphQLTypes["client"] | undefined;
    /** insert data into the table: "eth" */
    insert_eth?: GraphQLTypes["eth_mutation_response"] | undefined;
    /** insert a single row into the table: "eth" */
    insert_eth_one?: GraphQLTypes["eth"] | undefined;
    /** insert data into the table: "sol" */
    insert_sol?: GraphQLTypes["sol_mutation_response"] | undefined;
    /** insert a single row into the table: "sol" */
    insert_sol_one?: GraphQLTypes["sol"] | undefined;
    /** insert data into the table: "transactions" */
    insert_transactions?:
      | GraphQLTypes["transactions_mutation_response"]
      | undefined;
    /** insert a single row into the table: "transactions" */
    insert_transactions_one?: GraphQLTypes["transactions"] | undefined;
    /** insert data into the table: "wallet" */
    insert_wallet?: GraphQLTypes["wallet_mutation_response"] | undefined;
    /** insert a single row into the table: "wallet" */
    insert_wallet_one?: GraphQLTypes["wallet"] | undefined;
    /** update data of the table: "account" */
    update_account?: GraphQLTypes["account_mutation_response"] | undefined;
    /** update single row of the table: "account" */
    update_account_by_pk?: GraphQLTypes["account"] | undefined;
    /** update multiples rows of table: "account" */
    update_account_many?:
      | Array<GraphQLTypes["account_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "address" */
    update_address?: GraphQLTypes["address_mutation_response"] | undefined;
    /** update single row of the table: "address" */
    update_address_by_pk?: GraphQLTypes["address"] | undefined;
    /** update multiples rows of table: "address" */
    update_address_many?:
      | Array<GraphQLTypes["address_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "bitcoin" */
    update_bitcoin?: GraphQLTypes["bitcoin_mutation_response"] | undefined;
    /** update single row of the table: "bitcoin" */
    update_bitcoin_by_pk?: GraphQLTypes["bitcoin"] | undefined;
    /** update multiples rows of table: "bitcoin" */
    update_bitcoin_many?:
      | Array<GraphQLTypes["bitcoin_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "client" */
    update_client?: GraphQLTypes["client_mutation_response"] | undefined;
    /** update single row of the table: "client" */
    update_client_by_pk?: GraphQLTypes["client"] | undefined;
    /** update multiples rows of table: "client" */
    update_client_many?:
      | Array<GraphQLTypes["client_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "eth" */
    update_eth?: GraphQLTypes["eth_mutation_response"] | undefined;
    /** update single row of the table: "eth" */
    update_eth_by_pk?: GraphQLTypes["eth"] | undefined;
    /** update multiples rows of table: "eth" */
    update_eth_many?:
      | Array<GraphQLTypes["eth_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "sol" */
    update_sol?: GraphQLTypes["sol_mutation_response"] | undefined;
    /** update single row of the table: "sol" */
    update_sol_by_pk?: GraphQLTypes["sol"] | undefined;
    /** update multiples rows of table: "sol" */
    update_sol_many?:
      | Array<GraphQLTypes["sol_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "transactions" */
    update_transactions?:
      | GraphQLTypes["transactions_mutation_response"]
      | undefined;
    /** update single row of the table: "transactions" */
    update_transactions_by_pk?: GraphQLTypes["transactions"] | undefined;
    /** update multiples rows of table: "transactions" */
    update_transactions_many?:
      | Array<GraphQLTypes["transactions_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "wallet" */
    update_wallet?: GraphQLTypes["wallet_mutation_response"] | undefined;
    /** update single row of the table: "wallet" */
    update_wallet_by_pk?: GraphQLTypes["wallet"] | undefined;
    /** update multiples rows of table: "wallet" */
    update_wallet_many?:
      | Array<GraphQLTypes["wallet_mutation_response"] | undefined>
      | undefined;
  };
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: {
    __typename: "query_root";
    /** fetch data from the table: "account" */
    account: Array<GraphQLTypes["account"]>;
    /** fetch aggregated fields from the table: "account" */
    account_aggregate: GraphQLTypes["account_aggregate"];
    /** fetch data from the table: "account" using primary key columns */
    account_by_pk?: GraphQLTypes["account"] | undefined;
    /** fetch data from the table: "address" */
    address: Array<GraphQLTypes["address"]>;
    /** fetch aggregated fields from the table: "address" */
    address_aggregate: GraphQLTypes["address_aggregate"];
    /** fetch data from the table: "address" using primary key columns */
    address_by_pk?: GraphQLTypes["address"] | undefined;
    /** fetch data from the table: "bitcoin" */
    bitcoin: Array<GraphQLTypes["bitcoin"]>;
    /** fetch aggregated fields from the table: "bitcoin" */
    bitcoin_aggregate: GraphQLTypes["bitcoin_aggregate"];
    /** fetch data from the table: "bitcoin" using primary key columns */
    bitcoin_by_pk?: GraphQLTypes["bitcoin"] | undefined;
    /** fetch data from the table: "client" */
    client: Array<GraphQLTypes["client"]>;
    /** fetch aggregated fields from the table: "client" */
    client_aggregate: GraphQLTypes["client_aggregate"];
    /** fetch data from the table: "client" using primary key columns */
    client_by_pk?: GraphQLTypes["client"] | undefined;
    /** fetch data from the table: "eth" */
    eth: Array<GraphQLTypes["eth"]>;
    /** fetch aggregated fields from the table: "eth" */
    eth_aggregate: GraphQLTypes["eth_aggregate"];
    /** fetch data from the table: "eth" using primary key columns */
    eth_by_pk?: GraphQLTypes["eth"] | undefined;
    /** fetch data from the table: "sol" */
    sol: Array<GraphQLTypes["sol"]>;
    /** fetch aggregated fields from the table: "sol" */
    sol_aggregate: GraphQLTypes["sol_aggregate"];
    /** fetch data from the table: "sol" using primary key columns */
    sol_by_pk?: GraphQLTypes["sol"] | undefined;
    /** An array relationship */
    transactions: Array<GraphQLTypes["transactions"]>;
    /** An aggregate relationship */
    transactions_aggregate: GraphQLTypes["transactions_aggregate"];
    /** fetch data from the table: "transactions" using primary key columns */
    transactions_by_pk?: GraphQLTypes["transactions"] | undefined;
    /** fetch data from the table: "wallet" */
    wallet: Array<GraphQLTypes["wallet"]>;
    /** fetch aggregated fields from the table: "wallet" */
    wallet_aggregate: GraphQLTypes["wallet_aggregate"];
    /** fetch data from the table: "wallet" using primary key columns */
    wallet_by_pk?: GraphQLTypes["wallet"] | undefined;
  };
  /** solana address for client wallets */
  ["sol"]: {
    __typename: "sol";
    /** An object relationship */
    account: GraphQLTypes["account"];
    accountId: GraphQLTypes["uuid"];
    devnetSol: GraphQLTypes["float8"];
    id: GraphQLTypes["uuid"];
    mainnetSol: GraphQLTypes["float8"];
    privateKey: string;
    publicKey: string;
    testnetSol: GraphQLTypes["float8"];
  };
  /** aggregated selection of "sol" */
  ["sol_aggregate"]: {
    __typename: "sol_aggregate";
    aggregate?: GraphQLTypes["sol_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["sol"]>;
  };
  /** aggregate fields of "sol" */
  ["sol_aggregate_fields"]: {
    __typename: "sol_aggregate_fields";
    avg?: GraphQLTypes["sol_avg_fields"] | undefined;
    count: number;
    max?: GraphQLTypes["sol_max_fields"] | undefined;
    min?: GraphQLTypes["sol_min_fields"] | undefined;
    stddev?: GraphQLTypes["sol_stddev_fields"] | undefined;
    stddev_pop?: GraphQLTypes["sol_stddev_pop_fields"] | undefined;
    stddev_samp?: GraphQLTypes["sol_stddev_samp_fields"] | undefined;
    sum?: GraphQLTypes["sol_sum_fields"] | undefined;
    var_pop?: GraphQLTypes["sol_var_pop_fields"] | undefined;
    var_samp?: GraphQLTypes["sol_var_samp_fields"] | undefined;
    variance?: GraphQLTypes["sol_variance_fields"] | undefined;
  };
  /** aggregate avg on columns */
  ["sol_avg_fields"]: {
    __typename: "sol_avg_fields";
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** Boolean expression to filter rows from the table "sol". All fields are combined with a logical 'AND'. */
  ["sol_bool_exp"]: {
    _and?: Array<GraphQLTypes["sol_bool_exp"]> | undefined;
    _not?: GraphQLTypes["sol_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["sol_bool_exp"]> | undefined;
    account?: GraphQLTypes["account_bool_exp"] | undefined;
    accountId?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    devnetSol?: GraphQLTypes["float8_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    mainnetSol?: GraphQLTypes["float8_comparison_exp"] | undefined;
    privateKey?: GraphQLTypes["String_comparison_exp"] | undefined;
    publicKey?: GraphQLTypes["String_comparison_exp"] | undefined;
    testnetSol?: GraphQLTypes["float8_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "sol" */
  ["sol_constraint"]: sol_constraint;
  /** input type for incrementing numeric columns in table "sol" */
  ["sol_inc_input"]: {
    devnetSol?: GraphQLTypes["float8"] | undefined;
    mainnetSol?: GraphQLTypes["float8"] | undefined;
    testnetSol?: GraphQLTypes["float8"] | undefined;
  };
  /** input type for inserting data into table "sol" */
  ["sol_insert_input"]: {
    account?: GraphQLTypes["account_obj_rel_insert_input"] | undefined;
    accountId?: GraphQLTypes["uuid"] | undefined;
    devnetSol?: GraphQLTypes["float8"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    mainnetSol?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    testnetSol?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate max on columns */
  ["sol_max_fields"]: {
    __typename: "sol_max_fields";
    accountId?: GraphQLTypes["uuid"] | undefined;
    devnetSol?: GraphQLTypes["float8"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    mainnetSol?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    testnetSol?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate min on columns */
  ["sol_min_fields"]: {
    __typename: "sol_min_fields";
    accountId?: GraphQLTypes["uuid"] | undefined;
    devnetSol?: GraphQLTypes["float8"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    mainnetSol?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    testnetSol?: GraphQLTypes["float8"] | undefined;
  };
  /** response of any mutation on the table "sol" */
  ["sol_mutation_response"]: {
    __typename: "sol_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["sol"]>;
  };
  /** input type for inserting object relation for remote table "sol" */
  ["sol_obj_rel_insert_input"]: {
    data: GraphQLTypes["sol_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["sol_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "sol" */
  ["sol_on_conflict"]: {
    constraint: GraphQLTypes["sol_constraint"];
    update_columns: Array<GraphQLTypes["sol_update_column"]>;
    where?: GraphQLTypes["sol_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "sol". */
  ["sol_order_by"]: {
    account?: GraphQLTypes["account_order_by"] | undefined;
    accountId?: GraphQLTypes["order_by"] | undefined;
    devnetSol?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    mainnetSol?: GraphQLTypes["order_by"] | undefined;
    privateKey?: GraphQLTypes["order_by"] | undefined;
    publicKey?: GraphQLTypes["order_by"] | undefined;
    testnetSol?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: sol */
  ["sol_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "sol" */
  ["sol_select_column"]: sol_select_column;
  /** input type for updating data in table "sol" */
  ["sol_set_input"]: {
    accountId?: GraphQLTypes["uuid"] | undefined;
    devnetSol?: GraphQLTypes["float8"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    mainnetSol?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    testnetSol?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate stddev on columns */
  ["sol_stddev_fields"]: {
    __typename: "sol_stddev_fields";
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["sol_stddev_pop_fields"]: {
    __typename: "sol_stddev_pop_fields";
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["sol_stddev_samp_fields"]: {
    __typename: "sol_stddev_samp_fields";
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** Streaming cursor of the table "sol" */
  ["sol_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["sol_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["sol_stream_cursor_value_input"]: {
    accountId?: GraphQLTypes["uuid"] | undefined;
    devnetSol?: GraphQLTypes["float8"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    mainnetSol?: GraphQLTypes["float8"] | undefined;
    privateKey?: string | undefined;
    publicKey?: string | undefined;
    testnetSol?: GraphQLTypes["float8"] | undefined;
  };
  /** aggregate sum on columns */
  ["sol_sum_fields"]: {
    __typename: "sol_sum_fields";
    devnetSol?: GraphQLTypes["float8"] | undefined;
    mainnetSol?: GraphQLTypes["float8"] | undefined;
    testnetSol?: GraphQLTypes["float8"] | undefined;
  };
  /** update columns of table "sol" */
  ["sol_update_column"]: sol_update_column;
  ["sol_updates"]: {
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["sol_inc_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["sol_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["sol_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["sol_var_pop_fields"]: {
    __typename: "sol_var_pop_fields";
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** aggregate var_samp on columns */
  ["sol_var_samp_fields"]: {
    __typename: "sol_var_samp_fields";
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  /** aggregate variance on columns */
  ["sol_variance_fields"]: {
    __typename: "sol_variance_fields";
    devnetSol?: number | undefined;
    mainnetSol?: number | undefined;
    testnetSol?: number | undefined;
  };
  ["subscription_root"]: {
    __typename: "subscription_root";
    /** fetch data from the table: "account" */
    account: Array<GraphQLTypes["account"]>;
    /** fetch aggregated fields from the table: "account" */
    account_aggregate: GraphQLTypes["account_aggregate"];
    /** fetch data from the table: "account" using primary key columns */
    account_by_pk?: GraphQLTypes["account"] | undefined;
    /** fetch data from the table in a streaming manner: "account" */
    account_stream: Array<GraphQLTypes["account"]>;
    /** fetch data from the table: "address" */
    address: Array<GraphQLTypes["address"]>;
    /** fetch aggregated fields from the table: "address" */
    address_aggregate: GraphQLTypes["address_aggregate"];
    /** fetch data from the table: "address" using primary key columns */
    address_by_pk?: GraphQLTypes["address"] | undefined;
    /** fetch data from the table in a streaming manner: "address" */
    address_stream: Array<GraphQLTypes["address"]>;
    /** fetch data from the table: "bitcoin" */
    bitcoin: Array<GraphQLTypes["bitcoin"]>;
    /** fetch aggregated fields from the table: "bitcoin" */
    bitcoin_aggregate: GraphQLTypes["bitcoin_aggregate"];
    /** fetch data from the table: "bitcoin" using primary key columns */
    bitcoin_by_pk?: GraphQLTypes["bitcoin"] | undefined;
    /** fetch data from the table in a streaming manner: "bitcoin" */
    bitcoin_stream: Array<GraphQLTypes["bitcoin"]>;
    /** fetch data from the table: "client" */
    client: Array<GraphQLTypes["client"]>;
    /** fetch aggregated fields from the table: "client" */
    client_aggregate: GraphQLTypes["client_aggregate"];
    /** fetch data from the table: "client" using primary key columns */
    client_by_pk?: GraphQLTypes["client"] | undefined;
    /** fetch data from the table in a streaming manner: "client" */
    client_stream: Array<GraphQLTypes["client"]>;
    /** fetch data from the table: "eth" */
    eth: Array<GraphQLTypes["eth"]>;
    /** fetch aggregated fields from the table: "eth" */
    eth_aggregate: GraphQLTypes["eth_aggregate"];
    /** fetch data from the table: "eth" using primary key columns */
    eth_by_pk?: GraphQLTypes["eth"] | undefined;
    /** fetch data from the table in a streaming manner: "eth" */
    eth_stream: Array<GraphQLTypes["eth"]>;
    /** fetch data from the table: "sol" */
    sol: Array<GraphQLTypes["sol"]>;
    /** fetch aggregated fields from the table: "sol" */
    sol_aggregate: GraphQLTypes["sol_aggregate"];
    /** fetch data from the table: "sol" using primary key columns */
    sol_by_pk?: GraphQLTypes["sol"] | undefined;
    /** fetch data from the table in a streaming manner: "sol" */
    sol_stream: Array<GraphQLTypes["sol"]>;
    /** An array relationship */
    transactions: Array<GraphQLTypes["transactions"]>;
    /** An aggregate relationship */
    transactions_aggregate: GraphQLTypes["transactions_aggregate"];
    /** fetch data from the table: "transactions" using primary key columns */
    transactions_by_pk?: GraphQLTypes["transactions"] | undefined;
    /** fetch data from the table in a streaming manner: "transactions" */
    transactions_stream: Array<GraphQLTypes["transactions"]>;
    /** fetch data from the table: "wallet" */
    wallet: Array<GraphQLTypes["wallet"]>;
    /** fetch aggregated fields from the table: "wallet" */
    wallet_aggregate: GraphQLTypes["wallet_aggregate"];
    /** fetch data from the table: "wallet" using primary key columns */
    wallet_by_pk?: GraphQLTypes["wallet"] | undefined;
    /** fetch data from the table in a streaming manner: "wallet" */
    wallet_stream: Array<GraphQLTypes["wallet"]>;
  };
  /** transactions table  */
  ["transactions"]: {
    __typename: "transactions";
    amount: GraphQLTypes["float8"];
    blockTime: GraphQLTypes["bigint"];
    chainId?: GraphQLTypes["bigint"] | undefined;
    /** An object relationship */
    client: GraphQLTypes["client"];
    clientId: GraphQLTypes["uuid"];
    cluster?: string | undefined;
    date: GraphQLTypes["date"];
    fee: GraphQLTypes["float8"];
    from: string;
    hash?: string | undefined;
    id: GraphQLTypes["uuid"];
    network: string;
    nonce?: number | undefined;
    postBalances?: GraphQLTypes["jsonb"] | undefined;
    preBalances?: GraphQLTypes["jsonb"] | undefined;
    recentBlockhash: string;
    signature: GraphQLTypes["jsonb"];
    slot?: GraphQLTypes["bigint"] | undefined;
    status: string;
    to: string;
  };
  /** aggregated selection of "transactions" */
  ["transactions_aggregate"]: {
    __typename: "transactions_aggregate";
    aggregate?: GraphQLTypes["transactions_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["transactions"]>;
  };
  ["transactions_aggregate_bool_exp"]: {
    avg?: GraphQLTypes["transactions_aggregate_bool_exp_avg"] | undefined;
    corr?: GraphQLTypes["transactions_aggregate_bool_exp_corr"] | undefined;
    count?: GraphQLTypes["transactions_aggregate_bool_exp_count"] | undefined;
    covar_samp?:
      | GraphQLTypes["transactions_aggregate_bool_exp_covar_samp"]
      | undefined;
    max?: GraphQLTypes["transactions_aggregate_bool_exp_max"] | undefined;
    min?: GraphQLTypes["transactions_aggregate_bool_exp_min"] | undefined;
    stddev_samp?:
      | GraphQLTypes["transactions_aggregate_bool_exp_stddev_samp"]
      | undefined;
    sum?: GraphQLTypes["transactions_aggregate_bool_exp_sum"] | undefined;
    var_samp?:
      | GraphQLTypes["transactions_aggregate_bool_exp_var_samp"]
      | undefined;
  };
  ["transactions_aggregate_bool_exp_avg"]: {
    arguments: GraphQLTypes["transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["transactions_bool_exp"] | undefined;
    predicate: GraphQLTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_corr"]: {
    arguments: GraphQLTypes["transactions_aggregate_bool_exp_corr_arguments"];
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["transactions_bool_exp"] | undefined;
    predicate: GraphQLTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_corr_arguments"]: {
    X: GraphQLTypes["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"];
    Y: GraphQLTypes["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"];
  };
  ["transactions_aggregate_bool_exp_count"]: {
    arguments?: Array<GraphQLTypes["transactions_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["transactions_bool_exp"] | undefined;
    predicate: GraphQLTypes["Int_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_covar_samp"]: {
    arguments: GraphQLTypes["transactions_aggregate_bool_exp_covar_samp_arguments"];
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["transactions_bool_exp"] | undefined;
    predicate: GraphQLTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_covar_samp_arguments"]: {
    X: GraphQLTypes["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"];
    Y: GraphQLTypes["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"];
  };
  ["transactions_aggregate_bool_exp_max"]: {
    arguments: GraphQLTypes["transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["transactions_bool_exp"] | undefined;
    predicate: GraphQLTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_min"]: {
    arguments: GraphQLTypes["transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["transactions_bool_exp"] | undefined;
    predicate: GraphQLTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_stddev_samp"]: {
    arguments: GraphQLTypes["transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["transactions_bool_exp"] | undefined;
    predicate: GraphQLTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_sum"]: {
    arguments: GraphQLTypes["transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["transactions_bool_exp"] | undefined;
    predicate: GraphQLTypes["float8_comparison_exp"];
  };
  ["transactions_aggregate_bool_exp_var_samp"]: {
    arguments: GraphQLTypes["transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns"];
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["transactions_bool_exp"] | undefined;
    predicate: GraphQLTypes["float8_comparison_exp"];
  };
  /** aggregate fields of "transactions" */
  ["transactions_aggregate_fields"]: {
    __typename: "transactions_aggregate_fields";
    avg?: GraphQLTypes["transactions_avg_fields"] | undefined;
    count: number;
    max?: GraphQLTypes["transactions_max_fields"] | undefined;
    min?: GraphQLTypes["transactions_min_fields"] | undefined;
    stddev?: GraphQLTypes["transactions_stddev_fields"] | undefined;
    stddev_pop?: GraphQLTypes["transactions_stddev_pop_fields"] | undefined;
    stddev_samp?: GraphQLTypes["transactions_stddev_samp_fields"] | undefined;
    sum?: GraphQLTypes["transactions_sum_fields"] | undefined;
    var_pop?: GraphQLTypes["transactions_var_pop_fields"] | undefined;
    var_samp?: GraphQLTypes["transactions_var_samp_fields"] | undefined;
    variance?: GraphQLTypes["transactions_variance_fields"] | undefined;
  };
  /** order by aggregate values of table "transactions" */
  ["transactions_aggregate_order_by"]: {
    avg?: GraphQLTypes["transactions_avg_order_by"] | undefined;
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["transactions_max_order_by"] | undefined;
    min?: GraphQLTypes["transactions_min_order_by"] | undefined;
    stddev?: GraphQLTypes["transactions_stddev_order_by"] | undefined;
    stddev_pop?: GraphQLTypes["transactions_stddev_pop_order_by"] | undefined;
    stddev_samp?: GraphQLTypes["transactions_stddev_samp_order_by"] | undefined;
    sum?: GraphQLTypes["transactions_sum_order_by"] | undefined;
    var_pop?: GraphQLTypes["transactions_var_pop_order_by"] | undefined;
    var_samp?: GraphQLTypes["transactions_var_samp_order_by"] | undefined;
    variance?: GraphQLTypes["transactions_variance_order_by"] | undefined;
  };
  /** append existing jsonb value of filtered columns with new jsonb value */
  ["transactions_append_input"]: {
    postBalances?: GraphQLTypes["jsonb"] | undefined;
    preBalances?: GraphQLTypes["jsonb"] | undefined;
    signature?: GraphQLTypes["jsonb"] | undefined;
  };
  /** input type for inserting array relation for remote table "transactions" */
  ["transactions_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["transactions_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["transactions_on_conflict"] | undefined;
  };
  /** aggregate avg on columns */
  ["transactions_avg_fields"]: {
    __typename: "transactions_avg_fields";
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by avg() on columns of table "transactions" */
  ["transactions_avg_order_by"]: {
    amount?: GraphQLTypes["order_by"] | undefined;
    blockTime?: GraphQLTypes["order_by"] | undefined;
    chainId?: GraphQLTypes["order_by"] | undefined;
    fee?: GraphQLTypes["order_by"] | undefined;
    nonce?: GraphQLTypes["order_by"] | undefined;
    slot?: GraphQLTypes["order_by"] | undefined;
  };
  /** Boolean expression to filter rows from the table "transactions". All fields are combined with a logical 'AND'. */
  ["transactions_bool_exp"]: {
    _and?: Array<GraphQLTypes["transactions_bool_exp"]> | undefined;
    _not?: GraphQLTypes["transactions_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["transactions_bool_exp"]> | undefined;
    amount?: GraphQLTypes["float8_comparison_exp"] | undefined;
    blockTime?: GraphQLTypes["bigint_comparison_exp"] | undefined;
    chainId?: GraphQLTypes["bigint_comparison_exp"] | undefined;
    client?: GraphQLTypes["client_bool_exp"] | undefined;
    clientId?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    cluster?: GraphQLTypes["String_comparison_exp"] | undefined;
    date?: GraphQLTypes["date_comparison_exp"] | undefined;
    fee?: GraphQLTypes["float8_comparison_exp"] | undefined;
    from?: GraphQLTypes["String_comparison_exp"] | undefined;
    hash?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    network?: GraphQLTypes["String_comparison_exp"] | undefined;
    nonce?: GraphQLTypes["Int_comparison_exp"] | undefined;
    postBalances?: GraphQLTypes["jsonb_comparison_exp"] | undefined;
    preBalances?: GraphQLTypes["jsonb_comparison_exp"] | undefined;
    recentBlockhash?: GraphQLTypes["String_comparison_exp"] | undefined;
    signature?: GraphQLTypes["jsonb_comparison_exp"] | undefined;
    slot?: GraphQLTypes["bigint_comparison_exp"] | undefined;
    status?: GraphQLTypes["String_comparison_exp"] | undefined;
    to?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "transactions" */
  ["transactions_constraint"]: transactions_constraint;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  ["transactions_delete_at_path_input"]: {
    postBalances?: Array<string> | undefined;
    preBalances?: Array<string> | undefined;
    signature?: Array<string> | undefined;
  };
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  ["transactions_delete_elem_input"]: {
    postBalances?: number | undefined;
    preBalances?: number | undefined;
    signature?: number | undefined;
  };
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  ["transactions_delete_key_input"]: {
    postBalances?: string | undefined;
    preBalances?: string | undefined;
    signature?: string | undefined;
  };
  /** input type for incrementing numeric columns in table "transactions" */
  ["transactions_inc_input"]: {
    amount?: GraphQLTypes["float8"] | undefined;
    blockTime?: GraphQLTypes["bigint"] | undefined;
    chainId?: GraphQLTypes["bigint"] | undefined;
    fee?: GraphQLTypes["float8"] | undefined;
    nonce?: number | undefined;
    slot?: GraphQLTypes["bigint"] | undefined;
  };
  /** input type for inserting data into table "transactions" */
  ["transactions_insert_input"]: {
    amount?: GraphQLTypes["float8"] | undefined;
    blockTime?: GraphQLTypes["bigint"] | undefined;
    chainId?: GraphQLTypes["bigint"] | undefined;
    client?: GraphQLTypes["client_obj_rel_insert_input"] | undefined;
    clientId?: GraphQLTypes["uuid"] | undefined;
    cluster?: string | undefined;
    date?: GraphQLTypes["date"] | undefined;
    fee?: GraphQLTypes["float8"] | undefined;
    from?: string | undefined;
    hash?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    network?: string | undefined;
    nonce?: number | undefined;
    postBalances?: GraphQLTypes["jsonb"] | undefined;
    preBalances?: GraphQLTypes["jsonb"] | undefined;
    recentBlockhash?: string | undefined;
    signature?: GraphQLTypes["jsonb"] | undefined;
    slot?: GraphQLTypes["bigint"] | undefined;
    status?: string | undefined;
    to?: string | undefined;
  };
  /** aggregate max on columns */
  ["transactions_max_fields"]: {
    __typename: "transactions_max_fields";
    amount?: GraphQLTypes["float8"] | undefined;
    blockTime?: GraphQLTypes["bigint"] | undefined;
    chainId?: GraphQLTypes["bigint"] | undefined;
    clientId?: GraphQLTypes["uuid"] | undefined;
    cluster?: string | undefined;
    date?: GraphQLTypes["date"] | undefined;
    fee?: GraphQLTypes["float8"] | undefined;
    from?: string | undefined;
    hash?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    network?: string | undefined;
    nonce?: number | undefined;
    recentBlockhash?: string | undefined;
    slot?: GraphQLTypes["bigint"] | undefined;
    status?: string | undefined;
    to?: string | undefined;
  };
  /** order by max() on columns of table "transactions" */
  ["transactions_max_order_by"]: {
    amount?: GraphQLTypes["order_by"] | undefined;
    blockTime?: GraphQLTypes["order_by"] | undefined;
    chainId?: GraphQLTypes["order_by"] | undefined;
    clientId?: GraphQLTypes["order_by"] | undefined;
    cluster?: GraphQLTypes["order_by"] | undefined;
    date?: GraphQLTypes["order_by"] | undefined;
    fee?: GraphQLTypes["order_by"] | undefined;
    from?: GraphQLTypes["order_by"] | undefined;
    hash?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    network?: GraphQLTypes["order_by"] | undefined;
    nonce?: GraphQLTypes["order_by"] | undefined;
    recentBlockhash?: GraphQLTypes["order_by"] | undefined;
    slot?: GraphQLTypes["order_by"] | undefined;
    status?: GraphQLTypes["order_by"] | undefined;
    to?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["transactions_min_fields"]: {
    __typename: "transactions_min_fields";
    amount?: GraphQLTypes["float8"] | undefined;
    blockTime?: GraphQLTypes["bigint"] | undefined;
    chainId?: GraphQLTypes["bigint"] | undefined;
    clientId?: GraphQLTypes["uuid"] | undefined;
    cluster?: string | undefined;
    date?: GraphQLTypes["date"] | undefined;
    fee?: GraphQLTypes["float8"] | undefined;
    from?: string | undefined;
    hash?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    network?: string | undefined;
    nonce?: number | undefined;
    recentBlockhash?: string | undefined;
    slot?: GraphQLTypes["bigint"] | undefined;
    status?: string | undefined;
    to?: string | undefined;
  };
  /** order by min() on columns of table "transactions" */
  ["transactions_min_order_by"]: {
    amount?: GraphQLTypes["order_by"] | undefined;
    blockTime?: GraphQLTypes["order_by"] | undefined;
    chainId?: GraphQLTypes["order_by"] | undefined;
    clientId?: GraphQLTypes["order_by"] | undefined;
    cluster?: GraphQLTypes["order_by"] | undefined;
    date?: GraphQLTypes["order_by"] | undefined;
    fee?: GraphQLTypes["order_by"] | undefined;
    from?: GraphQLTypes["order_by"] | undefined;
    hash?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    network?: GraphQLTypes["order_by"] | undefined;
    nonce?: GraphQLTypes["order_by"] | undefined;
    recentBlockhash?: GraphQLTypes["order_by"] | undefined;
    slot?: GraphQLTypes["order_by"] | undefined;
    status?: GraphQLTypes["order_by"] | undefined;
    to?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "transactions" */
  ["transactions_mutation_response"]: {
    __typename: "transactions_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["transactions"]>;
  };
  /** on_conflict condition type for table "transactions" */
  ["transactions_on_conflict"]: {
    constraint: GraphQLTypes["transactions_constraint"];
    update_columns: Array<GraphQLTypes["transactions_update_column"]>;
    where?: GraphQLTypes["transactions_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "transactions". */
  ["transactions_order_by"]: {
    amount?: GraphQLTypes["order_by"] | undefined;
    blockTime?: GraphQLTypes["order_by"] | undefined;
    chainId?: GraphQLTypes["order_by"] | undefined;
    client?: GraphQLTypes["client_order_by"] | undefined;
    clientId?: GraphQLTypes["order_by"] | undefined;
    cluster?: GraphQLTypes["order_by"] | undefined;
    date?: GraphQLTypes["order_by"] | undefined;
    fee?: GraphQLTypes["order_by"] | undefined;
    from?: GraphQLTypes["order_by"] | undefined;
    hash?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    network?: GraphQLTypes["order_by"] | undefined;
    nonce?: GraphQLTypes["order_by"] | undefined;
    postBalances?: GraphQLTypes["order_by"] | undefined;
    preBalances?: GraphQLTypes["order_by"] | undefined;
    recentBlockhash?: GraphQLTypes["order_by"] | undefined;
    signature?: GraphQLTypes["order_by"] | undefined;
    slot?: GraphQLTypes["order_by"] | undefined;
    status?: GraphQLTypes["order_by"] | undefined;
    to?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: transactions */
  ["transactions_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  ["transactions_prepend_input"]: {
    postBalances?: GraphQLTypes["jsonb"] | undefined;
    preBalances?: GraphQLTypes["jsonb"] | undefined;
    signature?: GraphQLTypes["jsonb"] | undefined;
  };
  /** select columns of table "transactions" */
  ["transactions_select_column"]: transactions_select_column;
  /** select "transactions_aggregate_bool_exp_avg_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns;
  /** select "transactions_aggregate_bool_exp_corr_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns;
  /** select "transactions_aggregate_bool_exp_covar_samp_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns;
  /** select "transactions_aggregate_bool_exp_max_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns;
  /** select "transactions_aggregate_bool_exp_min_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns;
  /** select "transactions_aggregate_bool_exp_stddev_samp_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns;
  /** select "transactions_aggregate_bool_exp_sum_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns;
  /** select "transactions_aggregate_bool_exp_var_samp_arguments_columns" columns of table "transactions" */
  ["transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns"]: transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns;
  /** input type for updating data in table "transactions" */
  ["transactions_set_input"]: {
    amount?: GraphQLTypes["float8"] | undefined;
    blockTime?: GraphQLTypes["bigint"] | undefined;
    chainId?: GraphQLTypes["bigint"] | undefined;
    clientId?: GraphQLTypes["uuid"] | undefined;
    cluster?: string | undefined;
    date?: GraphQLTypes["date"] | undefined;
    fee?: GraphQLTypes["float8"] | undefined;
    from?: string | undefined;
    hash?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    network?: string | undefined;
    nonce?: number | undefined;
    postBalances?: GraphQLTypes["jsonb"] | undefined;
    preBalances?: GraphQLTypes["jsonb"] | undefined;
    recentBlockhash?: string | undefined;
    signature?: GraphQLTypes["jsonb"] | undefined;
    slot?: GraphQLTypes["bigint"] | undefined;
    status?: string | undefined;
    to?: string | undefined;
  };
  /** aggregate stddev on columns */
  ["transactions_stddev_fields"]: {
    __typename: "transactions_stddev_fields";
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by stddev() on columns of table "transactions" */
  ["transactions_stddev_order_by"]: {
    amount?: GraphQLTypes["order_by"] | undefined;
    blockTime?: GraphQLTypes["order_by"] | undefined;
    chainId?: GraphQLTypes["order_by"] | undefined;
    fee?: GraphQLTypes["order_by"] | undefined;
    nonce?: GraphQLTypes["order_by"] | undefined;
    slot?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate stddev_pop on columns */
  ["transactions_stddev_pop_fields"]: {
    __typename: "transactions_stddev_pop_fields";
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by stddev_pop() on columns of table "transactions" */
  ["transactions_stddev_pop_order_by"]: {
    amount?: GraphQLTypes["order_by"] | undefined;
    blockTime?: GraphQLTypes["order_by"] | undefined;
    chainId?: GraphQLTypes["order_by"] | undefined;
    fee?: GraphQLTypes["order_by"] | undefined;
    nonce?: GraphQLTypes["order_by"] | undefined;
    slot?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate stddev_samp on columns */
  ["transactions_stddev_samp_fields"]: {
    __typename: "transactions_stddev_samp_fields";
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by stddev_samp() on columns of table "transactions" */
  ["transactions_stddev_samp_order_by"]: {
    amount?: GraphQLTypes["order_by"] | undefined;
    blockTime?: GraphQLTypes["order_by"] | undefined;
    chainId?: GraphQLTypes["order_by"] | undefined;
    fee?: GraphQLTypes["order_by"] | undefined;
    nonce?: GraphQLTypes["order_by"] | undefined;
    slot?: GraphQLTypes["order_by"] | undefined;
  };
  /** Streaming cursor of the table "transactions" */
  ["transactions_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["transactions_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["transactions_stream_cursor_value_input"]: {
    amount?: GraphQLTypes["float8"] | undefined;
    blockTime?: GraphQLTypes["bigint"] | undefined;
    chainId?: GraphQLTypes["bigint"] | undefined;
    clientId?: GraphQLTypes["uuid"] | undefined;
    cluster?: string | undefined;
    date?: GraphQLTypes["date"] | undefined;
    fee?: GraphQLTypes["float8"] | undefined;
    from?: string | undefined;
    hash?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    network?: string | undefined;
    nonce?: number | undefined;
    postBalances?: GraphQLTypes["jsonb"] | undefined;
    preBalances?: GraphQLTypes["jsonb"] | undefined;
    recentBlockhash?: string | undefined;
    signature?: GraphQLTypes["jsonb"] | undefined;
    slot?: GraphQLTypes["bigint"] | undefined;
    status?: string | undefined;
    to?: string | undefined;
  };
  /** aggregate sum on columns */
  ["transactions_sum_fields"]: {
    __typename: "transactions_sum_fields";
    amount?: GraphQLTypes["float8"] | undefined;
    blockTime?: GraphQLTypes["bigint"] | undefined;
    chainId?: GraphQLTypes["bigint"] | undefined;
    fee?: GraphQLTypes["float8"] | undefined;
    nonce?: number | undefined;
    slot?: GraphQLTypes["bigint"] | undefined;
  };
  /** order by sum() on columns of table "transactions" */
  ["transactions_sum_order_by"]: {
    amount?: GraphQLTypes["order_by"] | undefined;
    blockTime?: GraphQLTypes["order_by"] | undefined;
    chainId?: GraphQLTypes["order_by"] | undefined;
    fee?: GraphQLTypes["order_by"] | undefined;
    nonce?: GraphQLTypes["order_by"] | undefined;
    slot?: GraphQLTypes["order_by"] | undefined;
  };
  /** update columns of table "transactions" */
  ["transactions_update_column"]: transactions_update_column;
  ["transactions_updates"]: {
    /** append existing jsonb value of filtered columns with new jsonb value */
    _append?: GraphQLTypes["transactions_append_input"] | undefined;
    /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
    _delete_at_path?:
      | GraphQLTypes["transactions_delete_at_path_input"]
      | undefined;
    /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
    _delete_elem?: GraphQLTypes["transactions_delete_elem_input"] | undefined;
    /** delete key/value pair or string element. key/value pairs are matched based on their key value */
    _delete_key?: GraphQLTypes["transactions_delete_key_input"] | undefined;
    /** increments the numeric columns with given value of the filtered values */
    _inc?: GraphQLTypes["transactions_inc_input"] | undefined;
    /** prepend existing jsonb value of filtered columns with new jsonb value */
    _prepend?: GraphQLTypes["transactions_prepend_input"] | undefined;
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["transactions_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["transactions_bool_exp"];
  };
  /** aggregate var_pop on columns */
  ["transactions_var_pop_fields"]: {
    __typename: "transactions_var_pop_fields";
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by var_pop() on columns of table "transactions" */
  ["transactions_var_pop_order_by"]: {
    amount?: GraphQLTypes["order_by"] | undefined;
    blockTime?: GraphQLTypes["order_by"] | undefined;
    chainId?: GraphQLTypes["order_by"] | undefined;
    fee?: GraphQLTypes["order_by"] | undefined;
    nonce?: GraphQLTypes["order_by"] | undefined;
    slot?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate var_samp on columns */
  ["transactions_var_samp_fields"]: {
    __typename: "transactions_var_samp_fields";
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by var_samp() on columns of table "transactions" */
  ["transactions_var_samp_order_by"]: {
    amount?: GraphQLTypes["order_by"] | undefined;
    blockTime?: GraphQLTypes["order_by"] | undefined;
    chainId?: GraphQLTypes["order_by"] | undefined;
    fee?: GraphQLTypes["order_by"] | undefined;
    nonce?: GraphQLTypes["order_by"] | undefined;
    slot?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate variance on columns */
  ["transactions_variance_fields"]: {
    __typename: "transactions_variance_fields";
    amount?: number | undefined;
    blockTime?: number | undefined;
    chainId?: number | undefined;
    fee?: number | undefined;
    nonce?: number | undefined;
    slot?: number | undefined;
  };
  /** order by variance() on columns of table "transactions" */
  ["transactions_variance_order_by"]: {
    amount?: GraphQLTypes["order_by"] | undefined;
    blockTime?: GraphQLTypes["order_by"] | undefined;
    chainId?: GraphQLTypes["order_by"] | undefined;
    fee?: GraphQLTypes["order_by"] | undefined;
    nonce?: GraphQLTypes["order_by"] | undefined;
    slot?: GraphQLTypes["order_by"] | undefined;
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
  /** wallets info for clients */
  ["wallet"]: {
    __typename: "wallet";
    /** An array relationship */
    accounts: Array<GraphQLTypes["account"]>;
    /** An aggregate relationship */
    accounts_aggregate: GraphQLTypes["account_aggregate"];
    /** An object relationship */
    client: GraphQLTypes["client"];
    clientId: GraphQLTypes["uuid"];
    id: GraphQLTypes["uuid"];
    secretPhase: string;
  };
  /** aggregated selection of "wallet" */
  ["wallet_aggregate"]: {
    __typename: "wallet_aggregate";
    aggregate?: GraphQLTypes["wallet_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["wallet"]>;
  };
  ["wallet_aggregate_bool_exp"]: {
    count?: GraphQLTypes["wallet_aggregate_bool_exp_count"] | undefined;
  };
  ["wallet_aggregate_bool_exp_count"]: {
    arguments?: Array<GraphQLTypes["wallet_select_column"]> | undefined;
    distinct?: boolean | undefined;
    filter?: GraphQLTypes["wallet_bool_exp"] | undefined;
    predicate: GraphQLTypes["Int_comparison_exp"];
  };
  /** aggregate fields of "wallet" */
  ["wallet_aggregate_fields"]: {
    __typename: "wallet_aggregate_fields";
    count: number;
    max?: GraphQLTypes["wallet_max_fields"] | undefined;
    min?: GraphQLTypes["wallet_min_fields"] | undefined;
  };
  /** order by aggregate values of table "wallet" */
  ["wallet_aggregate_order_by"]: {
    count?: GraphQLTypes["order_by"] | undefined;
    max?: GraphQLTypes["wallet_max_order_by"] | undefined;
    min?: GraphQLTypes["wallet_min_order_by"] | undefined;
  };
  /** input type for inserting array relation for remote table "wallet" */
  ["wallet_arr_rel_insert_input"]: {
    data: Array<GraphQLTypes["wallet_insert_input"]>;
    /** upsert condition */
    on_conflict?: GraphQLTypes["wallet_on_conflict"] | undefined;
  };
  /** Boolean expression to filter rows from the table "wallet". All fields are combined with a logical 'AND'. */
  ["wallet_bool_exp"]: {
    _and?: Array<GraphQLTypes["wallet_bool_exp"]> | undefined;
    _not?: GraphQLTypes["wallet_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["wallet_bool_exp"]> | undefined;
    accounts?: GraphQLTypes["account_bool_exp"] | undefined;
    accounts_aggregate?: GraphQLTypes["account_aggregate_bool_exp"] | undefined;
    client?: GraphQLTypes["client_bool_exp"] | undefined;
    clientId?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    secretPhase?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "wallet" */
  ["wallet_constraint"]: wallet_constraint;
  /** input type for inserting data into table "wallet" */
  ["wallet_insert_input"]: {
    accounts?: GraphQLTypes["account_arr_rel_insert_input"] | undefined;
    client?: GraphQLTypes["client_obj_rel_insert_input"] | undefined;
    clientId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    secretPhase?: string | undefined;
  };
  /** aggregate max on columns */
  ["wallet_max_fields"]: {
    __typename: "wallet_max_fields";
    clientId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    secretPhase?: string | undefined;
  };
  /** order by max() on columns of table "wallet" */
  ["wallet_max_order_by"]: {
    clientId?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    secretPhase?: GraphQLTypes["order_by"] | undefined;
  };
  /** aggregate min on columns */
  ["wallet_min_fields"]: {
    __typename: "wallet_min_fields";
    clientId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    secretPhase?: string | undefined;
  };
  /** order by min() on columns of table "wallet" */
  ["wallet_min_order_by"]: {
    clientId?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    secretPhase?: GraphQLTypes["order_by"] | undefined;
  };
  /** response of any mutation on the table "wallet" */
  ["wallet_mutation_response"]: {
    __typename: "wallet_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["wallet"]>;
  };
  /** input type for inserting object relation for remote table "wallet" */
  ["wallet_obj_rel_insert_input"]: {
    data: GraphQLTypes["wallet_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["wallet_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "wallet" */
  ["wallet_on_conflict"]: {
    constraint: GraphQLTypes["wallet_constraint"];
    update_columns: Array<GraphQLTypes["wallet_update_column"]>;
    where?: GraphQLTypes["wallet_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "wallet". */
  ["wallet_order_by"]: {
    accounts_aggregate?: GraphQLTypes["account_aggregate_order_by"] | undefined;
    client?: GraphQLTypes["client_order_by"] | undefined;
    clientId?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    secretPhase?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: wallet */
  ["wallet_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "wallet" */
  ["wallet_select_column"]: wallet_select_column;
  /** input type for updating data in table "wallet" */
  ["wallet_set_input"]: {
    clientId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    secretPhase?: string | undefined;
  };
  /** Streaming cursor of the table "wallet" */
  ["wallet_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["wallet_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["wallet_stream_cursor_value_input"]: {
    clientId?: GraphQLTypes["uuid"] | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    secretPhase?: string | undefined;
  };
  /** update columns of table "wallet" */
  ["wallet_update_column"]: wallet_update_column;
  ["wallet_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["wallet_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["wallet_bool_exp"];
  };
};
/** unique or primary key constraints on table "account" */
export const enum account_constraint {
  account_pkey = "account_pkey",
}
/** select columns of table "account" */
export const enum account_select_column {
  clientId = "clientId",
  id = "id",
  name = "name",
  walletId = "walletId",
}
/** update columns of table "account" */
export const enum account_update_column {
  clientId = "clientId",
  id = "id",
  name = "name",
  walletId = "walletId",
}
/** unique or primary key constraints on table "address" */
export const enum address_constraint {
  address_id_key = "address_id_key",
  address_pkey = "address_pkey",
  chain_client_id_key = "chain_client_id_key",
}
/** select columns of table "address" */
export const enum address_select_column {
  bitcoin = "bitcoin",
  client_id = "client_id",
  eth = "eth",
  id = "id",
  sol = "sol",
  usdc = "usdc",
}
/** update columns of table "address" */
export const enum address_update_column {
  bitcoin = "bitcoin",
  client_id = "client_id",
  eth = "eth",
  id = "id",
  sol = "sol",
  usdc = "usdc",
}
/** unique or primary key constraints on table "bitcoin" */
export const enum bitcoin_constraint {
  bitcoin_id_key = "bitcoin_id_key",
  bitcoin_pkey = "bitcoin_pkey",
  bitcoin_privateKey_key = "bitcoin_privateKey_key",
  bitcoin_publicKey_key = "bitcoin_publicKey_key",
  bitcoin_walletId_key = "bitcoin_walletId_key",
}
/** select columns of table "bitcoin" */
export const enum bitcoin_select_column {
  accountId = "accountId",
  id = "id",
  mainnetBtc = "mainnetBtc",
  privateKey = "privateKey",
  publicKey = "publicKey",
  regtestBtc = "regtestBtc",
  textnetBtc = "textnetBtc",
}
/** update columns of table "bitcoin" */
export const enum bitcoin_update_column {
  accountId = "accountId",
  id = "id",
  mainnetBtc = "mainnetBtc",
  privateKey = "privateKey",
  publicKey = "publicKey",
  regtestBtc = "regtestBtc",
  textnetBtc = "textnetBtc",
}
/** unique or primary key constraints on table "client" */
export const enum client_constraint {
  client_email_key = "client_email_key",
  client_mobile_number_key = "client_mobile_number_key",
  client_pkey = "client_pkey",
}
/** select columns of table "client" */
export const enum client_select_column {
  email = "email",
  firstname = "firstname",
  id = "id",
  lastname = "lastname",
  mobile = "mobile",
  password = "password",
  username = "username",
  valid = "valid",
}
/** update columns of table "client" */
export const enum client_update_column {
  email = "email",
  firstname = "firstname",
  id = "id",
  lastname = "lastname",
  mobile = "mobile",
  password = "password",
  username = "username",
  valid = "valid",
}
/** ordering argument of a cursor */
export const enum cursor_ordering {
  ASC = "ASC",
  DESC = "DESC",
}
/** unique or primary key constraints on table "eth" */
export const enum eth_constraint {
  eth_pkey = "eth_pkey",
  eth_privateKey_key = "eth_privateKey_key",
  eth_publicKey_key = "eth_publicKey_key",
  eth_walletId_key = "eth_walletId_key",
}
/** select columns of table "eth" */
export const enum eth_select_column {
  accountId = "accountId",
  goerliEth = "goerliEth",
  id = "id",
  kovanEth = "kovanEth",
  mainnetEth = "mainnetEth",
  privateKey = "privateKey",
  publicKey = "publicKey",
  rinkebyEth = "rinkebyEth",
  ropstenEth = "ropstenEth",
  sepoliaEth = "sepoliaEth",
}
/** update columns of table "eth" */
export const enum eth_update_column {
  accountId = "accountId",
  goerliEth = "goerliEth",
  id = "id",
  kovanEth = "kovanEth",
  mainnetEth = "mainnetEth",
  privateKey = "privateKey",
  publicKey = "publicKey",
  rinkebyEth = "rinkebyEth",
  ropstenEth = "ropstenEth",
  sepoliaEth = "sepoliaEth",
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
/** unique or primary key constraints on table "sol" */
export const enum sol_constraint {
  sol_accountId_key = "sol_accountId_key",
  sol_id_key = "sol_id_key",
  sol_pkey = "sol_pkey",
  sol_privateKey_key = "sol_privateKey_key",
  sol_publicKey_key = "sol_publicKey_key",
}
/** select columns of table "sol" */
export const enum sol_select_column {
  accountId = "accountId",
  devnetSol = "devnetSol",
  id = "id",
  mainnetSol = "mainnetSol",
  privateKey = "privateKey",
  publicKey = "publicKey",
  testnetSol = "testnetSol",
}
/** update columns of table "sol" */
export const enum sol_update_column {
  accountId = "accountId",
  devnetSol = "devnetSol",
  id = "id",
  mainnetSol = "mainnetSol",
  privateKey = "privateKey",
  publicKey = "publicKey",
  testnetSol = "testnetSol",
}
/** unique or primary key constraints on table "transactions" */
export const enum transactions_constraint {
  transactions_block_time_key = "transactions_block_time_key",
  transactions_pkey = "transactions_pkey",
}
/** select columns of table "transactions" */
export const enum transactions_select_column {
  amount = "amount",
  blockTime = "blockTime",
  chainId = "chainId",
  clientId = "clientId",
  cluster = "cluster",
  date = "date",
  fee = "fee",
  from = "from",
  hash = "hash",
  id = "id",
  network = "network",
  nonce = "nonce",
  postBalances = "postBalances",
  preBalances = "preBalances",
  recentBlockhash = "recentBlockhash",
  signature = "signature",
  slot = "slot",
  status = "status",
  to = "to",
}
/** select "transactions_aggregate_bool_exp_avg_arguments_columns" columns of table "transactions" */
export const enum transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns {
  amount = "amount",
  fee = "fee",
}
/** select "transactions_aggregate_bool_exp_corr_arguments_columns" columns of table "transactions" */
export const enum transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns {
  amount = "amount",
  fee = "fee",
}
/** select "transactions_aggregate_bool_exp_covar_samp_arguments_columns" columns of table "transactions" */
export const enum transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns {
  amount = "amount",
  fee = "fee",
}
/** select "transactions_aggregate_bool_exp_max_arguments_columns" columns of table "transactions" */
export const enum transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns {
  amount = "amount",
  fee = "fee",
}
/** select "transactions_aggregate_bool_exp_min_arguments_columns" columns of table "transactions" */
export const enum transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns {
  amount = "amount",
  fee = "fee",
}
/** select "transactions_aggregate_bool_exp_stddev_samp_arguments_columns" columns of table "transactions" */
export const enum transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns {
  amount = "amount",
  fee = "fee",
}
/** select "transactions_aggregate_bool_exp_sum_arguments_columns" columns of table "transactions" */
export const enum transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns {
  amount = "amount",
  fee = "fee",
}
/** select "transactions_aggregate_bool_exp_var_samp_arguments_columns" columns of table "transactions" */
export const enum transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns {
  amount = "amount",
  fee = "fee",
}
/** update columns of table "transactions" */
export const enum transactions_update_column {
  amount = "amount",
  blockTime = "blockTime",
  chainId = "chainId",
  clientId = "clientId",
  cluster = "cluster",
  date = "date",
  fee = "fee",
  from = "from",
  hash = "hash",
  id = "id",
  network = "network",
  nonce = "nonce",
  postBalances = "postBalances",
  preBalances = "preBalances",
  recentBlockhash = "recentBlockhash",
  signature = "signature",
  slot = "slot",
  status = "status",
  to = "to",
}
/** unique or primary key constraints on table "wallet" */
export const enum wallet_constraint {
  wallet_id_key = "wallet_id_key",
  wallet_pkey = "wallet_pkey",
  wallet_secretPhase_key = "wallet_secretPhase_key",
}
/** select columns of table "wallet" */
export const enum wallet_select_column {
  clientId = "clientId",
  id = "id",
  secretPhase = "secretPhase",
}
/** update columns of table "wallet" */
export const enum wallet_update_column {
  clientId = "clientId",
  id = "id",
  secretPhase = "secretPhase",
}

type ZEUS_VARIABLES = {
  ["Boolean_comparison_exp"]: ValueTypes["Boolean_comparison_exp"];
  ["Int_comparison_exp"]: ValueTypes["Int_comparison_exp"];
  ["String_comparison_exp"]: ValueTypes["String_comparison_exp"];
  ["account_aggregate_bool_exp"]: ValueTypes["account_aggregate_bool_exp"];
  ["account_aggregate_bool_exp_count"]: ValueTypes["account_aggregate_bool_exp_count"];
  ["account_aggregate_order_by"]: ValueTypes["account_aggregate_order_by"];
  ["account_arr_rel_insert_input"]: ValueTypes["account_arr_rel_insert_input"];
  ["account_bool_exp"]: ValueTypes["account_bool_exp"];
  ["account_constraint"]: ValueTypes["account_constraint"];
  ["account_insert_input"]: ValueTypes["account_insert_input"];
  ["account_max_order_by"]: ValueTypes["account_max_order_by"];
  ["account_min_order_by"]: ValueTypes["account_min_order_by"];
  ["account_obj_rel_insert_input"]: ValueTypes["account_obj_rel_insert_input"];
  ["account_on_conflict"]: ValueTypes["account_on_conflict"];
  ["account_order_by"]: ValueTypes["account_order_by"];
  ["account_pk_columns_input"]: ValueTypes["account_pk_columns_input"];
  ["account_select_column"]: ValueTypes["account_select_column"];
  ["account_set_input"]: ValueTypes["account_set_input"];
  ["account_stream_cursor_input"]: ValueTypes["account_stream_cursor_input"];
  ["account_stream_cursor_value_input"]: ValueTypes["account_stream_cursor_value_input"];
  ["account_update_column"]: ValueTypes["account_update_column"];
  ["account_updates"]: ValueTypes["account_updates"];
  ["address_bool_exp"]: ValueTypes["address_bool_exp"];
  ["address_constraint"]: ValueTypes["address_constraint"];
  ["address_insert_input"]: ValueTypes["address_insert_input"];
  ["address_obj_rel_insert_input"]: ValueTypes["address_obj_rel_insert_input"];
  ["address_on_conflict"]: ValueTypes["address_on_conflict"];
  ["address_order_by"]: ValueTypes["address_order_by"];
  ["address_pk_columns_input"]: ValueTypes["address_pk_columns_input"];
  ["address_select_column"]: ValueTypes["address_select_column"];
  ["address_set_input"]: ValueTypes["address_set_input"];
  ["address_stream_cursor_input"]: ValueTypes["address_stream_cursor_input"];
  ["address_stream_cursor_value_input"]: ValueTypes["address_stream_cursor_value_input"];
  ["address_update_column"]: ValueTypes["address_update_column"];
  ["address_updates"]: ValueTypes["address_updates"];
  ["bigint"]: ValueTypes["bigint"];
  ["bigint_comparison_exp"]: ValueTypes["bigint_comparison_exp"];
  ["bitcoin_bool_exp"]: ValueTypes["bitcoin_bool_exp"];
  ["bitcoin_constraint"]: ValueTypes["bitcoin_constraint"];
  ["bitcoin_inc_input"]: ValueTypes["bitcoin_inc_input"];
  ["bitcoin_insert_input"]: ValueTypes["bitcoin_insert_input"];
  ["bitcoin_obj_rel_insert_input"]: ValueTypes["bitcoin_obj_rel_insert_input"];
  ["bitcoin_on_conflict"]: ValueTypes["bitcoin_on_conflict"];
  ["bitcoin_order_by"]: ValueTypes["bitcoin_order_by"];
  ["bitcoin_pk_columns_input"]: ValueTypes["bitcoin_pk_columns_input"];
  ["bitcoin_select_column"]: ValueTypes["bitcoin_select_column"];
  ["bitcoin_set_input"]: ValueTypes["bitcoin_set_input"];
  ["bitcoin_stream_cursor_input"]: ValueTypes["bitcoin_stream_cursor_input"];
  ["bitcoin_stream_cursor_value_input"]: ValueTypes["bitcoin_stream_cursor_value_input"];
  ["bitcoin_update_column"]: ValueTypes["bitcoin_update_column"];
  ["bitcoin_updates"]: ValueTypes["bitcoin_updates"];
  ["client_bool_exp"]: ValueTypes["client_bool_exp"];
  ["client_constraint"]: ValueTypes["client_constraint"];
  ["client_inc_input"]: ValueTypes["client_inc_input"];
  ["client_insert_input"]: ValueTypes["client_insert_input"];
  ["client_obj_rel_insert_input"]: ValueTypes["client_obj_rel_insert_input"];
  ["client_on_conflict"]: ValueTypes["client_on_conflict"];
  ["client_order_by"]: ValueTypes["client_order_by"];
  ["client_pk_columns_input"]: ValueTypes["client_pk_columns_input"];
  ["client_select_column"]: ValueTypes["client_select_column"];
  ["client_set_input"]: ValueTypes["client_set_input"];
  ["client_stream_cursor_input"]: ValueTypes["client_stream_cursor_input"];
  ["client_stream_cursor_value_input"]: ValueTypes["client_stream_cursor_value_input"];
  ["client_update_column"]: ValueTypes["client_update_column"];
  ["client_updates"]: ValueTypes["client_updates"];
  ["cursor_ordering"]: ValueTypes["cursor_ordering"];
  ["date"]: ValueTypes["date"];
  ["date_comparison_exp"]: ValueTypes["date_comparison_exp"];
  ["eth_bool_exp"]: ValueTypes["eth_bool_exp"];
  ["eth_constraint"]: ValueTypes["eth_constraint"];
  ["eth_inc_input"]: ValueTypes["eth_inc_input"];
  ["eth_insert_input"]: ValueTypes["eth_insert_input"];
  ["eth_obj_rel_insert_input"]: ValueTypes["eth_obj_rel_insert_input"];
  ["eth_on_conflict"]: ValueTypes["eth_on_conflict"];
  ["eth_order_by"]: ValueTypes["eth_order_by"];
  ["eth_pk_columns_input"]: ValueTypes["eth_pk_columns_input"];
  ["eth_select_column"]: ValueTypes["eth_select_column"];
  ["eth_set_input"]: ValueTypes["eth_set_input"];
  ["eth_stream_cursor_input"]: ValueTypes["eth_stream_cursor_input"];
  ["eth_stream_cursor_value_input"]: ValueTypes["eth_stream_cursor_value_input"];
  ["eth_update_column"]: ValueTypes["eth_update_column"];
  ["eth_updates"]: ValueTypes["eth_updates"];
  ["float8"]: ValueTypes["float8"];
  ["float8_comparison_exp"]: ValueTypes["float8_comparison_exp"];
  ["jsonb"]: ValueTypes["jsonb"];
  ["jsonb_cast_exp"]: ValueTypes["jsonb_cast_exp"];
  ["jsonb_comparison_exp"]: ValueTypes["jsonb_comparison_exp"];
  ["order_by"]: ValueTypes["order_by"];
  ["sol_bool_exp"]: ValueTypes["sol_bool_exp"];
  ["sol_constraint"]: ValueTypes["sol_constraint"];
  ["sol_inc_input"]: ValueTypes["sol_inc_input"];
  ["sol_insert_input"]: ValueTypes["sol_insert_input"];
  ["sol_obj_rel_insert_input"]: ValueTypes["sol_obj_rel_insert_input"];
  ["sol_on_conflict"]: ValueTypes["sol_on_conflict"];
  ["sol_order_by"]: ValueTypes["sol_order_by"];
  ["sol_pk_columns_input"]: ValueTypes["sol_pk_columns_input"];
  ["sol_select_column"]: ValueTypes["sol_select_column"];
  ["sol_set_input"]: ValueTypes["sol_set_input"];
  ["sol_stream_cursor_input"]: ValueTypes["sol_stream_cursor_input"];
  ["sol_stream_cursor_value_input"]: ValueTypes["sol_stream_cursor_value_input"];
  ["sol_update_column"]: ValueTypes["sol_update_column"];
  ["sol_updates"]: ValueTypes["sol_updates"];
  ["transactions_aggregate_bool_exp"]: ValueTypes["transactions_aggregate_bool_exp"];
  ["transactions_aggregate_bool_exp_avg"]: ValueTypes["transactions_aggregate_bool_exp_avg"];
  ["transactions_aggregate_bool_exp_corr"]: ValueTypes["transactions_aggregate_bool_exp_corr"];
  ["transactions_aggregate_bool_exp_corr_arguments"]: ValueTypes["transactions_aggregate_bool_exp_corr_arguments"];
  ["transactions_aggregate_bool_exp_count"]: ValueTypes["transactions_aggregate_bool_exp_count"];
  ["transactions_aggregate_bool_exp_covar_samp"]: ValueTypes["transactions_aggregate_bool_exp_covar_samp"];
  ["transactions_aggregate_bool_exp_covar_samp_arguments"]: ValueTypes["transactions_aggregate_bool_exp_covar_samp_arguments"];
  ["transactions_aggregate_bool_exp_max"]: ValueTypes["transactions_aggregate_bool_exp_max"];
  ["transactions_aggregate_bool_exp_min"]: ValueTypes["transactions_aggregate_bool_exp_min"];
  ["transactions_aggregate_bool_exp_stddev_samp"]: ValueTypes["transactions_aggregate_bool_exp_stddev_samp"];
  ["transactions_aggregate_bool_exp_sum"]: ValueTypes["transactions_aggregate_bool_exp_sum"];
  ["transactions_aggregate_bool_exp_var_samp"]: ValueTypes["transactions_aggregate_bool_exp_var_samp"];
  ["transactions_aggregate_order_by"]: ValueTypes["transactions_aggregate_order_by"];
  ["transactions_append_input"]: ValueTypes["transactions_append_input"];
  ["transactions_arr_rel_insert_input"]: ValueTypes["transactions_arr_rel_insert_input"];
  ["transactions_avg_order_by"]: ValueTypes["transactions_avg_order_by"];
  ["transactions_bool_exp"]: ValueTypes["transactions_bool_exp"];
  ["transactions_constraint"]: ValueTypes["transactions_constraint"];
  ["transactions_delete_at_path_input"]: ValueTypes["transactions_delete_at_path_input"];
  ["transactions_delete_elem_input"]: ValueTypes["transactions_delete_elem_input"];
  ["transactions_delete_key_input"]: ValueTypes["transactions_delete_key_input"];
  ["transactions_inc_input"]: ValueTypes["transactions_inc_input"];
  ["transactions_insert_input"]: ValueTypes["transactions_insert_input"];
  ["transactions_max_order_by"]: ValueTypes["transactions_max_order_by"];
  ["transactions_min_order_by"]: ValueTypes["transactions_min_order_by"];
  ["transactions_on_conflict"]: ValueTypes["transactions_on_conflict"];
  ["transactions_order_by"]: ValueTypes["transactions_order_by"];
  ["transactions_pk_columns_input"]: ValueTypes["transactions_pk_columns_input"];
  ["transactions_prepend_input"]: ValueTypes["transactions_prepend_input"];
  ["transactions_select_column"]: ValueTypes["transactions_select_column"];
  ["transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns"]: ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_avg_arguments_columns"];
  ["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"]: ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_corr_arguments_columns"];
  ["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"]: ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_covar_samp_arguments_columns"];
  ["transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns"]: ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_max_arguments_columns"];
  ["transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns"]: ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_min_arguments_columns"];
  ["transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns"]: ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_stddev_samp_arguments_columns"];
  ["transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns"]: ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_sum_arguments_columns"];
  ["transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns"]: ValueTypes["transactions_select_column_transactions_aggregate_bool_exp_var_samp_arguments_columns"];
  ["transactions_set_input"]: ValueTypes["transactions_set_input"];
  ["transactions_stddev_order_by"]: ValueTypes["transactions_stddev_order_by"];
  ["transactions_stddev_pop_order_by"]: ValueTypes["transactions_stddev_pop_order_by"];
  ["transactions_stddev_samp_order_by"]: ValueTypes["transactions_stddev_samp_order_by"];
  ["transactions_stream_cursor_input"]: ValueTypes["transactions_stream_cursor_input"];
  ["transactions_stream_cursor_value_input"]: ValueTypes["transactions_stream_cursor_value_input"];
  ["transactions_sum_order_by"]: ValueTypes["transactions_sum_order_by"];
  ["transactions_update_column"]: ValueTypes["transactions_update_column"];
  ["transactions_updates"]: ValueTypes["transactions_updates"];
  ["transactions_var_pop_order_by"]: ValueTypes["transactions_var_pop_order_by"];
  ["transactions_var_samp_order_by"]: ValueTypes["transactions_var_samp_order_by"];
  ["transactions_variance_order_by"]: ValueTypes["transactions_variance_order_by"];
  ["uuid"]: ValueTypes["uuid"];
  ["uuid_comparison_exp"]: ValueTypes["uuid_comparison_exp"];
  ["wallet_aggregate_bool_exp"]: ValueTypes["wallet_aggregate_bool_exp"];
  ["wallet_aggregate_bool_exp_count"]: ValueTypes["wallet_aggregate_bool_exp_count"];
  ["wallet_aggregate_order_by"]: ValueTypes["wallet_aggregate_order_by"];
  ["wallet_arr_rel_insert_input"]: ValueTypes["wallet_arr_rel_insert_input"];
  ["wallet_bool_exp"]: ValueTypes["wallet_bool_exp"];
  ["wallet_constraint"]: ValueTypes["wallet_constraint"];
  ["wallet_insert_input"]: ValueTypes["wallet_insert_input"];
  ["wallet_max_order_by"]: ValueTypes["wallet_max_order_by"];
  ["wallet_min_order_by"]: ValueTypes["wallet_min_order_by"];
  ["wallet_obj_rel_insert_input"]: ValueTypes["wallet_obj_rel_insert_input"];
  ["wallet_on_conflict"]: ValueTypes["wallet_on_conflict"];
  ["wallet_order_by"]: ValueTypes["wallet_order_by"];
  ["wallet_pk_columns_input"]: ValueTypes["wallet_pk_columns_input"];
  ["wallet_select_column"]: ValueTypes["wallet_select_column"];
  ["wallet_set_input"]: ValueTypes["wallet_set_input"];
  ["wallet_stream_cursor_input"]: ValueTypes["wallet_stream_cursor_input"];
  ["wallet_stream_cursor_value_input"]: ValueTypes["wallet_stream_cursor_value_input"];
  ["wallet_update_column"]: ValueTypes["wallet_update_column"];
  ["wallet_updates"]: ValueTypes["wallet_updates"];
};
