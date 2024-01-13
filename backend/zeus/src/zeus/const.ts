/* eslint-disable */

export const AllTypesProps: Record<string, any> = {
  Int_comparison_exp: {},
  String_comparison_exp: {},
  client: {
    address: {},
    chain: {},
  },
  client_aggregate_fields: {
    count: {
      columns: "client_select_column",
    },
  },
  client_append_input: {
    address: "jsonb",
    chain: "jsonb",
  },
  client_bool_exp: {
    _and: "client_bool_exp",
    _not: "client_bool_exp",
    _or: "client_bool_exp",
    address: "jsonb_comparison_exp",
    chain: "jsonb_comparison_exp",
    email: "String_comparison_exp",
    firstname: "String_comparison_exp",
    id: "uuid_comparison_exp",
    lastname: "String_comparison_exp",
    mobile_number: "Int_comparison_exp",
    username: "String_comparison_exp",
  },
  client_constraint: "enum" as const,
  client_delete_at_path_input: {},
  client_delete_elem_input: {},
  client_delete_key_input: {},
  client_inc_input: {},
  client_insert_input: {
    address: "jsonb",
    chain: "jsonb",
    id: "uuid",
  },
  client_on_conflict: {
    constraint: "client_constraint",
    update_columns: "client_update_column",
    where: "client_bool_exp",
  },
  client_order_by: {
    address: "order_by",
    chain: "order_by",
    email: "order_by",
    firstname: "order_by",
    id: "order_by",
    lastname: "order_by",
    mobile_number: "order_by",
    username: "order_by",
  },
  client_pk_columns_input: {
    id: "uuid",
  },
  client_prepend_input: {
    address: "jsonb",
    chain: "jsonb",
  },
  client_select_column: "enum" as const,
  client_set_input: {
    address: "jsonb",
    chain: "jsonb",
    id: "uuid",
  },
  client_stream_cursor_input: {
    initial_value: "client_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  client_stream_cursor_value_input: {
    address: "jsonb",
    chain: "jsonb",
    id: "uuid",
  },
  client_update_column: "enum" as const,
  client_updates: {
    _append: "client_append_input",
    _delete_at_path: "client_delete_at_path_input",
    _delete_elem: "client_delete_elem_input",
    _delete_key: "client_delete_key_input",
    _inc: "client_inc_input",
    _prepend: "client_prepend_input",
    _set: "client_set_input",
    where: "client_bool_exp",
  },
  cursor_ordering: "enum" as const,
  jsonb: `scalar.jsonb` as const,
  jsonb_cast_exp: {
    String: "String_comparison_exp",
  },
  jsonb_comparison_exp: {
    _cast: "jsonb_cast_exp",
    _contained_in: "jsonb",
    _contains: "jsonb",
    _eq: "jsonb",
    _gt: "jsonb",
    _gte: "jsonb",
    _in: "jsonb",
    _lt: "jsonb",
    _lte: "jsonb",
    _neq: "jsonb",
    _nin: "jsonb",
  },
  mutation_root: {
    delete_client: {
      where: "client_bool_exp",
    },
    delete_client_by_pk: {
      id: "uuid",
    },
    insert_client: {
      objects: "client_insert_input",
      on_conflict: "client_on_conflict",
    },
    insert_client_one: {
      object: "client_insert_input",
      on_conflict: "client_on_conflict",
    },
    update_client: {
      _append: "client_append_input",
      _delete_at_path: "client_delete_at_path_input",
      _delete_elem: "client_delete_elem_input",
      _delete_key: "client_delete_key_input",
      _inc: "client_inc_input",
      _prepend: "client_prepend_input",
      _set: "client_set_input",
      where: "client_bool_exp",
    },
    update_client_by_pk: {
      _append: "client_append_input",
      _delete_at_path: "client_delete_at_path_input",
      _delete_elem: "client_delete_elem_input",
      _delete_key: "client_delete_key_input",
      _inc: "client_inc_input",
      _prepend: "client_prepend_input",
      _set: "client_set_input",
      pk_columns: "client_pk_columns_input",
    },
    update_client_many: {
      updates: "client_updates",
    },
  },
  order_by: "enum" as const,
  query_root: {
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
  client: {
    address: "jsonb",
    chain: "jsonb",
    email: "String",
    firstname: "String",
    id: "uuid",
    lastname: "String",
    mobile_number: "Int",
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
    mobile_number: "Float",
  },
  client_max_fields: {
    email: "String",
    firstname: "String",
    id: "uuid",
    lastname: "String",
    mobile_number: "Int",
    username: "String",
  },
  client_min_fields: {
    email: "String",
    firstname: "String",
    id: "uuid",
    lastname: "String",
    mobile_number: "Int",
    username: "String",
  },
  client_mutation_response: {
    affected_rows: "Int",
    returning: "client",
  },
  client_stddev_fields: {
    mobile_number: "Float",
  },
  client_stddev_pop_fields: {
    mobile_number: "Float",
  },
  client_stddev_samp_fields: {
    mobile_number: "Float",
  },
  client_sum_fields: {
    mobile_number: "Int",
  },
  client_var_pop_fields: {
    mobile_number: "Float",
  },
  client_var_samp_fields: {
    mobile_number: "Float",
  },
  client_variance_fields: {
    mobile_number: "Float",
  },
  jsonb: `scalar.jsonb` as const,
  mutation_root: {
    delete_client: "client_mutation_response",
    delete_client_by_pk: "client",
    insert_client: "client_mutation_response",
    insert_client_one: "client",
    update_client: "client_mutation_response",
    update_client_by_pk: "client",
    update_client_many: "client_mutation_response",
  },
  query_root: {
    client: "client",
    client_aggregate: "client_aggregate",
    client_by_pk: "client",
  },
  subscription_root: {
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
