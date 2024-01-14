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
  uuid?: ScalarResolver;
};
type ZEUS_UNIONS = never;

export type ValueTypes = {
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
  /** different chain and there address */
  ["chain"]: AliasType<{
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
  /** aggregated selection of "chain" */
  ["chain_aggregate"]: AliasType<{
    aggregate?: ValueTypes["chain_aggregate_fields"];
    nodes?: ValueTypes["chain"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "chain" */
  ["chain_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["chain_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["chain_max_fields"];
    min?: ValueTypes["chain_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "chain". All fields are combined with a logical 'AND'. */
  ["chain_bool_exp"]: {
    _and?:
      | Array<ValueTypes["chain_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["chain_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["chain_bool_exp"]>
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
  /** unique or primary key constraints on table "chain" */
  ["chain_constraint"]: chain_constraint;
  /** input type for inserting data into table "chain" */
  ["chain_insert_input"]: {
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
  ["chain_max_fields"]: AliasType<{
    bitcoin?: boolean | `@${string}`;
    client_id?: boolean | `@${string}`;
    eth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    sol?: boolean | `@${string}`;
    usdc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["chain_min_fields"]: AliasType<{
    bitcoin?: boolean | `@${string}`;
    client_id?: boolean | `@${string}`;
    eth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    sol?: boolean | `@${string}`;
    usdc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "chain" */
  ["chain_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["chain"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "chain" */
  ["chain_obj_rel_insert_input"]: {
    data: ValueTypes["chain_insert_input"] | Variable<any, string>;
    /** upsert condition */
    on_conflict?:
      | ValueTypes["chain_on_conflict"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** on_conflict condition type for table "chain" */
  ["chain_on_conflict"]: {
    constraint: ValueTypes["chain_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["chain_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["chain_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "chain". */
  ["chain_order_by"]: {
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
  /** primary key columns input for table: chain */
  ["chain_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "chain" */
  ["chain_select_column"]: chain_select_column;
  /** input type for updating data in table "chain" */
  ["chain_set_input"]: {
    bitcoin?: string | undefined | null | Variable<any, string>;
    client_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    eth?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    sol?: string | undefined | null | Variable<any, string>;
    usdc?: string | undefined | null | Variable<any, string>;
  };
  /** Streaming cursor of the table "chain" */
  ["chain_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["chain_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["chain_stream_cursor_value_input"]: {
    bitcoin?: string | undefined | null | Variable<any, string>;
    client_id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    eth?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    sol?: string | undefined | null | Variable<any, string>;
    usdc?: string | undefined | null | Variable<any, string>;
  };
  /** update columns of table "chain" */
  ["chain_update_column"]: chain_update_column;
  ["chain_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["chain_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["chain_bool_exp"] | Variable<any, string>;
  };
  /** subscriber for paybox */
  ["client"]: AliasType<{
    /** An object relationship */
    chain?: ValueTypes["chain"];
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    mobile?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
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
    chain?:
      | ValueTypes["chain_bool_exp"]
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
      | ValueTypes["Int_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    username?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "client" */
  ["client_constraint"]: client_constraint;
  /** input type for incrementing numeric columns in table "client" */
  ["client_inc_input"]: {
    mobile?: number | undefined | null | Variable<any, string>;
  };
  /** input type for inserting data into table "client" */
  ["client_insert_input"]: {
    chain?:
      | ValueTypes["chain_obj_rel_insert_input"]
      | undefined
      | null
      | Variable<any, string>;
    email?: string | undefined | null | Variable<any, string>;
    firstname?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    lastname?: string | undefined | null | Variable<any, string>;
    mobile?: number | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["client_max_fields"]: AliasType<{
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    mobile?: boolean | `@${string}`;
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
    chain?:
      | ValueTypes["chain_order_by"]
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
    username?:
      | ValueTypes["order_by"]
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
    mobile?: number | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
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
    mobile?: number | undefined | null | Variable<any, string>;
    username?: string | undefined | null | Variable<any, string>;
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
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_chain?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["chain_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["chain_mutation_response"],
    ];
    delete_chain_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["chain"],
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
    insert_chain?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["chain_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chain_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chain_mutation_response"],
    ];
    insert_chain_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["chain_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["chain_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chain"],
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
    update_chain?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["chain_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["chain_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["chain_mutation_response"],
    ];
    update_chain_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["chain_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["chain_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["chain"],
    ];
    update_chain_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["chain_updates"]> | Variable<any, string>;
      },
      ValueTypes["chain_mutation_response"],
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
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    chain?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chain_select_column"]>
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
          | Array<ValueTypes["chain_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chain_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chain"],
    ];
    chain_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chain_select_column"]>
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
          | Array<ValueTypes["chain_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chain_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chain_aggregate"],
    ];
    chain_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["chain"],
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
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    chain?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chain_select_column"]>
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
          | Array<ValueTypes["chain_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chain_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chain"],
    ];
    chain_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["chain_select_column"]>
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
          | Array<ValueTypes["chain_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chain_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chain_aggregate"],
    ];
    chain_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["chain"],
    ];
    chain_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["chain_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["chain_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["chain"],
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
    __typename?: boolean | `@${string}`;
  }>;
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
  /** different chain and there address */
  ["chain"]: AliasType<{
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
  /** aggregated selection of "chain" */
  ["chain_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["chain_aggregate_fields"];
    nodes?: ResolverInputTypes["chain"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "chain" */
  ["chain_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["chain_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["chain_max_fields"];
    min?: ResolverInputTypes["chain_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "chain". All fields are combined with a logical 'AND'. */
  ["chain_bool_exp"]: {
    _and?: Array<ResolverInputTypes["chain_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["chain_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["chain_bool_exp"]> | undefined | null;
    bitcoin?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    client?: ResolverInputTypes["client_bool_exp"] | undefined | null;
    client_id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    eth?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    sol?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    usdc?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "chain" */
  ["chain_constraint"]: chain_constraint;
  /** input type for inserting data into table "chain" */
  ["chain_insert_input"]: {
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
  ["chain_max_fields"]: AliasType<{
    bitcoin?: boolean | `@${string}`;
    client_id?: boolean | `@${string}`;
    eth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    sol?: boolean | `@${string}`;
    usdc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["chain_min_fields"]: AliasType<{
    bitcoin?: boolean | `@${string}`;
    client_id?: boolean | `@${string}`;
    eth?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    sol?: boolean | `@${string}`;
    usdc?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "chain" */
  ["chain_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["chain"];
    __typename?: boolean | `@${string}`;
  }>;
  /** input type for inserting object relation for remote table "chain" */
  ["chain_obj_rel_insert_input"]: {
    data: ResolverInputTypes["chain_insert_input"];
    /** upsert condition */
    on_conflict?: ResolverInputTypes["chain_on_conflict"] | undefined | null;
  };
  /** on_conflict condition type for table "chain" */
  ["chain_on_conflict"]: {
    constraint: ResolverInputTypes["chain_constraint"];
    update_columns: Array<ResolverInputTypes["chain_update_column"]>;
    where?: ResolverInputTypes["chain_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "chain". */
  ["chain_order_by"]: {
    bitcoin?: ResolverInputTypes["order_by"] | undefined | null;
    client?: ResolverInputTypes["client_order_by"] | undefined | null;
    client_id?: ResolverInputTypes["order_by"] | undefined | null;
    eth?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    sol?: ResolverInputTypes["order_by"] | undefined | null;
    usdc?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: chain */
  ["chain_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "chain" */
  ["chain_select_column"]: chain_select_column;
  /** input type for updating data in table "chain" */
  ["chain_set_input"]: {
    bitcoin?: string | undefined | null;
    client_id?: ResolverInputTypes["uuid"] | undefined | null;
    eth?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    sol?: string | undefined | null;
    usdc?: string | undefined | null;
  };
  /** Streaming cursor of the table "chain" */
  ["chain_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["chain_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["chain_stream_cursor_value_input"]: {
    bitcoin?: string | undefined | null;
    client_id?: ResolverInputTypes["uuid"] | undefined | null;
    eth?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    sol?: string | undefined | null;
    usdc?: string | undefined | null;
  };
  /** update columns of table "chain" */
  ["chain_update_column"]: chain_update_column;
  ["chain_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["chain_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["chain_bool_exp"];
  };
  /** subscriber for paybox */
  ["client"]: AliasType<{
    /** An object relationship */
    chain?: ResolverInputTypes["chain"];
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    mobile?: boolean | `@${string}`;
    username?: boolean | `@${string}`;
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
    chain?: ResolverInputTypes["chain_bool_exp"] | undefined | null;
    email?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    firstname?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    lastname?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    mobile?: ResolverInputTypes["Int_comparison_exp"] | undefined | null;
    username?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
  };
  /** unique or primary key constraints on table "client" */
  ["client_constraint"]: client_constraint;
  /** input type for incrementing numeric columns in table "client" */
  ["client_inc_input"]: {
    mobile?: number | undefined | null;
  };
  /** input type for inserting data into table "client" */
  ["client_insert_input"]: {
    chain?: ResolverInputTypes["chain_obj_rel_insert_input"] | undefined | null;
    email?: string | undefined | null;
    firstname?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    lastname?: string | undefined | null;
    mobile?: number | undefined | null;
    username?: string | undefined | null;
  };
  /** aggregate max on columns */
  ["client_max_fields"]: AliasType<{
    email?: boolean | `@${string}`;
    firstname?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    lastname?: boolean | `@${string}`;
    mobile?: boolean | `@${string}`;
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
    chain?: ResolverInputTypes["chain_order_by"] | undefined | null;
    email?: ResolverInputTypes["order_by"] | undefined | null;
    firstname?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    lastname?: ResolverInputTypes["order_by"] | undefined | null;
    mobile?: ResolverInputTypes["order_by"] | undefined | null;
    username?: ResolverInputTypes["order_by"] | undefined | null;
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
    mobile?: number | undefined | null;
    username?: string | undefined | null;
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
    mobile?: number | undefined | null;
    username?: string | undefined | null;
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
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_chain?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["chain_bool_exp"];
      },
      ResolverInputTypes["chain_mutation_response"],
    ];
    delete_chain_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["chain"],
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
    insert_chain?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["chain_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["chain_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["chain_mutation_response"],
    ];
    insert_chain_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["chain_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["chain_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["chain"],
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
    update_chain?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["chain_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["chain_bool_exp"];
      },
      ResolverInputTypes["chain_mutation_response"],
    ];
    update_chain_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["chain_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["chain_pk_columns_input"];
      },
      ResolverInputTypes["chain"],
    ];
    update_chain_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["chain_updates"]>;
      },
      ResolverInputTypes["chain_mutation_response"],
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
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    chain?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chain_select_column"]>
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
          | Array<ResolverInputTypes["chain_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["chain_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chain"],
    ];
    chain_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chain_select_column"]>
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
          | Array<ResolverInputTypes["chain_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["chain_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chain_aggregate"],
    ];
    chain_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["chain"],
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
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    chain?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chain_select_column"]>
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
          | Array<ResolverInputTypes["chain_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["chain_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chain"],
    ];
    chain_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["chain_select_column"]>
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
          | Array<ResolverInputTypes["chain_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["chain_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chain_aggregate"],
    ];
    chain_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["chain"],
    ];
    chain_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["chain_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["chain_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["chain"],
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
    __typename?: boolean | `@${string}`;
  }>;
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
  /** different chain and there address */
  ["chain"]: {
    bitcoin?: string | undefined;
    /** An object relationship */
    client: ModelTypes["client"];
    client_id: ModelTypes["uuid"];
    eth?: string | undefined;
    id: ModelTypes["uuid"];
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** aggregated selection of "chain" */
  ["chain_aggregate"]: {
    aggregate?: ModelTypes["chain_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["chain"]>;
  };
  /** aggregate fields of "chain" */
  ["chain_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["chain_max_fields"] | undefined;
    min?: ModelTypes["chain_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "chain". All fields are combined with a logical 'AND'. */
  ["chain_bool_exp"]: {
    _and?: Array<ModelTypes["chain_bool_exp"]> | undefined;
    _not?: ModelTypes["chain_bool_exp"] | undefined;
    _or?: Array<ModelTypes["chain_bool_exp"]> | undefined;
    bitcoin?: ModelTypes["String_comparison_exp"] | undefined;
    client?: ModelTypes["client_bool_exp"] | undefined;
    client_id?: ModelTypes["uuid_comparison_exp"] | undefined;
    eth?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    sol?: ModelTypes["String_comparison_exp"] | undefined;
    usdc?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["chain_constraint"]: chain_constraint;
  /** input type for inserting data into table "chain" */
  ["chain_insert_input"]: {
    bitcoin?: string | undefined;
    client?: ModelTypes["client_obj_rel_insert_input"] | undefined;
    client_id?: ModelTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** aggregate max on columns */
  ["chain_max_fields"]: {
    bitcoin?: string | undefined;
    client_id?: ModelTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** aggregate min on columns */
  ["chain_min_fields"]: {
    bitcoin?: string | undefined;
    client_id?: ModelTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** response of any mutation on the table "chain" */
  ["chain_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["chain"]>;
  };
  /** input type for inserting object relation for remote table "chain" */
  ["chain_obj_rel_insert_input"]: {
    data: ModelTypes["chain_insert_input"];
    /** upsert condition */
    on_conflict?: ModelTypes["chain_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "chain" */
  ["chain_on_conflict"]: {
    constraint: ModelTypes["chain_constraint"];
    update_columns: Array<ModelTypes["chain_update_column"]>;
    where?: ModelTypes["chain_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chain". */
  ["chain_order_by"]: {
    bitcoin?: ModelTypes["order_by"] | undefined;
    client?: ModelTypes["client_order_by"] | undefined;
    client_id?: ModelTypes["order_by"] | undefined;
    eth?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    sol?: ModelTypes["order_by"] | undefined;
    usdc?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: chain */
  ["chain_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["chain_select_column"]: chain_select_column;
  /** input type for updating data in table "chain" */
  ["chain_set_input"]: {
    bitcoin?: string | undefined;
    client_id?: ModelTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** Streaming cursor of the table "chain" */
  ["chain_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["chain_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chain_stream_cursor_value_input"]: {
    bitcoin?: string | undefined;
    client_id?: ModelTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  ["chain_update_column"]: chain_update_column;
  ["chain_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["chain_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["chain_bool_exp"];
  };
  /** subscriber for paybox */
  ["client"]: {
    /** An object relationship */
    chain?: ModelTypes["chain"] | undefined;
    email: string;
    firstname: string;
    id: ModelTypes["uuid"];
    lastname: string;
    mobile: number;
    username: string;
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
    chain?: ModelTypes["chain_bool_exp"] | undefined;
    email?: ModelTypes["String_comparison_exp"] | undefined;
    firstname?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    lastname?: ModelTypes["String_comparison_exp"] | undefined;
    mobile?: ModelTypes["Int_comparison_exp"] | undefined;
    username?: ModelTypes["String_comparison_exp"] | undefined;
  };
  ["client_constraint"]: client_constraint;
  /** input type for incrementing numeric columns in table "client" */
  ["client_inc_input"]: {
    mobile?: number | undefined;
  };
  /** input type for inserting data into table "client" */
  ["client_insert_input"]: {
    chain?: ModelTypes["chain_obj_rel_insert_input"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: number | undefined;
    username?: string | undefined;
  };
  /** aggregate max on columns */
  ["client_max_fields"]: {
    email?: string | undefined;
    firstname?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: number | undefined;
    username?: string | undefined;
  };
  /** aggregate min on columns */
  ["client_min_fields"]: {
    email?: string | undefined;
    firstname?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: number | undefined;
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
    chain?: ModelTypes["chain_order_by"] | undefined;
    email?: ModelTypes["order_by"] | undefined;
    firstname?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    lastname?: ModelTypes["order_by"] | undefined;
    mobile?: ModelTypes["order_by"] | undefined;
    username?: ModelTypes["order_by"] | undefined;
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
    mobile?: number | undefined;
    username?: string | undefined;
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
    mobile?: number | undefined;
    username?: string | undefined;
  };
  /** aggregate sum on columns */
  ["client_sum_fields"]: {
    mobile?: number | undefined;
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
  /** mutation root */
  ["mutation_root"]: {
    /** delete data from the table: "chain" */
    delete_chain?: ModelTypes["chain_mutation_response"] | undefined;
    /** delete single row from the table: "chain" */
    delete_chain_by_pk?: ModelTypes["chain"] | undefined;
    /** delete data from the table: "client" */
    delete_client?: ModelTypes["client_mutation_response"] | undefined;
    /** delete single row from the table: "client" */
    delete_client_by_pk?: ModelTypes["client"] | undefined;
    /** insert data into the table: "chain" */
    insert_chain?: ModelTypes["chain_mutation_response"] | undefined;
    /** insert a single row into the table: "chain" */
    insert_chain_one?: ModelTypes["chain"] | undefined;
    /** insert data into the table: "client" */
    insert_client?: ModelTypes["client_mutation_response"] | undefined;
    /** insert a single row into the table: "client" */
    insert_client_one?: ModelTypes["client"] | undefined;
    /** update data of the table: "chain" */
    update_chain?: ModelTypes["chain_mutation_response"] | undefined;
    /** update single row of the table: "chain" */
    update_chain_by_pk?: ModelTypes["chain"] | undefined;
    /** update multiples rows of table: "chain" */
    update_chain_many?:
      | Array<ModelTypes["chain_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "client" */
    update_client?: ModelTypes["client_mutation_response"] | undefined;
    /** update single row of the table: "client" */
    update_client_by_pk?: ModelTypes["client"] | undefined;
    /** update multiples rows of table: "client" */
    update_client_many?:
      | Array<ModelTypes["client_mutation_response"] | undefined>
      | undefined;
  };
  ["order_by"]: order_by;
  ["query_root"]: {
    /** fetch data from the table: "chain" */
    chain: Array<ModelTypes["chain"]>;
    /** fetch aggregated fields from the table: "chain" */
    chain_aggregate: ModelTypes["chain_aggregate"];
    /** fetch data from the table: "chain" using primary key columns */
    chain_by_pk?: ModelTypes["chain"] | undefined;
    /** fetch data from the table: "client" */
    client: Array<ModelTypes["client"]>;
    /** fetch aggregated fields from the table: "client" */
    client_aggregate: ModelTypes["client_aggregate"];
    /** fetch data from the table: "client" using primary key columns */
    client_by_pk?: ModelTypes["client"] | undefined;
  };
  ["subscription_root"]: {
    /** fetch data from the table: "chain" */
    chain: Array<ModelTypes["chain"]>;
    /** fetch aggregated fields from the table: "chain" */
    chain_aggregate: ModelTypes["chain_aggregate"];
    /** fetch data from the table: "chain" using primary key columns */
    chain_by_pk?: ModelTypes["chain"] | undefined;
    /** fetch data from the table in a streaming manner: "chain" */
    chain_stream: Array<ModelTypes["chain"]>;
    /** fetch data from the table: "client" */
    client: Array<ModelTypes["client"]>;
    /** fetch aggregated fields from the table: "client" */
    client_aggregate: ModelTypes["client_aggregate"];
    /** fetch data from the table: "client" using primary key columns */
    client_by_pk?: ModelTypes["client"] | undefined;
    /** fetch data from the table in a streaming manner: "client" */
    client_stream: Array<ModelTypes["client"]>;
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
  /** different chain and there address */
  ["chain"]: {
    __typename: "chain";
    bitcoin?: string | undefined;
    /** An object relationship */
    client: GraphQLTypes["client"];
    client_id: GraphQLTypes["uuid"];
    eth?: string | undefined;
    id: GraphQLTypes["uuid"];
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** aggregated selection of "chain" */
  ["chain_aggregate"]: {
    __typename: "chain_aggregate";
    aggregate?: GraphQLTypes["chain_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["chain"]>;
  };
  /** aggregate fields of "chain" */
  ["chain_aggregate_fields"]: {
    __typename: "chain_aggregate_fields";
    count: number;
    max?: GraphQLTypes["chain_max_fields"] | undefined;
    min?: GraphQLTypes["chain_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "chain". All fields are combined with a logical 'AND'. */
  ["chain_bool_exp"]: {
    _and?: Array<GraphQLTypes["chain_bool_exp"]> | undefined;
    _not?: GraphQLTypes["chain_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["chain_bool_exp"]> | undefined;
    bitcoin?: GraphQLTypes["String_comparison_exp"] | undefined;
    client?: GraphQLTypes["client_bool_exp"] | undefined;
    client_id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    eth?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    sol?: GraphQLTypes["String_comparison_exp"] | undefined;
    usdc?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "chain" */
  ["chain_constraint"]: chain_constraint;
  /** input type for inserting data into table "chain" */
  ["chain_insert_input"]: {
    bitcoin?: string | undefined;
    client?: GraphQLTypes["client_obj_rel_insert_input"] | undefined;
    client_id?: GraphQLTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** aggregate max on columns */
  ["chain_max_fields"]: {
    __typename: "chain_max_fields";
    bitcoin?: string | undefined;
    client_id?: GraphQLTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** aggregate min on columns */
  ["chain_min_fields"]: {
    __typename: "chain_min_fields";
    bitcoin?: string | undefined;
    client_id?: GraphQLTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** response of any mutation on the table "chain" */
  ["chain_mutation_response"]: {
    __typename: "chain_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["chain"]>;
  };
  /** input type for inserting object relation for remote table "chain" */
  ["chain_obj_rel_insert_input"]: {
    data: GraphQLTypes["chain_insert_input"];
    /** upsert condition */
    on_conflict?: GraphQLTypes["chain_on_conflict"] | undefined;
  };
  /** on_conflict condition type for table "chain" */
  ["chain_on_conflict"]: {
    constraint: GraphQLTypes["chain_constraint"];
    update_columns: Array<GraphQLTypes["chain_update_column"]>;
    where?: GraphQLTypes["chain_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "chain". */
  ["chain_order_by"]: {
    bitcoin?: GraphQLTypes["order_by"] | undefined;
    client?: GraphQLTypes["client_order_by"] | undefined;
    client_id?: GraphQLTypes["order_by"] | undefined;
    eth?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    sol?: GraphQLTypes["order_by"] | undefined;
    usdc?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: chain */
  ["chain_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "chain" */
  ["chain_select_column"]: chain_select_column;
  /** input type for updating data in table "chain" */
  ["chain_set_input"]: {
    bitcoin?: string | undefined;
    client_id?: GraphQLTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** Streaming cursor of the table "chain" */
  ["chain_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["chain_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["chain_stream_cursor_value_input"]: {
    bitcoin?: string | undefined;
    client_id?: GraphQLTypes["uuid"] | undefined;
    eth?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    sol?: string | undefined;
    usdc?: string | undefined;
  };
  /** update columns of table "chain" */
  ["chain_update_column"]: chain_update_column;
  ["chain_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["chain_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["chain_bool_exp"];
  };
  /** subscriber for paybox */
  ["client"]: {
    __typename: "client";
    /** An object relationship */
    chain?: GraphQLTypes["chain"] | undefined;
    email: string;
    firstname: string;
    id: GraphQLTypes["uuid"];
    lastname: string;
    mobile: number;
    username: string;
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
    chain?: GraphQLTypes["chain_bool_exp"] | undefined;
    email?: GraphQLTypes["String_comparison_exp"] | undefined;
    firstname?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    lastname?: GraphQLTypes["String_comparison_exp"] | undefined;
    mobile?: GraphQLTypes["Int_comparison_exp"] | undefined;
    username?: GraphQLTypes["String_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "client" */
  ["client_constraint"]: client_constraint;
  /** input type for incrementing numeric columns in table "client" */
  ["client_inc_input"]: {
    mobile?: number | undefined;
  };
  /** input type for inserting data into table "client" */
  ["client_insert_input"]: {
    chain?: GraphQLTypes["chain_obj_rel_insert_input"] | undefined;
    email?: string | undefined;
    firstname?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: number | undefined;
    username?: string | undefined;
  };
  /** aggregate max on columns */
  ["client_max_fields"]: {
    __typename: "client_max_fields";
    email?: string | undefined;
    firstname?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: number | undefined;
    username?: string | undefined;
  };
  /** aggregate min on columns */
  ["client_min_fields"]: {
    __typename: "client_min_fields";
    email?: string | undefined;
    firstname?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    lastname?: string | undefined;
    mobile?: number | undefined;
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
    chain?: GraphQLTypes["chain_order_by"] | undefined;
    email?: GraphQLTypes["order_by"] | undefined;
    firstname?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    lastname?: GraphQLTypes["order_by"] | undefined;
    mobile?: GraphQLTypes["order_by"] | undefined;
    username?: GraphQLTypes["order_by"] | undefined;
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
    mobile?: number | undefined;
    username?: string | undefined;
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
    mobile?: number | undefined;
    username?: string | undefined;
  };
  /** aggregate sum on columns */
  ["client_sum_fields"]: {
    __typename: "client_sum_fields";
    mobile?: number | undefined;
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
  /** mutation root */
  ["mutation_root"]: {
    __typename: "mutation_root";
    /** delete data from the table: "chain" */
    delete_chain?: GraphQLTypes["chain_mutation_response"] | undefined;
    /** delete single row from the table: "chain" */
    delete_chain_by_pk?: GraphQLTypes["chain"] | undefined;
    /** delete data from the table: "client" */
    delete_client?: GraphQLTypes["client_mutation_response"] | undefined;
    /** delete single row from the table: "client" */
    delete_client_by_pk?: GraphQLTypes["client"] | undefined;
    /** insert data into the table: "chain" */
    insert_chain?: GraphQLTypes["chain_mutation_response"] | undefined;
    /** insert a single row into the table: "chain" */
    insert_chain_one?: GraphQLTypes["chain"] | undefined;
    /** insert data into the table: "client" */
    insert_client?: GraphQLTypes["client_mutation_response"] | undefined;
    /** insert a single row into the table: "client" */
    insert_client_one?: GraphQLTypes["client"] | undefined;
    /** update data of the table: "chain" */
    update_chain?: GraphQLTypes["chain_mutation_response"] | undefined;
    /** update single row of the table: "chain" */
    update_chain_by_pk?: GraphQLTypes["chain"] | undefined;
    /** update multiples rows of table: "chain" */
    update_chain_many?:
      | Array<GraphQLTypes["chain_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "client" */
    update_client?: GraphQLTypes["client_mutation_response"] | undefined;
    /** update single row of the table: "client" */
    update_client_by_pk?: GraphQLTypes["client"] | undefined;
    /** update multiples rows of table: "client" */
    update_client_many?:
      | Array<GraphQLTypes["client_mutation_response"] | undefined>
      | undefined;
  };
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: {
    __typename: "query_root";
    /** fetch data from the table: "chain" */
    chain: Array<GraphQLTypes["chain"]>;
    /** fetch aggregated fields from the table: "chain" */
    chain_aggregate: GraphQLTypes["chain_aggregate"];
    /** fetch data from the table: "chain" using primary key columns */
    chain_by_pk?: GraphQLTypes["chain"] | undefined;
    /** fetch data from the table: "client" */
    client: Array<GraphQLTypes["client"]>;
    /** fetch aggregated fields from the table: "client" */
    client_aggregate: GraphQLTypes["client_aggregate"];
    /** fetch data from the table: "client" using primary key columns */
    client_by_pk?: GraphQLTypes["client"] | undefined;
  };
  ["subscription_root"]: {
    __typename: "subscription_root";
    /** fetch data from the table: "chain" */
    chain: Array<GraphQLTypes["chain"]>;
    /** fetch aggregated fields from the table: "chain" */
    chain_aggregate: GraphQLTypes["chain_aggregate"];
    /** fetch data from the table: "chain" using primary key columns */
    chain_by_pk?: GraphQLTypes["chain"] | undefined;
    /** fetch data from the table in a streaming manner: "chain" */
    chain_stream: Array<GraphQLTypes["chain"]>;
    /** fetch data from the table: "client" */
    client: Array<GraphQLTypes["client"]>;
    /** fetch aggregated fields from the table: "client" */
    client_aggregate: GraphQLTypes["client_aggregate"];
    /** fetch data from the table: "client" using primary key columns */
    client_by_pk?: GraphQLTypes["client"] | undefined;
    /** fetch data from the table in a streaming manner: "client" */
    client_stream: Array<GraphQLTypes["client"]>;
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
/** unique or primary key constraints on table "chain" */
export const enum chain_constraint {
  chain_client_id_key = "chain_client_id_key",
  chain_pkey = "chain_pkey",
}
/** select columns of table "chain" */
export const enum chain_select_column {
  bitcoin = "bitcoin",
  client_id = "client_id",
  eth = "eth",
  id = "id",
  sol = "sol",
  usdc = "usdc",
}
/** update columns of table "chain" */
export const enum chain_update_column {
  bitcoin = "bitcoin",
  client_id = "client_id",
  eth = "eth",
  id = "id",
  sol = "sol",
  usdc = "usdc",
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
  username = "username",
}
/** update columns of table "client" */
export const enum client_update_column {
  email = "email",
  firstname = "firstname",
  id = "id",
  lastname = "lastname",
  mobile = "mobile",
  username = "username",
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
  ["Int_comparison_exp"]: ValueTypes["Int_comparison_exp"];
  ["String_comparison_exp"]: ValueTypes["String_comparison_exp"];
  ["chain_bool_exp"]: ValueTypes["chain_bool_exp"];
  ["chain_constraint"]: ValueTypes["chain_constraint"];
  ["chain_insert_input"]: ValueTypes["chain_insert_input"];
  ["chain_obj_rel_insert_input"]: ValueTypes["chain_obj_rel_insert_input"];
  ["chain_on_conflict"]: ValueTypes["chain_on_conflict"];
  ["chain_order_by"]: ValueTypes["chain_order_by"];
  ["chain_pk_columns_input"]: ValueTypes["chain_pk_columns_input"];
  ["chain_select_column"]: ValueTypes["chain_select_column"];
  ["chain_set_input"]: ValueTypes["chain_set_input"];
  ["chain_stream_cursor_input"]: ValueTypes["chain_stream_cursor_input"];
  ["chain_stream_cursor_value_input"]: ValueTypes["chain_stream_cursor_value_input"];
  ["chain_update_column"]: ValueTypes["chain_update_column"];
  ["chain_updates"]: ValueTypes["chain_updates"];
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
  ["order_by"]: ValueTypes["order_by"];
  ["uuid"]: ValueTypes["uuid"];
  ["uuid_comparison_exp"]: ValueTypes["uuid_comparison_exp"];
};
