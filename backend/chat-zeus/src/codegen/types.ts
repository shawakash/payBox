export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  timestamptz: { input: any; output: any; }
  uuid: { input: any; output: any; }
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** all the rooms for chat */
export type Channel = {
  __typename?: 'channel';
  clientId1: Scalars['uuid']['output'];
  clientId2: Scalars['uuid']['output'];
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

/** aggregated selection of "channel" */
export type Channel_Aggregate = {
  __typename?: 'channel_aggregate';
  aggregate?: Maybe<Channel_Aggregate_Fields>;
  nodes: Array<Channel>;
};

/** aggregate fields of "channel" */
export type Channel_Aggregate_Fields = {
  __typename?: 'channel_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Channel_Max_Fields>;
  min?: Maybe<Channel_Min_Fields>;
};


/** aggregate fields of "channel" */
export type Channel_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Channel_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "channel". All fields are combined with a logical 'AND'. */
export type Channel_Bool_Exp = {
  _and?: InputMaybe<Array<Channel_Bool_Exp>>;
  _not?: InputMaybe<Channel_Bool_Exp>;
  _or?: InputMaybe<Array<Channel_Bool_Exp>>;
  clientId1?: InputMaybe<Uuid_Comparison_Exp>;
  clientId2?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "channel" */
export enum Channel_Constraint {
  /** unique or primary key constraint on columns "clientId1" */
  ChannelClientId1Key = 'channel_clientId1_key',
  /** unique or primary key constraint on columns "clientId2" */
  ChannelClientId2Key = 'channel_clientId2_key',
  /** unique or primary key constraint on columns "id" */
  ChannelPkey = 'channel_pkey'
}

/** input type for inserting data into table "channel" */
export type Channel_Insert_Input = {
  clientId1?: InputMaybe<Scalars['uuid']['input']>;
  clientId2?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Channel_Max_Fields = {
  __typename?: 'channel_max_fields';
  clientId1?: Maybe<Scalars['uuid']['output']>;
  clientId2?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Channel_Min_Fields = {
  __typename?: 'channel_min_fields';
  clientId1?: Maybe<Scalars['uuid']['output']>;
  clientId2?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "channel" */
export type Channel_Mutation_Response = {
  __typename?: 'channel_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Channel>;
};

/** on_conflict condition type for table "channel" */
export type Channel_On_Conflict = {
  constraint: Channel_Constraint;
  update_columns?: Array<Channel_Update_Column>;
  where?: InputMaybe<Channel_Bool_Exp>;
};

/** Ordering options when selecting data from "channel". */
export type Channel_Order_By = {
  clientId1?: InputMaybe<Order_By>;
  clientId2?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: channel */
export type Channel_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "channel" */
export enum Channel_Select_Column {
  /** column name */
  ClientId1 = 'clientId1',
  /** column name */
  ClientId2 = 'clientId2',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "channel" */
export type Channel_Set_Input = {
  clientId1?: InputMaybe<Scalars['uuid']['input']>;
  clientId2?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "channel" */
export type Channel_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Channel_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Channel_Stream_Cursor_Value_Input = {
  clientId1?: InputMaybe<Scalars['uuid']['input']>;
  clientId2?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "channel" */
export enum Channel_Update_Column {
  /** column name */
  ClientId1 = 'clientId1',
  /** column name */
  ClientId2 = 'clientId2',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Channel_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Channel_Set_Input>;
  /** filter the rows which have to be updated */
  where: Channel_Bool_Exp;
};

/** chat messages between clients */
export type Chat = {
  __typename?: 'chat';
  channelId: Scalars['uuid']['output'];
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  message: Scalars['String']['output'];
  senderId: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

/** aggregated selection of "chat" */
export type Chat_Aggregate = {
  __typename?: 'chat_aggregate';
  aggregate?: Maybe<Chat_Aggregate_Fields>;
  nodes: Array<Chat>;
};

/** aggregate fields of "chat" */
export type Chat_Aggregate_Fields = {
  __typename?: 'chat_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Chat_Max_Fields>;
  min?: Maybe<Chat_Min_Fields>;
};


/** aggregate fields of "chat" */
export type Chat_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Chat_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "chat". All fields are combined with a logical 'AND'. */
export type Chat_Bool_Exp = {
  _and?: InputMaybe<Array<Chat_Bool_Exp>>;
  _not?: InputMaybe<Chat_Bool_Exp>;
  _or?: InputMaybe<Array<Chat_Bool_Exp>>;
  channelId?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  message?: InputMaybe<String_Comparison_Exp>;
  senderId?: InputMaybe<Uuid_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "chat" */
export enum Chat_Constraint {
  /** unique or primary key constraint on columns "id" */
  ChatPkey = 'chat_pkey'
}

/** input type for inserting data into table "chat" */
export type Chat_Insert_Input = {
  channelId?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  senderId?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Chat_Max_Fields = {
  __typename?: 'chat_max_fields';
  channelId?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  senderId?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Chat_Min_Fields = {
  __typename?: 'chat_min_fields';
  channelId?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  senderId?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "chat" */
export type Chat_Mutation_Response = {
  __typename?: 'chat_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Chat>;
};

/** on_conflict condition type for table "chat" */
export type Chat_On_Conflict = {
  constraint: Chat_Constraint;
  update_columns?: Array<Chat_Update_Column>;
  where?: InputMaybe<Chat_Bool_Exp>;
};

/** Ordering options when selecting data from "chat". */
export type Chat_Order_By = {
  channelId?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  message?: InputMaybe<Order_By>;
  senderId?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: chat */
export type Chat_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "chat" */
export enum Chat_Select_Column {
  /** column name */
  ChannelId = 'channelId',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Message = 'message',
  /** column name */
  SenderId = 'senderId',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "chat" */
export type Chat_Set_Input = {
  channelId?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  senderId?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "chat" */
export type Chat_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Chat_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Chat_Stream_Cursor_Value_Input = {
  channelId?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  senderId?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "chat" */
export enum Chat_Update_Column {
  /** column name */
  ChannelId = 'channelId',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Message = 'message',
  /** column name */
  SenderId = 'senderId',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Chat_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Chat_Set_Input>;
  /** filter the rows which have to be updated */
  where: Chat_Bool_Exp;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "channel" */
  delete_channel?: Maybe<Channel_Mutation_Response>;
  /** delete single row from the table: "channel" */
  delete_channel_by_pk?: Maybe<Channel>;
  /** delete data from the table: "chat" */
  delete_chat?: Maybe<Chat_Mutation_Response>;
  /** delete single row from the table: "chat" */
  delete_chat_by_pk?: Maybe<Chat>;
  /** insert data into the table: "channel" */
  insert_channel?: Maybe<Channel_Mutation_Response>;
  /** insert a single row into the table: "channel" */
  insert_channel_one?: Maybe<Channel>;
  /** insert data into the table: "chat" */
  insert_chat?: Maybe<Chat_Mutation_Response>;
  /** insert a single row into the table: "chat" */
  insert_chat_one?: Maybe<Chat>;
  /** update data of the table: "channel" */
  update_channel?: Maybe<Channel_Mutation_Response>;
  /** update single row of the table: "channel" */
  update_channel_by_pk?: Maybe<Channel>;
  /** update multiples rows of table: "channel" */
  update_channel_many?: Maybe<Array<Maybe<Channel_Mutation_Response>>>;
  /** update data of the table: "chat" */
  update_chat?: Maybe<Chat_Mutation_Response>;
  /** update single row of the table: "chat" */
  update_chat_by_pk?: Maybe<Chat>;
  /** update multiples rows of table: "chat" */
  update_chat_many?: Maybe<Array<Maybe<Chat_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_ChannelArgs = {
  where: Channel_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Channel_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_ChatArgs = {
  where: Chat_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Chat_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootInsert_ChannelArgs = {
  objects: Array<Channel_Insert_Input>;
  on_conflict?: InputMaybe<Channel_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Channel_OneArgs = {
  object: Channel_Insert_Input;
  on_conflict?: InputMaybe<Channel_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ChatArgs = {
  objects: Array<Chat_Insert_Input>;
  on_conflict?: InputMaybe<Chat_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Chat_OneArgs = {
  object: Chat_Insert_Input;
  on_conflict?: InputMaybe<Chat_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_ChannelArgs = {
  _set?: InputMaybe<Channel_Set_Input>;
  where: Channel_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Channel_By_PkArgs = {
  _set?: InputMaybe<Channel_Set_Input>;
  pk_columns: Channel_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Channel_ManyArgs = {
  updates: Array<Channel_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_ChatArgs = {
  _set?: InputMaybe<Chat_Set_Input>;
  where: Chat_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Chat_By_PkArgs = {
  _set?: InputMaybe<Chat_Set_Input>;
  pk_columns: Chat_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Chat_ManyArgs = {
  updates: Array<Chat_Updates>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "channel" */
  channel: Array<Channel>;
  /** fetch aggregated fields from the table: "channel" */
  channel_aggregate: Channel_Aggregate;
  /** fetch data from the table: "channel" using primary key columns */
  channel_by_pk?: Maybe<Channel>;
  /** fetch data from the table: "chat" */
  chat: Array<Chat>;
  /** fetch aggregated fields from the table: "chat" */
  chat_aggregate: Chat_Aggregate;
  /** fetch data from the table: "chat" using primary key columns */
  chat_by_pk?: Maybe<Chat>;
};


export type Query_RootChannelArgs = {
  distinct_on?: InputMaybe<Array<Channel_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Channel_Order_By>>;
  where?: InputMaybe<Channel_Bool_Exp>;
};


export type Query_RootChannel_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Channel_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Channel_Order_By>>;
  where?: InputMaybe<Channel_Bool_Exp>;
};


export type Query_RootChannel_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootChatArgs = {
  distinct_on?: InputMaybe<Array<Chat_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Chat_Order_By>>;
  where?: InputMaybe<Chat_Bool_Exp>;
};


export type Query_RootChat_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Chat_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Chat_Order_By>>;
  where?: InputMaybe<Chat_Bool_Exp>;
};


export type Query_RootChat_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "channel" */
  channel: Array<Channel>;
  /** fetch aggregated fields from the table: "channel" */
  channel_aggregate: Channel_Aggregate;
  /** fetch data from the table: "channel" using primary key columns */
  channel_by_pk?: Maybe<Channel>;
  /** fetch data from the table in a streaming manner: "channel" */
  channel_stream: Array<Channel>;
  /** fetch data from the table: "chat" */
  chat: Array<Chat>;
  /** fetch aggregated fields from the table: "chat" */
  chat_aggregate: Chat_Aggregate;
  /** fetch data from the table: "chat" using primary key columns */
  chat_by_pk?: Maybe<Chat>;
  /** fetch data from the table in a streaming manner: "chat" */
  chat_stream: Array<Chat>;
};


export type Subscription_RootChannelArgs = {
  distinct_on?: InputMaybe<Array<Channel_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Channel_Order_By>>;
  where?: InputMaybe<Channel_Bool_Exp>;
};


export type Subscription_RootChannel_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Channel_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Channel_Order_By>>;
  where?: InputMaybe<Channel_Bool_Exp>;
};


export type Subscription_RootChannel_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootChannel_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Channel_Stream_Cursor_Input>>;
  where?: InputMaybe<Channel_Bool_Exp>;
};


export type Subscription_RootChatArgs = {
  distinct_on?: InputMaybe<Array<Chat_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Chat_Order_By>>;
  where?: InputMaybe<Chat_Bool_Exp>;
};


export type Subscription_RootChat_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Chat_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Chat_Order_By>>;
  where?: InputMaybe<Chat_Bool_Exp>;
};


export type Subscription_RootChat_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootChat_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Chat_Stream_Cursor_Input>>;
  where?: InputMaybe<Chat_Bool_Exp>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']['input']>;
  _gt?: InputMaybe<Scalars['uuid']['input']>;
  _gte?: InputMaybe<Scalars['uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['uuid']['input']>;
  _lte?: InputMaybe<Scalars['uuid']['input']>;
  _neq?: InputMaybe<Scalars['uuid']['input']>;
  _nin?: InputMaybe<Array<Scalars['uuid']['input']>>;
};
