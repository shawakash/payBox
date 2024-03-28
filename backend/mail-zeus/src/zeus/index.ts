/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from "./const";
export const HOST = "https://tops-akita-21.hasura.app/v1/graphql";

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
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** custom address for paybox */
  ["custom_address"]: AliasType<{
    address?: boolean | `@${string}`;
    createdAt?: boolean | `@${string}`;
    description?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    key?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "custom_address" */
  ["custom_address_aggregate"]: AliasType<{
    aggregate?: ValueTypes["custom_address_aggregate_fields"];
    nodes?: ValueTypes["custom_address"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "custom_address" */
  ["custom_address_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["custom_address_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["custom_address_max_fields"];
    min?: ValueTypes["custom_address_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "custom_address". All fields are combined with a logical 'AND'. */
  ["custom_address_bool_exp"]: {
    _and?:
      | Array<ValueTypes["custom_address_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["custom_address_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["custom_address_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    address?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    createdAt?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    description?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    key?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    updatedAt?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "custom_address" */
  ["custom_address_constraint"]: custom_address_constraint;
  /** input type for inserting data into table "custom_address" */
  ["custom_address_insert_input"]: {
    address?: string | undefined | null | Variable<any, string>;
    createdAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    description?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    key?: string | undefined | null | Variable<any, string>;
    updatedAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["custom_address_max_fields"]: AliasType<{
    address?: boolean | `@${string}`;
    createdAt?: boolean | `@${string}`;
    description?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    key?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["custom_address_min_fields"]: AliasType<{
    address?: boolean | `@${string}`;
    createdAt?: boolean | `@${string}`;
    description?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    key?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "custom_address" */
  ["custom_address_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["custom_address"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "custom_address" */
  ["custom_address_on_conflict"]: {
    constraint: ValueTypes["custom_address_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["custom_address_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["custom_address_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "custom_address". */
  ["custom_address_order_by"]: {
    address?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    createdAt?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    description?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    key?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    updatedAt?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: custom_address */
  ["custom_address_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "custom_address" */
  ["custom_address_select_column"]: custom_address_select_column;
  /** input type for updating data in table "custom_address" */
  ["custom_address_set_input"]: {
    address?: string | undefined | null | Variable<any, string>;
    createdAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    description?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    key?: string | undefined | null | Variable<any, string>;
    updatedAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Streaming cursor of the table "custom_address" */
  ["custom_address_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["custom_address_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["custom_address_stream_cursor_value_input"]: {
    address?: string | undefined | null | Variable<any, string>;
    createdAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    description?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    key?: string | undefined | null | Variable<any, string>;
    updatedAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** update columns of table "custom_address" */
  ["custom_address_update_column"]: custom_address_update_column;
  ["custom_address_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["custom_address_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["custom_address_bool_exp"] | Variable<any, string>;
  };
  /** mails from clients */
  ["mails"]: AliasType<{
    createdAt?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fromAddress?: boolean | `@${string}`;
    htmlContent?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    subject?: boolean | `@${string}`;
    textContent?: boolean | `@${string}`;
    toAddress?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "mails" */
  ["mails_aggregate"]: AliasType<{
    aggregate?: ValueTypes["mails_aggregate_fields"];
    nodes?: ValueTypes["mails"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "mails" */
  ["mails_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ValueTypes["mails_select_column"]>
          | undefined
          | null
          | Variable<any, string>;
        distinct?: boolean | undefined | null | Variable<any, string>;
      },
      boolean | `@${string}`,
    ];
    max?: ValueTypes["mails_max_fields"];
    min?: ValueTypes["mails_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "mails". All fields are combined with a logical 'AND'. */
  ["mails_bool_exp"]: {
    _and?:
      | Array<ValueTypes["mails_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    _not?:
      | ValueTypes["mails_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
    _or?:
      | Array<ValueTypes["mails_bool_exp"]>
      | undefined
      | null
      | Variable<any, string>;
    createdAt?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    date?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    fromAddress?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    htmlContent?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    id?:
      | ValueTypes["uuid_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    subject?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    textContent?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    toAddress?:
      | ValueTypes["String_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
    updatedAt?:
      | ValueTypes["timestamptz_comparison_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** unique or primary key constraints on table "mails" */
  ["mails_constraint"]: mails_constraint;
  /** input type for inserting data into table "mails" */
  ["mails_insert_input"]: {
    createdAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    date?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    fromAddress?: string | undefined | null | Variable<any, string>;
    htmlContent?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    subject?: string | undefined | null | Variable<any, string>;
    textContent?: string | undefined | null | Variable<any, string>;
    toAddress?: string | undefined | null | Variable<any, string>;
    updatedAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** aggregate max on columns */
  ["mails_max_fields"]: AliasType<{
    createdAt?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fromAddress?: boolean | `@${string}`;
    htmlContent?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    subject?: boolean | `@${string}`;
    textContent?: boolean | `@${string}`;
    toAddress?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["mails_min_fields"]: AliasType<{
    createdAt?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fromAddress?: boolean | `@${string}`;
    htmlContent?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    subject?: boolean | `@${string}`;
    textContent?: boolean | `@${string}`;
    toAddress?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "mails" */
  ["mails_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ValueTypes["mails"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "mails" */
  ["mails_on_conflict"]: {
    constraint: ValueTypes["mails_constraint"] | Variable<any, string>;
    update_columns:
      | Array<ValueTypes["mails_update_column"]>
      | Variable<any, string>;
    where?:
      | ValueTypes["mails_bool_exp"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Ordering options when selecting data from "mails". */
  ["mails_order_by"]: {
    createdAt?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    date?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    fromAddress?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    htmlContent?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    subject?: ValueTypes["order_by"] | undefined | null | Variable<any, string>;
    textContent?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    toAddress?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
    updatedAt?:
      | ValueTypes["order_by"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** primary key columns input for table: mails */
  ["mails_pk_columns_input"]: {
    id: ValueTypes["uuid"] | Variable<any, string>;
  };
  /** select columns of table "mails" */
  ["mails_select_column"]: mails_select_column;
  /** input type for updating data in table "mails" */
  ["mails_set_input"]: {
    createdAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    date?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    fromAddress?: string | undefined | null | Variable<any, string>;
    htmlContent?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    subject?: string | undefined | null | Variable<any, string>;
    textContent?: string | undefined | null | Variable<any, string>;
    toAddress?: string | undefined | null | Variable<any, string>;
    updatedAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Streaming cursor of the table "mails" */
  ["mails_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value:
      | ValueTypes["mails_stream_cursor_value_input"]
      | Variable<any, string>;
    /** cursor ordering */
    ordering?:
      | ValueTypes["cursor_ordering"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** Initial value of the column from where the streaming should start */
  ["mails_stream_cursor_value_input"]: {
    createdAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
    date?: ValueTypes["timestamptz"] | undefined | null | Variable<any, string>;
    fromAddress?: string | undefined | null | Variable<any, string>;
    htmlContent?: string | undefined | null | Variable<any, string>;
    id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>;
    subject?: string | undefined | null | Variable<any, string>;
    textContent?: string | undefined | null | Variable<any, string>;
    toAddress?: string | undefined | null | Variable<any, string>;
    updatedAt?:
      | ValueTypes["timestamptz"]
      | undefined
      | null
      | Variable<any, string>;
  };
  /** update columns of table "mails" */
  ["mails_update_column"]: mails_update_column;
  ["mails_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?:
      | ValueTypes["mails_set_input"]
      | undefined
      | null
      | Variable<any, string>;
    /** filter the rows which have to be updated */
    where: ValueTypes["mails_bool_exp"] | Variable<any, string>;
  };
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_custom_address?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["custom_address_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["custom_address_mutation_response"],
    ];
    delete_custom_address_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["custom_address"],
    ];
    delete_mails?: [
      {
        /** filter the rows which have to be deleted */
        where: ValueTypes["mails_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["mails_mutation_response"],
    ];
    delete_mails_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["mails"],
    ];
    insert_custom_address?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["custom_address_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["custom_address_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["custom_address_mutation_response"],
    ];
    insert_custom_address_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["custom_address_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["custom_address_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["custom_address"],
    ];
    insert_mails?: [
      {
        /** the rows to be inserted */
        objects:
          | Array<ValueTypes["mails_insert_input"]>
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["mails_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["mails_mutation_response"],
    ];
    insert_mails_one?: [
      {
        /** the row to be inserted */
        object:
          | ValueTypes["mails_insert_input"]
          | Variable<any, string> /** upsert condition */;
        on_conflict?:
          | ValueTypes["mails_on_conflict"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["mails"],
    ];
    update_custom_address?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["custom_address_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["custom_address_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["custom_address_mutation_response"],
    ];
    update_custom_address_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["custom_address_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["custom_address_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["custom_address"],
    ];
    update_custom_address_many?: [
      {
        /** updates to execute, in order */
        updates:
          | Array<ValueTypes["custom_address_updates"]>
          | Variable<any, string>;
      },
      ValueTypes["custom_address_mutation_response"],
    ];
    update_mails?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["mails_set_input"]
          | undefined
          | null
          | Variable<
              any,
              string
            > /** filter the rows which have to be updated */;
        where: ValueTypes["mails_bool_exp"] | Variable<any, string>;
      },
      ValueTypes["mails_mutation_response"],
    ];
    update_mails_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ValueTypes["mails_set_input"]
          | undefined
          | null
          | Variable<any, string>;
        pk_columns:
          | ValueTypes["mails_pk_columns_input"]
          | Variable<any, string>;
      },
      ValueTypes["mails"],
    ];
    update_mails_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ValueTypes["mails_updates"]> | Variable<any, string>;
      },
      ValueTypes["mails_mutation_response"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    custom_address?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["custom_address_select_column"]>
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
          | Array<ValueTypes["custom_address_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["custom_address_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["custom_address"],
    ];
    custom_address_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["custom_address_select_column"]>
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
          | Array<ValueTypes["custom_address_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["custom_address_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["custom_address_aggregate"],
    ];
    custom_address_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["custom_address"],
    ];
    mails?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["mails_select_column"]>
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
          | Array<ValueTypes["mails_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["mails_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["mails"],
    ];
    mails_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["mails_select_column"]>
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
          | Array<ValueTypes["mails_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["mails_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["mails_aggregate"],
    ];
    mails_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["mails"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    custom_address?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["custom_address_select_column"]>
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
          | Array<ValueTypes["custom_address_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["custom_address_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["custom_address"],
    ];
    custom_address_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["custom_address_select_column"]>
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
          | Array<ValueTypes["custom_address_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["custom_address_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["custom_address_aggregate"],
    ];
    custom_address_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["custom_address"],
    ];
    custom_address_stream?: [
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
              | ValueTypes["custom_address_stream_cursor_input"]
              | undefined
              | null
            >
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["custom_address_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["custom_address"],
    ];
    mails?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["mails_select_column"]>
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
          | Array<ValueTypes["mails_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["mails_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["mails"],
    ];
    mails_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ValueTypes["mails_select_column"]>
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
          | Array<ValueTypes["mails_order_by"]>
          | undefined
          | null
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["mails_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["mails_aggregate"],
    ];
    mails_by_pk?: [
      { id: ValueTypes["uuid"] | Variable<any, string> },
      ValueTypes["mails"],
    ];
    mails_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size:
          | number
          | Variable<
              any,
              string
            > /** cursor to stream the results returned by the query */;
        cursor:
          | Array<ValueTypes["mails_stream_cursor_input"] | undefined | null>
          | Variable<any, string> /** filter the rows returned */;
        where?:
          | ValueTypes["mails_bool_exp"]
          | undefined
          | null
          | Variable<any, string>;
      },
      ValueTypes["mails"],
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
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** custom address for paybox */
  ["custom_address"]: AliasType<{
    address?: boolean | `@${string}`;
    createdAt?: boolean | `@${string}`;
    description?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    key?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "custom_address" */
  ["custom_address_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["custom_address_aggregate_fields"];
    nodes?: ResolverInputTypes["custom_address"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "custom_address" */
  ["custom_address_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["custom_address_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["custom_address_max_fields"];
    min?: ResolverInputTypes["custom_address_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "custom_address". All fields are combined with a logical 'AND'. */
  ["custom_address_bool_exp"]: {
    _and?:
      | Array<ResolverInputTypes["custom_address_bool_exp"]>
      | undefined
      | null;
    _not?: ResolverInputTypes["custom_address_bool_exp"] | undefined | null;
    _or?:
      | Array<ResolverInputTypes["custom_address_bool_exp"]>
      | undefined
      | null;
    address?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    createdAt?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    description?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    key?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    updatedAt?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "custom_address" */
  ["custom_address_constraint"]: custom_address_constraint;
  /** input type for inserting data into table "custom_address" */
  ["custom_address_insert_input"]: {
    address?: string | undefined | null;
    createdAt?: ResolverInputTypes["timestamptz"] | undefined | null;
    description?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    key?: string | undefined | null;
    updatedAt?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** aggregate max on columns */
  ["custom_address_max_fields"]: AliasType<{
    address?: boolean | `@${string}`;
    createdAt?: boolean | `@${string}`;
    description?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    key?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["custom_address_min_fields"]: AliasType<{
    address?: boolean | `@${string}`;
    createdAt?: boolean | `@${string}`;
    description?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    key?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "custom_address" */
  ["custom_address_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["custom_address"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "custom_address" */
  ["custom_address_on_conflict"]: {
    constraint: ResolverInputTypes["custom_address_constraint"];
    update_columns: Array<ResolverInputTypes["custom_address_update_column"]>;
    where?: ResolverInputTypes["custom_address_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "custom_address". */
  ["custom_address_order_by"]: {
    address?: ResolverInputTypes["order_by"] | undefined | null;
    createdAt?: ResolverInputTypes["order_by"] | undefined | null;
    description?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    key?: ResolverInputTypes["order_by"] | undefined | null;
    updatedAt?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: custom_address */
  ["custom_address_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "custom_address" */
  ["custom_address_select_column"]: custom_address_select_column;
  /** input type for updating data in table "custom_address" */
  ["custom_address_set_input"]: {
    address?: string | undefined | null;
    createdAt?: ResolverInputTypes["timestamptz"] | undefined | null;
    description?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    key?: string | undefined | null;
    updatedAt?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** Streaming cursor of the table "custom_address" */
  ["custom_address_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["custom_address_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["custom_address_stream_cursor_value_input"]: {
    address?: string | undefined | null;
    createdAt?: ResolverInputTypes["timestamptz"] | undefined | null;
    description?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    key?: string | undefined | null;
    updatedAt?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** update columns of table "custom_address" */
  ["custom_address_update_column"]: custom_address_update_column;
  ["custom_address_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["custom_address_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["custom_address_bool_exp"];
  };
  /** mails from clients */
  ["mails"]: AliasType<{
    createdAt?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fromAddress?: boolean | `@${string}`;
    htmlContent?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    subject?: boolean | `@${string}`;
    textContent?: boolean | `@${string}`;
    toAddress?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregated selection of "mails" */
  ["mails_aggregate"]: AliasType<{
    aggregate?: ResolverInputTypes["mails_aggregate_fields"];
    nodes?: ResolverInputTypes["mails"];
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate fields of "mails" */
  ["mails_aggregate_fields"]: AliasType<{
    count?: [
      {
        columns?:
          | Array<ResolverInputTypes["mails_select_column"]>
          | undefined
          | null;
        distinct?: boolean | undefined | null;
      },
      boolean | `@${string}`,
    ];
    max?: ResolverInputTypes["mails_max_fields"];
    min?: ResolverInputTypes["mails_min_fields"];
    __typename?: boolean | `@${string}`;
  }>;
  /** Boolean expression to filter rows from the table "mails". All fields are combined with a logical 'AND'. */
  ["mails_bool_exp"]: {
    _and?: Array<ResolverInputTypes["mails_bool_exp"]> | undefined | null;
    _not?: ResolverInputTypes["mails_bool_exp"] | undefined | null;
    _or?: Array<ResolverInputTypes["mails_bool_exp"]> | undefined | null;
    createdAt?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
    date?: ResolverInputTypes["timestamptz_comparison_exp"] | undefined | null;
    fromAddress?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    htmlContent?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null;
    subject?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    textContent?:
      | ResolverInputTypes["String_comparison_exp"]
      | undefined
      | null;
    toAddress?: ResolverInputTypes["String_comparison_exp"] | undefined | null;
    updatedAt?:
      | ResolverInputTypes["timestamptz_comparison_exp"]
      | undefined
      | null;
  };
  /** unique or primary key constraints on table "mails" */
  ["mails_constraint"]: mails_constraint;
  /** input type for inserting data into table "mails" */
  ["mails_insert_input"]: {
    createdAt?: ResolverInputTypes["timestamptz"] | undefined | null;
    date?: ResolverInputTypes["timestamptz"] | undefined | null;
    fromAddress?: string | undefined | null;
    htmlContent?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    subject?: string | undefined | null;
    textContent?: string | undefined | null;
    toAddress?: string | undefined | null;
    updatedAt?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** aggregate max on columns */
  ["mails_max_fields"]: AliasType<{
    createdAt?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fromAddress?: boolean | `@${string}`;
    htmlContent?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    subject?: boolean | `@${string}`;
    textContent?: boolean | `@${string}`;
    toAddress?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** aggregate min on columns */
  ["mails_min_fields"]: AliasType<{
    createdAt?: boolean | `@${string}`;
    date?: boolean | `@${string}`;
    fromAddress?: boolean | `@${string}`;
    htmlContent?: boolean | `@${string}`;
    id?: boolean | `@${string}`;
    subject?: boolean | `@${string}`;
    textContent?: boolean | `@${string}`;
    toAddress?: boolean | `@${string}`;
    updatedAt?: boolean | `@${string}`;
    __typename?: boolean | `@${string}`;
  }>;
  /** response of any mutation on the table "mails" */
  ["mails_mutation_response"]: AliasType<{
    /** number of rows affected by the mutation */
    affected_rows?: boolean | `@${string}`;
    /** data from the rows affected by the mutation */
    returning?: ResolverInputTypes["mails"];
    __typename?: boolean | `@${string}`;
  }>;
  /** on_conflict condition type for table "mails" */
  ["mails_on_conflict"]: {
    constraint: ResolverInputTypes["mails_constraint"];
    update_columns: Array<ResolverInputTypes["mails_update_column"]>;
    where?: ResolverInputTypes["mails_bool_exp"] | undefined | null;
  };
  /** Ordering options when selecting data from "mails". */
  ["mails_order_by"]: {
    createdAt?: ResolverInputTypes["order_by"] | undefined | null;
    date?: ResolverInputTypes["order_by"] | undefined | null;
    fromAddress?: ResolverInputTypes["order_by"] | undefined | null;
    htmlContent?: ResolverInputTypes["order_by"] | undefined | null;
    id?: ResolverInputTypes["order_by"] | undefined | null;
    subject?: ResolverInputTypes["order_by"] | undefined | null;
    textContent?: ResolverInputTypes["order_by"] | undefined | null;
    toAddress?: ResolverInputTypes["order_by"] | undefined | null;
    updatedAt?: ResolverInputTypes["order_by"] | undefined | null;
  };
  /** primary key columns input for table: mails */
  ["mails_pk_columns_input"]: {
    id: ResolverInputTypes["uuid"];
  };
  /** select columns of table "mails" */
  ["mails_select_column"]: mails_select_column;
  /** input type for updating data in table "mails" */
  ["mails_set_input"]: {
    createdAt?: ResolverInputTypes["timestamptz"] | undefined | null;
    date?: ResolverInputTypes["timestamptz"] | undefined | null;
    fromAddress?: string | undefined | null;
    htmlContent?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    subject?: string | undefined | null;
    textContent?: string | undefined | null;
    toAddress?: string | undefined | null;
    updatedAt?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** Streaming cursor of the table "mails" */
  ["mails_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ResolverInputTypes["mails_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null;
  };
  /** Initial value of the column from where the streaming should start */
  ["mails_stream_cursor_value_input"]: {
    createdAt?: ResolverInputTypes["timestamptz"] | undefined | null;
    date?: ResolverInputTypes["timestamptz"] | undefined | null;
    fromAddress?: string | undefined | null;
    htmlContent?: string | undefined | null;
    id?: ResolverInputTypes["uuid"] | undefined | null;
    subject?: string | undefined | null;
    textContent?: string | undefined | null;
    toAddress?: string | undefined | null;
    updatedAt?: ResolverInputTypes["timestamptz"] | undefined | null;
  };
  /** update columns of table "mails" */
  ["mails_update_column"]: mails_update_column;
  ["mails_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ResolverInputTypes["mails_set_input"] | undefined | null;
    /** filter the rows which have to be updated */
    where: ResolverInputTypes["mails_bool_exp"];
  };
  /** mutation root */
  ["mutation_root"]: AliasType<{
    delete_custom_address?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["custom_address_bool_exp"];
      },
      ResolverInputTypes["custom_address_mutation_response"],
    ];
    delete_custom_address_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["custom_address"],
    ];
    delete_mails?: [
      {
        /** filter the rows which have to be deleted */
        where: ResolverInputTypes["mails_bool_exp"];
      },
      ResolverInputTypes["mails_mutation_response"],
    ];
    delete_mails_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["mails"],
    ];
    insert_custom_address?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["custom_address_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["custom_address_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["custom_address_mutation_response"],
    ];
    insert_custom_address_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["custom_address_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["custom_address_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["custom_address"],
    ];
    insert_mails?: [
      {
        /** the rows to be inserted */
        objects: Array<
          ResolverInputTypes["mails_insert_input"]
        > /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["mails_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["mails_mutation_response"],
    ];
    insert_mails_one?: [
      {
        /** the row to be inserted */
        object: ResolverInputTypes["mails_insert_input"] /** upsert condition */;
        on_conflict?:
          | ResolverInputTypes["mails_on_conflict"]
          | undefined
          | null;
      },
      ResolverInputTypes["mails"],
    ];
    update_custom_address?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["custom_address_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["custom_address_bool_exp"];
      },
      ResolverInputTypes["custom_address_mutation_response"],
    ];
    update_custom_address_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["custom_address_set_input"]
          | undefined
          | null;
        pk_columns: ResolverInputTypes["custom_address_pk_columns_input"];
      },
      ResolverInputTypes["custom_address"],
    ];
    update_custom_address_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["custom_address_updates"]>;
      },
      ResolverInputTypes["custom_address_mutation_response"],
    ];
    update_mails?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?:
          | ResolverInputTypes["mails_set_input"]
          | undefined
          | null /** filter the rows which have to be updated */;
        where: ResolverInputTypes["mails_bool_exp"];
      },
      ResolverInputTypes["mails_mutation_response"],
    ];
    update_mails_by_pk?: [
      {
        /** sets the columns of the filtered rows to the given values */
        _set?: ResolverInputTypes["mails_set_input"] | undefined | null;
        pk_columns: ResolverInputTypes["mails_pk_columns_input"];
      },
      ResolverInputTypes["mails"],
    ];
    update_mails_many?: [
      {
        /** updates to execute, in order */
        updates: Array<ResolverInputTypes["mails_updates"]>;
      },
      ResolverInputTypes["mails_mutation_response"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: AliasType<{
    custom_address?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["custom_address_select_column"]>
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
          | Array<ResolverInputTypes["custom_address_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["custom_address_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["custom_address"],
    ];
    custom_address_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["custom_address_select_column"]>
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
          | Array<ResolverInputTypes["custom_address_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["custom_address_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["custom_address_aggregate"],
    ];
    custom_address_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["custom_address"],
    ];
    mails?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["mails_select_column"]>
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
          | Array<ResolverInputTypes["mails_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["mails_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["mails"],
    ];
    mails_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["mails_select_column"]>
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
          | Array<ResolverInputTypes["mails_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["mails_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["mails_aggregate"],
    ];
    mails_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["mails"],
    ];
    __typename?: boolean | `@${string}`;
  }>;
  ["subscription_root"]: AliasType<{
    custom_address?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["custom_address_select_column"]>
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
          | Array<ResolverInputTypes["custom_address_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["custom_address_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["custom_address"],
    ];
    custom_address_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["custom_address_select_column"]>
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
          | Array<ResolverInputTypes["custom_address_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?:
          | ResolverInputTypes["custom_address_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["custom_address_aggregate"],
    ];
    custom_address_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["custom_address"],
    ];
    custom_address_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          | ResolverInputTypes["custom_address_stream_cursor_input"]
          | undefined
          | null
        > /** filter the rows returned */;
        where?:
          | ResolverInputTypes["custom_address_bool_exp"]
          | undefined
          | null;
      },
      ResolverInputTypes["custom_address"],
    ];
    mails?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["mails_select_column"]>
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
          | Array<ResolverInputTypes["mails_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["mails_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["mails"],
    ];
    mails_aggregate?: [
      {
        /** distinct select on columns */
        distinct_on?:
          | Array<ResolverInputTypes["mails_select_column"]>
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
          | Array<ResolverInputTypes["mails_order_by"]>
          | undefined
          | null /** filter the rows returned */;
        where?: ResolverInputTypes["mails_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["mails_aggregate"],
    ];
    mails_by_pk?: [
      { id: ResolverInputTypes["uuid"] },
      ResolverInputTypes["mails"],
    ];
    mails_stream?: [
      {
        /** maximum number of rows returned in a single batch */
        batch_size: number /** cursor to stream the results returned by the query */;
        cursor: Array<
          ResolverInputTypes["mails_stream_cursor_input"] | undefined | null
        > /** filter the rows returned */;
        where?: ResolverInputTypes["mails_bool_exp"] | undefined | null;
      },
      ResolverInputTypes["mails"],
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
  ["cursor_ordering"]: cursor_ordering;
  /** custom address for paybox */
  ["custom_address"]: {
    address: string;
    createdAt: ModelTypes["timestamptz"];
    description: string;
    id: ModelTypes["uuid"];
    key: string;
    updatedAt: ModelTypes["timestamptz"];
  };
  /** aggregated selection of "custom_address" */
  ["custom_address_aggregate"]: {
    aggregate?: ModelTypes["custom_address_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["custom_address"]>;
  };
  /** aggregate fields of "custom_address" */
  ["custom_address_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["custom_address_max_fields"] | undefined;
    min?: ModelTypes["custom_address_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "custom_address". All fields are combined with a logical 'AND'. */
  ["custom_address_bool_exp"]: {
    _and?: Array<ModelTypes["custom_address_bool_exp"]> | undefined;
    _not?: ModelTypes["custom_address_bool_exp"] | undefined;
    _or?: Array<ModelTypes["custom_address_bool_exp"]> | undefined;
    address?: ModelTypes["String_comparison_exp"] | undefined;
    createdAt?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    description?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    key?: ModelTypes["String_comparison_exp"] | undefined;
    updatedAt?: ModelTypes["timestamptz_comparison_exp"] | undefined;
  };
  ["custom_address_constraint"]: custom_address_constraint;
  /** input type for inserting data into table "custom_address" */
  ["custom_address_insert_input"]: {
    address?: string | undefined;
    createdAt?: ModelTypes["timestamptz"] | undefined;
    description?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    key?: string | undefined;
    updatedAt?: ModelTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["custom_address_max_fields"]: {
    address?: string | undefined;
    createdAt?: ModelTypes["timestamptz"] | undefined;
    description?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    key?: string | undefined;
    updatedAt?: ModelTypes["timestamptz"] | undefined;
  };
  /** aggregate min on columns */
  ["custom_address_min_fields"]: {
    address?: string | undefined;
    createdAt?: ModelTypes["timestamptz"] | undefined;
    description?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    key?: string | undefined;
    updatedAt?: ModelTypes["timestamptz"] | undefined;
  };
  /** response of any mutation on the table "custom_address" */
  ["custom_address_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["custom_address"]>;
  };
  /** on_conflict condition type for table "custom_address" */
  ["custom_address_on_conflict"]: {
    constraint: ModelTypes["custom_address_constraint"];
    update_columns: Array<ModelTypes["custom_address_update_column"]>;
    where?: ModelTypes["custom_address_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "custom_address". */
  ["custom_address_order_by"]: {
    address?: ModelTypes["order_by"] | undefined;
    createdAt?: ModelTypes["order_by"] | undefined;
    description?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    key?: ModelTypes["order_by"] | undefined;
    updatedAt?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: custom_address */
  ["custom_address_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["custom_address_select_column"]: custom_address_select_column;
  /** input type for updating data in table "custom_address" */
  ["custom_address_set_input"]: {
    address?: string | undefined;
    createdAt?: ModelTypes["timestamptz"] | undefined;
    description?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    key?: string | undefined;
    updatedAt?: ModelTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "custom_address" */
  ["custom_address_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["custom_address_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["custom_address_stream_cursor_value_input"]: {
    address?: string | undefined;
    createdAt?: ModelTypes["timestamptz"] | undefined;
    description?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    key?: string | undefined;
    updatedAt?: ModelTypes["timestamptz"] | undefined;
  };
  ["custom_address_update_column"]: custom_address_update_column;
  ["custom_address_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["custom_address_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["custom_address_bool_exp"];
  };
  /** mails from clients */
  ["mails"]: {
    createdAt: ModelTypes["timestamptz"];
    date: ModelTypes["timestamptz"];
    fromAddress: string;
    htmlContent: string;
    id: ModelTypes["uuid"];
    subject: string;
    textContent: string;
    toAddress: string;
    updatedAt: ModelTypes["timestamptz"];
  };
  /** aggregated selection of "mails" */
  ["mails_aggregate"]: {
    aggregate?: ModelTypes["mails_aggregate_fields"] | undefined;
    nodes: Array<ModelTypes["mails"]>;
  };
  /** aggregate fields of "mails" */
  ["mails_aggregate_fields"]: {
    count: number;
    max?: ModelTypes["mails_max_fields"] | undefined;
    min?: ModelTypes["mails_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "mails". All fields are combined with a logical 'AND'. */
  ["mails_bool_exp"]: {
    _and?: Array<ModelTypes["mails_bool_exp"]> | undefined;
    _not?: ModelTypes["mails_bool_exp"] | undefined;
    _or?: Array<ModelTypes["mails_bool_exp"]> | undefined;
    createdAt?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    date?: ModelTypes["timestamptz_comparison_exp"] | undefined;
    fromAddress?: ModelTypes["String_comparison_exp"] | undefined;
    htmlContent?: ModelTypes["String_comparison_exp"] | undefined;
    id?: ModelTypes["uuid_comparison_exp"] | undefined;
    subject?: ModelTypes["String_comparison_exp"] | undefined;
    textContent?: ModelTypes["String_comparison_exp"] | undefined;
    toAddress?: ModelTypes["String_comparison_exp"] | undefined;
    updatedAt?: ModelTypes["timestamptz_comparison_exp"] | undefined;
  };
  ["mails_constraint"]: mails_constraint;
  /** input type for inserting data into table "mails" */
  ["mails_insert_input"]: {
    createdAt?: ModelTypes["timestamptz"] | undefined;
    date?: ModelTypes["timestamptz"] | undefined;
    fromAddress?: string | undefined;
    htmlContent?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    subject?: string | undefined;
    textContent?: string | undefined;
    toAddress?: string | undefined;
    updatedAt?: ModelTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["mails_max_fields"]: {
    createdAt?: ModelTypes["timestamptz"] | undefined;
    date?: ModelTypes["timestamptz"] | undefined;
    fromAddress?: string | undefined;
    htmlContent?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    subject?: string | undefined;
    textContent?: string | undefined;
    toAddress?: string | undefined;
    updatedAt?: ModelTypes["timestamptz"] | undefined;
  };
  /** aggregate min on columns */
  ["mails_min_fields"]: {
    createdAt?: ModelTypes["timestamptz"] | undefined;
    date?: ModelTypes["timestamptz"] | undefined;
    fromAddress?: string | undefined;
    htmlContent?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    subject?: string | undefined;
    textContent?: string | undefined;
    toAddress?: string | undefined;
    updatedAt?: ModelTypes["timestamptz"] | undefined;
  };
  /** response of any mutation on the table "mails" */
  ["mails_mutation_response"]: {
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<ModelTypes["mails"]>;
  };
  /** on_conflict condition type for table "mails" */
  ["mails_on_conflict"]: {
    constraint: ModelTypes["mails_constraint"];
    update_columns: Array<ModelTypes["mails_update_column"]>;
    where?: ModelTypes["mails_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "mails". */
  ["mails_order_by"]: {
    createdAt?: ModelTypes["order_by"] | undefined;
    date?: ModelTypes["order_by"] | undefined;
    fromAddress?: ModelTypes["order_by"] | undefined;
    htmlContent?: ModelTypes["order_by"] | undefined;
    id?: ModelTypes["order_by"] | undefined;
    subject?: ModelTypes["order_by"] | undefined;
    textContent?: ModelTypes["order_by"] | undefined;
    toAddress?: ModelTypes["order_by"] | undefined;
    updatedAt?: ModelTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: mails */
  ["mails_pk_columns_input"]: {
    id: ModelTypes["uuid"];
  };
  ["mails_select_column"]: mails_select_column;
  /** input type for updating data in table "mails" */
  ["mails_set_input"]: {
    createdAt?: ModelTypes["timestamptz"] | undefined;
    date?: ModelTypes["timestamptz"] | undefined;
    fromAddress?: string | undefined;
    htmlContent?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    subject?: string | undefined;
    textContent?: string | undefined;
    toAddress?: string | undefined;
    updatedAt?: ModelTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "mails" */
  ["mails_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: ModelTypes["mails_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: ModelTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["mails_stream_cursor_value_input"]: {
    createdAt?: ModelTypes["timestamptz"] | undefined;
    date?: ModelTypes["timestamptz"] | undefined;
    fromAddress?: string | undefined;
    htmlContent?: string | undefined;
    id?: ModelTypes["uuid"] | undefined;
    subject?: string | undefined;
    textContent?: string | undefined;
    toAddress?: string | undefined;
    updatedAt?: ModelTypes["timestamptz"] | undefined;
  };
  ["mails_update_column"]: mails_update_column;
  ["mails_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: ModelTypes["mails_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: ModelTypes["mails_bool_exp"];
  };
  /** mutation root */
  ["mutation_root"]: {
    /** delete data from the table: "custom_address" */
    delete_custom_address?:
      | ModelTypes["custom_address_mutation_response"]
      | undefined;
    /** delete single row from the table: "custom_address" */
    delete_custom_address_by_pk?: ModelTypes["custom_address"] | undefined;
    /** delete data from the table: "mails" */
    delete_mails?: ModelTypes["mails_mutation_response"] | undefined;
    /** delete single row from the table: "mails" */
    delete_mails_by_pk?: ModelTypes["mails"] | undefined;
    /** insert data into the table: "custom_address" */
    insert_custom_address?:
      | ModelTypes["custom_address_mutation_response"]
      | undefined;
    /** insert a single row into the table: "custom_address" */
    insert_custom_address_one?: ModelTypes["custom_address"] | undefined;
    /** insert data into the table: "mails" */
    insert_mails?: ModelTypes["mails_mutation_response"] | undefined;
    /** insert a single row into the table: "mails" */
    insert_mails_one?: ModelTypes["mails"] | undefined;
    /** update data of the table: "custom_address" */
    update_custom_address?:
      | ModelTypes["custom_address_mutation_response"]
      | undefined;
    /** update single row of the table: "custom_address" */
    update_custom_address_by_pk?: ModelTypes["custom_address"] | undefined;
    /** update multiples rows of table: "custom_address" */
    update_custom_address_many?:
      | Array<ModelTypes["custom_address_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "mails" */
    update_mails?: ModelTypes["mails_mutation_response"] | undefined;
    /** update single row of the table: "mails" */
    update_mails_by_pk?: ModelTypes["mails"] | undefined;
    /** update multiples rows of table: "mails" */
    update_mails_many?:
      | Array<ModelTypes["mails_mutation_response"] | undefined>
      | undefined;
  };
  ["order_by"]: order_by;
  ["query_root"]: {
    /** fetch data from the table: "custom_address" */
    custom_address: Array<ModelTypes["custom_address"]>;
    /** fetch aggregated fields from the table: "custom_address" */
    custom_address_aggregate: ModelTypes["custom_address_aggregate"];
    /** fetch data from the table: "custom_address" using primary key columns */
    custom_address_by_pk?: ModelTypes["custom_address"] | undefined;
    /** fetch data from the table: "mails" */
    mails: Array<ModelTypes["mails"]>;
    /** fetch aggregated fields from the table: "mails" */
    mails_aggregate: ModelTypes["mails_aggregate"];
    /** fetch data from the table: "mails" using primary key columns */
    mails_by_pk?: ModelTypes["mails"] | undefined;
  };
  ["subscription_root"]: {
    /** fetch data from the table: "custom_address" */
    custom_address: Array<ModelTypes["custom_address"]>;
    /** fetch aggregated fields from the table: "custom_address" */
    custom_address_aggregate: ModelTypes["custom_address_aggregate"];
    /** fetch data from the table: "custom_address" using primary key columns */
    custom_address_by_pk?: ModelTypes["custom_address"] | undefined;
    /** fetch data from the table in a streaming manner: "custom_address" */
    custom_address_stream: Array<ModelTypes["custom_address"]>;
    /** fetch data from the table: "mails" */
    mails: Array<ModelTypes["mails"]>;
    /** fetch aggregated fields from the table: "mails" */
    mails_aggregate: ModelTypes["mails_aggregate"];
    /** fetch data from the table: "mails" using primary key columns */
    mails_by_pk?: ModelTypes["mails"] | undefined;
    /** fetch data from the table in a streaming manner: "mails" */
    mails_stream: Array<ModelTypes["mails"]>;
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
  /** ordering argument of a cursor */
  ["cursor_ordering"]: cursor_ordering;
  /** custom address for paybox */
  ["custom_address"]: {
    __typename: "custom_address";
    address: string;
    createdAt: GraphQLTypes["timestamptz"];
    description: string;
    id: GraphQLTypes["uuid"];
    key: string;
    updatedAt: GraphQLTypes["timestamptz"];
  };
  /** aggregated selection of "custom_address" */
  ["custom_address_aggregate"]: {
    __typename: "custom_address_aggregate";
    aggregate?: GraphQLTypes["custom_address_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["custom_address"]>;
  };
  /** aggregate fields of "custom_address" */
  ["custom_address_aggregate_fields"]: {
    __typename: "custom_address_aggregate_fields";
    count: number;
    max?: GraphQLTypes["custom_address_max_fields"] | undefined;
    min?: GraphQLTypes["custom_address_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "custom_address". All fields are combined with a logical 'AND'. */
  ["custom_address_bool_exp"]: {
    _and?: Array<GraphQLTypes["custom_address_bool_exp"]> | undefined;
    _not?: GraphQLTypes["custom_address_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["custom_address_bool_exp"]> | undefined;
    address?: GraphQLTypes["String_comparison_exp"] | undefined;
    createdAt?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    description?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    key?: GraphQLTypes["String_comparison_exp"] | undefined;
    updatedAt?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "custom_address" */
  ["custom_address_constraint"]: custom_address_constraint;
  /** input type for inserting data into table "custom_address" */
  ["custom_address_insert_input"]: {
    address?: string | undefined;
    createdAt?: GraphQLTypes["timestamptz"] | undefined;
    description?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    key?: string | undefined;
    updatedAt?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["custom_address_max_fields"]: {
    __typename: "custom_address_max_fields";
    address?: string | undefined;
    createdAt?: GraphQLTypes["timestamptz"] | undefined;
    description?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    key?: string | undefined;
    updatedAt?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** aggregate min on columns */
  ["custom_address_min_fields"]: {
    __typename: "custom_address_min_fields";
    address?: string | undefined;
    createdAt?: GraphQLTypes["timestamptz"] | undefined;
    description?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    key?: string | undefined;
    updatedAt?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** response of any mutation on the table "custom_address" */
  ["custom_address_mutation_response"]: {
    __typename: "custom_address_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["custom_address"]>;
  };
  /** on_conflict condition type for table "custom_address" */
  ["custom_address_on_conflict"]: {
    constraint: GraphQLTypes["custom_address_constraint"];
    update_columns: Array<GraphQLTypes["custom_address_update_column"]>;
    where?: GraphQLTypes["custom_address_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "custom_address". */
  ["custom_address_order_by"]: {
    address?: GraphQLTypes["order_by"] | undefined;
    createdAt?: GraphQLTypes["order_by"] | undefined;
    description?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    key?: GraphQLTypes["order_by"] | undefined;
    updatedAt?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: custom_address */
  ["custom_address_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "custom_address" */
  ["custom_address_select_column"]: custom_address_select_column;
  /** input type for updating data in table "custom_address" */
  ["custom_address_set_input"]: {
    address?: string | undefined;
    createdAt?: GraphQLTypes["timestamptz"] | undefined;
    description?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    key?: string | undefined;
    updatedAt?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "custom_address" */
  ["custom_address_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["custom_address_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["custom_address_stream_cursor_value_input"]: {
    address?: string | undefined;
    createdAt?: GraphQLTypes["timestamptz"] | undefined;
    description?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    key?: string | undefined;
    updatedAt?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** update columns of table "custom_address" */
  ["custom_address_update_column"]: custom_address_update_column;
  ["custom_address_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["custom_address_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["custom_address_bool_exp"];
  };
  /** mails from clients */
  ["mails"]: {
    __typename: "mails";
    createdAt: GraphQLTypes["timestamptz"];
    date: GraphQLTypes["timestamptz"];
    fromAddress: string;
    htmlContent: string;
    id: GraphQLTypes["uuid"];
    subject: string;
    textContent: string;
    toAddress: string;
    updatedAt: GraphQLTypes["timestamptz"];
  };
  /** aggregated selection of "mails" */
  ["mails_aggregate"]: {
    __typename: "mails_aggregate";
    aggregate?: GraphQLTypes["mails_aggregate_fields"] | undefined;
    nodes: Array<GraphQLTypes["mails"]>;
  };
  /** aggregate fields of "mails" */
  ["mails_aggregate_fields"]: {
    __typename: "mails_aggregate_fields";
    count: number;
    max?: GraphQLTypes["mails_max_fields"] | undefined;
    min?: GraphQLTypes["mails_min_fields"] | undefined;
  };
  /** Boolean expression to filter rows from the table "mails". All fields are combined with a logical 'AND'. */
  ["mails_bool_exp"]: {
    _and?: Array<GraphQLTypes["mails_bool_exp"]> | undefined;
    _not?: GraphQLTypes["mails_bool_exp"] | undefined;
    _or?: Array<GraphQLTypes["mails_bool_exp"]> | undefined;
    createdAt?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    date?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
    fromAddress?: GraphQLTypes["String_comparison_exp"] | undefined;
    htmlContent?: GraphQLTypes["String_comparison_exp"] | undefined;
    id?: GraphQLTypes["uuid_comparison_exp"] | undefined;
    subject?: GraphQLTypes["String_comparison_exp"] | undefined;
    textContent?: GraphQLTypes["String_comparison_exp"] | undefined;
    toAddress?: GraphQLTypes["String_comparison_exp"] | undefined;
    updatedAt?: GraphQLTypes["timestamptz_comparison_exp"] | undefined;
  };
  /** unique or primary key constraints on table "mails" */
  ["mails_constraint"]: mails_constraint;
  /** input type for inserting data into table "mails" */
  ["mails_insert_input"]: {
    createdAt?: GraphQLTypes["timestamptz"] | undefined;
    date?: GraphQLTypes["timestamptz"] | undefined;
    fromAddress?: string | undefined;
    htmlContent?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    subject?: string | undefined;
    textContent?: string | undefined;
    toAddress?: string | undefined;
    updatedAt?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** aggregate max on columns */
  ["mails_max_fields"]: {
    __typename: "mails_max_fields";
    createdAt?: GraphQLTypes["timestamptz"] | undefined;
    date?: GraphQLTypes["timestamptz"] | undefined;
    fromAddress?: string | undefined;
    htmlContent?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    subject?: string | undefined;
    textContent?: string | undefined;
    toAddress?: string | undefined;
    updatedAt?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** aggregate min on columns */
  ["mails_min_fields"]: {
    __typename: "mails_min_fields";
    createdAt?: GraphQLTypes["timestamptz"] | undefined;
    date?: GraphQLTypes["timestamptz"] | undefined;
    fromAddress?: string | undefined;
    htmlContent?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    subject?: string | undefined;
    textContent?: string | undefined;
    toAddress?: string | undefined;
    updatedAt?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** response of any mutation on the table "mails" */
  ["mails_mutation_response"]: {
    __typename: "mails_mutation_response";
    /** number of rows affected by the mutation */
    affected_rows: number;
    /** data from the rows affected by the mutation */
    returning: Array<GraphQLTypes["mails"]>;
  };
  /** on_conflict condition type for table "mails" */
  ["mails_on_conflict"]: {
    constraint: GraphQLTypes["mails_constraint"];
    update_columns: Array<GraphQLTypes["mails_update_column"]>;
    where?: GraphQLTypes["mails_bool_exp"] | undefined;
  };
  /** Ordering options when selecting data from "mails". */
  ["mails_order_by"]: {
    createdAt?: GraphQLTypes["order_by"] | undefined;
    date?: GraphQLTypes["order_by"] | undefined;
    fromAddress?: GraphQLTypes["order_by"] | undefined;
    htmlContent?: GraphQLTypes["order_by"] | undefined;
    id?: GraphQLTypes["order_by"] | undefined;
    subject?: GraphQLTypes["order_by"] | undefined;
    textContent?: GraphQLTypes["order_by"] | undefined;
    toAddress?: GraphQLTypes["order_by"] | undefined;
    updatedAt?: GraphQLTypes["order_by"] | undefined;
  };
  /** primary key columns input for table: mails */
  ["mails_pk_columns_input"]: {
    id: GraphQLTypes["uuid"];
  };
  /** select columns of table "mails" */
  ["mails_select_column"]: mails_select_column;
  /** input type for updating data in table "mails" */
  ["mails_set_input"]: {
    createdAt?: GraphQLTypes["timestamptz"] | undefined;
    date?: GraphQLTypes["timestamptz"] | undefined;
    fromAddress?: string | undefined;
    htmlContent?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    subject?: string | undefined;
    textContent?: string | undefined;
    toAddress?: string | undefined;
    updatedAt?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** Streaming cursor of the table "mails" */
  ["mails_stream_cursor_input"]: {
    /** Stream column input with initial value */
    initial_value: GraphQLTypes["mails_stream_cursor_value_input"];
    /** cursor ordering */
    ordering?: GraphQLTypes["cursor_ordering"] | undefined;
  };
  /** Initial value of the column from where the streaming should start */
  ["mails_stream_cursor_value_input"]: {
    createdAt?: GraphQLTypes["timestamptz"] | undefined;
    date?: GraphQLTypes["timestamptz"] | undefined;
    fromAddress?: string | undefined;
    htmlContent?: string | undefined;
    id?: GraphQLTypes["uuid"] | undefined;
    subject?: string | undefined;
    textContent?: string | undefined;
    toAddress?: string | undefined;
    updatedAt?: GraphQLTypes["timestamptz"] | undefined;
  };
  /** update columns of table "mails" */
  ["mails_update_column"]: mails_update_column;
  ["mails_updates"]: {
    /** sets the columns of the filtered rows to the given values */
    _set?: GraphQLTypes["mails_set_input"] | undefined;
    /** filter the rows which have to be updated */
    where: GraphQLTypes["mails_bool_exp"];
  };
  /** mutation root */
  ["mutation_root"]: {
    __typename: "mutation_root";
    /** delete data from the table: "custom_address" */
    delete_custom_address?:
      | GraphQLTypes["custom_address_mutation_response"]
      | undefined;
    /** delete single row from the table: "custom_address" */
    delete_custom_address_by_pk?: GraphQLTypes["custom_address"] | undefined;
    /** delete data from the table: "mails" */
    delete_mails?: GraphQLTypes["mails_mutation_response"] | undefined;
    /** delete single row from the table: "mails" */
    delete_mails_by_pk?: GraphQLTypes["mails"] | undefined;
    /** insert data into the table: "custom_address" */
    insert_custom_address?:
      | GraphQLTypes["custom_address_mutation_response"]
      | undefined;
    /** insert a single row into the table: "custom_address" */
    insert_custom_address_one?: GraphQLTypes["custom_address"] | undefined;
    /** insert data into the table: "mails" */
    insert_mails?: GraphQLTypes["mails_mutation_response"] | undefined;
    /** insert a single row into the table: "mails" */
    insert_mails_one?: GraphQLTypes["mails"] | undefined;
    /** update data of the table: "custom_address" */
    update_custom_address?:
      | GraphQLTypes["custom_address_mutation_response"]
      | undefined;
    /** update single row of the table: "custom_address" */
    update_custom_address_by_pk?: GraphQLTypes["custom_address"] | undefined;
    /** update multiples rows of table: "custom_address" */
    update_custom_address_many?:
      | Array<GraphQLTypes["custom_address_mutation_response"] | undefined>
      | undefined;
    /** update data of the table: "mails" */
    update_mails?: GraphQLTypes["mails_mutation_response"] | undefined;
    /** update single row of the table: "mails" */
    update_mails_by_pk?: GraphQLTypes["mails"] | undefined;
    /** update multiples rows of table: "mails" */
    update_mails_many?:
      | Array<GraphQLTypes["mails_mutation_response"] | undefined>
      | undefined;
  };
  /** column ordering options */
  ["order_by"]: order_by;
  ["query_root"]: {
    __typename: "query_root";
    /** fetch data from the table: "custom_address" */
    custom_address: Array<GraphQLTypes["custom_address"]>;
    /** fetch aggregated fields from the table: "custom_address" */
    custom_address_aggregate: GraphQLTypes["custom_address_aggregate"];
    /** fetch data from the table: "custom_address" using primary key columns */
    custom_address_by_pk?: GraphQLTypes["custom_address"] | undefined;
    /** fetch data from the table: "mails" */
    mails: Array<GraphQLTypes["mails"]>;
    /** fetch aggregated fields from the table: "mails" */
    mails_aggregate: GraphQLTypes["mails_aggregate"];
    /** fetch data from the table: "mails" using primary key columns */
    mails_by_pk?: GraphQLTypes["mails"] | undefined;
  };
  ["subscription_root"]: {
    __typename: "subscription_root";
    /** fetch data from the table: "custom_address" */
    custom_address: Array<GraphQLTypes["custom_address"]>;
    /** fetch aggregated fields from the table: "custom_address" */
    custom_address_aggregate: GraphQLTypes["custom_address_aggregate"];
    /** fetch data from the table: "custom_address" using primary key columns */
    custom_address_by_pk?: GraphQLTypes["custom_address"] | undefined;
    /** fetch data from the table in a streaming manner: "custom_address" */
    custom_address_stream: Array<GraphQLTypes["custom_address"]>;
    /** fetch data from the table: "mails" */
    mails: Array<GraphQLTypes["mails"]>;
    /** fetch aggregated fields from the table: "mails" */
    mails_aggregate: GraphQLTypes["mails_aggregate"];
    /** fetch data from the table: "mails" using primary key columns */
    mails_by_pk?: GraphQLTypes["mails"] | undefined;
    /** fetch data from the table in a streaming manner: "mails" */
    mails_stream: Array<GraphQLTypes["mails"]>;
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
/** ordering argument of a cursor */
export const enum cursor_ordering {
  ASC = "ASC",
  DESC = "DESC",
}
/** unique or primary key constraints on table "custom_address" */
export const enum custom_address_constraint {
  custom_address_address_key = "custom_address_address_key",
  custom_address_key_key = "custom_address_key_key",
  custom_address_pkey = "custom_address_pkey",
}
/** select columns of table "custom_address" */
export const enum custom_address_select_column {
  address = "address",
  createdAt = "createdAt",
  description = "description",
  id = "id",
  key = "key",
  updatedAt = "updatedAt",
}
/** update columns of table "custom_address" */
export const enum custom_address_update_column {
  address = "address",
  createdAt = "createdAt",
  description = "description",
  id = "id",
  key = "key",
  updatedAt = "updatedAt",
}
/** unique or primary key constraints on table "mails" */
export const enum mails_constraint {
  mails_pkey = "mails_pkey",
}
/** select columns of table "mails" */
export const enum mails_select_column {
  createdAt = "createdAt",
  date = "date",
  fromAddress = "fromAddress",
  htmlContent = "htmlContent",
  id = "id",
  subject = "subject",
  textContent = "textContent",
  toAddress = "toAddress",
  updatedAt = "updatedAt",
}
/** update columns of table "mails" */
export const enum mails_update_column {
  createdAt = "createdAt",
  date = "date",
  fromAddress = "fromAddress",
  htmlContent = "htmlContent",
  id = "id",
  subject = "subject",
  textContent = "textContent",
  toAddress = "toAddress",
  updatedAt = "updatedAt",
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
  ["cursor_ordering"]: ValueTypes["cursor_ordering"];
  ["custom_address_bool_exp"]: ValueTypes["custom_address_bool_exp"];
  ["custom_address_constraint"]: ValueTypes["custom_address_constraint"];
  ["custom_address_insert_input"]: ValueTypes["custom_address_insert_input"];
  ["custom_address_on_conflict"]: ValueTypes["custom_address_on_conflict"];
  ["custom_address_order_by"]: ValueTypes["custom_address_order_by"];
  ["custom_address_pk_columns_input"]: ValueTypes["custom_address_pk_columns_input"];
  ["custom_address_select_column"]: ValueTypes["custom_address_select_column"];
  ["custom_address_set_input"]: ValueTypes["custom_address_set_input"];
  ["custom_address_stream_cursor_input"]: ValueTypes["custom_address_stream_cursor_input"];
  ["custom_address_stream_cursor_value_input"]: ValueTypes["custom_address_stream_cursor_value_input"];
  ["custom_address_update_column"]: ValueTypes["custom_address_update_column"];
  ["custom_address_updates"]: ValueTypes["custom_address_updates"];
  ["mails_bool_exp"]: ValueTypes["mails_bool_exp"];
  ["mails_constraint"]: ValueTypes["mails_constraint"];
  ["mails_insert_input"]: ValueTypes["mails_insert_input"];
  ["mails_on_conflict"]: ValueTypes["mails_on_conflict"];
  ["mails_order_by"]: ValueTypes["mails_order_by"];
  ["mails_pk_columns_input"]: ValueTypes["mails_pk_columns_input"];
  ["mails_select_column"]: ValueTypes["mails_select_column"];
  ["mails_set_input"]: ValueTypes["mails_set_input"];
  ["mails_stream_cursor_input"]: ValueTypes["mails_stream_cursor_input"];
  ["mails_stream_cursor_value_input"]: ValueTypes["mails_stream_cursor_value_input"];
  ["mails_update_column"]: ValueTypes["mails_update_column"];
  ["mails_updates"]: ValueTypes["mails_updates"];
  ["order_by"]: ValueTypes["order_by"];
  ["timestamptz"]: ValueTypes["timestamptz"];
  ["timestamptz_comparison_exp"]: ValueTypes["timestamptz_comparison_exp"];
  ["uuid"]: ValueTypes["uuid"];
  ["uuid_comparison_exp"]: ValueTypes["uuid_comparison_exp"];
};
