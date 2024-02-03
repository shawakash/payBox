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
  bigint: { input: any; output: any; }
  date: { input: any; output: any; }
  float8: { input: any; output: any; }
  jsonb: { input: any; output: any; }
  uuid: { input: any; output: any; }
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
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

/** different chain and there address */
export type Address = {
  __typename?: 'address';
  bitcoin?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  client: Client;
  client_id: Scalars['uuid']['output'];
  eth: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  sol: Scalars['String']['output'];
  usdc?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "address" */
export type Address_Aggregate = {
  __typename?: 'address_aggregate';
  aggregate?: Maybe<Address_Aggregate_Fields>;
  nodes: Array<Address>;
};

/** aggregate fields of "address" */
export type Address_Aggregate_Fields = {
  __typename?: 'address_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Address_Max_Fields>;
  min?: Maybe<Address_Min_Fields>;
};


/** aggregate fields of "address" */
export type Address_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Address_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "address". All fields are combined with a logical 'AND'. */
export type Address_Bool_Exp = {
  _and?: InputMaybe<Array<Address_Bool_Exp>>;
  _not?: InputMaybe<Address_Bool_Exp>;
  _or?: InputMaybe<Array<Address_Bool_Exp>>;
  bitcoin?: InputMaybe<String_Comparison_Exp>;
  client?: InputMaybe<Client_Bool_Exp>;
  client_id?: InputMaybe<Uuid_Comparison_Exp>;
  eth?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  sol?: InputMaybe<String_Comparison_Exp>;
  usdc?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "address" */
export enum Address_Constraint {
  /** unique or primary key constraint on columns "id" */
  AddressIdKey = 'address_id_key',
  /** unique or primary key constraint on columns "id" */
  AddressPkey = 'address_pkey',
  /** unique or primary key constraint on columns "client_id" */
  ChainClientIdKey = 'chain_client_id_key'
}

/** input type for inserting data into table "address" */
export type Address_Insert_Input = {
  bitcoin?: InputMaybe<Scalars['String']['input']>;
  client?: InputMaybe<Client_Obj_Rel_Insert_Input>;
  client_id?: InputMaybe<Scalars['uuid']['input']>;
  eth?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  sol?: InputMaybe<Scalars['String']['input']>;
  usdc?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Address_Max_Fields = {
  __typename?: 'address_max_fields';
  bitcoin?: Maybe<Scalars['String']['output']>;
  client_id?: Maybe<Scalars['uuid']['output']>;
  eth?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  sol?: Maybe<Scalars['String']['output']>;
  usdc?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Address_Min_Fields = {
  __typename?: 'address_min_fields';
  bitcoin?: Maybe<Scalars['String']['output']>;
  client_id?: Maybe<Scalars['uuid']['output']>;
  eth?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  sol?: Maybe<Scalars['String']['output']>;
  usdc?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "address" */
export type Address_Mutation_Response = {
  __typename?: 'address_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Address>;
};

/** input type for inserting object relation for remote table "address" */
export type Address_Obj_Rel_Insert_Input = {
  data: Address_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Address_On_Conflict>;
};

/** on_conflict condition type for table "address" */
export type Address_On_Conflict = {
  constraint: Address_Constraint;
  update_columns?: Array<Address_Update_Column>;
  where?: InputMaybe<Address_Bool_Exp>;
};

/** Ordering options when selecting data from "address". */
export type Address_Order_By = {
  bitcoin?: InputMaybe<Order_By>;
  client?: InputMaybe<Client_Order_By>;
  client_id?: InputMaybe<Order_By>;
  eth?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  sol?: InputMaybe<Order_By>;
  usdc?: InputMaybe<Order_By>;
};

/** primary key columns input for table: address */
export type Address_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "address" */
export enum Address_Select_Column {
  /** column name */
  Bitcoin = 'bitcoin',
  /** column name */
  ClientId = 'client_id',
  /** column name */
  Eth = 'eth',
  /** column name */
  Id = 'id',
  /** column name */
  Sol = 'sol',
  /** column name */
  Usdc = 'usdc'
}

/** input type for updating data in table "address" */
export type Address_Set_Input = {
  bitcoin?: InputMaybe<Scalars['String']['input']>;
  client_id?: InputMaybe<Scalars['uuid']['input']>;
  eth?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  sol?: InputMaybe<Scalars['String']['input']>;
  usdc?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "address" */
export type Address_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Address_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Address_Stream_Cursor_Value_Input = {
  bitcoin?: InputMaybe<Scalars['String']['input']>;
  client_id?: InputMaybe<Scalars['uuid']['input']>;
  eth?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  sol?: InputMaybe<Scalars['String']['input']>;
  usdc?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "address" */
export enum Address_Update_Column {
  /** column name */
  Bitcoin = 'bitcoin',
  /** column name */
  ClientId = 'client_id',
  /** column name */
  Eth = 'eth',
  /** column name */
  Id = 'id',
  /** column name */
  Sol = 'sol',
  /** column name */
  Usdc = 'usdc'
}

export type Address_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Address_Set_Input>;
  /** filter the rows which have to be updated */
  where: Address_Bool_Exp;
};

/** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
export type Bigint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['bigint']['input']>;
  _gt?: InputMaybe<Scalars['bigint']['input']>;
  _gte?: InputMaybe<Scalars['bigint']['input']>;
  _in?: InputMaybe<Array<Scalars['bigint']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['bigint']['input']>;
  _lte?: InputMaybe<Scalars['bigint']['input']>;
  _neq?: InputMaybe<Scalars['bigint']['input']>;
  _nin?: InputMaybe<Array<Scalars['bigint']['input']>>;
};

/** subscriber for paybox */
export type Client = {
  __typename?: 'client';
  /** An object relationship */
  address?: Maybe<Address>;
  email: Scalars['String']['output'];
  firstname?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  lastname?: Maybe<Scalars['String']['output']>;
  mobile?: Maybe<Scalars['bigint']['output']>;
  password: Scalars['String']['output'];
  /** An array relationship */
  transactions: Array<Transactions>;
  /** An aggregate relationship */
  transactions_aggregate: Transactions_Aggregate;
  username?: Maybe<Scalars['String']['output']>;
};


/** subscriber for paybox */
export type ClientTransactionsArgs = {
  distinct_on?: InputMaybe<Array<Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transactions_Order_By>>;
  where?: InputMaybe<Transactions_Bool_Exp>;
};


/** subscriber for paybox */
export type ClientTransactions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transactions_Order_By>>;
  where?: InputMaybe<Transactions_Bool_Exp>;
};

/** aggregated selection of "client" */
export type Client_Aggregate = {
  __typename?: 'client_aggregate';
  aggregate?: Maybe<Client_Aggregate_Fields>;
  nodes: Array<Client>;
};

/** aggregate fields of "client" */
export type Client_Aggregate_Fields = {
  __typename?: 'client_aggregate_fields';
  avg?: Maybe<Client_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Client_Max_Fields>;
  min?: Maybe<Client_Min_Fields>;
  stddev?: Maybe<Client_Stddev_Fields>;
  stddev_pop?: Maybe<Client_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Client_Stddev_Samp_Fields>;
  sum?: Maybe<Client_Sum_Fields>;
  var_pop?: Maybe<Client_Var_Pop_Fields>;
  var_samp?: Maybe<Client_Var_Samp_Fields>;
  variance?: Maybe<Client_Variance_Fields>;
};


/** aggregate fields of "client" */
export type Client_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Client_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Client_Avg_Fields = {
  __typename?: 'client_avg_fields';
  mobile?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "client". All fields are combined with a logical 'AND'. */
export type Client_Bool_Exp = {
  _and?: InputMaybe<Array<Client_Bool_Exp>>;
  _not?: InputMaybe<Client_Bool_Exp>;
  _or?: InputMaybe<Array<Client_Bool_Exp>>;
  address?: InputMaybe<Address_Bool_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  firstname?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  lastname?: InputMaybe<String_Comparison_Exp>;
  mobile?: InputMaybe<Bigint_Comparison_Exp>;
  password?: InputMaybe<String_Comparison_Exp>;
  transactions?: InputMaybe<Transactions_Bool_Exp>;
  transactions_aggregate?: InputMaybe<Transactions_Aggregate_Bool_Exp>;
  username?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "client" */
export enum Client_Constraint {
  /** unique or primary key constraint on columns "email" */
  ClientEmailKey = 'client_email_key',
  /** unique or primary key constraint on columns "mobile" */
  ClientMobileNumberKey = 'client_mobile_number_key',
  /** unique or primary key constraint on columns "id" */
  ClientPkey = 'client_pkey'
}

/** input type for incrementing numeric columns in table "client" */
export type Client_Inc_Input = {
  mobile?: InputMaybe<Scalars['bigint']['input']>;
};

/** input type for inserting data into table "client" */
export type Client_Insert_Input = {
  address?: InputMaybe<Address_Obj_Rel_Insert_Input>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstname?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  lastname?: InputMaybe<Scalars['String']['input']>;
  mobile?: InputMaybe<Scalars['bigint']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  transactions?: InputMaybe<Transactions_Arr_Rel_Insert_Input>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Client_Max_Fields = {
  __typename?: 'client_max_fields';
  email?: Maybe<Scalars['String']['output']>;
  firstname?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  lastname?: Maybe<Scalars['String']['output']>;
  mobile?: Maybe<Scalars['bigint']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Client_Min_Fields = {
  __typename?: 'client_min_fields';
  email?: Maybe<Scalars['String']['output']>;
  firstname?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  lastname?: Maybe<Scalars['String']['output']>;
  mobile?: Maybe<Scalars['bigint']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "client" */
export type Client_Mutation_Response = {
  __typename?: 'client_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Client>;
};

/** input type for inserting object relation for remote table "client" */
export type Client_Obj_Rel_Insert_Input = {
  data: Client_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Client_On_Conflict>;
};

/** on_conflict condition type for table "client" */
export type Client_On_Conflict = {
  constraint: Client_Constraint;
  update_columns?: Array<Client_Update_Column>;
  where?: InputMaybe<Client_Bool_Exp>;
};

/** Ordering options when selecting data from "client". */
export type Client_Order_By = {
  address?: InputMaybe<Address_Order_By>;
  email?: InputMaybe<Order_By>;
  firstname?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lastname?: InputMaybe<Order_By>;
  mobile?: InputMaybe<Order_By>;
  password?: InputMaybe<Order_By>;
  transactions_aggregate?: InputMaybe<Transactions_Aggregate_Order_By>;
  username?: InputMaybe<Order_By>;
};

/** primary key columns input for table: client */
export type Client_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "client" */
export enum Client_Select_Column {
  /** column name */
  Email = 'email',
  /** column name */
  Firstname = 'firstname',
  /** column name */
  Id = 'id',
  /** column name */
  Lastname = 'lastname',
  /** column name */
  Mobile = 'mobile',
  /** column name */
  Password = 'password',
  /** column name */
  Username = 'username'
}

/** input type for updating data in table "client" */
export type Client_Set_Input = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstname?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  lastname?: InputMaybe<Scalars['String']['input']>;
  mobile?: InputMaybe<Scalars['bigint']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Client_Stddev_Fields = {
  __typename?: 'client_stddev_fields';
  mobile?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Client_Stddev_Pop_Fields = {
  __typename?: 'client_stddev_pop_fields';
  mobile?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Client_Stddev_Samp_Fields = {
  __typename?: 'client_stddev_samp_fields';
  mobile?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "client" */
export type Client_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Client_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Client_Stream_Cursor_Value_Input = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstname?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  lastname?: InputMaybe<Scalars['String']['input']>;
  mobile?: InputMaybe<Scalars['bigint']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Client_Sum_Fields = {
  __typename?: 'client_sum_fields';
  mobile?: Maybe<Scalars['bigint']['output']>;
};

/** update columns of table "client" */
export enum Client_Update_Column {
  /** column name */
  Email = 'email',
  /** column name */
  Firstname = 'firstname',
  /** column name */
  Id = 'id',
  /** column name */
  Lastname = 'lastname',
  /** column name */
  Mobile = 'mobile',
  /** column name */
  Password = 'password',
  /** column name */
  Username = 'username'
}

export type Client_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Client_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Client_Set_Input>;
  /** filter the rows which have to be updated */
  where: Client_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Client_Var_Pop_Fields = {
  __typename?: 'client_var_pop_fields';
  mobile?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Client_Var_Samp_Fields = {
  __typename?: 'client_var_samp_fields';
  mobile?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Client_Variance_Fields = {
  __typename?: 'client_variance_fields';
  mobile?: Maybe<Scalars['Float']['output']>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** Boolean expression to compare columns of type "date". All fields are combined with logical 'AND'. */
export type Date_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['date']['input']>;
  _gt?: InputMaybe<Scalars['date']['input']>;
  _gte?: InputMaybe<Scalars['date']['input']>;
  _in?: InputMaybe<Array<Scalars['date']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['date']['input']>;
  _lte?: InputMaybe<Scalars['date']['input']>;
  _neq?: InputMaybe<Scalars['date']['input']>;
  _nin?: InputMaybe<Array<Scalars['date']['input']>>;
};

/** Boolean expression to compare columns of type "float8". All fields are combined with logical 'AND'. */
export type Float8_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['float8']['input']>;
  _gt?: InputMaybe<Scalars['float8']['input']>;
  _gte?: InputMaybe<Scalars['float8']['input']>;
  _in?: InputMaybe<Array<Scalars['float8']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['float8']['input']>;
  _lte?: InputMaybe<Scalars['float8']['input']>;
  _neq?: InputMaybe<Scalars['float8']['input']>;
  _nin?: InputMaybe<Array<Scalars['float8']['input']>>;
};

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "address" */
  delete_address?: Maybe<Address_Mutation_Response>;
  /** delete single row from the table: "address" */
  delete_address_by_pk?: Maybe<Address>;
  /** delete data from the table: "client" */
  delete_client?: Maybe<Client_Mutation_Response>;
  /** delete single row from the table: "client" */
  delete_client_by_pk?: Maybe<Client>;
  /** delete data from the table: "transactions" */
  delete_transactions?: Maybe<Transactions_Mutation_Response>;
  /** delete single row from the table: "transactions" */
  delete_transactions_by_pk?: Maybe<Transactions>;
  /** insert data into the table: "address" */
  insert_address?: Maybe<Address_Mutation_Response>;
  /** insert a single row into the table: "address" */
  insert_address_one?: Maybe<Address>;
  /** insert data into the table: "client" */
  insert_client?: Maybe<Client_Mutation_Response>;
  /** insert a single row into the table: "client" */
  insert_client_one?: Maybe<Client>;
  /** insert data into the table: "transactions" */
  insert_transactions?: Maybe<Transactions_Mutation_Response>;
  /** insert a single row into the table: "transactions" */
  insert_transactions_one?: Maybe<Transactions>;
  /** update data of the table: "address" */
  update_address?: Maybe<Address_Mutation_Response>;
  /** update single row of the table: "address" */
  update_address_by_pk?: Maybe<Address>;
  /** update multiples rows of table: "address" */
  update_address_many?: Maybe<Array<Maybe<Address_Mutation_Response>>>;
  /** update data of the table: "client" */
  update_client?: Maybe<Client_Mutation_Response>;
  /** update single row of the table: "client" */
  update_client_by_pk?: Maybe<Client>;
  /** update multiples rows of table: "client" */
  update_client_many?: Maybe<Array<Maybe<Client_Mutation_Response>>>;
  /** update data of the table: "transactions" */
  update_transactions?: Maybe<Transactions_Mutation_Response>;
  /** update single row of the table: "transactions" */
  update_transactions_by_pk?: Maybe<Transactions>;
  /** update multiples rows of table: "transactions" */
  update_transactions_many?: Maybe<Array<Maybe<Transactions_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_AddressArgs = {
  where: Address_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Address_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_ClientArgs = {
  where: Client_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Client_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_TransactionsArgs = {
  where: Transactions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Transactions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootInsert_AddressArgs = {
  objects: Array<Address_Insert_Input>;
  on_conflict?: InputMaybe<Address_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Address_OneArgs = {
  object: Address_Insert_Input;
  on_conflict?: InputMaybe<Address_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ClientArgs = {
  objects: Array<Client_Insert_Input>;
  on_conflict?: InputMaybe<Client_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Client_OneArgs = {
  object: Client_Insert_Input;
  on_conflict?: InputMaybe<Client_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_TransactionsArgs = {
  objects: Array<Transactions_Insert_Input>;
  on_conflict?: InputMaybe<Transactions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Transactions_OneArgs = {
  object: Transactions_Insert_Input;
  on_conflict?: InputMaybe<Transactions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_AddressArgs = {
  _set?: InputMaybe<Address_Set_Input>;
  where: Address_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Address_By_PkArgs = {
  _set?: InputMaybe<Address_Set_Input>;
  pk_columns: Address_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Address_ManyArgs = {
  updates: Array<Address_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_ClientArgs = {
  _inc?: InputMaybe<Client_Inc_Input>;
  _set?: InputMaybe<Client_Set_Input>;
  where: Client_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Client_By_PkArgs = {
  _inc?: InputMaybe<Client_Inc_Input>;
  _set?: InputMaybe<Client_Set_Input>;
  pk_columns: Client_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Client_ManyArgs = {
  updates: Array<Client_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_TransactionsArgs = {
  _append?: InputMaybe<Transactions_Append_Input>;
  _delete_at_path?: InputMaybe<Transactions_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Transactions_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Transactions_Delete_Key_Input>;
  _inc?: InputMaybe<Transactions_Inc_Input>;
  _prepend?: InputMaybe<Transactions_Prepend_Input>;
  _set?: InputMaybe<Transactions_Set_Input>;
  where: Transactions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Transactions_By_PkArgs = {
  _append?: InputMaybe<Transactions_Append_Input>;
  _delete_at_path?: InputMaybe<Transactions_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Transactions_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Transactions_Delete_Key_Input>;
  _inc?: InputMaybe<Transactions_Inc_Input>;
  _prepend?: InputMaybe<Transactions_Prepend_Input>;
  _set?: InputMaybe<Transactions_Set_Input>;
  pk_columns: Transactions_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Transactions_ManyArgs = {
  updates: Array<Transactions_Updates>;
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
  /** fetch data from the table: "address" */
  address: Array<Address>;
  /** fetch aggregated fields from the table: "address" */
  address_aggregate: Address_Aggregate;
  /** fetch data from the table: "address" using primary key columns */
  address_by_pk?: Maybe<Address>;
  /** fetch data from the table: "client" */
  client: Array<Client>;
  /** fetch aggregated fields from the table: "client" */
  client_aggregate: Client_Aggregate;
  /** fetch data from the table: "client" using primary key columns */
  client_by_pk?: Maybe<Client>;
  /** An array relationship */
  transactions: Array<Transactions>;
  /** An aggregate relationship */
  transactions_aggregate: Transactions_Aggregate;
  /** fetch data from the table: "transactions" using primary key columns */
  transactions_by_pk?: Maybe<Transactions>;
};


export type Query_RootAddressArgs = {
  distinct_on?: InputMaybe<Array<Address_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Address_Order_By>>;
  where?: InputMaybe<Address_Bool_Exp>;
};


export type Query_RootAddress_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Address_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Address_Order_By>>;
  where?: InputMaybe<Address_Bool_Exp>;
};


export type Query_RootAddress_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootClientArgs = {
  distinct_on?: InputMaybe<Array<Client_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Client_Order_By>>;
  where?: InputMaybe<Client_Bool_Exp>;
};


export type Query_RootClient_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Client_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Client_Order_By>>;
  where?: InputMaybe<Client_Bool_Exp>;
};


export type Query_RootClient_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTransactionsArgs = {
  distinct_on?: InputMaybe<Array<Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transactions_Order_By>>;
  where?: InputMaybe<Transactions_Bool_Exp>;
};


export type Query_RootTransactions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transactions_Order_By>>;
  where?: InputMaybe<Transactions_Bool_Exp>;
};


export type Query_RootTransactions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "address" */
  address: Array<Address>;
  /** fetch aggregated fields from the table: "address" */
  address_aggregate: Address_Aggregate;
  /** fetch data from the table: "address" using primary key columns */
  address_by_pk?: Maybe<Address>;
  /** fetch data from the table in a streaming manner: "address" */
  address_stream: Array<Address>;
  /** fetch data from the table: "client" */
  client: Array<Client>;
  /** fetch aggregated fields from the table: "client" */
  client_aggregate: Client_Aggregate;
  /** fetch data from the table: "client" using primary key columns */
  client_by_pk?: Maybe<Client>;
  /** fetch data from the table in a streaming manner: "client" */
  client_stream: Array<Client>;
  /** An array relationship */
  transactions: Array<Transactions>;
  /** An aggregate relationship */
  transactions_aggregate: Transactions_Aggregate;
  /** fetch data from the table: "transactions" using primary key columns */
  transactions_by_pk?: Maybe<Transactions>;
  /** fetch data from the table in a streaming manner: "transactions" */
  transactions_stream: Array<Transactions>;
};


export type Subscription_RootAddressArgs = {
  distinct_on?: InputMaybe<Array<Address_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Address_Order_By>>;
  where?: InputMaybe<Address_Bool_Exp>;
};


export type Subscription_RootAddress_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Address_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Address_Order_By>>;
  where?: InputMaybe<Address_Bool_Exp>;
};


export type Subscription_RootAddress_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAddress_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Address_Stream_Cursor_Input>>;
  where?: InputMaybe<Address_Bool_Exp>;
};


export type Subscription_RootClientArgs = {
  distinct_on?: InputMaybe<Array<Client_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Client_Order_By>>;
  where?: InputMaybe<Client_Bool_Exp>;
};


export type Subscription_RootClient_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Client_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Client_Order_By>>;
  where?: InputMaybe<Client_Bool_Exp>;
};


export type Subscription_RootClient_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootClient_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Client_Stream_Cursor_Input>>;
  where?: InputMaybe<Client_Bool_Exp>;
};


export type Subscription_RootTransactionsArgs = {
  distinct_on?: InputMaybe<Array<Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transactions_Order_By>>;
  where?: InputMaybe<Transactions_Bool_Exp>;
};


export type Subscription_RootTransactions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Transactions_Order_By>>;
  where?: InputMaybe<Transactions_Bool_Exp>;
};


export type Subscription_RootTransactions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTransactions_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Transactions_Stream_Cursor_Input>>;
  where?: InputMaybe<Transactions_Bool_Exp>;
};

/** transactions table  */
export type Transactions = {
  __typename?: 'transactions';
  amount: Scalars['float8']['output'];
  block_time: Scalars['bigint']['output'];
  /** An object relationship */
  client: Client;
  client_id: Scalars['uuid']['output'];
  cluster?: Maybe<Scalars['String']['output']>;
  date: Scalars['date']['output'];
  fee: Scalars['float8']['output'];
  from: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  network: Scalars['String']['output'];
  post_balances: Scalars['jsonb']['output'];
  pre_balances: Scalars['jsonb']['output'];
  recent_blockhash: Scalars['String']['output'];
  signature: Scalars['jsonb']['output'];
  slot: Scalars['bigint']['output'];
  status: Scalars['String']['output'];
  to: Scalars['String']['output'];
};


/** transactions table  */
export type TransactionsPost_BalancesArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** transactions table  */
export type TransactionsPre_BalancesArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** transactions table  */
export type TransactionsSignatureArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "transactions" */
export type Transactions_Aggregate = {
  __typename?: 'transactions_aggregate';
  aggregate?: Maybe<Transactions_Aggregate_Fields>;
  nodes: Array<Transactions>;
};

export type Transactions_Aggregate_Bool_Exp = {
  avg?: InputMaybe<Transactions_Aggregate_Bool_Exp_Avg>;
  corr?: InputMaybe<Transactions_Aggregate_Bool_Exp_Corr>;
  count?: InputMaybe<Transactions_Aggregate_Bool_Exp_Count>;
  covar_samp?: InputMaybe<Transactions_Aggregate_Bool_Exp_Covar_Samp>;
  max?: InputMaybe<Transactions_Aggregate_Bool_Exp_Max>;
  min?: InputMaybe<Transactions_Aggregate_Bool_Exp_Min>;
  stddev_samp?: InputMaybe<Transactions_Aggregate_Bool_Exp_Stddev_Samp>;
  sum?: InputMaybe<Transactions_Aggregate_Bool_Exp_Sum>;
  var_samp?: InputMaybe<Transactions_Aggregate_Bool_Exp_Var_Samp>;
};

export type Transactions_Aggregate_Bool_Exp_Avg = {
  arguments: Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Avg_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transactions_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Transactions_Aggregate_Bool_Exp_Corr = {
  arguments: Transactions_Aggregate_Bool_Exp_Corr_Arguments;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transactions_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Transactions_Aggregate_Bool_Exp_Corr_Arguments = {
  X: Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Corr_Arguments_Columns;
  Y: Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Corr_Arguments_Columns;
};

export type Transactions_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Transactions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transactions_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

export type Transactions_Aggregate_Bool_Exp_Covar_Samp = {
  arguments: Transactions_Aggregate_Bool_Exp_Covar_Samp_Arguments;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transactions_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Transactions_Aggregate_Bool_Exp_Covar_Samp_Arguments = {
  X: Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns;
  Y: Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns;
};

export type Transactions_Aggregate_Bool_Exp_Max = {
  arguments: Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Max_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transactions_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Transactions_Aggregate_Bool_Exp_Min = {
  arguments: Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Min_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transactions_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Transactions_Aggregate_Bool_Exp_Stddev_Samp = {
  arguments: Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Stddev_Samp_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transactions_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Transactions_Aggregate_Bool_Exp_Sum = {
  arguments: Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Sum_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transactions_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Transactions_Aggregate_Bool_Exp_Var_Samp = {
  arguments: Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Var_Samp_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Transactions_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

/** aggregate fields of "transactions" */
export type Transactions_Aggregate_Fields = {
  __typename?: 'transactions_aggregate_fields';
  avg?: Maybe<Transactions_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Transactions_Max_Fields>;
  min?: Maybe<Transactions_Min_Fields>;
  stddev?: Maybe<Transactions_Stddev_Fields>;
  stddev_pop?: Maybe<Transactions_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Transactions_Stddev_Samp_Fields>;
  sum?: Maybe<Transactions_Sum_Fields>;
  var_pop?: Maybe<Transactions_Var_Pop_Fields>;
  var_samp?: Maybe<Transactions_Var_Samp_Fields>;
  variance?: Maybe<Transactions_Variance_Fields>;
};


/** aggregate fields of "transactions" */
export type Transactions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Transactions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "transactions" */
export type Transactions_Aggregate_Order_By = {
  avg?: InputMaybe<Transactions_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transactions_Max_Order_By>;
  min?: InputMaybe<Transactions_Min_Order_By>;
  stddev?: InputMaybe<Transactions_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Transactions_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Transactions_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Transactions_Sum_Order_By>;
  var_pop?: InputMaybe<Transactions_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Transactions_Var_Samp_Order_By>;
  variance?: InputMaybe<Transactions_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Transactions_Append_Input = {
  post_balances?: InputMaybe<Scalars['jsonb']['input']>;
  pre_balances?: InputMaybe<Scalars['jsonb']['input']>;
  signature?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "transactions" */
export type Transactions_Arr_Rel_Insert_Input = {
  data: Array<Transactions_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Transactions_On_Conflict>;
};

/** aggregate avg on columns */
export type Transactions_Avg_Fields = {
  __typename?: 'transactions_avg_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  block_time?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "transactions" */
export type Transactions_Avg_Order_By = {
  amount?: InputMaybe<Order_By>;
  block_time?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "transactions". All fields are combined with a logical 'AND'. */
export type Transactions_Bool_Exp = {
  _and?: InputMaybe<Array<Transactions_Bool_Exp>>;
  _not?: InputMaybe<Transactions_Bool_Exp>;
  _or?: InputMaybe<Array<Transactions_Bool_Exp>>;
  amount?: InputMaybe<Float8_Comparison_Exp>;
  block_time?: InputMaybe<Bigint_Comparison_Exp>;
  client?: InputMaybe<Client_Bool_Exp>;
  client_id?: InputMaybe<Uuid_Comparison_Exp>;
  cluster?: InputMaybe<String_Comparison_Exp>;
  date?: InputMaybe<Date_Comparison_Exp>;
  fee?: InputMaybe<Float8_Comparison_Exp>;
  from?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  network?: InputMaybe<String_Comparison_Exp>;
  post_balances?: InputMaybe<Jsonb_Comparison_Exp>;
  pre_balances?: InputMaybe<Jsonb_Comparison_Exp>;
  recent_blockhash?: InputMaybe<String_Comparison_Exp>;
  signature?: InputMaybe<Jsonb_Comparison_Exp>;
  slot?: InputMaybe<Bigint_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  to?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "transactions" */
export enum Transactions_Constraint {
  /** unique or primary key constraint on columns "block_time" */
  TransactionsBlockTimeKey = 'transactions_block_time_key',
  /** unique or primary key constraint on columns "id" */
  TransactionsPkey = 'transactions_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Transactions_Delete_At_Path_Input = {
  post_balances?: InputMaybe<Array<Scalars['String']['input']>>;
  pre_balances?: InputMaybe<Array<Scalars['String']['input']>>;
  signature?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Transactions_Delete_Elem_Input = {
  post_balances?: InputMaybe<Scalars['Int']['input']>;
  pre_balances?: InputMaybe<Scalars['Int']['input']>;
  signature?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Transactions_Delete_Key_Input = {
  post_balances?: InputMaybe<Scalars['String']['input']>;
  pre_balances?: InputMaybe<Scalars['String']['input']>;
  signature?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "transactions" */
export type Transactions_Inc_Input = {
  amount?: InputMaybe<Scalars['float8']['input']>;
  block_time?: InputMaybe<Scalars['bigint']['input']>;
  fee?: InputMaybe<Scalars['float8']['input']>;
  slot?: InputMaybe<Scalars['bigint']['input']>;
};

/** input type for inserting data into table "transactions" */
export type Transactions_Insert_Input = {
  amount?: InputMaybe<Scalars['float8']['input']>;
  block_time?: InputMaybe<Scalars['bigint']['input']>;
  client?: InputMaybe<Client_Obj_Rel_Insert_Input>;
  client_id?: InputMaybe<Scalars['uuid']['input']>;
  cluster?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['date']['input']>;
  fee?: InputMaybe<Scalars['float8']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  network?: InputMaybe<Scalars['String']['input']>;
  post_balances?: InputMaybe<Scalars['jsonb']['input']>;
  pre_balances?: InputMaybe<Scalars['jsonb']['input']>;
  recent_blockhash?: InputMaybe<Scalars['String']['input']>;
  signature?: InputMaybe<Scalars['jsonb']['input']>;
  slot?: InputMaybe<Scalars['bigint']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Transactions_Max_Fields = {
  __typename?: 'transactions_max_fields';
  amount?: Maybe<Scalars['float8']['output']>;
  block_time?: Maybe<Scalars['bigint']['output']>;
  client_id?: Maybe<Scalars['uuid']['output']>;
  cluster?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['date']['output']>;
  fee?: Maybe<Scalars['float8']['output']>;
  from?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  network?: Maybe<Scalars['String']['output']>;
  recent_blockhash?: Maybe<Scalars['String']['output']>;
  slot?: Maybe<Scalars['bigint']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  to?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "transactions" */
export type Transactions_Max_Order_By = {
  amount?: InputMaybe<Order_By>;
  block_time?: InputMaybe<Order_By>;
  client_id?: InputMaybe<Order_By>;
  cluster?: InputMaybe<Order_By>;
  date?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  from?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  network?: InputMaybe<Order_By>;
  recent_blockhash?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  to?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transactions_Min_Fields = {
  __typename?: 'transactions_min_fields';
  amount?: Maybe<Scalars['float8']['output']>;
  block_time?: Maybe<Scalars['bigint']['output']>;
  client_id?: Maybe<Scalars['uuid']['output']>;
  cluster?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['date']['output']>;
  fee?: Maybe<Scalars['float8']['output']>;
  from?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  network?: Maybe<Scalars['String']['output']>;
  recent_blockhash?: Maybe<Scalars['String']['output']>;
  slot?: Maybe<Scalars['bigint']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  to?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "transactions" */
export type Transactions_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  block_time?: InputMaybe<Order_By>;
  client_id?: InputMaybe<Order_By>;
  cluster?: InputMaybe<Order_By>;
  date?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  from?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  network?: InputMaybe<Order_By>;
  recent_blockhash?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  to?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "transactions" */
export type Transactions_Mutation_Response = {
  __typename?: 'transactions_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Transactions>;
};

/** on_conflict condition type for table "transactions" */
export type Transactions_On_Conflict = {
  constraint: Transactions_Constraint;
  update_columns?: Array<Transactions_Update_Column>;
  where?: InputMaybe<Transactions_Bool_Exp>;
};

/** Ordering options when selecting data from "transactions". */
export type Transactions_Order_By = {
  amount?: InputMaybe<Order_By>;
  block_time?: InputMaybe<Order_By>;
  client?: InputMaybe<Client_Order_By>;
  client_id?: InputMaybe<Order_By>;
  cluster?: InputMaybe<Order_By>;
  date?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  from?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  network?: InputMaybe<Order_By>;
  post_balances?: InputMaybe<Order_By>;
  pre_balances?: InputMaybe<Order_By>;
  recent_blockhash?: InputMaybe<Order_By>;
  signature?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  to?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transactions */
export type Transactions_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Transactions_Prepend_Input = {
  post_balances?: InputMaybe<Scalars['jsonb']['input']>;
  pre_balances?: InputMaybe<Scalars['jsonb']['input']>;
  signature?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "transactions" */
export enum Transactions_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  BlockTime = 'block_time',
  /** column name */
  ClientId = 'client_id',
  /** column name */
  Cluster = 'cluster',
  /** column name */
  Date = 'date',
  /** column name */
  Fee = 'fee',
  /** column name */
  From = 'from',
  /** column name */
  Id = 'id',
  /** column name */
  Network = 'network',
  /** column name */
  PostBalances = 'post_balances',
  /** column name */
  PreBalances = 'pre_balances',
  /** column name */
  RecentBlockhash = 'recent_blockhash',
  /** column name */
  Signature = 'signature',
  /** column name */
  Slot = 'slot',
  /** column name */
  Status = 'status',
  /** column name */
  To = 'to'
}

/** select "transactions_aggregate_bool_exp_avg_arguments_columns" columns of table "transactions" */
export enum Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Avg_Arguments_Columns {
  /** column name */
  Amount = 'amount',
  /** column name */
  Fee = 'fee'
}

/** select "transactions_aggregate_bool_exp_corr_arguments_columns" columns of table "transactions" */
export enum Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Corr_Arguments_Columns {
  /** column name */
  Amount = 'amount',
  /** column name */
  Fee = 'fee'
}

/** select "transactions_aggregate_bool_exp_covar_samp_arguments_columns" columns of table "transactions" */
export enum Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns {
  /** column name */
  Amount = 'amount',
  /** column name */
  Fee = 'fee'
}

/** select "transactions_aggregate_bool_exp_max_arguments_columns" columns of table "transactions" */
export enum Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Max_Arguments_Columns {
  /** column name */
  Amount = 'amount',
  /** column name */
  Fee = 'fee'
}

/** select "transactions_aggregate_bool_exp_min_arguments_columns" columns of table "transactions" */
export enum Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Min_Arguments_Columns {
  /** column name */
  Amount = 'amount',
  /** column name */
  Fee = 'fee'
}

/** select "transactions_aggregate_bool_exp_stddev_samp_arguments_columns" columns of table "transactions" */
export enum Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Stddev_Samp_Arguments_Columns {
  /** column name */
  Amount = 'amount',
  /** column name */
  Fee = 'fee'
}

/** select "transactions_aggregate_bool_exp_sum_arguments_columns" columns of table "transactions" */
export enum Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Sum_Arguments_Columns {
  /** column name */
  Amount = 'amount',
  /** column name */
  Fee = 'fee'
}

/** select "transactions_aggregate_bool_exp_var_samp_arguments_columns" columns of table "transactions" */
export enum Transactions_Select_Column_Transactions_Aggregate_Bool_Exp_Var_Samp_Arguments_Columns {
  /** column name */
  Amount = 'amount',
  /** column name */
  Fee = 'fee'
}

/** input type for updating data in table "transactions" */
export type Transactions_Set_Input = {
  amount?: InputMaybe<Scalars['float8']['input']>;
  block_time?: InputMaybe<Scalars['bigint']['input']>;
  client_id?: InputMaybe<Scalars['uuid']['input']>;
  cluster?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['date']['input']>;
  fee?: InputMaybe<Scalars['float8']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  network?: InputMaybe<Scalars['String']['input']>;
  post_balances?: InputMaybe<Scalars['jsonb']['input']>;
  pre_balances?: InputMaybe<Scalars['jsonb']['input']>;
  recent_blockhash?: InputMaybe<Scalars['String']['input']>;
  signature?: InputMaybe<Scalars['jsonb']['input']>;
  slot?: InputMaybe<Scalars['bigint']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Transactions_Stddev_Fields = {
  __typename?: 'transactions_stddev_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  block_time?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "transactions" */
export type Transactions_Stddev_Order_By = {
  amount?: InputMaybe<Order_By>;
  block_time?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Transactions_Stddev_Pop_Fields = {
  __typename?: 'transactions_stddev_pop_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  block_time?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "transactions" */
export type Transactions_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  block_time?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Transactions_Stddev_Samp_Fields = {
  __typename?: 'transactions_stddev_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  block_time?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "transactions" */
export type Transactions_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  block_time?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "transactions" */
export type Transactions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Transactions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Transactions_Stream_Cursor_Value_Input = {
  amount?: InputMaybe<Scalars['float8']['input']>;
  block_time?: InputMaybe<Scalars['bigint']['input']>;
  client_id?: InputMaybe<Scalars['uuid']['input']>;
  cluster?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['date']['input']>;
  fee?: InputMaybe<Scalars['float8']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  network?: InputMaybe<Scalars['String']['input']>;
  post_balances?: InputMaybe<Scalars['jsonb']['input']>;
  pre_balances?: InputMaybe<Scalars['jsonb']['input']>;
  recent_blockhash?: InputMaybe<Scalars['String']['input']>;
  signature?: InputMaybe<Scalars['jsonb']['input']>;
  slot?: InputMaybe<Scalars['bigint']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Transactions_Sum_Fields = {
  __typename?: 'transactions_sum_fields';
  amount?: Maybe<Scalars['float8']['output']>;
  block_time?: Maybe<Scalars['bigint']['output']>;
  fee?: Maybe<Scalars['float8']['output']>;
  slot?: Maybe<Scalars['bigint']['output']>;
};

/** order by sum() on columns of table "transactions" */
export type Transactions_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  block_time?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** update columns of table "transactions" */
export enum Transactions_Update_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  BlockTime = 'block_time',
  /** column name */
  ClientId = 'client_id',
  /** column name */
  Cluster = 'cluster',
  /** column name */
  Date = 'date',
  /** column name */
  Fee = 'fee',
  /** column name */
  From = 'from',
  /** column name */
  Id = 'id',
  /** column name */
  Network = 'network',
  /** column name */
  PostBalances = 'post_balances',
  /** column name */
  PreBalances = 'pre_balances',
  /** column name */
  RecentBlockhash = 'recent_blockhash',
  /** column name */
  Signature = 'signature',
  /** column name */
  Slot = 'slot',
  /** column name */
  Status = 'status',
  /** column name */
  To = 'to'
}

export type Transactions_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Transactions_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Transactions_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Transactions_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Transactions_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Transactions_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Transactions_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Transactions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Transactions_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Transactions_Var_Pop_Fields = {
  __typename?: 'transactions_var_pop_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  block_time?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "transactions" */
export type Transactions_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  block_time?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Transactions_Var_Samp_Fields = {
  __typename?: 'transactions_var_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  block_time?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "transactions" */
export type Transactions_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  block_time?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Transactions_Variance_Fields = {
  __typename?: 'transactions_variance_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  block_time?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "transactions" */
export type Transactions_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  block_time?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
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
