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
  float8: { input: any; output: any; }
  jsonb: { input: any; output: any; }
  timestamptz: { input: any; output: any; }
  uuid: { input: any; output: any; }
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
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

/** accounts in a wallet */
export type Account = {
  __typename?: 'account';
  /** An object relationship */
  bitcoin?: Maybe<Bitcoin>;
  /** An object relationship */
  client: Client;
  clientId: Scalars['uuid']['output'];
  /** An object relationship */
  eth?: Maybe<Eth>;
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  /** An object relationship */
  sol?: Maybe<Sol>;
  /** An object relationship */
  wallet: Wallet;
  walletId: Scalars['uuid']['output'];
};

/** aggregated selection of "account" */
export type Account_Aggregate = {
  __typename?: 'account_aggregate';
  aggregate?: Maybe<Account_Aggregate_Fields>;
  nodes: Array<Account>;
};

export type Account_Aggregate_Bool_Exp = {
  count?: InputMaybe<Account_Aggregate_Bool_Exp_Count>;
};

export type Account_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Account_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Account_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "account" */
export type Account_Aggregate_Fields = {
  __typename?: 'account_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Account_Max_Fields>;
  min?: Maybe<Account_Min_Fields>;
};


/** aggregate fields of "account" */
export type Account_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Account_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "account" */
export type Account_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Account_Max_Order_By>;
  min?: InputMaybe<Account_Min_Order_By>;
};

/** input type for inserting array relation for remote table "account" */
export type Account_Arr_Rel_Insert_Input = {
  data: Array<Account_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Account_On_Conflict>;
};

/** Boolean expression to filter rows from the table "account". All fields are combined with a logical 'AND'. */
export type Account_Bool_Exp = {
  _and?: InputMaybe<Array<Account_Bool_Exp>>;
  _not?: InputMaybe<Account_Bool_Exp>;
  _or?: InputMaybe<Array<Account_Bool_Exp>>;
  bitcoin?: InputMaybe<Bitcoin_Bool_Exp>;
  client?: InputMaybe<Client_Bool_Exp>;
  clientId?: InputMaybe<Uuid_Comparison_Exp>;
  eth?: InputMaybe<Eth_Bool_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  sol?: InputMaybe<Sol_Bool_Exp>;
  wallet?: InputMaybe<Wallet_Bool_Exp>;
  walletId?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "account" */
export enum Account_Constraint {
  /** unique or primary key constraint on columns "id" */
  AccountPkey = 'account_pkey'
}

/** input type for inserting data into table "account" */
export type Account_Insert_Input = {
  bitcoin?: InputMaybe<Bitcoin_Obj_Rel_Insert_Input>;
  client?: InputMaybe<Client_Obj_Rel_Insert_Input>;
  clientId?: InputMaybe<Scalars['uuid']['input']>;
  eth?: InputMaybe<Eth_Obj_Rel_Insert_Input>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sol?: InputMaybe<Sol_Obj_Rel_Insert_Input>;
  wallet?: InputMaybe<Wallet_Obj_Rel_Insert_Input>;
  walletId?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Account_Max_Fields = {
  __typename?: 'account_max_fields';
  clientId?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  walletId?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "account" */
export type Account_Max_Order_By = {
  clientId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  walletId?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Account_Min_Fields = {
  __typename?: 'account_min_fields';
  clientId?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  walletId?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "account" */
export type Account_Min_Order_By = {
  clientId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  walletId?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "account" */
export type Account_Mutation_Response = {
  __typename?: 'account_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Account>;
};

/** input type for inserting object relation for remote table "account" */
export type Account_Obj_Rel_Insert_Input = {
  data: Account_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Account_On_Conflict>;
};

/** on_conflict condition type for table "account" */
export type Account_On_Conflict = {
  constraint: Account_Constraint;
  update_columns?: Array<Account_Update_Column>;
  where?: InputMaybe<Account_Bool_Exp>;
};

/** Ordering options when selecting data from "account". */
export type Account_Order_By = {
  bitcoin?: InputMaybe<Bitcoin_Order_By>;
  client?: InputMaybe<Client_Order_By>;
  clientId?: InputMaybe<Order_By>;
  eth?: InputMaybe<Eth_Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  sol?: InputMaybe<Sol_Order_By>;
  wallet?: InputMaybe<Wallet_Order_By>;
  walletId?: InputMaybe<Order_By>;
};

/** primary key columns input for table: account */
export type Account_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "account" */
export enum Account_Select_Column {
  /** column name */
  ClientId = 'clientId',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  WalletId = 'walletId'
}

/** input type for updating data in table "account" */
export type Account_Set_Input = {
  clientId?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  walletId?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "account" */
export type Account_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Account_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Account_Stream_Cursor_Value_Input = {
  clientId?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  walletId?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "account" */
export enum Account_Update_Column {
  /** column name */
  ClientId = 'clientId',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  WalletId = 'walletId'
}

export type Account_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Account_Set_Input>;
  /** filter the rows which have to be updated */
  where: Account_Bool_Exp;
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

/** bticoin address for client wallets */
export type Bitcoin = {
  __typename?: 'bitcoin';
  /** An object relationship */
  account: Account;
  accountId: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  mainnetBtc: Scalars['float8']['output'];
  privateKey: Scalars['String']['output'];
  publicKey: Scalars['String']['output'];
  regtestBtc: Scalars['float8']['output'];
  textnetBtc: Scalars['float8']['output'];
};

/** aggregated selection of "bitcoin" */
export type Bitcoin_Aggregate = {
  __typename?: 'bitcoin_aggregate';
  aggregate?: Maybe<Bitcoin_Aggregate_Fields>;
  nodes: Array<Bitcoin>;
};

/** aggregate fields of "bitcoin" */
export type Bitcoin_Aggregate_Fields = {
  __typename?: 'bitcoin_aggregate_fields';
  avg?: Maybe<Bitcoin_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Bitcoin_Max_Fields>;
  min?: Maybe<Bitcoin_Min_Fields>;
  stddev?: Maybe<Bitcoin_Stddev_Fields>;
  stddev_pop?: Maybe<Bitcoin_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Bitcoin_Stddev_Samp_Fields>;
  sum?: Maybe<Bitcoin_Sum_Fields>;
  var_pop?: Maybe<Bitcoin_Var_Pop_Fields>;
  var_samp?: Maybe<Bitcoin_Var_Samp_Fields>;
  variance?: Maybe<Bitcoin_Variance_Fields>;
};


/** aggregate fields of "bitcoin" */
export type Bitcoin_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Bitcoin_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Bitcoin_Avg_Fields = {
  __typename?: 'bitcoin_avg_fields';
  mainnetBtc?: Maybe<Scalars['Float']['output']>;
  regtestBtc?: Maybe<Scalars['Float']['output']>;
  textnetBtc?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "bitcoin". All fields are combined with a logical 'AND'. */
export type Bitcoin_Bool_Exp = {
  _and?: InputMaybe<Array<Bitcoin_Bool_Exp>>;
  _not?: InputMaybe<Bitcoin_Bool_Exp>;
  _or?: InputMaybe<Array<Bitcoin_Bool_Exp>>;
  account?: InputMaybe<Account_Bool_Exp>;
  accountId?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  mainnetBtc?: InputMaybe<Float8_Comparison_Exp>;
  privateKey?: InputMaybe<String_Comparison_Exp>;
  publicKey?: InputMaybe<String_Comparison_Exp>;
  regtestBtc?: InputMaybe<Float8_Comparison_Exp>;
  textnetBtc?: InputMaybe<Float8_Comparison_Exp>;
};

/** unique or primary key constraints on table "bitcoin" */
export enum Bitcoin_Constraint {
  /** unique or primary key constraint on columns "id" */
  BitcoinIdKey = 'bitcoin_id_key',
  /** unique or primary key constraint on columns "id" */
  BitcoinPkey = 'bitcoin_pkey',
  /** unique or primary key constraint on columns "privateKey" */
  BitcoinPrivateKeyKey = 'bitcoin_privateKey_key',
  /** unique or primary key constraint on columns "publicKey" */
  BitcoinPublicKeyKey = 'bitcoin_publicKey_key',
  /** unique or primary key constraint on columns "accountId" */
  BitcoinWalletIdKey = 'bitcoin_walletId_key'
}

/** input type for incrementing numeric columns in table "bitcoin" */
export type Bitcoin_Inc_Input = {
  mainnetBtc?: InputMaybe<Scalars['float8']['input']>;
  regtestBtc?: InputMaybe<Scalars['float8']['input']>;
  textnetBtc?: InputMaybe<Scalars['float8']['input']>;
};

/** input type for inserting data into table "bitcoin" */
export type Bitcoin_Insert_Input = {
  account?: InputMaybe<Account_Obj_Rel_Insert_Input>;
  accountId?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mainnetBtc?: InputMaybe<Scalars['float8']['input']>;
  privateKey?: InputMaybe<Scalars['String']['input']>;
  publicKey?: InputMaybe<Scalars['String']['input']>;
  regtestBtc?: InputMaybe<Scalars['float8']['input']>;
  textnetBtc?: InputMaybe<Scalars['float8']['input']>;
};

/** aggregate max on columns */
export type Bitcoin_Max_Fields = {
  __typename?: 'bitcoin_max_fields';
  accountId?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  mainnetBtc?: Maybe<Scalars['float8']['output']>;
  privateKey?: Maybe<Scalars['String']['output']>;
  publicKey?: Maybe<Scalars['String']['output']>;
  regtestBtc?: Maybe<Scalars['float8']['output']>;
  textnetBtc?: Maybe<Scalars['float8']['output']>;
};

/** aggregate min on columns */
export type Bitcoin_Min_Fields = {
  __typename?: 'bitcoin_min_fields';
  accountId?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  mainnetBtc?: Maybe<Scalars['float8']['output']>;
  privateKey?: Maybe<Scalars['String']['output']>;
  publicKey?: Maybe<Scalars['String']['output']>;
  regtestBtc?: Maybe<Scalars['float8']['output']>;
  textnetBtc?: Maybe<Scalars['float8']['output']>;
};

/** response of any mutation on the table "bitcoin" */
export type Bitcoin_Mutation_Response = {
  __typename?: 'bitcoin_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Bitcoin>;
};

/** input type for inserting object relation for remote table "bitcoin" */
export type Bitcoin_Obj_Rel_Insert_Input = {
  data: Bitcoin_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Bitcoin_On_Conflict>;
};

/** on_conflict condition type for table "bitcoin" */
export type Bitcoin_On_Conflict = {
  constraint: Bitcoin_Constraint;
  update_columns?: Array<Bitcoin_Update_Column>;
  where?: InputMaybe<Bitcoin_Bool_Exp>;
};

/** Ordering options when selecting data from "bitcoin". */
export type Bitcoin_Order_By = {
  account?: InputMaybe<Account_Order_By>;
  accountId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  mainnetBtc?: InputMaybe<Order_By>;
  privateKey?: InputMaybe<Order_By>;
  publicKey?: InputMaybe<Order_By>;
  regtestBtc?: InputMaybe<Order_By>;
  textnetBtc?: InputMaybe<Order_By>;
};

/** primary key columns input for table: bitcoin */
export type Bitcoin_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "bitcoin" */
export enum Bitcoin_Select_Column {
  /** column name */
  AccountId = 'accountId',
  /** column name */
  Id = 'id',
  /** column name */
  MainnetBtc = 'mainnetBtc',
  /** column name */
  PrivateKey = 'privateKey',
  /** column name */
  PublicKey = 'publicKey',
  /** column name */
  RegtestBtc = 'regtestBtc',
  /** column name */
  TextnetBtc = 'textnetBtc'
}

/** input type for updating data in table "bitcoin" */
export type Bitcoin_Set_Input = {
  accountId?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mainnetBtc?: InputMaybe<Scalars['float8']['input']>;
  privateKey?: InputMaybe<Scalars['String']['input']>;
  publicKey?: InputMaybe<Scalars['String']['input']>;
  regtestBtc?: InputMaybe<Scalars['float8']['input']>;
  textnetBtc?: InputMaybe<Scalars['float8']['input']>;
};

/** aggregate stddev on columns */
export type Bitcoin_Stddev_Fields = {
  __typename?: 'bitcoin_stddev_fields';
  mainnetBtc?: Maybe<Scalars['Float']['output']>;
  regtestBtc?: Maybe<Scalars['Float']['output']>;
  textnetBtc?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Bitcoin_Stddev_Pop_Fields = {
  __typename?: 'bitcoin_stddev_pop_fields';
  mainnetBtc?: Maybe<Scalars['Float']['output']>;
  regtestBtc?: Maybe<Scalars['Float']['output']>;
  textnetBtc?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Bitcoin_Stddev_Samp_Fields = {
  __typename?: 'bitcoin_stddev_samp_fields';
  mainnetBtc?: Maybe<Scalars['Float']['output']>;
  regtestBtc?: Maybe<Scalars['Float']['output']>;
  textnetBtc?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "bitcoin" */
export type Bitcoin_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Bitcoin_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Bitcoin_Stream_Cursor_Value_Input = {
  accountId?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mainnetBtc?: InputMaybe<Scalars['float8']['input']>;
  privateKey?: InputMaybe<Scalars['String']['input']>;
  publicKey?: InputMaybe<Scalars['String']['input']>;
  regtestBtc?: InputMaybe<Scalars['float8']['input']>;
  textnetBtc?: InputMaybe<Scalars['float8']['input']>;
};

/** aggregate sum on columns */
export type Bitcoin_Sum_Fields = {
  __typename?: 'bitcoin_sum_fields';
  mainnetBtc?: Maybe<Scalars['float8']['output']>;
  regtestBtc?: Maybe<Scalars['float8']['output']>;
  textnetBtc?: Maybe<Scalars['float8']['output']>;
};

/** update columns of table "bitcoin" */
export enum Bitcoin_Update_Column {
  /** column name */
  AccountId = 'accountId',
  /** column name */
  Id = 'id',
  /** column name */
  MainnetBtc = 'mainnetBtc',
  /** column name */
  PrivateKey = 'privateKey',
  /** column name */
  PublicKey = 'publicKey',
  /** column name */
  RegtestBtc = 'regtestBtc',
  /** column name */
  TextnetBtc = 'textnetBtc'
}

export type Bitcoin_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Bitcoin_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Bitcoin_Set_Input>;
  /** filter the rows which have to be updated */
  where: Bitcoin_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Bitcoin_Var_Pop_Fields = {
  __typename?: 'bitcoin_var_pop_fields';
  mainnetBtc?: Maybe<Scalars['Float']['output']>;
  regtestBtc?: Maybe<Scalars['Float']['output']>;
  textnetBtc?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Bitcoin_Var_Samp_Fields = {
  __typename?: 'bitcoin_var_samp_fields';
  mainnetBtc?: Maybe<Scalars['Float']['output']>;
  regtestBtc?: Maybe<Scalars['Float']['output']>;
  textnetBtc?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Bitcoin_Variance_Fields = {
  __typename?: 'bitcoin_variance_fields';
  mainnetBtc?: Maybe<Scalars['Float']['output']>;
  regtestBtc?: Maybe<Scalars['Float']['output']>;
  textnetBtc?: Maybe<Scalars['Float']['output']>;
};

/** subscriber for paybox */
export type Client = {
  __typename?: 'client';
  /** An array relationship */
  accounts: Array<Account>;
  /** An aggregate relationship */
  accounts_aggregate: Account_Aggregate;
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
  valid: Scalars['Boolean']['output'];
  /** An array relationship */
  wallets: Array<Wallet>;
  /** An aggregate relationship */
  wallets_aggregate: Wallet_Aggregate;
};


/** subscriber for paybox */
export type ClientAccountsArgs = {
  distinct_on?: InputMaybe<Array<Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Account_Order_By>>;
  where?: InputMaybe<Account_Bool_Exp>;
};


/** subscriber for paybox */
export type ClientAccounts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Account_Order_By>>;
  where?: InputMaybe<Account_Bool_Exp>;
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


/** subscriber for paybox */
export type ClientWalletsArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Order_By>>;
  where?: InputMaybe<Wallet_Bool_Exp>;
};


/** subscriber for paybox */
export type ClientWallets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Order_By>>;
  where?: InputMaybe<Wallet_Bool_Exp>;
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
  accounts?: InputMaybe<Account_Bool_Exp>;
  accounts_aggregate?: InputMaybe<Account_Aggregate_Bool_Exp>;
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
  valid?: InputMaybe<Boolean_Comparison_Exp>;
  wallets?: InputMaybe<Wallet_Bool_Exp>;
  wallets_aggregate?: InputMaybe<Wallet_Aggregate_Bool_Exp>;
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
  accounts?: InputMaybe<Account_Arr_Rel_Insert_Input>;
  address?: InputMaybe<Address_Obj_Rel_Insert_Input>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstname?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  lastname?: InputMaybe<Scalars['String']['input']>;
  mobile?: InputMaybe<Scalars['bigint']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  transactions?: InputMaybe<Transactions_Arr_Rel_Insert_Input>;
  username?: InputMaybe<Scalars['String']['input']>;
  valid?: InputMaybe<Scalars['Boolean']['input']>;
  wallets?: InputMaybe<Wallet_Arr_Rel_Insert_Input>;
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
  accounts_aggregate?: InputMaybe<Account_Aggregate_Order_By>;
  address?: InputMaybe<Address_Order_By>;
  email?: InputMaybe<Order_By>;
  firstname?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lastname?: InputMaybe<Order_By>;
  mobile?: InputMaybe<Order_By>;
  password?: InputMaybe<Order_By>;
  transactions_aggregate?: InputMaybe<Transactions_Aggregate_Order_By>;
  username?: InputMaybe<Order_By>;
  valid?: InputMaybe<Order_By>;
  wallets_aggregate?: InputMaybe<Wallet_Aggregate_Order_By>;
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
  Username = 'username',
  /** column name */
  Valid = 'valid'
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
  valid?: InputMaybe<Scalars['Boolean']['input']>;
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
  valid?: InputMaybe<Scalars['Boolean']['input']>;
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
  Username = 'username',
  /** column name */
  Valid = 'valid'
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

/** eth address and token for client wallets */
export type Eth = {
  __typename?: 'eth';
  /** An object relationship */
  account: Account;
  accountId: Scalars['uuid']['output'];
  goerliEth: Scalars['float8']['output'];
  id: Scalars['uuid']['output'];
  kovanEth: Scalars['float8']['output'];
  mainnetEth: Scalars['float8']['output'];
  privateKey: Scalars['String']['output'];
  publicKey: Scalars['String']['output'];
  rinkebyEth: Scalars['float8']['output'];
  ropstenEth: Scalars['float8']['output'];
  sepoliaEth: Scalars['float8']['output'];
};

/** aggregated selection of "eth" */
export type Eth_Aggregate = {
  __typename?: 'eth_aggregate';
  aggregate?: Maybe<Eth_Aggregate_Fields>;
  nodes: Array<Eth>;
};

/** aggregate fields of "eth" */
export type Eth_Aggregate_Fields = {
  __typename?: 'eth_aggregate_fields';
  avg?: Maybe<Eth_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Eth_Max_Fields>;
  min?: Maybe<Eth_Min_Fields>;
  stddev?: Maybe<Eth_Stddev_Fields>;
  stddev_pop?: Maybe<Eth_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Eth_Stddev_Samp_Fields>;
  sum?: Maybe<Eth_Sum_Fields>;
  var_pop?: Maybe<Eth_Var_Pop_Fields>;
  var_samp?: Maybe<Eth_Var_Samp_Fields>;
  variance?: Maybe<Eth_Variance_Fields>;
};


/** aggregate fields of "eth" */
export type Eth_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Eth_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Eth_Avg_Fields = {
  __typename?: 'eth_avg_fields';
  goerliEth?: Maybe<Scalars['Float']['output']>;
  kovanEth?: Maybe<Scalars['Float']['output']>;
  mainnetEth?: Maybe<Scalars['Float']['output']>;
  rinkebyEth?: Maybe<Scalars['Float']['output']>;
  ropstenEth?: Maybe<Scalars['Float']['output']>;
  sepoliaEth?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "eth". All fields are combined with a logical 'AND'. */
export type Eth_Bool_Exp = {
  _and?: InputMaybe<Array<Eth_Bool_Exp>>;
  _not?: InputMaybe<Eth_Bool_Exp>;
  _or?: InputMaybe<Array<Eth_Bool_Exp>>;
  account?: InputMaybe<Account_Bool_Exp>;
  accountId?: InputMaybe<Uuid_Comparison_Exp>;
  goerliEth?: InputMaybe<Float8_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  kovanEth?: InputMaybe<Float8_Comparison_Exp>;
  mainnetEth?: InputMaybe<Float8_Comparison_Exp>;
  privateKey?: InputMaybe<String_Comparison_Exp>;
  publicKey?: InputMaybe<String_Comparison_Exp>;
  rinkebyEth?: InputMaybe<Float8_Comparison_Exp>;
  ropstenEth?: InputMaybe<Float8_Comparison_Exp>;
  sepoliaEth?: InputMaybe<Float8_Comparison_Exp>;
};

/** unique or primary key constraints on table "eth" */
export enum Eth_Constraint {
  /** unique or primary key constraint on columns "id" */
  EthPkey = 'eth_pkey',
  /** unique or primary key constraint on columns "privateKey" */
  EthPrivateKeyKey = 'eth_privateKey_key',
  /** unique or primary key constraint on columns "publicKey" */
  EthPublicKeyKey = 'eth_publicKey_key',
  /** unique or primary key constraint on columns "accountId" */
  EthWalletIdKey = 'eth_walletId_key'
}

/** input type for incrementing numeric columns in table "eth" */
export type Eth_Inc_Input = {
  goerliEth?: InputMaybe<Scalars['float8']['input']>;
  kovanEth?: InputMaybe<Scalars['float8']['input']>;
  mainnetEth?: InputMaybe<Scalars['float8']['input']>;
  rinkebyEth?: InputMaybe<Scalars['float8']['input']>;
  ropstenEth?: InputMaybe<Scalars['float8']['input']>;
  sepoliaEth?: InputMaybe<Scalars['float8']['input']>;
};

/** input type for inserting data into table "eth" */
export type Eth_Insert_Input = {
  account?: InputMaybe<Account_Obj_Rel_Insert_Input>;
  accountId?: InputMaybe<Scalars['uuid']['input']>;
  goerliEth?: InputMaybe<Scalars['float8']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  kovanEth?: InputMaybe<Scalars['float8']['input']>;
  mainnetEth?: InputMaybe<Scalars['float8']['input']>;
  privateKey?: InputMaybe<Scalars['String']['input']>;
  publicKey?: InputMaybe<Scalars['String']['input']>;
  rinkebyEth?: InputMaybe<Scalars['float8']['input']>;
  ropstenEth?: InputMaybe<Scalars['float8']['input']>;
  sepoliaEth?: InputMaybe<Scalars['float8']['input']>;
};

/** aggregate max on columns */
export type Eth_Max_Fields = {
  __typename?: 'eth_max_fields';
  accountId?: Maybe<Scalars['uuid']['output']>;
  goerliEth?: Maybe<Scalars['float8']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  kovanEth?: Maybe<Scalars['float8']['output']>;
  mainnetEth?: Maybe<Scalars['float8']['output']>;
  privateKey?: Maybe<Scalars['String']['output']>;
  publicKey?: Maybe<Scalars['String']['output']>;
  rinkebyEth?: Maybe<Scalars['float8']['output']>;
  ropstenEth?: Maybe<Scalars['float8']['output']>;
  sepoliaEth?: Maybe<Scalars['float8']['output']>;
};

/** aggregate min on columns */
export type Eth_Min_Fields = {
  __typename?: 'eth_min_fields';
  accountId?: Maybe<Scalars['uuid']['output']>;
  goerliEth?: Maybe<Scalars['float8']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  kovanEth?: Maybe<Scalars['float8']['output']>;
  mainnetEth?: Maybe<Scalars['float8']['output']>;
  privateKey?: Maybe<Scalars['String']['output']>;
  publicKey?: Maybe<Scalars['String']['output']>;
  rinkebyEth?: Maybe<Scalars['float8']['output']>;
  ropstenEth?: Maybe<Scalars['float8']['output']>;
  sepoliaEth?: Maybe<Scalars['float8']['output']>;
};

/** response of any mutation on the table "eth" */
export type Eth_Mutation_Response = {
  __typename?: 'eth_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Eth>;
};

/** input type for inserting object relation for remote table "eth" */
export type Eth_Obj_Rel_Insert_Input = {
  data: Eth_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Eth_On_Conflict>;
};

/** on_conflict condition type for table "eth" */
export type Eth_On_Conflict = {
  constraint: Eth_Constraint;
  update_columns?: Array<Eth_Update_Column>;
  where?: InputMaybe<Eth_Bool_Exp>;
};

/** Ordering options when selecting data from "eth". */
export type Eth_Order_By = {
  account?: InputMaybe<Account_Order_By>;
  accountId?: InputMaybe<Order_By>;
  goerliEth?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kovanEth?: InputMaybe<Order_By>;
  mainnetEth?: InputMaybe<Order_By>;
  privateKey?: InputMaybe<Order_By>;
  publicKey?: InputMaybe<Order_By>;
  rinkebyEth?: InputMaybe<Order_By>;
  ropstenEth?: InputMaybe<Order_By>;
  sepoliaEth?: InputMaybe<Order_By>;
};

/** primary key columns input for table: eth */
export type Eth_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "eth" */
export enum Eth_Select_Column {
  /** column name */
  AccountId = 'accountId',
  /** column name */
  GoerliEth = 'goerliEth',
  /** column name */
  Id = 'id',
  /** column name */
  KovanEth = 'kovanEth',
  /** column name */
  MainnetEth = 'mainnetEth',
  /** column name */
  PrivateKey = 'privateKey',
  /** column name */
  PublicKey = 'publicKey',
  /** column name */
  RinkebyEth = 'rinkebyEth',
  /** column name */
  RopstenEth = 'ropstenEth',
  /** column name */
  SepoliaEth = 'sepoliaEth'
}

/** input type for updating data in table "eth" */
export type Eth_Set_Input = {
  accountId?: InputMaybe<Scalars['uuid']['input']>;
  goerliEth?: InputMaybe<Scalars['float8']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  kovanEth?: InputMaybe<Scalars['float8']['input']>;
  mainnetEth?: InputMaybe<Scalars['float8']['input']>;
  privateKey?: InputMaybe<Scalars['String']['input']>;
  publicKey?: InputMaybe<Scalars['String']['input']>;
  rinkebyEth?: InputMaybe<Scalars['float8']['input']>;
  ropstenEth?: InputMaybe<Scalars['float8']['input']>;
  sepoliaEth?: InputMaybe<Scalars['float8']['input']>;
};

/** aggregate stddev on columns */
export type Eth_Stddev_Fields = {
  __typename?: 'eth_stddev_fields';
  goerliEth?: Maybe<Scalars['Float']['output']>;
  kovanEth?: Maybe<Scalars['Float']['output']>;
  mainnetEth?: Maybe<Scalars['Float']['output']>;
  rinkebyEth?: Maybe<Scalars['Float']['output']>;
  ropstenEth?: Maybe<Scalars['Float']['output']>;
  sepoliaEth?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Eth_Stddev_Pop_Fields = {
  __typename?: 'eth_stddev_pop_fields';
  goerliEth?: Maybe<Scalars['Float']['output']>;
  kovanEth?: Maybe<Scalars['Float']['output']>;
  mainnetEth?: Maybe<Scalars['Float']['output']>;
  rinkebyEth?: Maybe<Scalars['Float']['output']>;
  ropstenEth?: Maybe<Scalars['Float']['output']>;
  sepoliaEth?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Eth_Stddev_Samp_Fields = {
  __typename?: 'eth_stddev_samp_fields';
  goerliEth?: Maybe<Scalars['Float']['output']>;
  kovanEth?: Maybe<Scalars['Float']['output']>;
  mainnetEth?: Maybe<Scalars['Float']['output']>;
  rinkebyEth?: Maybe<Scalars['Float']['output']>;
  ropstenEth?: Maybe<Scalars['Float']['output']>;
  sepoliaEth?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "eth" */
export type Eth_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Eth_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Eth_Stream_Cursor_Value_Input = {
  accountId?: InputMaybe<Scalars['uuid']['input']>;
  goerliEth?: InputMaybe<Scalars['float8']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  kovanEth?: InputMaybe<Scalars['float8']['input']>;
  mainnetEth?: InputMaybe<Scalars['float8']['input']>;
  privateKey?: InputMaybe<Scalars['String']['input']>;
  publicKey?: InputMaybe<Scalars['String']['input']>;
  rinkebyEth?: InputMaybe<Scalars['float8']['input']>;
  ropstenEth?: InputMaybe<Scalars['float8']['input']>;
  sepoliaEth?: InputMaybe<Scalars['float8']['input']>;
};

/** aggregate sum on columns */
export type Eth_Sum_Fields = {
  __typename?: 'eth_sum_fields';
  goerliEth?: Maybe<Scalars['float8']['output']>;
  kovanEth?: Maybe<Scalars['float8']['output']>;
  mainnetEth?: Maybe<Scalars['float8']['output']>;
  rinkebyEth?: Maybe<Scalars['float8']['output']>;
  ropstenEth?: Maybe<Scalars['float8']['output']>;
  sepoliaEth?: Maybe<Scalars['float8']['output']>;
};

/** update columns of table "eth" */
export enum Eth_Update_Column {
  /** column name */
  AccountId = 'accountId',
  /** column name */
  GoerliEth = 'goerliEth',
  /** column name */
  Id = 'id',
  /** column name */
  KovanEth = 'kovanEth',
  /** column name */
  MainnetEth = 'mainnetEth',
  /** column name */
  PrivateKey = 'privateKey',
  /** column name */
  PublicKey = 'publicKey',
  /** column name */
  RinkebyEth = 'rinkebyEth',
  /** column name */
  RopstenEth = 'ropstenEth',
  /** column name */
  SepoliaEth = 'sepoliaEth'
}

export type Eth_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Eth_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Eth_Set_Input>;
  /** filter the rows which have to be updated */
  where: Eth_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Eth_Var_Pop_Fields = {
  __typename?: 'eth_var_pop_fields';
  goerliEth?: Maybe<Scalars['Float']['output']>;
  kovanEth?: Maybe<Scalars['Float']['output']>;
  mainnetEth?: Maybe<Scalars['Float']['output']>;
  rinkebyEth?: Maybe<Scalars['Float']['output']>;
  ropstenEth?: Maybe<Scalars['Float']['output']>;
  sepoliaEth?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Eth_Var_Samp_Fields = {
  __typename?: 'eth_var_samp_fields';
  goerliEth?: Maybe<Scalars['Float']['output']>;
  kovanEth?: Maybe<Scalars['Float']['output']>;
  mainnetEth?: Maybe<Scalars['Float']['output']>;
  rinkebyEth?: Maybe<Scalars['Float']['output']>;
  ropstenEth?: Maybe<Scalars['Float']['output']>;
  sepoliaEth?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Eth_Variance_Fields = {
  __typename?: 'eth_variance_fields';
  goerliEth?: Maybe<Scalars['Float']['output']>;
  kovanEth?: Maybe<Scalars['Float']['output']>;
  mainnetEth?: Maybe<Scalars['Float']['output']>;
  rinkebyEth?: Maybe<Scalars['Float']['output']>;
  ropstenEth?: Maybe<Scalars['Float']['output']>;
  sepoliaEth?: Maybe<Scalars['Float']['output']>;
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
  /** delete data from the table: "account" */
  delete_account?: Maybe<Account_Mutation_Response>;
  /** delete single row from the table: "account" */
  delete_account_by_pk?: Maybe<Account>;
  /** delete data from the table: "address" */
  delete_address?: Maybe<Address_Mutation_Response>;
  /** delete single row from the table: "address" */
  delete_address_by_pk?: Maybe<Address>;
  /** delete data from the table: "bitcoin" */
  delete_bitcoin?: Maybe<Bitcoin_Mutation_Response>;
  /** delete single row from the table: "bitcoin" */
  delete_bitcoin_by_pk?: Maybe<Bitcoin>;
  /** delete data from the table: "client" */
  delete_client?: Maybe<Client_Mutation_Response>;
  /** delete single row from the table: "client" */
  delete_client_by_pk?: Maybe<Client>;
  /** delete data from the table: "eth" */
  delete_eth?: Maybe<Eth_Mutation_Response>;
  /** delete single row from the table: "eth" */
  delete_eth_by_pk?: Maybe<Eth>;
  /** delete data from the table: "sol" */
  delete_sol?: Maybe<Sol_Mutation_Response>;
  /** delete single row from the table: "sol" */
  delete_sol_by_pk?: Maybe<Sol>;
  /** delete data from the table: "transactions" */
  delete_transactions?: Maybe<Transactions_Mutation_Response>;
  /** delete single row from the table: "transactions" */
  delete_transactions_by_pk?: Maybe<Transactions>;
  /** delete data from the table: "wallet" */
  delete_wallet?: Maybe<Wallet_Mutation_Response>;
  /** delete single row from the table: "wallet" */
  delete_wallet_by_pk?: Maybe<Wallet>;
  /** insert data into the table: "account" */
  insert_account?: Maybe<Account_Mutation_Response>;
  /** insert a single row into the table: "account" */
  insert_account_one?: Maybe<Account>;
  /** insert data into the table: "address" */
  insert_address?: Maybe<Address_Mutation_Response>;
  /** insert a single row into the table: "address" */
  insert_address_one?: Maybe<Address>;
  /** insert data into the table: "bitcoin" */
  insert_bitcoin?: Maybe<Bitcoin_Mutation_Response>;
  /** insert a single row into the table: "bitcoin" */
  insert_bitcoin_one?: Maybe<Bitcoin>;
  /** insert data into the table: "client" */
  insert_client?: Maybe<Client_Mutation_Response>;
  /** insert a single row into the table: "client" */
  insert_client_one?: Maybe<Client>;
  /** insert data into the table: "eth" */
  insert_eth?: Maybe<Eth_Mutation_Response>;
  /** insert a single row into the table: "eth" */
  insert_eth_one?: Maybe<Eth>;
  /** insert data into the table: "sol" */
  insert_sol?: Maybe<Sol_Mutation_Response>;
  /** insert a single row into the table: "sol" */
  insert_sol_one?: Maybe<Sol>;
  /** insert data into the table: "transactions" */
  insert_transactions?: Maybe<Transactions_Mutation_Response>;
  /** insert a single row into the table: "transactions" */
  insert_transactions_one?: Maybe<Transactions>;
  /** insert data into the table: "wallet" */
  insert_wallet?: Maybe<Wallet_Mutation_Response>;
  /** insert a single row into the table: "wallet" */
  insert_wallet_one?: Maybe<Wallet>;
  /** update data of the table: "account" */
  update_account?: Maybe<Account_Mutation_Response>;
  /** update single row of the table: "account" */
  update_account_by_pk?: Maybe<Account>;
  /** update multiples rows of table: "account" */
  update_account_many?: Maybe<Array<Maybe<Account_Mutation_Response>>>;
  /** update data of the table: "address" */
  update_address?: Maybe<Address_Mutation_Response>;
  /** update single row of the table: "address" */
  update_address_by_pk?: Maybe<Address>;
  /** update multiples rows of table: "address" */
  update_address_many?: Maybe<Array<Maybe<Address_Mutation_Response>>>;
  /** update data of the table: "bitcoin" */
  update_bitcoin?: Maybe<Bitcoin_Mutation_Response>;
  /** update single row of the table: "bitcoin" */
  update_bitcoin_by_pk?: Maybe<Bitcoin>;
  /** update multiples rows of table: "bitcoin" */
  update_bitcoin_many?: Maybe<Array<Maybe<Bitcoin_Mutation_Response>>>;
  /** update data of the table: "client" */
  update_client?: Maybe<Client_Mutation_Response>;
  /** update single row of the table: "client" */
  update_client_by_pk?: Maybe<Client>;
  /** update multiples rows of table: "client" */
  update_client_many?: Maybe<Array<Maybe<Client_Mutation_Response>>>;
  /** update data of the table: "eth" */
  update_eth?: Maybe<Eth_Mutation_Response>;
  /** update single row of the table: "eth" */
  update_eth_by_pk?: Maybe<Eth>;
  /** update multiples rows of table: "eth" */
  update_eth_many?: Maybe<Array<Maybe<Eth_Mutation_Response>>>;
  /** update data of the table: "sol" */
  update_sol?: Maybe<Sol_Mutation_Response>;
  /** update single row of the table: "sol" */
  update_sol_by_pk?: Maybe<Sol>;
  /** update multiples rows of table: "sol" */
  update_sol_many?: Maybe<Array<Maybe<Sol_Mutation_Response>>>;
  /** update data of the table: "transactions" */
  update_transactions?: Maybe<Transactions_Mutation_Response>;
  /** update single row of the table: "transactions" */
  update_transactions_by_pk?: Maybe<Transactions>;
  /** update multiples rows of table: "transactions" */
  update_transactions_many?: Maybe<Array<Maybe<Transactions_Mutation_Response>>>;
  /** update data of the table: "wallet" */
  update_wallet?: Maybe<Wallet_Mutation_Response>;
  /** update single row of the table: "wallet" */
  update_wallet_by_pk?: Maybe<Wallet>;
  /** update multiples rows of table: "wallet" */
  update_wallet_many?: Maybe<Array<Maybe<Wallet_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_AccountArgs = {
  where: Account_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Account_By_PkArgs = {
  id: Scalars['uuid']['input'];
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
export type Mutation_RootDelete_BitcoinArgs = {
  where: Bitcoin_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Bitcoin_By_PkArgs = {
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
export type Mutation_RootDelete_EthArgs = {
  where: Eth_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Eth_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_SolArgs = {
  where: Sol_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Sol_By_PkArgs = {
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
export type Mutation_RootDelete_WalletArgs = {
  where: Wallet_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Wallet_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootInsert_AccountArgs = {
  objects: Array<Account_Insert_Input>;
  on_conflict?: InputMaybe<Account_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Account_OneArgs = {
  object: Account_Insert_Input;
  on_conflict?: InputMaybe<Account_On_Conflict>;
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
export type Mutation_RootInsert_BitcoinArgs = {
  objects: Array<Bitcoin_Insert_Input>;
  on_conflict?: InputMaybe<Bitcoin_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Bitcoin_OneArgs = {
  object: Bitcoin_Insert_Input;
  on_conflict?: InputMaybe<Bitcoin_On_Conflict>;
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
export type Mutation_RootInsert_EthArgs = {
  objects: Array<Eth_Insert_Input>;
  on_conflict?: InputMaybe<Eth_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Eth_OneArgs = {
  object: Eth_Insert_Input;
  on_conflict?: InputMaybe<Eth_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_SolArgs = {
  objects: Array<Sol_Insert_Input>;
  on_conflict?: InputMaybe<Sol_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Sol_OneArgs = {
  object: Sol_Insert_Input;
  on_conflict?: InputMaybe<Sol_On_Conflict>;
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
export type Mutation_RootInsert_WalletArgs = {
  objects: Array<Wallet_Insert_Input>;
  on_conflict?: InputMaybe<Wallet_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Wallet_OneArgs = {
  object: Wallet_Insert_Input;
  on_conflict?: InputMaybe<Wallet_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_AccountArgs = {
  _set?: InputMaybe<Account_Set_Input>;
  where: Account_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Account_By_PkArgs = {
  _set?: InputMaybe<Account_Set_Input>;
  pk_columns: Account_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Account_ManyArgs = {
  updates: Array<Account_Updates>;
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
export type Mutation_RootUpdate_BitcoinArgs = {
  _inc?: InputMaybe<Bitcoin_Inc_Input>;
  _set?: InputMaybe<Bitcoin_Set_Input>;
  where: Bitcoin_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Bitcoin_By_PkArgs = {
  _inc?: InputMaybe<Bitcoin_Inc_Input>;
  _set?: InputMaybe<Bitcoin_Set_Input>;
  pk_columns: Bitcoin_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Bitcoin_ManyArgs = {
  updates: Array<Bitcoin_Updates>;
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
export type Mutation_RootUpdate_EthArgs = {
  _inc?: InputMaybe<Eth_Inc_Input>;
  _set?: InputMaybe<Eth_Set_Input>;
  where: Eth_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Eth_By_PkArgs = {
  _inc?: InputMaybe<Eth_Inc_Input>;
  _set?: InputMaybe<Eth_Set_Input>;
  pk_columns: Eth_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Eth_ManyArgs = {
  updates: Array<Eth_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_SolArgs = {
  _inc?: InputMaybe<Sol_Inc_Input>;
  _set?: InputMaybe<Sol_Set_Input>;
  where: Sol_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Sol_By_PkArgs = {
  _inc?: InputMaybe<Sol_Inc_Input>;
  _set?: InputMaybe<Sol_Set_Input>;
  pk_columns: Sol_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Sol_ManyArgs = {
  updates: Array<Sol_Updates>;
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


/** mutation root */
export type Mutation_RootUpdate_WalletArgs = {
  _set?: InputMaybe<Wallet_Set_Input>;
  where: Wallet_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Wallet_By_PkArgs = {
  _set?: InputMaybe<Wallet_Set_Input>;
  pk_columns: Wallet_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Wallet_ManyArgs = {
  updates: Array<Wallet_Updates>;
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
  /** fetch data from the table: "account" */
  account: Array<Account>;
  /** fetch aggregated fields from the table: "account" */
  account_aggregate: Account_Aggregate;
  /** fetch data from the table: "account" using primary key columns */
  account_by_pk?: Maybe<Account>;
  /** fetch data from the table: "address" */
  address: Array<Address>;
  /** fetch aggregated fields from the table: "address" */
  address_aggregate: Address_Aggregate;
  /** fetch data from the table: "address" using primary key columns */
  address_by_pk?: Maybe<Address>;
  /** fetch data from the table: "bitcoin" */
  bitcoin: Array<Bitcoin>;
  /** fetch aggregated fields from the table: "bitcoin" */
  bitcoin_aggregate: Bitcoin_Aggregate;
  /** fetch data from the table: "bitcoin" using primary key columns */
  bitcoin_by_pk?: Maybe<Bitcoin>;
  /** fetch data from the table: "client" */
  client: Array<Client>;
  /** fetch aggregated fields from the table: "client" */
  client_aggregate: Client_Aggregate;
  /** fetch data from the table: "client" using primary key columns */
  client_by_pk?: Maybe<Client>;
  /** fetch data from the table: "eth" */
  eth: Array<Eth>;
  /** fetch aggregated fields from the table: "eth" */
  eth_aggregate: Eth_Aggregate;
  /** fetch data from the table: "eth" using primary key columns */
  eth_by_pk?: Maybe<Eth>;
  /** fetch data from the table: "sol" */
  sol: Array<Sol>;
  /** fetch aggregated fields from the table: "sol" */
  sol_aggregate: Sol_Aggregate;
  /** fetch data from the table: "sol" using primary key columns */
  sol_by_pk?: Maybe<Sol>;
  /** An array relationship */
  transactions: Array<Transactions>;
  /** An aggregate relationship */
  transactions_aggregate: Transactions_Aggregate;
  /** fetch data from the table: "transactions" using primary key columns */
  transactions_by_pk?: Maybe<Transactions>;
  /** fetch data from the table: "wallet" */
  wallet: Array<Wallet>;
  /** fetch aggregated fields from the table: "wallet" */
  wallet_aggregate: Wallet_Aggregate;
  /** fetch data from the table: "wallet" using primary key columns */
  wallet_by_pk?: Maybe<Wallet>;
};


export type Query_RootAccountArgs = {
  distinct_on?: InputMaybe<Array<Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Account_Order_By>>;
  where?: InputMaybe<Account_Bool_Exp>;
};


export type Query_RootAccount_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Account_Order_By>>;
  where?: InputMaybe<Account_Bool_Exp>;
};


export type Query_RootAccount_By_PkArgs = {
  id: Scalars['uuid']['input'];
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


export type Query_RootBitcoinArgs = {
  distinct_on?: InputMaybe<Array<Bitcoin_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Bitcoin_Order_By>>;
  where?: InputMaybe<Bitcoin_Bool_Exp>;
};


export type Query_RootBitcoin_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Bitcoin_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Bitcoin_Order_By>>;
  where?: InputMaybe<Bitcoin_Bool_Exp>;
};


export type Query_RootBitcoin_By_PkArgs = {
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


export type Query_RootEthArgs = {
  distinct_on?: InputMaybe<Array<Eth_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Eth_Order_By>>;
  where?: InputMaybe<Eth_Bool_Exp>;
};


export type Query_RootEth_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Eth_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Eth_Order_By>>;
  where?: InputMaybe<Eth_Bool_Exp>;
};


export type Query_RootEth_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootSolArgs = {
  distinct_on?: InputMaybe<Array<Sol_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Sol_Order_By>>;
  where?: InputMaybe<Sol_Bool_Exp>;
};


export type Query_RootSol_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Sol_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Sol_Order_By>>;
  where?: InputMaybe<Sol_Bool_Exp>;
};


export type Query_RootSol_By_PkArgs = {
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


export type Query_RootWalletArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Order_By>>;
  where?: InputMaybe<Wallet_Bool_Exp>;
};


export type Query_RootWallet_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Order_By>>;
  where?: InputMaybe<Wallet_Bool_Exp>;
};


export type Query_RootWallet_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

/** solana address for client wallets */
export type Sol = {
  __typename?: 'sol';
  /** An object relationship */
  account: Account;
  accountId: Scalars['uuid']['output'];
  devnetSol: Scalars['float8']['output'];
  id: Scalars['uuid']['output'];
  mainnetSol: Scalars['float8']['output'];
  privateKey: Scalars['String']['output'];
  publicKey: Scalars['String']['output'];
  testnetSol: Scalars['float8']['output'];
};

/** aggregated selection of "sol" */
export type Sol_Aggregate = {
  __typename?: 'sol_aggregate';
  aggregate?: Maybe<Sol_Aggregate_Fields>;
  nodes: Array<Sol>;
};

/** aggregate fields of "sol" */
export type Sol_Aggregate_Fields = {
  __typename?: 'sol_aggregate_fields';
  avg?: Maybe<Sol_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Sol_Max_Fields>;
  min?: Maybe<Sol_Min_Fields>;
  stddev?: Maybe<Sol_Stddev_Fields>;
  stddev_pop?: Maybe<Sol_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Sol_Stddev_Samp_Fields>;
  sum?: Maybe<Sol_Sum_Fields>;
  var_pop?: Maybe<Sol_Var_Pop_Fields>;
  var_samp?: Maybe<Sol_Var_Samp_Fields>;
  variance?: Maybe<Sol_Variance_Fields>;
};


/** aggregate fields of "sol" */
export type Sol_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Sol_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Sol_Avg_Fields = {
  __typename?: 'sol_avg_fields';
  devnetSol?: Maybe<Scalars['Float']['output']>;
  mainnetSol?: Maybe<Scalars['Float']['output']>;
  testnetSol?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "sol". All fields are combined with a logical 'AND'. */
export type Sol_Bool_Exp = {
  _and?: InputMaybe<Array<Sol_Bool_Exp>>;
  _not?: InputMaybe<Sol_Bool_Exp>;
  _or?: InputMaybe<Array<Sol_Bool_Exp>>;
  account?: InputMaybe<Account_Bool_Exp>;
  accountId?: InputMaybe<Uuid_Comparison_Exp>;
  devnetSol?: InputMaybe<Float8_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  mainnetSol?: InputMaybe<Float8_Comparison_Exp>;
  privateKey?: InputMaybe<String_Comparison_Exp>;
  publicKey?: InputMaybe<String_Comparison_Exp>;
  testnetSol?: InputMaybe<Float8_Comparison_Exp>;
};

/** unique or primary key constraints on table "sol" */
export enum Sol_Constraint {
  /** unique or primary key constraint on columns "accountId" */
  SolAccountIdKey = 'sol_accountId_key',
  /** unique or primary key constraint on columns "id" */
  SolIdKey = 'sol_id_key',
  /** unique or primary key constraint on columns "id" */
  SolPkey = 'sol_pkey',
  /** unique or primary key constraint on columns "privateKey" */
  SolPrivateKeyKey = 'sol_privateKey_key',
  /** unique or primary key constraint on columns "publicKey" */
  SolPublicKeyKey = 'sol_publicKey_key'
}

/** input type for incrementing numeric columns in table "sol" */
export type Sol_Inc_Input = {
  devnetSol?: InputMaybe<Scalars['float8']['input']>;
  mainnetSol?: InputMaybe<Scalars['float8']['input']>;
  testnetSol?: InputMaybe<Scalars['float8']['input']>;
};

/** input type for inserting data into table "sol" */
export type Sol_Insert_Input = {
  account?: InputMaybe<Account_Obj_Rel_Insert_Input>;
  accountId?: InputMaybe<Scalars['uuid']['input']>;
  devnetSol?: InputMaybe<Scalars['float8']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mainnetSol?: InputMaybe<Scalars['float8']['input']>;
  privateKey?: InputMaybe<Scalars['String']['input']>;
  publicKey?: InputMaybe<Scalars['String']['input']>;
  testnetSol?: InputMaybe<Scalars['float8']['input']>;
};

/** aggregate max on columns */
export type Sol_Max_Fields = {
  __typename?: 'sol_max_fields';
  accountId?: Maybe<Scalars['uuid']['output']>;
  devnetSol?: Maybe<Scalars['float8']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  mainnetSol?: Maybe<Scalars['float8']['output']>;
  privateKey?: Maybe<Scalars['String']['output']>;
  publicKey?: Maybe<Scalars['String']['output']>;
  testnetSol?: Maybe<Scalars['float8']['output']>;
};

/** aggregate min on columns */
export type Sol_Min_Fields = {
  __typename?: 'sol_min_fields';
  accountId?: Maybe<Scalars['uuid']['output']>;
  devnetSol?: Maybe<Scalars['float8']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  mainnetSol?: Maybe<Scalars['float8']['output']>;
  privateKey?: Maybe<Scalars['String']['output']>;
  publicKey?: Maybe<Scalars['String']['output']>;
  testnetSol?: Maybe<Scalars['float8']['output']>;
};

/** response of any mutation on the table "sol" */
export type Sol_Mutation_Response = {
  __typename?: 'sol_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Sol>;
};

/** input type for inserting object relation for remote table "sol" */
export type Sol_Obj_Rel_Insert_Input = {
  data: Sol_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Sol_On_Conflict>;
};

/** on_conflict condition type for table "sol" */
export type Sol_On_Conflict = {
  constraint: Sol_Constraint;
  update_columns?: Array<Sol_Update_Column>;
  where?: InputMaybe<Sol_Bool_Exp>;
};

/** Ordering options when selecting data from "sol". */
export type Sol_Order_By = {
  account?: InputMaybe<Account_Order_By>;
  accountId?: InputMaybe<Order_By>;
  devnetSol?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  mainnetSol?: InputMaybe<Order_By>;
  privateKey?: InputMaybe<Order_By>;
  publicKey?: InputMaybe<Order_By>;
  testnetSol?: InputMaybe<Order_By>;
};

/** primary key columns input for table: sol */
export type Sol_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "sol" */
export enum Sol_Select_Column {
  /** column name */
  AccountId = 'accountId',
  /** column name */
  DevnetSol = 'devnetSol',
  /** column name */
  Id = 'id',
  /** column name */
  MainnetSol = 'mainnetSol',
  /** column name */
  PrivateKey = 'privateKey',
  /** column name */
  PublicKey = 'publicKey',
  /** column name */
  TestnetSol = 'testnetSol'
}

/** input type for updating data in table "sol" */
export type Sol_Set_Input = {
  accountId?: InputMaybe<Scalars['uuid']['input']>;
  devnetSol?: InputMaybe<Scalars['float8']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mainnetSol?: InputMaybe<Scalars['float8']['input']>;
  privateKey?: InputMaybe<Scalars['String']['input']>;
  publicKey?: InputMaybe<Scalars['String']['input']>;
  testnetSol?: InputMaybe<Scalars['float8']['input']>;
};

/** aggregate stddev on columns */
export type Sol_Stddev_Fields = {
  __typename?: 'sol_stddev_fields';
  devnetSol?: Maybe<Scalars['Float']['output']>;
  mainnetSol?: Maybe<Scalars['Float']['output']>;
  testnetSol?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Sol_Stddev_Pop_Fields = {
  __typename?: 'sol_stddev_pop_fields';
  devnetSol?: Maybe<Scalars['Float']['output']>;
  mainnetSol?: Maybe<Scalars['Float']['output']>;
  testnetSol?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Sol_Stddev_Samp_Fields = {
  __typename?: 'sol_stddev_samp_fields';
  devnetSol?: Maybe<Scalars['Float']['output']>;
  mainnetSol?: Maybe<Scalars['Float']['output']>;
  testnetSol?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "sol" */
export type Sol_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Sol_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Sol_Stream_Cursor_Value_Input = {
  accountId?: InputMaybe<Scalars['uuid']['input']>;
  devnetSol?: InputMaybe<Scalars['float8']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mainnetSol?: InputMaybe<Scalars['float8']['input']>;
  privateKey?: InputMaybe<Scalars['String']['input']>;
  publicKey?: InputMaybe<Scalars['String']['input']>;
  testnetSol?: InputMaybe<Scalars['float8']['input']>;
};

/** aggregate sum on columns */
export type Sol_Sum_Fields = {
  __typename?: 'sol_sum_fields';
  devnetSol?: Maybe<Scalars['float8']['output']>;
  mainnetSol?: Maybe<Scalars['float8']['output']>;
  testnetSol?: Maybe<Scalars['float8']['output']>;
};

/** update columns of table "sol" */
export enum Sol_Update_Column {
  /** column name */
  AccountId = 'accountId',
  /** column name */
  DevnetSol = 'devnetSol',
  /** column name */
  Id = 'id',
  /** column name */
  MainnetSol = 'mainnetSol',
  /** column name */
  PrivateKey = 'privateKey',
  /** column name */
  PublicKey = 'publicKey',
  /** column name */
  TestnetSol = 'testnetSol'
}

export type Sol_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Sol_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Sol_Set_Input>;
  /** filter the rows which have to be updated */
  where: Sol_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Sol_Var_Pop_Fields = {
  __typename?: 'sol_var_pop_fields';
  devnetSol?: Maybe<Scalars['Float']['output']>;
  mainnetSol?: Maybe<Scalars['Float']['output']>;
  testnetSol?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Sol_Var_Samp_Fields = {
  __typename?: 'sol_var_samp_fields';
  devnetSol?: Maybe<Scalars['Float']['output']>;
  mainnetSol?: Maybe<Scalars['Float']['output']>;
  testnetSol?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Sol_Variance_Fields = {
  __typename?: 'sol_variance_fields';
  devnetSol?: Maybe<Scalars['Float']['output']>;
  mainnetSol?: Maybe<Scalars['Float']['output']>;
  testnetSol?: Maybe<Scalars['Float']['output']>;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "account" */
  account: Array<Account>;
  /** fetch aggregated fields from the table: "account" */
  account_aggregate: Account_Aggregate;
  /** fetch data from the table: "account" using primary key columns */
  account_by_pk?: Maybe<Account>;
  /** fetch data from the table in a streaming manner: "account" */
  account_stream: Array<Account>;
  /** fetch data from the table: "address" */
  address: Array<Address>;
  /** fetch aggregated fields from the table: "address" */
  address_aggregate: Address_Aggregate;
  /** fetch data from the table: "address" using primary key columns */
  address_by_pk?: Maybe<Address>;
  /** fetch data from the table in a streaming manner: "address" */
  address_stream: Array<Address>;
  /** fetch data from the table: "bitcoin" */
  bitcoin: Array<Bitcoin>;
  /** fetch aggregated fields from the table: "bitcoin" */
  bitcoin_aggregate: Bitcoin_Aggregate;
  /** fetch data from the table: "bitcoin" using primary key columns */
  bitcoin_by_pk?: Maybe<Bitcoin>;
  /** fetch data from the table in a streaming manner: "bitcoin" */
  bitcoin_stream: Array<Bitcoin>;
  /** fetch data from the table: "client" */
  client: Array<Client>;
  /** fetch aggregated fields from the table: "client" */
  client_aggregate: Client_Aggregate;
  /** fetch data from the table: "client" using primary key columns */
  client_by_pk?: Maybe<Client>;
  /** fetch data from the table in a streaming manner: "client" */
  client_stream: Array<Client>;
  /** fetch data from the table: "eth" */
  eth: Array<Eth>;
  /** fetch aggregated fields from the table: "eth" */
  eth_aggregate: Eth_Aggregate;
  /** fetch data from the table: "eth" using primary key columns */
  eth_by_pk?: Maybe<Eth>;
  /** fetch data from the table in a streaming manner: "eth" */
  eth_stream: Array<Eth>;
  /** fetch data from the table: "sol" */
  sol: Array<Sol>;
  /** fetch aggregated fields from the table: "sol" */
  sol_aggregate: Sol_Aggregate;
  /** fetch data from the table: "sol" using primary key columns */
  sol_by_pk?: Maybe<Sol>;
  /** fetch data from the table in a streaming manner: "sol" */
  sol_stream: Array<Sol>;
  /** An array relationship */
  transactions: Array<Transactions>;
  /** An aggregate relationship */
  transactions_aggregate: Transactions_Aggregate;
  /** fetch data from the table: "transactions" using primary key columns */
  transactions_by_pk?: Maybe<Transactions>;
  /** fetch data from the table in a streaming manner: "transactions" */
  transactions_stream: Array<Transactions>;
  /** fetch data from the table: "wallet" */
  wallet: Array<Wallet>;
  /** fetch aggregated fields from the table: "wallet" */
  wallet_aggregate: Wallet_Aggregate;
  /** fetch data from the table: "wallet" using primary key columns */
  wallet_by_pk?: Maybe<Wallet>;
  /** fetch data from the table in a streaming manner: "wallet" */
  wallet_stream: Array<Wallet>;
};


export type Subscription_RootAccountArgs = {
  distinct_on?: InputMaybe<Array<Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Account_Order_By>>;
  where?: InputMaybe<Account_Bool_Exp>;
};


export type Subscription_RootAccount_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Account_Order_By>>;
  where?: InputMaybe<Account_Bool_Exp>;
};


export type Subscription_RootAccount_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAccount_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Account_Stream_Cursor_Input>>;
  where?: InputMaybe<Account_Bool_Exp>;
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


export type Subscription_RootBitcoinArgs = {
  distinct_on?: InputMaybe<Array<Bitcoin_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Bitcoin_Order_By>>;
  where?: InputMaybe<Bitcoin_Bool_Exp>;
};


export type Subscription_RootBitcoin_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Bitcoin_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Bitcoin_Order_By>>;
  where?: InputMaybe<Bitcoin_Bool_Exp>;
};


export type Subscription_RootBitcoin_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootBitcoin_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Bitcoin_Stream_Cursor_Input>>;
  where?: InputMaybe<Bitcoin_Bool_Exp>;
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


export type Subscription_RootEthArgs = {
  distinct_on?: InputMaybe<Array<Eth_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Eth_Order_By>>;
  where?: InputMaybe<Eth_Bool_Exp>;
};


export type Subscription_RootEth_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Eth_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Eth_Order_By>>;
  where?: InputMaybe<Eth_Bool_Exp>;
};


export type Subscription_RootEth_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEth_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Eth_Stream_Cursor_Input>>;
  where?: InputMaybe<Eth_Bool_Exp>;
};


export type Subscription_RootSolArgs = {
  distinct_on?: InputMaybe<Array<Sol_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Sol_Order_By>>;
  where?: InputMaybe<Sol_Bool_Exp>;
};


export type Subscription_RootSol_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Sol_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Sol_Order_By>>;
  where?: InputMaybe<Sol_Bool_Exp>;
};


export type Subscription_RootSol_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootSol_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Sol_Stream_Cursor_Input>>;
  where?: InputMaybe<Sol_Bool_Exp>;
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


export type Subscription_RootWalletArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Order_By>>;
  where?: InputMaybe<Wallet_Bool_Exp>;
};


export type Subscription_RootWallet_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Wallet_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Wallet_Order_By>>;
  where?: InputMaybe<Wallet_Bool_Exp>;
};


export type Subscription_RootWallet_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootWallet_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Wallet_Stream_Cursor_Input>>;
  where?: InputMaybe<Wallet_Bool_Exp>;
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

/** transactions table  */
export type Transactions = {
  __typename?: 'transactions';
  amount: Scalars['float8']['output'];
  blockTime: Scalars['bigint']['output'];
  chainId?: Maybe<Scalars['bigint']['output']>;
  /** An object relationship */
  client: Client;
  clientId: Scalars['uuid']['output'];
  cluster?: Maybe<Scalars['String']['output']>;
  fee: Scalars['float8']['output'];
  from: Scalars['String']['output'];
  hash?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  network: Scalars['String']['output'];
  nonce?: Maybe<Scalars['Int']['output']>;
  postBalances?: Maybe<Scalars['jsonb']['output']>;
  preBalances?: Maybe<Scalars['jsonb']['output']>;
  recentBlockhash: Scalars['String']['output'];
  signature: Scalars['jsonb']['output'];
  slot?: Maybe<Scalars['bigint']['output']>;
  status: Scalars['String']['output'];
  time: Scalars['timestamptz']['output'];
  to: Scalars['String']['output'];
};


/** transactions table  */
export type TransactionsPostBalancesArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** transactions table  */
export type TransactionsPreBalancesArgs = {
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
  postBalances?: InputMaybe<Scalars['jsonb']['input']>;
  preBalances?: InputMaybe<Scalars['jsonb']['input']>;
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
  blockTime?: Maybe<Scalars['Float']['output']>;
  chainId?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  nonce?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "transactions" */
export type Transactions_Avg_Order_By = {
  amount?: InputMaybe<Order_By>;
  blockTime?: InputMaybe<Order_By>;
  chainId?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "transactions". All fields are combined with a logical 'AND'. */
export type Transactions_Bool_Exp = {
  _and?: InputMaybe<Array<Transactions_Bool_Exp>>;
  _not?: InputMaybe<Transactions_Bool_Exp>;
  _or?: InputMaybe<Array<Transactions_Bool_Exp>>;
  amount?: InputMaybe<Float8_Comparison_Exp>;
  blockTime?: InputMaybe<Bigint_Comparison_Exp>;
  chainId?: InputMaybe<Bigint_Comparison_Exp>;
  client?: InputMaybe<Client_Bool_Exp>;
  clientId?: InputMaybe<Uuid_Comparison_Exp>;
  cluster?: InputMaybe<String_Comparison_Exp>;
  fee?: InputMaybe<Float8_Comparison_Exp>;
  from?: InputMaybe<String_Comparison_Exp>;
  hash?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  network?: InputMaybe<String_Comparison_Exp>;
  nonce?: InputMaybe<Int_Comparison_Exp>;
  postBalances?: InputMaybe<Jsonb_Comparison_Exp>;
  preBalances?: InputMaybe<Jsonb_Comparison_Exp>;
  recentBlockhash?: InputMaybe<String_Comparison_Exp>;
  signature?: InputMaybe<Jsonb_Comparison_Exp>;
  slot?: InputMaybe<Bigint_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  time?: InputMaybe<Timestamptz_Comparison_Exp>;
  to?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "transactions" */
export enum Transactions_Constraint {
  /** unique or primary key constraint on columns "blockTime" */
  TransactionsBlockTimeKey = 'transactions_block_time_key',
  /** unique or primary key constraint on columns "id" */
  TransactionsPkey = 'transactions_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Transactions_Delete_At_Path_Input = {
  postBalances?: InputMaybe<Array<Scalars['String']['input']>>;
  preBalances?: InputMaybe<Array<Scalars['String']['input']>>;
  signature?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Transactions_Delete_Elem_Input = {
  postBalances?: InputMaybe<Scalars['Int']['input']>;
  preBalances?: InputMaybe<Scalars['Int']['input']>;
  signature?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Transactions_Delete_Key_Input = {
  postBalances?: InputMaybe<Scalars['String']['input']>;
  preBalances?: InputMaybe<Scalars['String']['input']>;
  signature?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "transactions" */
export type Transactions_Inc_Input = {
  amount?: InputMaybe<Scalars['float8']['input']>;
  blockTime?: InputMaybe<Scalars['bigint']['input']>;
  chainId?: InputMaybe<Scalars['bigint']['input']>;
  fee?: InputMaybe<Scalars['float8']['input']>;
  nonce?: InputMaybe<Scalars['Int']['input']>;
  slot?: InputMaybe<Scalars['bigint']['input']>;
};

/** input type for inserting data into table "transactions" */
export type Transactions_Insert_Input = {
  amount?: InputMaybe<Scalars['float8']['input']>;
  blockTime?: InputMaybe<Scalars['bigint']['input']>;
  chainId?: InputMaybe<Scalars['bigint']['input']>;
  client?: InputMaybe<Client_Obj_Rel_Insert_Input>;
  clientId?: InputMaybe<Scalars['uuid']['input']>;
  cluster?: InputMaybe<Scalars['String']['input']>;
  fee?: InputMaybe<Scalars['float8']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  hash?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  network?: InputMaybe<Scalars['String']['input']>;
  nonce?: InputMaybe<Scalars['Int']['input']>;
  postBalances?: InputMaybe<Scalars['jsonb']['input']>;
  preBalances?: InputMaybe<Scalars['jsonb']['input']>;
  recentBlockhash?: InputMaybe<Scalars['String']['input']>;
  signature?: InputMaybe<Scalars['jsonb']['input']>;
  slot?: InputMaybe<Scalars['bigint']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<Scalars['timestamptz']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Transactions_Max_Fields = {
  __typename?: 'transactions_max_fields';
  amount?: Maybe<Scalars['float8']['output']>;
  blockTime?: Maybe<Scalars['bigint']['output']>;
  chainId?: Maybe<Scalars['bigint']['output']>;
  clientId?: Maybe<Scalars['uuid']['output']>;
  cluster?: Maybe<Scalars['String']['output']>;
  fee?: Maybe<Scalars['float8']['output']>;
  from?: Maybe<Scalars['String']['output']>;
  hash?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  network?: Maybe<Scalars['String']['output']>;
  nonce?: Maybe<Scalars['Int']['output']>;
  recentBlockhash?: Maybe<Scalars['String']['output']>;
  slot?: Maybe<Scalars['bigint']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['timestamptz']['output']>;
  to?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "transactions" */
export type Transactions_Max_Order_By = {
  amount?: InputMaybe<Order_By>;
  blockTime?: InputMaybe<Order_By>;
  chainId?: InputMaybe<Order_By>;
  clientId?: InputMaybe<Order_By>;
  cluster?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  from?: InputMaybe<Order_By>;
  hash?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  network?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
  recentBlockhash?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  time?: InputMaybe<Order_By>;
  to?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Transactions_Min_Fields = {
  __typename?: 'transactions_min_fields';
  amount?: Maybe<Scalars['float8']['output']>;
  blockTime?: Maybe<Scalars['bigint']['output']>;
  chainId?: Maybe<Scalars['bigint']['output']>;
  clientId?: Maybe<Scalars['uuid']['output']>;
  cluster?: Maybe<Scalars['String']['output']>;
  fee?: Maybe<Scalars['float8']['output']>;
  from?: Maybe<Scalars['String']['output']>;
  hash?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  network?: Maybe<Scalars['String']['output']>;
  nonce?: Maybe<Scalars['Int']['output']>;
  recentBlockhash?: Maybe<Scalars['String']['output']>;
  slot?: Maybe<Scalars['bigint']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['timestamptz']['output']>;
  to?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "transactions" */
export type Transactions_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  blockTime?: InputMaybe<Order_By>;
  chainId?: InputMaybe<Order_By>;
  clientId?: InputMaybe<Order_By>;
  cluster?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  from?: InputMaybe<Order_By>;
  hash?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  network?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
  recentBlockhash?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  time?: InputMaybe<Order_By>;
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
  blockTime?: InputMaybe<Order_By>;
  chainId?: InputMaybe<Order_By>;
  client?: InputMaybe<Client_Order_By>;
  clientId?: InputMaybe<Order_By>;
  cluster?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  from?: InputMaybe<Order_By>;
  hash?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  network?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
  postBalances?: InputMaybe<Order_By>;
  preBalances?: InputMaybe<Order_By>;
  recentBlockhash?: InputMaybe<Order_By>;
  signature?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  time?: InputMaybe<Order_By>;
  to?: InputMaybe<Order_By>;
};

/** primary key columns input for table: transactions */
export type Transactions_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Transactions_Prepend_Input = {
  postBalances?: InputMaybe<Scalars['jsonb']['input']>;
  preBalances?: InputMaybe<Scalars['jsonb']['input']>;
  signature?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "transactions" */
export enum Transactions_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  BlockTime = 'blockTime',
  /** column name */
  ChainId = 'chainId',
  /** column name */
  ClientId = 'clientId',
  /** column name */
  Cluster = 'cluster',
  /** column name */
  Fee = 'fee',
  /** column name */
  From = 'from',
  /** column name */
  Hash = 'hash',
  /** column name */
  Id = 'id',
  /** column name */
  Network = 'network',
  /** column name */
  Nonce = 'nonce',
  /** column name */
  PostBalances = 'postBalances',
  /** column name */
  PreBalances = 'preBalances',
  /** column name */
  RecentBlockhash = 'recentBlockhash',
  /** column name */
  Signature = 'signature',
  /** column name */
  Slot = 'slot',
  /** column name */
  Status = 'status',
  /** column name */
  Time = 'time',
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
  blockTime?: InputMaybe<Scalars['bigint']['input']>;
  chainId?: InputMaybe<Scalars['bigint']['input']>;
  clientId?: InputMaybe<Scalars['uuid']['input']>;
  cluster?: InputMaybe<Scalars['String']['input']>;
  fee?: InputMaybe<Scalars['float8']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  hash?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  network?: InputMaybe<Scalars['String']['input']>;
  nonce?: InputMaybe<Scalars['Int']['input']>;
  postBalances?: InputMaybe<Scalars['jsonb']['input']>;
  preBalances?: InputMaybe<Scalars['jsonb']['input']>;
  recentBlockhash?: InputMaybe<Scalars['String']['input']>;
  signature?: InputMaybe<Scalars['jsonb']['input']>;
  slot?: InputMaybe<Scalars['bigint']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<Scalars['timestamptz']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Transactions_Stddev_Fields = {
  __typename?: 'transactions_stddev_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  blockTime?: Maybe<Scalars['Float']['output']>;
  chainId?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  nonce?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "transactions" */
export type Transactions_Stddev_Order_By = {
  amount?: InputMaybe<Order_By>;
  blockTime?: InputMaybe<Order_By>;
  chainId?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Transactions_Stddev_Pop_Fields = {
  __typename?: 'transactions_stddev_pop_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  blockTime?: Maybe<Scalars['Float']['output']>;
  chainId?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  nonce?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "transactions" */
export type Transactions_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  blockTime?: InputMaybe<Order_By>;
  chainId?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Transactions_Stddev_Samp_Fields = {
  __typename?: 'transactions_stddev_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  blockTime?: Maybe<Scalars['Float']['output']>;
  chainId?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  nonce?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "transactions" */
export type Transactions_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  blockTime?: InputMaybe<Order_By>;
  chainId?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
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
  blockTime?: InputMaybe<Scalars['bigint']['input']>;
  chainId?: InputMaybe<Scalars['bigint']['input']>;
  clientId?: InputMaybe<Scalars['uuid']['input']>;
  cluster?: InputMaybe<Scalars['String']['input']>;
  fee?: InputMaybe<Scalars['float8']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  hash?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  network?: InputMaybe<Scalars['String']['input']>;
  nonce?: InputMaybe<Scalars['Int']['input']>;
  postBalances?: InputMaybe<Scalars['jsonb']['input']>;
  preBalances?: InputMaybe<Scalars['jsonb']['input']>;
  recentBlockhash?: InputMaybe<Scalars['String']['input']>;
  signature?: InputMaybe<Scalars['jsonb']['input']>;
  slot?: InputMaybe<Scalars['bigint']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<Scalars['timestamptz']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Transactions_Sum_Fields = {
  __typename?: 'transactions_sum_fields';
  amount?: Maybe<Scalars['float8']['output']>;
  blockTime?: Maybe<Scalars['bigint']['output']>;
  chainId?: Maybe<Scalars['bigint']['output']>;
  fee?: Maybe<Scalars['float8']['output']>;
  nonce?: Maybe<Scalars['Int']['output']>;
  slot?: Maybe<Scalars['bigint']['output']>;
};

/** order by sum() on columns of table "transactions" */
export type Transactions_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  blockTime?: InputMaybe<Order_By>;
  chainId?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** update columns of table "transactions" */
export enum Transactions_Update_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  BlockTime = 'blockTime',
  /** column name */
  ChainId = 'chainId',
  /** column name */
  ClientId = 'clientId',
  /** column name */
  Cluster = 'cluster',
  /** column name */
  Fee = 'fee',
  /** column name */
  From = 'from',
  /** column name */
  Hash = 'hash',
  /** column name */
  Id = 'id',
  /** column name */
  Network = 'network',
  /** column name */
  Nonce = 'nonce',
  /** column name */
  PostBalances = 'postBalances',
  /** column name */
  PreBalances = 'preBalances',
  /** column name */
  RecentBlockhash = 'recentBlockhash',
  /** column name */
  Signature = 'signature',
  /** column name */
  Slot = 'slot',
  /** column name */
  Status = 'status',
  /** column name */
  Time = 'time',
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
  blockTime?: Maybe<Scalars['Float']['output']>;
  chainId?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  nonce?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "transactions" */
export type Transactions_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  blockTime?: InputMaybe<Order_By>;
  chainId?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Transactions_Var_Samp_Fields = {
  __typename?: 'transactions_var_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  blockTime?: Maybe<Scalars['Float']['output']>;
  chainId?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  nonce?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "transactions" */
export type Transactions_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  blockTime?: InputMaybe<Order_By>;
  chainId?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
  slot?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Transactions_Variance_Fields = {
  __typename?: 'transactions_variance_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  blockTime?: Maybe<Scalars['Float']['output']>;
  chainId?: Maybe<Scalars['Float']['output']>;
  fee?: Maybe<Scalars['Float']['output']>;
  nonce?: Maybe<Scalars['Float']['output']>;
  slot?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "transactions" */
export type Transactions_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  blockTime?: InputMaybe<Order_By>;
  chainId?: InputMaybe<Order_By>;
  fee?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
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

/** wallets info for clients */
export type Wallet = {
  __typename?: 'wallet';
  /** An array relationship */
  accounts: Array<Account>;
  /** An aggregate relationship */
  accounts_aggregate: Account_Aggregate;
  /** An object relationship */
  client: Client;
  clientId: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  secretPhase: Scalars['String']['output'];
};


/** wallets info for clients */
export type WalletAccountsArgs = {
  distinct_on?: InputMaybe<Array<Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Account_Order_By>>;
  where?: InputMaybe<Account_Bool_Exp>;
};


/** wallets info for clients */
export type WalletAccounts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Account_Order_By>>;
  where?: InputMaybe<Account_Bool_Exp>;
};

/** aggregated selection of "wallet" */
export type Wallet_Aggregate = {
  __typename?: 'wallet_aggregate';
  aggregate?: Maybe<Wallet_Aggregate_Fields>;
  nodes: Array<Wallet>;
};

export type Wallet_Aggregate_Bool_Exp = {
  count?: InputMaybe<Wallet_Aggregate_Bool_Exp_Count>;
};

export type Wallet_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Wallet_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Wallet_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "wallet" */
export type Wallet_Aggregate_Fields = {
  __typename?: 'wallet_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Wallet_Max_Fields>;
  min?: Maybe<Wallet_Min_Fields>;
};


/** aggregate fields of "wallet" */
export type Wallet_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Wallet_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "wallet" */
export type Wallet_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Wallet_Max_Order_By>;
  min?: InputMaybe<Wallet_Min_Order_By>;
};

/** input type for inserting array relation for remote table "wallet" */
export type Wallet_Arr_Rel_Insert_Input = {
  data: Array<Wallet_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Wallet_On_Conflict>;
};

/** Boolean expression to filter rows from the table "wallet". All fields are combined with a logical 'AND'. */
export type Wallet_Bool_Exp = {
  _and?: InputMaybe<Array<Wallet_Bool_Exp>>;
  _not?: InputMaybe<Wallet_Bool_Exp>;
  _or?: InputMaybe<Array<Wallet_Bool_Exp>>;
  accounts?: InputMaybe<Account_Bool_Exp>;
  accounts_aggregate?: InputMaybe<Account_Aggregate_Bool_Exp>;
  client?: InputMaybe<Client_Bool_Exp>;
  clientId?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  secretPhase?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "wallet" */
export enum Wallet_Constraint {
  /** unique or primary key constraint on columns "id" */
  WalletIdKey = 'wallet_id_key',
  /** unique or primary key constraint on columns "id" */
  WalletPkey = 'wallet_pkey',
  /** unique or primary key constraint on columns "secretPhase" */
  WalletSecretPhaseKey = 'wallet_secretPhase_key'
}

/** input type for inserting data into table "wallet" */
export type Wallet_Insert_Input = {
  accounts?: InputMaybe<Account_Arr_Rel_Insert_Input>;
  client?: InputMaybe<Client_Obj_Rel_Insert_Input>;
  clientId?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  secretPhase?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Wallet_Max_Fields = {
  __typename?: 'wallet_max_fields';
  clientId?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  secretPhase?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "wallet" */
export type Wallet_Max_Order_By = {
  clientId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  secretPhase?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Wallet_Min_Fields = {
  __typename?: 'wallet_min_fields';
  clientId?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  secretPhase?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "wallet" */
export type Wallet_Min_Order_By = {
  clientId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  secretPhase?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "wallet" */
export type Wallet_Mutation_Response = {
  __typename?: 'wallet_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Wallet>;
};

/** input type for inserting object relation for remote table "wallet" */
export type Wallet_Obj_Rel_Insert_Input = {
  data: Wallet_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Wallet_On_Conflict>;
};

/** on_conflict condition type for table "wallet" */
export type Wallet_On_Conflict = {
  constraint: Wallet_Constraint;
  update_columns?: Array<Wallet_Update_Column>;
  where?: InputMaybe<Wallet_Bool_Exp>;
};

/** Ordering options when selecting data from "wallet". */
export type Wallet_Order_By = {
  accounts_aggregate?: InputMaybe<Account_Aggregate_Order_By>;
  client?: InputMaybe<Client_Order_By>;
  clientId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  secretPhase?: InputMaybe<Order_By>;
};

/** primary key columns input for table: wallet */
export type Wallet_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "wallet" */
export enum Wallet_Select_Column {
  /** column name */
  ClientId = 'clientId',
  /** column name */
  Id = 'id',
  /** column name */
  SecretPhase = 'secretPhase'
}

/** input type for updating data in table "wallet" */
export type Wallet_Set_Input = {
  clientId?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  secretPhase?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "wallet" */
export type Wallet_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Wallet_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Wallet_Stream_Cursor_Value_Input = {
  clientId?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  secretPhase?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "wallet" */
export enum Wallet_Update_Column {
  /** column name */
  ClientId = 'clientId',
  /** column name */
  Id = 'id',
  /** column name */
  SecretPhase = 'secretPhase'
}

export type Wallet_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Wallet_Set_Input>;
  /** filter the rows which have to be updated */
  where: Wallet_Bool_Exp;
};
