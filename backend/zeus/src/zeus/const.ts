/* eslint-disable */

export const AllTypesProps: Record<string, any> = {
  String_comparison_exp: {},
  address_aggregate_fields: {
    count: {
      columns: "address_select_column",
    },
  },
  address_bool_exp: {
    _and: "address_bool_exp",
    _not: "address_bool_exp",
    _or: "address_bool_exp",
    bitcoin: "String_comparison_exp",
    client: "client_bool_exp",
    client_id: "uuid_comparison_exp",
    eth: "String_comparison_exp",
    id: "uuid_comparison_exp",
    sol: "String_comparison_exp",
    usdc: "String_comparison_exp",
  },
  address_constraint: "enum" as const,
  address_insert_input: {
    client: "client_obj_rel_insert_input",
    client_id: "uuid",
    id: "uuid",
  },
  address_obj_rel_insert_input: {
    data: "address_insert_input",
    on_conflict: "address_on_conflict",
  },
  address_on_conflict: {
    constraint: "address_constraint",
    update_columns: "address_update_column",
    where: "address_bool_exp",
  },
  address_order_by: {
    bitcoin: "order_by",
    client: "client_order_by",
    client_id: "order_by",
    eth: "order_by",
    id: "order_by",
    sol: "order_by",
    usdc: "order_by",
  },
  address_pk_columns_input: {
    id: "uuid",
  },
  address_select_column: "enum" as const,
  address_set_input: {
    client_id: "uuid",
    id: "uuid",
  },
  address_stream_cursor_input: {
    initial_value: "address_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  address_stream_cursor_value_input: {
    client_id: "uuid",
    id: "uuid",
  },
  address_update_column: "enum" as const,
  address_updates: {
    _set: "address_set_input",
    where: "address_bool_exp",
  },
  bigint: `scalar.bigint` as const,
  bigint_comparison_exp: {
    _eq: "bigint",
    _gt: "bigint",
    _gte: "bigint",
    _in: "bigint",
    _lt: "bigint",
    _lte: "bigint",
    _neq: "bigint",
    _nin: "bigint",
  },
  client_aggregate_fields: {
    count: {
      columns: "client_select_column",
    },
  },
  client_bool_exp: {
    _and: "client_bool_exp",
    _not: "client_bool_exp",
    _or: "client_bool_exp",
    address: "address_bool_exp",
    email: "String_comparison_exp",
    firstname: "String_comparison_exp",
    id: "uuid_comparison_exp",
    lastname: "String_comparison_exp",
    mobile: "bigint_comparison_exp",
    password: "String_comparison_exp",
    username: "String_comparison_exp",
  },
  client_constraint: "enum" as const,
  client_inc_input: {
    mobile: "bigint",
  },
  client_insert_input: {
    address: "address_obj_rel_insert_input",
    id: "uuid",
    mobile: "bigint",
  },
  client_obj_rel_insert_input: {
    data: "client_insert_input",
    on_conflict: "client_on_conflict",
  },
  client_on_conflict: {
    constraint: "client_constraint",
    update_columns: "client_update_column",
    where: "client_bool_exp",
  },
  client_order_by: {
    address: "address_order_by",
    email: "order_by",
    firstname: "order_by",
    id: "order_by",
    lastname: "order_by",
    mobile: "order_by",
    password: "order_by",
    username: "order_by",
  },
  client_pk_columns_input: {
    id: "uuid",
  },
  client_select_column: "enum" as const,
  client_set_input: {
    id: "uuid",
    mobile: "bigint",
  },
  client_stream_cursor_input: {
    initial_value: "client_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  client_stream_cursor_value_input: {
    id: "uuid",
    mobile: "bigint",
  },
  client_update_column: "enum" as const,
  client_updates: {
    _inc: "client_inc_input",
    _set: "client_set_input",
    where: "client_bool_exp",
  },
  cursor_ordering: "enum" as const,
  mutation_root: {
    delete_address: {
      where: "address_bool_exp",
    },
    delete_address_by_pk: {
      id: "uuid",
    },
    delete_client: {
      where: "client_bool_exp",
    },
    delete_client_by_pk: {
      id: "uuid",
    },
    insert_address: {
      objects: "address_insert_input",
      on_conflict: "address_on_conflict",
    },
    insert_address_one: {
      object: "address_insert_input",
      on_conflict: "address_on_conflict",
    },
    insert_client: {
      objects: "client_insert_input",
      on_conflict: "client_on_conflict",
    },
    insert_client_one: {
      object: "client_insert_input",
      on_conflict: "client_on_conflict",
    },
    update_address: {
      _set: "address_set_input",
      where: "address_bool_exp",
    },
    update_address_by_pk: {
      _set: "address_set_input",
      pk_columns: "address_pk_columns_input",
    },
    update_address_many: {
      updates: "address_updates",
    },
    update_client: {
      _inc: "client_inc_input",
      _set: "client_set_input",
      where: "client_bool_exp",
    },
    update_client_by_pk: {
      _inc: "client_inc_input",
      _set: "client_set_input",
      pk_columns: "client_pk_columns_input",
    },
    update_client_many: {
      updates: "client_updates",
    },
  },
  order_by: "enum" as const,
  query_root: {
    address: {
      distinct_on: "address_select_column",
      order_by: "address_order_by",
      where: "address_bool_exp",
    },
    address_aggregate: {
      distinct_on: "address_select_column",
      order_by: "address_order_by",
      where: "address_bool_exp",
    },
    address_by_pk: {
      id: "uuid",
    },
    client: {
      distinct_on: "client_select_column",
      order_by: "client_order_by",
      where: "client_bool_exp",
    },
    client_aggregate: {
      distinct_on: "client_select_column",
      order_by: "client_order_by",
      where: "client_bool_exp",
    },
    client_by_pk: {
      id: "uuid",
    },
  },
  subscription_root: {
    address: {
      distinct_on: "address_select_column",
      order_by: "address_order_by",
      where: "address_bool_exp",
    },
    address_aggregate: {
      distinct_on: "address_select_column",
      order_by: "address_order_by",
      where: "address_bool_exp",
    },
    address_by_pk: {
      id: "uuid",
    },
    address_stream: {
      cursor: "address_stream_cursor_input",
      where: "address_bool_exp",
    },
    client: {
      distinct_on: "client_select_column",
      order_by: "client_order_by",
      where: "client_bool_exp",
    },
    client_aggregate: {
      distinct_on: "client_select_column",
      order_by: "client_order_by",
      where: "client_bool_exp",
    },
    client_by_pk: {
      id: "uuid",
    },
    client_stream: {
      cursor: "client_stream_cursor_input",
      where: "client_bool_exp",
    },
  },
  uuid: `scalar.uuid` as const,
  uuid_comparison_exp: {
    _eq: "uuid",
    _gt: "uuid",
    _gte: "uuid",
    _in: "uuid",
    _lt: "uuid",
    _lte: "uuid",
    _neq: "uuid",
    _nin: "uuid",
  },
};

export const ReturnTypes: Record<string, any> = {
  cached: {
    ttl: "Int",
    refresh: "Boolean",
  },
  address: {
    bitcoin: "String",
    client: "client",
    client_id: "uuid",
    eth: "String",
    id: "uuid",
    sol: "String",
    usdc: "String",
  },
  address_aggregate: {
    aggregate: "address_aggregate_fields",
    nodes: "address",
  },
  address_aggregate_fields: {
    count: "Int",
    max: "address_max_fields",
    min: "address_min_fields",
  },
  address_max_fields: {
    bitcoin: "String",
    client_id: "uuid",
    eth: "String",
    id: "uuid",
    sol: "String",
    usdc: "String",
  },
  address_min_fields: {
    bitcoin: "String",
    client_id: "uuid",
    eth: "String",
    id: "uuid",
    sol: "String",
    usdc: "String",
  },
  address_mutation_response: {
    affected_rows: "Int",
    returning: "address",
  },
  bigint: `scalar.bigint` as const,
  client: {
    address: "address",
    email: "String",
    firstname: "String",
    id: "uuid",
    lastname: "String",
    mobile: "bigint",
    password: "String",
    username: "String",
  },
  client_aggregate: {
    aggregate: "client_aggregate_fields",
    nodes: "client",
  },
  client_aggregate_fields: {
    avg: "client_avg_fields",
    count: "Int",
    max: "client_max_fields",
    min: "client_min_fields",
    stddev: "client_stddev_fields",
    stddev_pop: "client_stddev_pop_fields",
    stddev_samp: "client_stddev_samp_fields",
    sum: "client_sum_fields",
    var_pop: "client_var_pop_fields",
    var_samp: "client_var_samp_fields",
    variance: "client_variance_fields",
  },
  client_avg_fields: {
    mobile: "Float",
  },
  client_max_fields: {
    email: "String",
    firstname: "String",
    id: "uuid",
    lastname: "String",
    mobile: "bigint",
    password: "String",
    username: "String",
  },
  client_min_fields: {
    email: "String",
    firstname: "String",
    id: "uuid",
    lastname: "String",
    mobile: "bigint",
    password: "String",
    username: "String",
  },
  client_mutation_response: {
    affected_rows: "Int",
    returning: "client",
  },
  client_stddev_fields: {
    mobile: "Float",
  },
  client_stddev_pop_fields: {
    mobile: "Float",
  },
  client_stddev_samp_fields: {
    mobile: "Float",
  },
  client_sum_fields: {
    mobile: "bigint",
  },
  client_var_pop_fields: {
    mobile: "Float",
  },
  client_var_samp_fields: {
    mobile: "Float",
  },
  client_variance_fields: {
    mobile: "Float",
  },
  mutation_root: {
    delete_address: "address_mutation_response",
    delete_address_by_pk: "address",
    delete_client: "client_mutation_response",
    delete_client_by_pk: "client",
    insert_address: "address_mutation_response",
    insert_address_one: "address",
    insert_client: "client_mutation_response",
    insert_client_one: "client",
    update_address: "address_mutation_response",
    update_address_by_pk: "address",
    update_address_many: "address_mutation_response",
    update_client: "client_mutation_response",
    update_client_by_pk: "client",
    update_client_many: "client_mutation_response",
  },
  query_root: {
    address: "address",
    address_aggregate: "address_aggregate",
    address_by_pk: "address",
    client: "client",
    client_aggregate: "client_aggregate",
    client_by_pk: "client",
  },
  subscription_root: {
    address: "address",
    address_aggregate: "address_aggregate",
    address_by_pk: "address",
    address_stream: "address",
    client: "client",
    client_aggregate: "client_aggregate",
    client_by_pk: "client",
    client_stream: "client",
  },
  uuid: `scalar.uuid` as const,
};

export const Ops = {
  query: "query_root" as const,
  mutation: "mutation_root" as const,
  subscription: "subscription_root" as const,
};
