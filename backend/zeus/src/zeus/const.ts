/* eslint-disable */

export const AllTypesProps: Record<string, any> = {
  Int_comparison_exp: {},
  String_comparison_exp: {},
  chain_aggregate_fields: {
    count: {
      columns: "chain_select_column",
    },
  },
  chain_bool_exp: {
    _and: "chain_bool_exp",
    _not: "chain_bool_exp",
    _or: "chain_bool_exp",
    bitcoin: "String_comparison_exp",
    client: "client_bool_exp",
    client_id: "uuid_comparison_exp",
    eth: "String_comparison_exp",
    id: "uuid_comparison_exp",
    sol: "String_comparison_exp",
    usdc: "String_comparison_exp",
  },
  chain_constraint: "enum" as const,
  chain_insert_input: {
    client: "client_obj_rel_insert_input",
    client_id: "uuid",
    id: "uuid",
  },
  chain_obj_rel_insert_input: {
    data: "chain_insert_input",
    on_conflict: "chain_on_conflict",
  },
  chain_on_conflict: {
    constraint: "chain_constraint",
    update_columns: "chain_update_column",
    where: "chain_bool_exp",
  },
  chain_order_by: {
    bitcoin: "order_by",
    client: "client_order_by",
    client_id: "order_by",
    eth: "order_by",
    id: "order_by",
    sol: "order_by",
    usdc: "order_by",
  },
  chain_pk_columns_input: {
    id: "uuid",
  },
  chain_select_column: "enum" as const,
  chain_set_input: {
    client_id: "uuid",
    id: "uuid",
  },
  chain_stream_cursor_input: {
    initial_value: "chain_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  chain_stream_cursor_value_input: {
    client_id: "uuid",
    id: "uuid",
  },
  chain_update_column: "enum" as const,
  chain_updates: {
    _set: "chain_set_input",
    where: "chain_bool_exp",
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
    chain: "chain_bool_exp",
    email: "String_comparison_exp",
    firstname: "String_comparison_exp",
    id: "uuid_comparison_exp",
    lastname: "String_comparison_exp",
    mobile: "Int_comparison_exp",
    username: "String_comparison_exp",
  },
  client_constraint: "enum" as const,
  client_inc_input: {},
  client_insert_input: {
    chain: "chain_obj_rel_insert_input",
    id: "uuid",
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
    chain: "chain_order_by",
    email: "order_by",
    firstname: "order_by",
    id: "order_by",
    lastname: "order_by",
    mobile: "order_by",
    username: "order_by",
  },
  client_pk_columns_input: {
    id: "uuid",
  },
  client_select_column: "enum" as const,
  client_set_input: {
    id: "uuid",
  },
  client_stream_cursor_input: {
    initial_value: "client_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  client_stream_cursor_value_input: {
    id: "uuid",
  },
  client_update_column: "enum" as const,
  client_updates: {
    _inc: "client_inc_input",
    _set: "client_set_input",
    where: "client_bool_exp",
  },
  cursor_ordering: "enum" as const,
  mutation_root: {
    delete_chain: {
      where: "chain_bool_exp",
    },
    delete_chain_by_pk: {
      id: "uuid",
    },
    delete_client: {
      where: "client_bool_exp",
    },
    delete_client_by_pk: {
      id: "uuid",
    },
    insert_chain: {
      objects: "chain_insert_input",
      on_conflict: "chain_on_conflict",
    },
    insert_chain_one: {
      object: "chain_insert_input",
      on_conflict: "chain_on_conflict",
    },
    insert_client: {
      objects: "client_insert_input",
      on_conflict: "client_on_conflict",
    },
    insert_client_one: {
      object: "client_insert_input",
      on_conflict: "client_on_conflict",
    },
    update_chain: {
      _set: "chain_set_input",
      where: "chain_bool_exp",
    },
    update_chain_by_pk: {
      _set: "chain_set_input",
      pk_columns: "chain_pk_columns_input",
    },
    update_chain_many: {
      updates: "chain_updates",
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
    chain: {
      distinct_on: "chain_select_column",
      order_by: "chain_order_by",
      where: "chain_bool_exp",
    },
    chain_aggregate: {
      distinct_on: "chain_select_column",
      order_by: "chain_order_by",
      where: "chain_bool_exp",
    },
    chain_by_pk: {
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
    chain: {
      distinct_on: "chain_select_column",
      order_by: "chain_order_by",
      where: "chain_bool_exp",
    },
    chain_aggregate: {
      distinct_on: "chain_select_column",
      order_by: "chain_order_by",
      where: "chain_bool_exp",
    },
    chain_by_pk: {
      id: "uuid",
    },
    chain_stream: {
      cursor: "chain_stream_cursor_input",
      where: "chain_bool_exp",
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
  chain: {
    bitcoin: "String",
    client: "client",
    client_id: "uuid",
    eth: "String",
    id: "uuid",
    sol: "String",
    usdc: "String",
  },
  chain_aggregate: {
    aggregate: "chain_aggregate_fields",
    nodes: "chain",
  },
  chain_aggregate_fields: {
    count: "Int",
    max: "chain_max_fields",
    min: "chain_min_fields",
  },
  chain_max_fields: {
    bitcoin: "String",
    client_id: "uuid",
    eth: "String",
    id: "uuid",
    sol: "String",
    usdc: "String",
  },
  chain_min_fields: {
    bitcoin: "String",
    client_id: "uuid",
    eth: "String",
    id: "uuid",
    sol: "String",
    usdc: "String",
  },
  chain_mutation_response: {
    affected_rows: "Int",
    returning: "chain",
  },
  client: {
    chain: "chain",
    email: "String",
    firstname: "String",
    id: "uuid",
    lastname: "String",
    mobile: "Int",
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
    mobile: "Int",
    username: "String",
  },
  client_min_fields: {
    email: "String",
    firstname: "String",
    id: "uuid",
    lastname: "String",
    mobile: "Int",
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
    mobile: "Int",
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
    delete_chain: "chain_mutation_response",
    delete_chain_by_pk: "chain",
    delete_client: "client_mutation_response",
    delete_client_by_pk: "client",
    insert_chain: "chain_mutation_response",
    insert_chain_one: "chain",
    insert_client: "client_mutation_response",
    insert_client_one: "client",
    update_chain: "chain_mutation_response",
    update_chain_by_pk: "chain",
    update_chain_many: "chain_mutation_response",
    update_client: "client_mutation_response",
    update_client_by_pk: "client",
    update_client_many: "client_mutation_response",
  },
  query_root: {
    chain: "chain",
    chain_aggregate: "chain_aggregate",
    chain_by_pk: "chain",
    client: "client",
    client_aggregate: "client_aggregate",
    client_by_pk: "client",
  },
  subscription_root: {
    chain: "chain",
    chain_aggregate: "chain_aggregate",
    chain_by_pk: "chain",
    chain_stream: "chain",
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
