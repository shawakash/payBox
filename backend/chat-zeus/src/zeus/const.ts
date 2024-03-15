/* eslint-disable */

export const AllTypesProps: Record<string, any> = {
  String_comparison_exp: {},
  channel_aggregate_fields: {
    count: {
      columns: "channel_select_column",
    },
  },
  channel_bool_exp: {
    _and: "channel_bool_exp",
    _not: "channel_bool_exp",
    _or: "channel_bool_exp",
    clientId1: "uuid_comparison_exp",
    clientId2: "uuid_comparison_exp",
    created_at: "timestamptz_comparison_exp",
    id: "uuid_comparison_exp",
    updated_at: "timestamptz_comparison_exp",
  },
  channel_constraint: "enum" as const,
  channel_insert_input: {
    clientId1: "uuid",
    clientId2: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    updated_at: "timestamptz",
  },
  channel_on_conflict: {
    constraint: "channel_constraint",
    update_columns: "channel_update_column",
    where: "channel_bool_exp",
  },
  channel_order_by: {
    clientId1: "order_by",
    clientId2: "order_by",
    created_at: "order_by",
    id: "order_by",
    updated_at: "order_by",
  },
  channel_pk_columns_input: {
    id: "uuid",
  },
  channel_select_column: "enum" as const,
  channel_set_input: {
    clientId1: "uuid",
    clientId2: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    updated_at: "timestamptz",
  },
  channel_stream_cursor_input: {
    initial_value: "channel_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  channel_stream_cursor_value_input: {
    clientId1: "uuid",
    clientId2: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    updated_at: "timestamptz",
  },
  channel_update_column: "enum" as const,
  channel_updates: {
    _set: "channel_set_input",
    where: "channel_bool_exp",
  },
  chat_aggregate_fields: {
    count: {
      columns: "chat_select_column",
    },
  },
  chat_bool_exp: {
    _and: "chat_bool_exp",
    _not: "chat_bool_exp",
    _or: "chat_bool_exp",
    channelId: "uuid_comparison_exp",
    created_at: "timestamptz_comparison_exp",
    id: "uuid_comparison_exp",
    message: "String_comparison_exp",
    senderId: "uuid_comparison_exp",
    updated_at: "timestamptz_comparison_exp",
  },
  chat_constraint: "enum" as const,
  chat_insert_input: {
    channelId: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    senderId: "uuid",
    updated_at: "timestamptz",
  },
  chat_on_conflict: {
    constraint: "chat_constraint",
    update_columns: "chat_update_column",
    where: "chat_bool_exp",
  },
  chat_order_by: {
    channelId: "order_by",
    created_at: "order_by",
    id: "order_by",
    message: "order_by",
    senderId: "order_by",
    updated_at: "order_by",
  },
  chat_pk_columns_input: {
    id: "uuid",
  },
  chat_select_column: "enum" as const,
  chat_set_input: {
    channelId: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    senderId: "uuid",
    updated_at: "timestamptz",
  },
  chat_stream_cursor_input: {
    initial_value: "chat_stream_cursor_value_input",
    ordering: "cursor_ordering",
  },
  chat_stream_cursor_value_input: {
    channelId: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    senderId: "uuid",
    updated_at: "timestamptz",
  },
  chat_update_column: "enum" as const,
  chat_updates: {
    _set: "chat_set_input",
    where: "chat_bool_exp",
  },
  cursor_ordering: "enum" as const,
  mutation_root: {
    delete_channel: {
      where: "channel_bool_exp",
    },
    delete_channel_by_pk: {
      id: "uuid",
    },
    delete_chat: {
      where: "chat_bool_exp",
    },
    delete_chat_by_pk: {
      id: "uuid",
    },
    insert_channel: {
      objects: "channel_insert_input",
      on_conflict: "channel_on_conflict",
    },
    insert_channel_one: {
      object: "channel_insert_input",
      on_conflict: "channel_on_conflict",
    },
    insert_chat: {
      objects: "chat_insert_input",
      on_conflict: "chat_on_conflict",
    },
    insert_chat_one: {
      object: "chat_insert_input",
      on_conflict: "chat_on_conflict",
    },
    update_channel: {
      _set: "channel_set_input",
      where: "channel_bool_exp",
    },
    update_channel_by_pk: {
      _set: "channel_set_input",
      pk_columns: "channel_pk_columns_input",
    },
    update_channel_many: {
      updates: "channel_updates",
    },
    update_chat: {
      _set: "chat_set_input",
      where: "chat_bool_exp",
    },
    update_chat_by_pk: {
      _set: "chat_set_input",
      pk_columns: "chat_pk_columns_input",
    },
    update_chat_many: {
      updates: "chat_updates",
    },
  },
  order_by: "enum" as const,
  query_root: {
    channel: {
      distinct_on: "channel_select_column",
      order_by: "channel_order_by",
      where: "channel_bool_exp",
    },
    channel_aggregate: {
      distinct_on: "channel_select_column",
      order_by: "channel_order_by",
      where: "channel_bool_exp",
    },
    channel_by_pk: {
      id: "uuid",
    },
    chat: {
      distinct_on: "chat_select_column",
      order_by: "chat_order_by",
      where: "chat_bool_exp",
    },
    chat_aggregate: {
      distinct_on: "chat_select_column",
      order_by: "chat_order_by",
      where: "chat_bool_exp",
    },
    chat_by_pk: {
      id: "uuid",
    },
  },
  subscription_root: {
    channel: {
      distinct_on: "channel_select_column",
      order_by: "channel_order_by",
      where: "channel_bool_exp",
    },
    channel_aggregate: {
      distinct_on: "channel_select_column",
      order_by: "channel_order_by",
      where: "channel_bool_exp",
    },
    channel_by_pk: {
      id: "uuid",
    },
    channel_stream: {
      cursor: "channel_stream_cursor_input",
      where: "channel_bool_exp",
    },
    chat: {
      distinct_on: "chat_select_column",
      order_by: "chat_order_by",
      where: "chat_bool_exp",
    },
    chat_aggregate: {
      distinct_on: "chat_select_column",
      order_by: "chat_order_by",
      where: "chat_bool_exp",
    },
    chat_by_pk: {
      id: "uuid",
    },
    chat_stream: {
      cursor: "chat_stream_cursor_input",
      where: "chat_bool_exp",
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
  channel: {
    clientId1: "uuid",
    clientId2: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    updated_at: "timestamptz",
  },
  channel_aggregate: {
    aggregate: "channel_aggregate_fields",
    nodes: "channel",
  },
  channel_aggregate_fields: {
    count: "Int",
    max: "channel_max_fields",
    min: "channel_min_fields",
  },
  channel_max_fields: {
    clientId1: "uuid",
    clientId2: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    updated_at: "timestamptz",
  },
  channel_min_fields: {
    clientId1: "uuid",
    clientId2: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    updated_at: "timestamptz",
  },
  channel_mutation_response: {
    affected_rows: "Int",
    returning: "channel",
  },
  chat: {
    channelId: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    message: "String",
    senderId: "uuid",
    updated_at: "timestamptz",
  },
  chat_aggregate: {
    aggregate: "chat_aggregate_fields",
    nodes: "chat",
  },
  chat_aggregate_fields: {
    count: "Int",
    max: "chat_max_fields",
    min: "chat_min_fields",
  },
  chat_max_fields: {
    channelId: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    message: "String",
    senderId: "uuid",
    updated_at: "timestamptz",
  },
  chat_min_fields: {
    channelId: "uuid",
    created_at: "timestamptz",
    id: "uuid",
    message: "String",
    senderId: "uuid",
    updated_at: "timestamptz",
  },
  chat_mutation_response: {
    affected_rows: "Int",
    returning: "chat",
  },
  mutation_root: {
    delete_channel: "channel_mutation_response",
    delete_channel_by_pk: "channel",
    delete_chat: "chat_mutation_response",
    delete_chat_by_pk: "chat",
    insert_channel: "channel_mutation_response",
    insert_channel_one: "channel",
    insert_chat: "chat_mutation_response",
    insert_chat_one: "chat",
    update_channel: "channel_mutation_response",
    update_channel_by_pk: "channel",
    update_channel_many: "channel_mutation_response",
    update_chat: "chat_mutation_response",
    update_chat_by_pk: "chat",
    update_chat_many: "chat_mutation_response",
  },
  query_root: {
    channel: "channel",
    channel_aggregate: "channel_aggregate",
    channel_by_pk: "channel",
    chat: "chat",
    chat_aggregate: "chat_aggregate",
    chat_by_pk: "chat",
  },
  subscription_root: {
    channel: "channel",
    channel_aggregate: "channel_aggregate",
    channel_by_pk: "channel",
    channel_stream: "channel",
    chat: "chat",
    chat_aggregate: "chat_aggregate",
    chat_by_pk: "chat",
    chat_stream: "chat",
  },
  timestamptz: `scalar.timestamptz` as const,
  uuid: `scalar.uuid` as const,
};

export const Ops = {
  query: "query_root" as const,
  mutation: "mutation_root" as const,
  subscription: "subscription_root" as const,
};
