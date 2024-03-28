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

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** custom address for paybox */
export type Custom_Address = {
  __typename?: 'custom_address';
  address: Scalars['String']['output'];
  createdAt: Scalars['timestamptz']['output'];
  description: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  key: Scalars['String']['output'];
  updatedAt: Scalars['timestamptz']['output'];
};

/** aggregated selection of "custom_address" */
export type Custom_Address_Aggregate = {
  __typename?: 'custom_address_aggregate';
  aggregate?: Maybe<Custom_Address_Aggregate_Fields>;
  nodes: Array<Custom_Address>;
};

/** aggregate fields of "custom_address" */
export type Custom_Address_Aggregate_Fields = {
  __typename?: 'custom_address_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Custom_Address_Max_Fields>;
  min?: Maybe<Custom_Address_Min_Fields>;
};


/** aggregate fields of "custom_address" */
export type Custom_Address_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Custom_Address_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "custom_address". All fields are combined with a logical 'AND'. */
export type Custom_Address_Bool_Exp = {
  _and?: InputMaybe<Array<Custom_Address_Bool_Exp>>;
  _not?: InputMaybe<Custom_Address_Bool_Exp>;
  _or?: InputMaybe<Array<Custom_Address_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  key?: InputMaybe<String_Comparison_Exp>;
  updatedAt?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "custom_address" */
export enum Custom_Address_Constraint {
  /** unique or primary key constraint on columns "address" */
  CustomAddressAddressKey = 'custom_address_address_key',
  /** unique or primary key constraint on columns "key" */
  CustomAddressKeyKey = 'custom_address_key_key',
  /** unique or primary key constraint on columns "id" */
  CustomAddressPkey = 'custom_address_pkey'
}

/** input type for inserting data into table "custom_address" */
export type Custom_Address_Insert_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Custom_Address_Max_Fields = {
  __typename?: 'custom_address_max_fields';
  address?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Custom_Address_Min_Fields = {
  __typename?: 'custom_address_min_fields';
  address?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "custom_address" */
export type Custom_Address_Mutation_Response = {
  __typename?: 'custom_address_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Custom_Address>;
};

/** on_conflict condition type for table "custom_address" */
export type Custom_Address_On_Conflict = {
  constraint: Custom_Address_Constraint;
  update_columns?: Array<Custom_Address_Update_Column>;
  where?: InputMaybe<Custom_Address_Bool_Exp>;
};

/** Ordering options when selecting data from "custom_address". */
export type Custom_Address_Order_By = {
  address?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  key?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
};

/** primary key columns input for table: custom_address */
export type Custom_Address_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "custom_address" */
export enum Custom_Address_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Key = 'key',
  /** column name */
  UpdatedAt = 'updatedAt'
}

/** input type for updating data in table "custom_address" */
export type Custom_Address_Set_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "custom_address" */
export type Custom_Address_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Custom_Address_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Custom_Address_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "custom_address" */
export enum Custom_Address_Update_Column {
  /** column name */
  Address = 'address',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Key = 'key',
  /** column name */
  UpdatedAt = 'updatedAt'
}

export type Custom_Address_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Custom_Address_Set_Input>;
  /** filter the rows which have to be updated */
  where: Custom_Address_Bool_Exp;
};

/** mails from clients */
export type Mails = {
  __typename?: 'mails';
  createdAt: Scalars['timestamptz']['output'];
  date: Scalars['timestamptz']['output'];
  fromAddress: Scalars['String']['output'];
  htmlContent: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  subject: Scalars['String']['output'];
  textContent: Scalars['String']['output'];
  toAddress: Scalars['String']['output'];
  updatedAt: Scalars['timestamptz']['output'];
};

/** aggregated selection of "mails" */
export type Mails_Aggregate = {
  __typename?: 'mails_aggregate';
  aggregate?: Maybe<Mails_Aggregate_Fields>;
  nodes: Array<Mails>;
};

/** aggregate fields of "mails" */
export type Mails_Aggregate_Fields = {
  __typename?: 'mails_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Mails_Max_Fields>;
  min?: Maybe<Mails_Min_Fields>;
};


/** aggregate fields of "mails" */
export type Mails_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Mails_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "mails". All fields are combined with a logical 'AND'. */
export type Mails_Bool_Exp = {
  _and?: InputMaybe<Array<Mails_Bool_Exp>>;
  _not?: InputMaybe<Mails_Bool_Exp>;
  _or?: InputMaybe<Array<Mails_Bool_Exp>>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  date?: InputMaybe<Timestamptz_Comparison_Exp>;
  fromAddress?: InputMaybe<String_Comparison_Exp>;
  htmlContent?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  subject?: InputMaybe<String_Comparison_Exp>;
  textContent?: InputMaybe<String_Comparison_Exp>;
  toAddress?: InputMaybe<String_Comparison_Exp>;
  updatedAt?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "mails" */
export enum Mails_Constraint {
  /** unique or primary key constraint on columns "id" */
  MailsPkey = 'mails_pkey'
}

/** input type for inserting data into table "mails" */
export type Mails_Insert_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  date?: InputMaybe<Scalars['timestamptz']['input']>;
  fromAddress?: InputMaybe<Scalars['String']['input']>;
  htmlContent?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  textContent?: InputMaybe<Scalars['String']['input']>;
  toAddress?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Mails_Max_Fields = {
  __typename?: 'mails_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  date?: Maybe<Scalars['timestamptz']['output']>;
  fromAddress?: Maybe<Scalars['String']['output']>;
  htmlContent?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  subject?: Maybe<Scalars['String']['output']>;
  textContent?: Maybe<Scalars['String']['output']>;
  toAddress?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Mails_Min_Fields = {
  __typename?: 'mails_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  date?: Maybe<Scalars['timestamptz']['output']>;
  fromAddress?: Maybe<Scalars['String']['output']>;
  htmlContent?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  subject?: Maybe<Scalars['String']['output']>;
  textContent?: Maybe<Scalars['String']['output']>;
  toAddress?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "mails" */
export type Mails_Mutation_Response = {
  __typename?: 'mails_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Mails>;
};

/** on_conflict condition type for table "mails" */
export type Mails_On_Conflict = {
  constraint: Mails_Constraint;
  update_columns?: Array<Mails_Update_Column>;
  where?: InputMaybe<Mails_Bool_Exp>;
};

/** Ordering options when selecting data from "mails". */
export type Mails_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  date?: InputMaybe<Order_By>;
  fromAddress?: InputMaybe<Order_By>;
  htmlContent?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  subject?: InputMaybe<Order_By>;
  textContent?: InputMaybe<Order_By>;
  toAddress?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
};

/** primary key columns input for table: mails */
export type Mails_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "mails" */
export enum Mails_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Date = 'date',
  /** column name */
  FromAddress = 'fromAddress',
  /** column name */
  HtmlContent = 'htmlContent',
  /** column name */
  Id = 'id',
  /** column name */
  Subject = 'subject',
  /** column name */
  TextContent = 'textContent',
  /** column name */
  ToAddress = 'toAddress',
  /** column name */
  UpdatedAt = 'updatedAt'
}

/** input type for updating data in table "mails" */
export type Mails_Set_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  date?: InputMaybe<Scalars['timestamptz']['input']>;
  fromAddress?: InputMaybe<Scalars['String']['input']>;
  htmlContent?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  textContent?: InputMaybe<Scalars['String']['input']>;
  toAddress?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "mails" */
export type Mails_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Mails_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Mails_Stream_Cursor_Value_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  date?: InputMaybe<Scalars['timestamptz']['input']>;
  fromAddress?: InputMaybe<Scalars['String']['input']>;
  htmlContent?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  textContent?: InputMaybe<Scalars['String']['input']>;
  toAddress?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "mails" */
export enum Mails_Update_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Date = 'date',
  /** column name */
  FromAddress = 'fromAddress',
  /** column name */
  HtmlContent = 'htmlContent',
  /** column name */
  Id = 'id',
  /** column name */
  Subject = 'subject',
  /** column name */
  TextContent = 'textContent',
  /** column name */
  ToAddress = 'toAddress',
  /** column name */
  UpdatedAt = 'updatedAt'
}

export type Mails_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Mails_Set_Input>;
  /** filter the rows which have to be updated */
  where: Mails_Bool_Exp;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "custom_address" */
  delete_custom_address?: Maybe<Custom_Address_Mutation_Response>;
  /** delete single row from the table: "custom_address" */
  delete_custom_address_by_pk?: Maybe<Custom_Address>;
  /** delete data from the table: "mails" */
  delete_mails?: Maybe<Mails_Mutation_Response>;
  /** delete single row from the table: "mails" */
  delete_mails_by_pk?: Maybe<Mails>;
  /** insert data into the table: "custom_address" */
  insert_custom_address?: Maybe<Custom_Address_Mutation_Response>;
  /** insert a single row into the table: "custom_address" */
  insert_custom_address_one?: Maybe<Custom_Address>;
  /** insert data into the table: "mails" */
  insert_mails?: Maybe<Mails_Mutation_Response>;
  /** insert a single row into the table: "mails" */
  insert_mails_one?: Maybe<Mails>;
  /** update data of the table: "custom_address" */
  update_custom_address?: Maybe<Custom_Address_Mutation_Response>;
  /** update single row of the table: "custom_address" */
  update_custom_address_by_pk?: Maybe<Custom_Address>;
  /** update multiples rows of table: "custom_address" */
  update_custom_address_many?: Maybe<Array<Maybe<Custom_Address_Mutation_Response>>>;
  /** update data of the table: "mails" */
  update_mails?: Maybe<Mails_Mutation_Response>;
  /** update single row of the table: "mails" */
  update_mails_by_pk?: Maybe<Mails>;
  /** update multiples rows of table: "mails" */
  update_mails_many?: Maybe<Array<Maybe<Mails_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_Custom_AddressArgs = {
  where: Custom_Address_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Custom_Address_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_MailsArgs = {
  where: Mails_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Mails_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootInsert_Custom_AddressArgs = {
  objects: Array<Custom_Address_Insert_Input>;
  on_conflict?: InputMaybe<Custom_Address_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Custom_Address_OneArgs = {
  object: Custom_Address_Insert_Input;
  on_conflict?: InputMaybe<Custom_Address_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_MailsArgs = {
  objects: Array<Mails_Insert_Input>;
  on_conflict?: InputMaybe<Mails_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Mails_OneArgs = {
  object: Mails_Insert_Input;
  on_conflict?: InputMaybe<Mails_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_Custom_AddressArgs = {
  _set?: InputMaybe<Custom_Address_Set_Input>;
  where: Custom_Address_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Custom_Address_By_PkArgs = {
  _set?: InputMaybe<Custom_Address_Set_Input>;
  pk_columns: Custom_Address_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Custom_Address_ManyArgs = {
  updates: Array<Custom_Address_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_MailsArgs = {
  _set?: InputMaybe<Mails_Set_Input>;
  where: Mails_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Mails_By_PkArgs = {
  _set?: InputMaybe<Mails_Set_Input>;
  pk_columns: Mails_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Mails_ManyArgs = {
  updates: Array<Mails_Updates>;
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
  /** fetch data from the table: "custom_address" */
  custom_address: Array<Custom_Address>;
  /** fetch aggregated fields from the table: "custom_address" */
  custom_address_aggregate: Custom_Address_Aggregate;
  /** fetch data from the table: "custom_address" using primary key columns */
  custom_address_by_pk?: Maybe<Custom_Address>;
  /** fetch data from the table: "mails" */
  mails: Array<Mails>;
  /** fetch aggregated fields from the table: "mails" */
  mails_aggregate: Mails_Aggregate;
  /** fetch data from the table: "mails" using primary key columns */
  mails_by_pk?: Maybe<Mails>;
};


export type Query_RootCustom_AddressArgs = {
  distinct_on?: InputMaybe<Array<Custom_Address_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Custom_Address_Order_By>>;
  where?: InputMaybe<Custom_Address_Bool_Exp>;
};


export type Query_RootCustom_Address_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Custom_Address_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Custom_Address_Order_By>>;
  where?: InputMaybe<Custom_Address_Bool_Exp>;
};


export type Query_RootCustom_Address_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootMailsArgs = {
  distinct_on?: InputMaybe<Array<Mails_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Mails_Order_By>>;
  where?: InputMaybe<Mails_Bool_Exp>;
};


export type Query_RootMails_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Mails_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Mails_Order_By>>;
  where?: InputMaybe<Mails_Bool_Exp>;
};


export type Query_RootMails_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "custom_address" */
  custom_address: Array<Custom_Address>;
  /** fetch aggregated fields from the table: "custom_address" */
  custom_address_aggregate: Custom_Address_Aggregate;
  /** fetch data from the table: "custom_address" using primary key columns */
  custom_address_by_pk?: Maybe<Custom_Address>;
  /** fetch data from the table in a streaming manner: "custom_address" */
  custom_address_stream: Array<Custom_Address>;
  /** fetch data from the table: "mails" */
  mails: Array<Mails>;
  /** fetch aggregated fields from the table: "mails" */
  mails_aggregate: Mails_Aggregate;
  /** fetch data from the table: "mails" using primary key columns */
  mails_by_pk?: Maybe<Mails>;
  /** fetch data from the table in a streaming manner: "mails" */
  mails_stream: Array<Mails>;
};


export type Subscription_RootCustom_AddressArgs = {
  distinct_on?: InputMaybe<Array<Custom_Address_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Custom_Address_Order_By>>;
  where?: InputMaybe<Custom_Address_Bool_Exp>;
};


export type Subscription_RootCustom_Address_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Custom_Address_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Custom_Address_Order_By>>;
  where?: InputMaybe<Custom_Address_Bool_Exp>;
};


export type Subscription_RootCustom_Address_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootCustom_Address_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Custom_Address_Stream_Cursor_Input>>;
  where?: InputMaybe<Custom_Address_Bool_Exp>;
};


export type Subscription_RootMailsArgs = {
  distinct_on?: InputMaybe<Array<Mails_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Mails_Order_By>>;
  where?: InputMaybe<Mails_Bool_Exp>;
};


export type Subscription_RootMails_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Mails_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Mails_Order_By>>;
  where?: InputMaybe<Mails_Bool_Exp>;
};


export type Subscription_RootMails_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootMails_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Mails_Stream_Cursor_Input>>;
  where?: InputMaybe<Mails_Bool_Exp>;
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
