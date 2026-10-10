import { GraphQLResolveInfo } from 'graphql';
import { AccountModel, PersonModel, CategoryModel, TransactionModel, AccountTotalsModel, UserModel, AuthPayloadModel } from './models.js';
import { GraphQLContext } from '../context.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Account = {
  __typename?: 'Account';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  people: Array<Person>;
  totals: AccountTotals;
  transactions: Array<Transaction>;
};


export type AccountTotalsArgs = {
  filter?: InputMaybe<TransactionFilter>;
};


export type AccountTransactionsArgs = {
  filter?: InputMaybe<TransactionFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type AccountTotals = {
  __typename?: 'AccountTotals';
  net: Scalars['Float']['output'];
  totalCredits: Scalars['Float']['output'];
  totalDebits: Scalars['Float']['output'];
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  user: User;
};

export type CreateAccountInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  personIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type CreateCategoryInput = {
  name: Scalars['String']['input'];
};

export type CreatePersonInput = {
  name: Scalars['String']['input'];
};

export type CreateTransactionInput = {
  accountId: Scalars['ID']['input'];
  amount: Scalars['Float']['input'];
  categoryId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  occurredOn?: InputMaybe<Scalars['String']['input']>;
  personId: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAccount: Account;
  createPerson: Person;
  createTransaction: Transaction;
  createTransactionCategory: TransactionCategory;
  deleteAccount: Scalars['Boolean']['output'];
  deletePerson: Scalars['Boolean']['output'];
  deleteTransaction: Scalars['Boolean']['output'];
  deleteTransactionCategory: Scalars['Boolean']['output'];
  signIn: AuthPayload;
  signOut: Scalars['Boolean']['output'];
  signup: AuthPayload;
  updateAccount: Account;
  updatePerson: Person;
  updateTransaction: Transaction;
  updateTransactionCategory: TransactionCategory;
};


export type MutationCreateAccountArgs = {
  input: CreateAccountInput;
};


export type MutationCreatePersonArgs = {
  input: CreatePersonInput;
};


export type MutationCreateTransactionArgs = {
  input: CreateTransactionInput;
};


export type MutationCreateTransactionCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationDeleteAccountArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePersonArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTransactionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTransactionCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSignInArgs = {
  input: SignInInput;
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUpdateAccountArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAccountInput;
};


export type MutationUpdatePersonArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePersonInput;
};


export type MutationUpdateTransactionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTransactionInput;
};


export type MutationUpdateTransactionCategoryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCategoryInput;
};

export type Person = {
  __typename?: 'Person';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  accounts: Array<Account>;
  me?: Maybe<User>;
  people: Array<Person>;
  transactionCategories: Array<TransactionCategory>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryAccountArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type SignInInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SignupInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Transaction = {
  __typename?: 'Transaction';
  account: Account;
  amount: Scalars['Float']['output'];
  category: TransactionCategory;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  occurredOn: Scalars['String']['output'];
  person: Person;
};

export type TransactionCategory = {
  __typename?: 'TransactionCategory';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type TransactionFilter = {
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  personIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type UpdateAccountInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  personIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type UpdateCategoryInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePersonInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTransactionInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  occurredOn?: InputMaybe<Scalars['String']['input']>;
  personId?: InputMaybe<Scalars['ID']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Account: ResolverTypeWrapper<AccountModel>;
  AccountTotals: ResolverTypeWrapper<AccountTotalsModel>;
  AuthPayload: ResolverTypeWrapper<AuthPayloadModel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreateAccountInput: CreateAccountInput;
  CreateCategoryInput: CreateCategoryInput;
  CreatePersonInput: CreatePersonInput;
  CreateTransactionInput: CreateTransactionInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Person: ResolverTypeWrapper<PersonModel>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  SignInInput: SignInInput;
  SignupInput: SignupInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Transaction: ResolverTypeWrapper<TransactionModel>;
  TransactionCategory: ResolverTypeWrapper<CategoryModel>;
  TransactionFilter: TransactionFilter;
  UpdateAccountInput: UpdateAccountInput;
  UpdateCategoryInput: UpdateCategoryInput;
  UpdatePersonInput: UpdatePersonInput;
  UpdateTransactionInput: UpdateTransactionInput;
  User: ResolverTypeWrapper<UserModel>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Account: AccountModel;
  AccountTotals: AccountTotalsModel;
  AuthPayload: AuthPayloadModel;
  Boolean: Scalars['Boolean']['output'];
  CreateAccountInput: CreateAccountInput;
  CreateCategoryInput: CreateCategoryInput;
  CreatePersonInput: CreatePersonInput;
  CreateTransactionInput: CreateTransactionInput;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  Person: PersonModel;
  Query: Record<PropertyKey, never>;
  SignInInput: SignInInput;
  SignupInput: SignupInput;
  String: Scalars['String']['output'];
  Transaction: TransactionModel;
  TransactionCategory: CategoryModel;
  TransactionFilter: TransactionFilter;
  UpdateAccountInput: UpdateAccountInput;
  UpdateCategoryInput: UpdateCategoryInput;
  UpdatePersonInput: UpdatePersonInput;
  UpdateTransactionInput: UpdateTransactionInput;
  User: UserModel;
}>;

export type AccountResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType>;
  totals?: Resolver<ResolversTypes['AccountTotals'], ParentType, ContextType, Partial<AccountTotalsArgs>>;
  transactions?: Resolver<Array<ResolversTypes['Transaction']>, ParentType, ContextType, Partial<AccountTransactionsArgs>>;
}>;

export type AccountTotalsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AccountTotals'] = ResolversParentTypes['AccountTotals']> = ResolversObject<{
  net?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalCredits?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalDebits?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
}>;

export type AuthPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createAccount?: Resolver<ResolversTypes['Account'], ParentType, ContextType, RequireFields<MutationCreateAccountArgs, 'input'>>;
  createPerson?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<MutationCreatePersonArgs, 'input'>>;
  createTransaction?: Resolver<ResolversTypes['Transaction'], ParentType, ContextType, RequireFields<MutationCreateTransactionArgs, 'input'>>;
  createTransactionCategory?: Resolver<ResolversTypes['TransactionCategory'], ParentType, ContextType, RequireFields<MutationCreateTransactionCategoryArgs, 'input'>>;
  deleteAccount?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteAccountArgs, 'id'>>;
  deletePerson?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeletePersonArgs, 'id'>>;
  deleteTransaction?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTransactionArgs, 'id'>>;
  deleteTransactionCategory?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTransactionCategoryArgs, 'id'>>;
  signIn?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationSignInArgs, 'input'>>;
  signOut?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  signup?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationSignupArgs, 'input'>>;
  updateAccount?: Resolver<ResolversTypes['Account'], ParentType, ContextType, RequireFields<MutationUpdateAccountArgs, 'id' | 'input'>>;
  updatePerson?: Resolver<ResolversTypes['Person'], ParentType, ContextType, RequireFields<MutationUpdatePersonArgs, 'id' | 'input'>>;
  updateTransaction?: Resolver<ResolversTypes['Transaction'], ParentType, ContextType, RequireFields<MutationUpdateTransactionArgs, 'id' | 'input'>>;
  updateTransactionCategory?: Resolver<ResolversTypes['TransactionCategory'], ParentType, ContextType, RequireFields<MutationUpdateTransactionCategoryArgs, 'id' | 'input'>>;
}>;

export type PersonResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  account?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryAccountArgs, 'id'>>;
  accounts?: Resolver<Array<ResolversTypes['Account']>, ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType>;
  transactionCategories?: Resolver<Array<ResolversTypes['TransactionCategory']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type TransactionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction']> = ResolversObject<{
  account?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['TransactionCategory'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  occurredOn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  person?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
}>;

export type TransactionCategoryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TransactionCategory'] = ResolversParentTypes['TransactionCategory']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  Account?: AccountResolvers<ContextType>;
  AccountTotals?: AccountTotalsResolvers<ContextType>;
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  TransactionCategory?: TransactionCategoryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

