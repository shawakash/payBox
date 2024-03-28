/* eslint-disable */

export const AllTypesProps: Record<string, any> = {
  String_comparison_exp: {},
  cursor_ordering: "enum" as const,
  custom_address_aggregate_fields: {
    count: {
      columns: "custom_address_select_column",
    },
  },
  custom_address_bool_exp: {
    _and: "custom_address_bool_exp",
    _not: "custom_address_bool_exp",
    _or: "custom_address_bool_exp",
    address: "String_comparison_exp",
    createdAt: "timestamptz_comparison_exp",
    description: "String_comparison_exp",
    id: "uuid_comparison_exp",
    key: "String_comparison_exp",
    updatedAt: "timestamptz_comparison_exp",
  },
  custom_address_constraint: "enum" as const,
  custom_address_insert_input: {
    createdAt: "timestamptz",
    id: "uuid",
    updatedAt: "timestamptz",
  },
  custom_address_on_conflict: {
    constraint: "custom_address_constraint",
    update_columns: "custom_address_update_column",
    where: "custom_address_bool_exp",
  },
  custom_address_order_by: {
    address: "order_by",
    createdAt: "order_by",
    description: "order_by",
    id: "order_by",
    key: "order_by",
    updatedAt: "order_by",
  },
  custom_address_pk_columns_input: {
    id: "uuid",
  },
  custom_address_select_column: "enum" as const,
  custom_address_set_input: {
    createdAt: "timestamptz",
    id: "uuid",
    updatedAt: "timestamptz",
  },
  custom_address_stream_cursor_input: {
    initial_value: "custom_address_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  custom_address_stream_cursor_value_input: {
    createdAt: "timestamptz",
    id: "uuid",
    updatedAt: "timestamptz",
  },
  custom_address_update_column: "enum" as const,
  custom_address_updates: {
    _set: "custom_address_set_input",
    where: "custom_address_bool_exp",
  },
  mails_aggregate_fields: {
    count: {
      columns: "mails_select_column",
    },
  },
  mails_bool_exp: {
    _and: "mails_bool_exp",
    _not: "mails_bool_exp",
    _or: "mails_bool_exp",
    createdAt: "timestamptz_comparison_exp",
    date: "timestamptz_comparison_exp",
    fromAddress: "String_comparison_exp",
    htmlContent: "String_comparison_exp",
    id: "uuid_comparison_exp",
    subject: "String_comparison_exp",
    textContent: "String_comparison_exp",
    toAddress: "String_comparison_exp",
    updatedAt: "timestamptz_comparison_exp",
  },
  mails_constraint: "enum" as const,
  mails_insert_input: {
    createdAt: "timestamptz",
    date: "timestamptz",
    id: "uuid",
    updatedAt: "timestamptz",
  },
  mails_on_conflict: {
    constraint: "mails_constraint",
    update_columns: "mails_update_column",
    where: "mails_bool_exp",
  },
  mails_order_by: {
    createdAt: "order_by",
    date: "order_by",
    fromAddress: "order_by",
    htmlContent: "order_by",
    id: "order_by",
    subject: "order_by",
    textContent: "order_by",
    toAddress: "order_by",
    updatedAt: "order_by",
  },
  mails_pk_columns_input: {
    id: "uuid",
  },
  mails_select_column: "enum" as const,
  mails_set_input: {
    createdAt: "timestamptz",
    date: "timestamptz",
    id: "uuid",
    updatedAt: "timestamptz",
  },
  mails_stream_cursor_input: {
    initial_value: "mails_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  mails_stream_cursor_value_input: {
    createdAt: "timestamptz",
    date: "timestamptz",
    id: "uuid",
    updatedAt: "timestamptz",
  },
  mails_update_column: "enum" as const,
  mails_updates: {
    _set: "mails_set_input",
    where: "mails_bool_exp",
  },
  mutation_root: {
    delete_custom_address: {
      where: "custom_address_bool_exp",
    },
    delete_custom_address_by_pk: {
      id: "uuid",
    },
    delete_mails: {
      where: "mails_bool_exp",
    },
    delete_mails_by_pk: {
      id: "uuid",
    },
    insert_custom_address: {
      objects: "custom_address_insert_input",
      on_conflict: "custom_address_on_conflict",
    },
    insert_custom_address_one: {
      object: "custom_address_insert_input",
      on_conflict: "custom_address_on_conflict",
    },
    insert_mails: {
      objects: "mails_insert_input",
      on_conflict: "mails_on_conflict",
    },
    insert_mails_one: {
      object: "mails_insert_input",
      on_conflict: "mails_on_conflict",
    },
    update_custom_address: {
      _set: "custom_address_set_input",
      where: "custom_address_bool_exp",
    },
    update_custom_address_by_pk: {
      _set: "custom_address_set_input",
      pk_columns: "custom_address_pk_columns_input",
    },
    update_custom_address_many: {
      updates: "custom_address_updates",
    },
    update_mails: {
      _set: "mails_set_input",
      where: "mails_bool_exp",
    },
    update_mails_by_pk: {
      _set: "mails_set_input",
      pk_columns: "mails_pk_columns_input",
    },
    update_mails_many: {
      updates: "mails_updates",
    },
  },
  order_by: "enum" as const,
  query_root: {
    custom_address: {
      distinct_on: "custom_address_select_column",
      order_by: "custom_address_order_by",
      where: "custom_address_bool_exp",
    },
    custom_address_aggregate: {
      distinct_on: "custom_address_select_column",
      order_by: "custom_address_order_by",
      where: "custom_address_bool_exp",
    },
    custom_address_by_pk: {
      id: "uuid",
    },
    mails: {
      distinct_on: "mails_select_column",
      order_by: "mails_order_by",
      where: "mails_bool_exp",
    },
    mails_aggregate: {
      distinct_on: "mails_select_column",
      order_by: "mails_order_by",
      where: "mails_bool_exp",
    },
    mails_by_pk: {
      id: "uuid",
    },
  },
  subscription_root: {
    custom_address: {
      distinct_on: "custom_address_select_column",
      order_by: "custom_address_order_by",
      where: "custom_address_bool_exp",
    },
    custom_address_aggregate: {
      distinct_on: "custom_address_select_column",
      order_by: "custom_address_order_by",
      where: "custom_address_bool_exp",
    },
    custom_address_by_pk: {
      id: "uuid",
    },
    custom_address_stream: {
      cursor: "custom_address_stream_cursor_input",
      where: "custom_address_bool_exp",
    },
    mails: {
      distinct_on: "mails_select_column",
      order_by: "mails_order_by",
      where: "mails_bool_exp",
    },
    mails_aggregate: {
      distinct_on: "mails_select_column",
      order_by: "mails_order_by",
      where: "mails_bool_exp",
    },
    mails_by_pk: {
      id: "uuid",
    },
    mails_stream: {
      cursor: "mails_stream_cursor_input",
      where: "mails_bool_exp",
    },
  },
  timestamptz: `scalar.timestamptz` as const,
  timestamptz_comparison_exp: {
    _eq: "timestamptz",
    _gt: "timestamptz",
    _gte: "timestamptz",
    _in: "timestamptz",
    _lt: "timestamptz",
    _lte: "timestamptz",
    _neq: "timestamptz",
    _nin: "timestamptz",
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
  custom_address: {
    address: "String",
    createdAt: "timestamptz",
    description: "String",
    id: "uuid",
    key: "String",
    updatedAt: "timestamptz",
  },
  custom_address_aggregate: {
    aggregate: "custom_address_aggregate_fields",
    nodes: "custom_address",
  },
  custom_address_aggregate_fields: {
    count: "Int",
    max: "custom_address_max_fields",
    min: "custom_address_min_fields",
  },
  custom_address_max_fields: {
    address: "String",
    createdAt: "timestamptz",
    description: "String",
    id: "uuid",
    key: "String",
    updatedAt: "timestamptz",
  },
  custom_address_min_fields: {
    address: "String",
    createdAt: "timestamptz",
    description: "String",
    id: "uuid",
    key: "String",
    updatedAt: "timestamptz",
  },
  custom_address_mutation_response: {
    affected_rows: "Int",
    returning: "custom_address",
  },
  mails: {
    createdAt: "timestamptz",
    date: "timestamptz",
    fromAddress: "String",
    htmlContent: "String",
    id: "uuid",
    subject: "String",
    textContent: "String",
    toAddress: "String",
    updatedAt: "timestamptz",
  },
  mails_aggregate: {
    aggregate: "mails_aggregate_fields",
    nodes: "mails",
  },
  mails_aggregate_fields: {
    count: "Int",
    max: "mails_max_fields",
    min: "mails_min_fields",
  },
  mails_max_fields: {
    createdAt: "timestamptz",
    date: "timestamptz",
    fromAddress: "String",
    htmlContent: "String",
    id: "uuid",
    subject: "String",
    textContent: "String",
    toAddress: "String",
    updatedAt: "timestamptz",
  },
  mails_min_fields: {
    createdAt: "timestamptz",
    date: "timestamptz",
    fromAddress: "String",
    htmlContent: "String",
    id: "uuid",
    subject: "String",
    textContent: "String",
    toAddress: "String",
    updatedAt: "timestamptz",
  },
  mails_mutation_response: {
    affected_rows: "Int",
    returning: "mails",
  },
  mutation_root: {
    delete_custom_address: "custom_address_mutation_response",
    delete_custom_address_by_pk: "custom_address",
    delete_mails: "mails_mutation_response",
    delete_mails_by_pk: "mails",
    insert_custom_address: "custom_address_mutation_response",
    insert_custom_address_one: "custom_address",
    insert_mails: "mails_mutation_response",
    insert_mails_one: "mails",
    update_custom_address: "custom_address_mutation_response",
    update_custom_address_by_pk: "custom_address",
    update_custom_address_many: "custom_address_mutation_response",
    update_mails: "mails_mutation_response",
    update_mails_by_pk: "mails",
    update_mails_many: "mails_mutation_response",
  },
  query_root: {
    custom_address: "custom_address",
    custom_address_aggregate: "custom_address_aggregate",
    custom_address_by_pk: "custom_address",
    mails: "mails",
    mails_aggregate: "mails_aggregate",
    mails_by_pk: "mails",
  },
  subscription_root: {
    custom_address: "custom_address",
    custom_address_aggregate: "custom_address_aggregate",
    custom_address_by_pk: "custom_address",
    custom_address_stream: "custom_address",
    mails: "mails",
    mails_aggregate: "mails_aggregate",
    mails_by_pk: "mails",
    mails_stream: "mails",
  },
  timestamptz: `scalar.timestamptz` as const,
  uuid: `scalar.uuid` as const,
};

export const Ops = {
  query: "query_root" as const,
  mutation: "mutation_root" as const,
  subscription: "subscription_root" as const,
};
