/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateAccountInput = {
  description?: string | null | undefined;
  name: string;
  personIds?: Array<string | number> | null | undefined;
};

export type CreateCategoryInput = {
  name: string;
};

export type CreatePersonInput = {
  name: string;
};

export type CreateScenarioEventInput = {
  amount: number;
  categoryId: string | number;
  description?: string | null | undefined;
  endDate?: string | null | undefined;
  personId: string | number;
  recurrenceInterval?: number | null | undefined;
  recurrenceUnit?: RecurrenceUnit | null | undefined;
  scenarioId: string | number;
  startDate: string;
};

export type CreateScenarioInput = {
  accountId: string | number;
  endDate: string;
  name: string;
  startDate: string;
};

export type CreateTransactionInput = {
  accountId: string | number;
  amount: number;
  categoryId: string | number;
  description?: string | null | undefined;
  occurredOn?: string | null | undefined;
  personId: string | number;
};

/**
 * How often a scenario event repeats. Mirrored by a CHECK constraint on
 * scenario_events.recurrence_unit and the union type in src/lib/recurrence.ts.
 */
export type RecurrenceUnit =
  | 'DAY'
  | 'MONTH'
  | 'WEEK'
  | 'YEAR';

export type SignInInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  email: string;
  password: string;
};

export type TransactionFilter = {
  categoryIds?: Array<string | number> | null | undefined;
  personIds?: Array<string | number> | null | undefined;
};

export type UpdateAccountInput = {
  description?: string | null | undefined;
  name?: string | null | undefined;
  personIds?: Array<string | number> | null | undefined;
};

export type UpdateCategoryInput = {
  name?: string | null | undefined;
};

export type UpdatePersonInput = {
  name?: string | null | undefined;
};

/**
 * Omitting a field leaves it unchanged; passing null clears it. That distinction
 * matters for endDate and the recurrence pair, since clearing both recurrence
 * fields is how a repeating event becomes a one-time one.
 */
export type UpdateScenarioEventInput = {
  amount?: number | null | undefined;
  categoryId?: string | number | null | undefined;
  description?: string | null | undefined;
  endDate?: string | null | undefined;
  personId?: string | number | null | undefined;
  recurrenceInterval?: number | null | undefined;
  recurrenceUnit?: RecurrenceUnit | null | undefined;
  startDate?: string | null | undefined;
};

export type UpdateScenarioInput = {
  endDate?: string | null | undefined;
  name?: string | null | undefined;
  startDate?: string | null | undefined;
};

export type UpdateTransactionInput = {
  amount?: number | null | undefined;
  categoryId?: string | number | null | undefined;
  description?: string | null | undefined;
  occurredOn?: string | null | undefined;
  personId?: string | number | null | undefined;
};

export type GetAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAccountsQuery = { accounts: Array<{ id: string, name: string, description: string | null, createdAt: string, people: Array<{ id: string, name: string, createdAt: string }> }> };

export type GetAccountDetailQueryVariables = Exact<{
  id: string | number;
  filter?: TransactionFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
}>;


export type GetAccountDetailQuery = { account: { id: string, name: string, description: string | null, createdAt: string, transactions: Array<{ id: string, amount: number, description: string | null, occurredOn: string, createdAt: string, person: { id: string, name: string, createdAt: string }, category: { id: string, name: string, createdAt: string } }>, totals: { totalCredits: number, totalDebits: number, net: number }, people: Array<{ id: string, name: string, createdAt: string }> } | null };

export type CreateAccountMutationVariables = Exact<{
  input: CreateAccountInput;
}>;


export type CreateAccountMutation = { createAccount: { id: string, name: string, description: string | null, createdAt: string, people: Array<{ id: string, name: string, createdAt: string }> } };

export type UpdateAccountMutationVariables = Exact<{
  id: string | number;
  input: UpdateAccountInput;
}>;


export type UpdateAccountMutation = { updateAccount: { id: string, name: string, description: string | null, createdAt: string, people: Array<{ id: string, name: string, createdAt: string }> } };

export type DeleteAccountMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteAccountMutation = { deleteAccount: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, email: string } | null };

export type SignInMutationVariables = Exact<{
  input: SignInInput;
}>;


export type SignInMutation = { signIn: { user: { id: string, email: string } } };

export type SignupMutationVariables = Exact<{
  input: SignupInput;
}>;


export type SignupMutation = { signup: { user: { id: string, email: string } } };

export type SignOutMutationVariables = Exact<{ [key: string]: never; }>;


export type SignOutMutation = { signOut: boolean };

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { transactionCategories: Array<{ id: string, name: string, createdAt: string }> };

export type CreateCategoryMutationVariables = Exact<{
  input: CreateCategoryInput;
}>;


export type CreateCategoryMutation = { createTransactionCategory: { id: string, name: string, createdAt: string } };

export type UpdateCategoryMutationVariables = Exact<{
  id: string | number;
  input: UpdateCategoryInput;
}>;


export type UpdateCategoryMutation = { updateTransactionCategory: { id: string, name: string, createdAt: string } };

export type DeleteCategoryMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteCategoryMutation = { deleteTransactionCategory: boolean };

export type UserFieldsFragment = { id: string, email: string };

export type PersonFieldsFragment = { id: string, name: string, createdAt: string };

export type CategoryFieldsFragment = { id: string, name: string, createdAt: string };

export type TotalsFieldsFragment = { totalCredits: number, totalDebits: number, net: number };

export type AccountFieldsFragment = { id: string, name: string, description: string | null, createdAt: string, people: Array<{ id: string, name: string, createdAt: string }> };

export type TransactionFieldsFragment = { id: string, amount: number, description: string | null, occurredOn: string, createdAt: string, person: { id: string, name: string, createdAt: string }, category: { id: string, name: string, createdAt: string } };

export type ScenarioFieldsFragment = { id: string, name: string, startDate: string, endDate: string, createdAt: string };

export type ScenarioEventFieldsFragment = { id: string, amount: number, description: string | null, startDate: string, endDate: string | null, recurrenceInterval: number | null, recurrenceUnit: RecurrenceUnit | null, createdAt: string, person: { id: string, name: string, createdAt: string }, category: { id: string, name: string, createdAt: string } };

export type GridDataFieldsFragment = { columnTotals: Array<number>, grandTotal: number, rows: Array<{ total: number, person: { id: string, name: string, createdAt: string }, cells: Array<{ categoryId: string, amount: number }> }> };

export type ScenarioGridFieldsFragment = { people: Array<{ id: string, name: string, createdAt: string }>, categories: Array<{ id: string, name: string, createdAt: string }>, baseline: { columnTotals: Array<number>, grandTotal: number, rows: Array<{ total: number, person: { id: string, name: string, createdAt: string }, cells: Array<{ categoryId: string, amount: number }> }> }, projected: { columnTotals: Array<number>, grandTotal: number, rows: Array<{ total: number, person: { id: string, name: string, createdAt: string }, cells: Array<{ categoryId: string, amount: number }> }> } };

export type GetPeopleQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPeopleQuery = { people: Array<{ id: string, name: string, createdAt: string }> };

export type CreatePersonMutationVariables = Exact<{
  input: CreatePersonInput;
}>;


export type CreatePersonMutation = { createPerson: { id: string, name: string, createdAt: string } };

export type UpdatePersonMutationVariables = Exact<{
  id: string | number;
  input: UpdatePersonInput;
}>;


export type UpdatePersonMutation = { updatePerson: { id: string, name: string, createdAt: string } };

export type DeletePersonMutationVariables = Exact<{
  id: string | number;
}>;


export type DeletePersonMutation = { deletePerson: boolean };

export type GetScenariosQueryVariables = Exact<{
  accountId: string | number;
}>;


export type GetScenariosQuery = { scenarios: Array<{ id: string, name: string, startDate: string, endDate: string, createdAt: string }> };

export type GetScenarioDetailQueryVariables = Exact<{
  id: string | number;
  filter?: TransactionFilter | null | undefined;
}>;


export type GetScenarioDetailQuery = { scenario: { id: string, name: string, startDate: string, endDate: string, createdAt: string, account: { id: string, name: string }, events: Array<{ id: string, amount: number, description: string | null, startDate: string, endDate: string | null, recurrenceInterval: number | null, recurrenceUnit: RecurrenceUnit | null, createdAt: string, person: { id: string, name: string, createdAt: string }, category: { id: string, name: string, createdAt: string } }>, grid: { people: Array<{ id: string, name: string, createdAt: string }>, categories: Array<{ id: string, name: string, createdAt: string }>, baseline: { columnTotals: Array<number>, grandTotal: number, rows: Array<{ total: number, person: { id: string, name: string, createdAt: string }, cells: Array<{ categoryId: string, amount: number }> }> }, projected: { columnTotals: Array<number>, grandTotal: number, rows: Array<{ total: number, person: { id: string, name: string, createdAt: string }, cells: Array<{ categoryId: string, amount: number }> }> } } } | null };

export type CreateScenarioMutationVariables = Exact<{
  input: CreateScenarioInput;
}>;


export type CreateScenarioMutation = { createScenario: { id: string, name: string, startDate: string, endDate: string, createdAt: string } };

export type UpdateScenarioMutationVariables = Exact<{
  id: string | number;
  input: UpdateScenarioInput;
}>;


export type UpdateScenarioMutation = { updateScenario: { id: string, name: string, startDate: string, endDate: string, createdAt: string } };

export type DeleteScenarioMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteScenarioMutation = { deleteScenario: boolean };

export type CreateScenarioEventMutationVariables = Exact<{
  input: CreateScenarioEventInput;
}>;


export type CreateScenarioEventMutation = { createScenarioEvent: { id: string, amount: number, description: string | null, startDate: string, endDate: string | null, recurrenceInterval: number | null, recurrenceUnit: RecurrenceUnit | null, createdAt: string, person: { id: string, name: string, createdAt: string }, category: { id: string, name: string, createdAt: string } } };

export type UpdateScenarioEventMutationVariables = Exact<{
  id: string | number;
  input: UpdateScenarioEventInput;
}>;


export type UpdateScenarioEventMutation = { updateScenarioEvent: { id: string, amount: number, description: string | null, startDate: string, endDate: string | null, recurrenceInterval: number | null, recurrenceUnit: RecurrenceUnit | null, createdAt: string, person: { id: string, name: string, createdAt: string }, category: { id: string, name: string, createdAt: string } } };

export type DeleteScenarioEventMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteScenarioEventMutation = { deleteScenarioEvent: boolean };

export type CreateTransactionMutationVariables = Exact<{
  input: CreateTransactionInput;
}>;


export type CreateTransactionMutation = { createTransaction: { id: string, amount: number, description: string | null, occurredOn: string, createdAt: string, person: { id: string, name: string, createdAt: string }, category: { id: string, name: string, createdAt: string } } };

export type UpdateTransactionMutationVariables = Exact<{
  id: string | number;
  input: UpdateTransactionInput;
}>;


export type UpdateTransactionMutation = { updateTransaction: { id: string, amount: number, description: string | null, occurredOn: string, createdAt: string, person: { id: string, name: string, createdAt: string }, category: { id: string, name: string, createdAt: string } } };

export type DeleteTransactionMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteTransactionMutation = { deleteTransaction: boolean };

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = { users: Array<{ id: string, email: string }> };

export const UserFieldsFragmentDoc = gql`
    fragment UserFields on User {
  id
  email
}
    `;
export const TotalsFieldsFragmentDoc = gql`
    fragment TotalsFields on AccountTotals {
  totalCredits
  totalDebits
  net
}
    `;
export const PersonFieldsFragmentDoc = gql`
    fragment PersonFields on Person {
  id
  name
  createdAt
}
    `;
export const AccountFieldsFragmentDoc = gql`
    fragment AccountFields on Account {
  id
  name
  description
  createdAt
  people {
    ...PersonFields
  }
}
    ${PersonFieldsFragmentDoc}`;
export const CategoryFieldsFragmentDoc = gql`
    fragment CategoryFields on TransactionCategory {
  id
  name
  createdAt
}
    `;
export const TransactionFieldsFragmentDoc = gql`
    fragment TransactionFields on Transaction {
  id
  amount
  description
  occurredOn
  createdAt
  person {
    ...PersonFields
  }
  category {
    ...CategoryFields
  }
}
    ${PersonFieldsFragmentDoc}
${CategoryFieldsFragmentDoc}`;
export const ScenarioFieldsFragmentDoc = gql`
    fragment ScenarioFields on Scenario {
  id
  name
  startDate
  endDate
  createdAt
}
    `;
export const ScenarioEventFieldsFragmentDoc = gql`
    fragment ScenarioEventFields on ScenarioEvent {
  id
  amount
  description
  startDate
  endDate
  recurrenceInterval
  recurrenceUnit
  createdAt
  person {
    ...PersonFields
  }
  category {
    ...CategoryFields
  }
}
    ${PersonFieldsFragmentDoc}
${CategoryFieldsFragmentDoc}`;
export const GridDataFieldsFragmentDoc = gql`
    fragment GridDataFields on GridData {
  rows {
    person {
      ...PersonFields
    }
    cells {
      categoryId
      amount
    }
    total
  }
  columnTotals
  grandTotal
}
    ${PersonFieldsFragmentDoc}`;
export const ScenarioGridFieldsFragmentDoc = gql`
    fragment ScenarioGridFields on ScenarioGrid {
  people {
    ...PersonFields
  }
  categories {
    ...CategoryFields
  }
  baseline {
    ...GridDataFields
  }
  projected {
    ...GridDataFields
  }
}
    ${PersonFieldsFragmentDoc}
${CategoryFieldsFragmentDoc}
${GridDataFieldsFragmentDoc}`;
export const GetAccountsDocument = gql`
    query GetAccounts {
  accounts {
    ...AccountFields
  }
}
    ${AccountFieldsFragmentDoc}`;

/**
 * __useGetAccountsQuery__
 *
 * To run a query within a React component, call `useGetAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAccountsQuery(baseOptions?: Apollo.QueryHookOptions<GetAccountsQuery, GetAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAccountsQuery, GetAccountsQueryVariables>(GetAccountsDocument, options);
      }
export function useGetAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAccountsQuery, GetAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAccountsQuery, GetAccountsQueryVariables>(GetAccountsDocument, options);
        }
// @ts-ignore
export function useGetAccountsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAccountsQuery, GetAccountsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAccountsQuery, GetAccountsQueryVariables>;
export function useGetAccountsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAccountsQuery, GetAccountsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAccountsQuery | undefined, GetAccountsQueryVariables>;
export function useGetAccountsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAccountsQuery, GetAccountsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAccountsQuery, GetAccountsQueryVariables>(GetAccountsDocument, options);
        }
export type GetAccountsQueryHookResult = ReturnType<typeof useGetAccountsQuery>;
export type GetAccountsLazyQueryHookResult = ReturnType<typeof useGetAccountsLazyQuery>;
export type GetAccountsSuspenseQueryHookResult = ReturnType<typeof useGetAccountsSuspenseQuery>;
export type GetAccountsQueryResult = Apollo.QueryResult<GetAccountsQuery, GetAccountsQueryVariables>;
export const GetAccountDetailDocument = gql`
    query GetAccountDetail($id: ID!, $filter: TransactionFilter, $limit: Int, $offset: Int) {
  account(id: $id) {
    ...AccountFields
    transactions(filter: $filter, limit: $limit, offset: $offset) {
      ...TransactionFields
    }
    totals(filter: $filter) {
      ...TotalsFields
    }
  }
}
    ${AccountFieldsFragmentDoc}
${TransactionFieldsFragmentDoc}
${TotalsFieldsFragmentDoc}`;

/**
 * __useGetAccountDetailQuery__
 *
 * To run a query within a React component, call `useGetAccountDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAccountDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAccountDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *      filter: // value for 'filter'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetAccountDetailQuery(baseOptions: Apollo.QueryHookOptions<GetAccountDetailQuery, GetAccountDetailQueryVariables> & ({ variables: GetAccountDetailQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAccountDetailQuery, GetAccountDetailQueryVariables>(GetAccountDetailDocument, options);
      }
export function useGetAccountDetailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAccountDetailQuery, GetAccountDetailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAccountDetailQuery, GetAccountDetailQueryVariables>(GetAccountDetailDocument, options);
        }
// @ts-ignore
export function useGetAccountDetailSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAccountDetailQuery, GetAccountDetailQueryVariables>): Apollo.UseSuspenseQueryResult<GetAccountDetailQuery, GetAccountDetailQueryVariables>;
export function useGetAccountDetailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAccountDetailQuery, GetAccountDetailQueryVariables>): Apollo.UseSuspenseQueryResult<GetAccountDetailQuery | undefined, GetAccountDetailQueryVariables>;
export function useGetAccountDetailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAccountDetailQuery, GetAccountDetailQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAccountDetailQuery, GetAccountDetailQueryVariables>(GetAccountDetailDocument, options);
        }
export type GetAccountDetailQueryHookResult = ReturnType<typeof useGetAccountDetailQuery>;
export type GetAccountDetailLazyQueryHookResult = ReturnType<typeof useGetAccountDetailLazyQuery>;
export type GetAccountDetailSuspenseQueryHookResult = ReturnType<typeof useGetAccountDetailSuspenseQuery>;
export type GetAccountDetailQueryResult = Apollo.QueryResult<GetAccountDetailQuery, GetAccountDetailQueryVariables>;
export const CreateAccountDocument = gql`
    mutation CreateAccount($input: CreateAccountInput!) {
  createAccount(input: $input) {
    ...AccountFields
  }
}
    ${AccountFieldsFragmentDoc}`;
export type CreateAccountMutationFn = Apollo.MutationFunction<CreateAccountMutation, CreateAccountMutationVariables>;

/**
 * __useCreateAccountMutation__
 *
 * To run a mutation, you first call `useCreateAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAccountMutation, { data, loading, error }] = useCreateAccountMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateAccountMutation(baseOptions?: Apollo.MutationHookOptions<CreateAccountMutation, CreateAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateAccountMutation, CreateAccountMutationVariables>(CreateAccountDocument, options);
      }
export type CreateAccountMutationHookResult = ReturnType<typeof useCreateAccountMutation>;
export type CreateAccountMutationResult = Apollo.MutationResult<CreateAccountMutation>;
export type CreateAccountMutationOptions = Apollo.BaseMutationOptions<CreateAccountMutation, CreateAccountMutationVariables>;
export const UpdateAccountDocument = gql`
    mutation UpdateAccount($id: ID!, $input: UpdateAccountInput!) {
  updateAccount(id: $id, input: $input) {
    ...AccountFields
  }
}
    ${AccountFieldsFragmentDoc}`;
export type UpdateAccountMutationFn = Apollo.MutationFunction<UpdateAccountMutation, UpdateAccountMutationVariables>;

/**
 * __useUpdateAccountMutation__
 *
 * To run a mutation, you first call `useUpdateAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAccountMutation, { data, loading, error }] = useUpdateAccountMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateAccountMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAccountMutation, UpdateAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAccountMutation, UpdateAccountMutationVariables>(UpdateAccountDocument, options);
      }
export type UpdateAccountMutationHookResult = ReturnType<typeof useUpdateAccountMutation>;
export type UpdateAccountMutationResult = Apollo.MutationResult<UpdateAccountMutation>;
export type UpdateAccountMutationOptions = Apollo.BaseMutationOptions<UpdateAccountMutation, UpdateAccountMutationVariables>;
export const DeleteAccountDocument = gql`
    mutation DeleteAccount($id: ID!) {
  deleteAccount(id: $id)
}
    `;
export type DeleteAccountMutationFn = Apollo.MutationFunction<DeleteAccountMutation, DeleteAccountMutationVariables>;

/**
 * __useDeleteAccountMutation__
 *
 * To run a mutation, you first call `useDeleteAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAccountMutation, { data, loading, error }] = useDeleteAccountMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteAccountMutation(baseOptions?: Apollo.MutationHookOptions<DeleteAccountMutation, DeleteAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteAccountMutation, DeleteAccountMutationVariables>(DeleteAccountDocument, options);
      }
export type DeleteAccountMutationHookResult = ReturnType<typeof useDeleteAccountMutation>;
export type DeleteAccountMutationResult = Apollo.MutationResult<DeleteAccountMutation>;
export type DeleteAccountMutationOptions = Apollo.BaseMutationOptions<DeleteAccountMutation, DeleteAccountMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    email
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
// @ts-ignore
export function useMeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery | undefined, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const SignInDocument = gql`
    mutation SignIn($input: SignInInput!) {
  signIn(input: $input) {
    user {
      id
      email
    }
  }
}
    `;
export type SignInMutationFn = Apollo.MutationFunction<SignInMutation, SignInMutationVariables>;

/**
 * __useSignInMutation__
 *
 * To run a mutation, you first call `useSignInMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignInMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signInMutation, { data, loading, error }] = useSignInMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSignInMutation(baseOptions?: Apollo.MutationHookOptions<SignInMutation, SignInMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignInMutation, SignInMutationVariables>(SignInDocument, options);
      }
export type SignInMutationHookResult = ReturnType<typeof useSignInMutation>;
export type SignInMutationResult = Apollo.MutationResult<SignInMutation>;
export type SignInMutationOptions = Apollo.BaseMutationOptions<SignInMutation, SignInMutationVariables>;
export const SignupDocument = gql`
    mutation Signup($input: SignupInput!) {
  signup(input: $input) {
    user {
      id
      email
    }
  }
}
    `;
export type SignupMutationFn = Apollo.MutationFunction<SignupMutation, SignupMutationVariables>;

/**
 * __useSignupMutation__
 *
 * To run a mutation, you first call `useSignupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupMutation, { data, loading, error }] = useSignupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSignupMutation(baseOptions?: Apollo.MutationHookOptions<SignupMutation, SignupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignupMutation, SignupMutationVariables>(SignupDocument, options);
      }
export type SignupMutationHookResult = ReturnType<typeof useSignupMutation>;
export type SignupMutationResult = Apollo.MutationResult<SignupMutation>;
export type SignupMutationOptions = Apollo.BaseMutationOptions<SignupMutation, SignupMutationVariables>;
export const SignOutDocument = gql`
    mutation SignOut {
  signOut
}
    `;
export type SignOutMutationFn = Apollo.MutationFunction<SignOutMutation, SignOutMutationVariables>;

/**
 * __useSignOutMutation__
 *
 * To run a mutation, you first call `useSignOutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignOutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signOutMutation, { data, loading, error }] = useSignOutMutation({
 *   variables: {
 *   },
 * });
 */
export function useSignOutMutation(baseOptions?: Apollo.MutationHookOptions<SignOutMutation, SignOutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignOutMutation, SignOutMutationVariables>(SignOutDocument, options);
      }
export type SignOutMutationHookResult = ReturnType<typeof useSignOutMutation>;
export type SignOutMutationResult = Apollo.MutationResult<SignOutMutation>;
export type SignOutMutationOptions = Apollo.BaseMutationOptions<SignOutMutation, SignOutMutationVariables>;
export const GetCategoriesDocument = gql`
    query GetCategories {
  transactionCategories {
    ...CategoryFields
  }
}
    ${CategoryFieldsFragmentDoc}`;

/**
 * __useGetCategoriesQuery__
 *
 * To run a query within a React component, call `useGetCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCategoriesQuery(baseOptions?: Apollo.QueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
      }
export function useGetCategoriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
        }
// @ts-ignore
export function useGetCategoriesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<GetCategoriesQuery, GetCategoriesQueryVariables>;
export function useGetCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<GetCategoriesQuery | undefined, GetCategoriesQueryVariables>;
export function useGetCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
        }
export type GetCategoriesQueryHookResult = ReturnType<typeof useGetCategoriesQuery>;
export type GetCategoriesLazyQueryHookResult = ReturnType<typeof useGetCategoriesLazyQuery>;
export type GetCategoriesSuspenseQueryHookResult = ReturnType<typeof useGetCategoriesSuspenseQuery>;
export type GetCategoriesQueryResult = Apollo.QueryResult<GetCategoriesQuery, GetCategoriesQueryVariables>;
export const CreateCategoryDocument = gql`
    mutation CreateCategory($input: CreateCategoryInput!) {
  createTransactionCategory(input: $input) {
    ...CategoryFields
  }
}
    ${CategoryFieldsFragmentDoc}`;
export type CreateCategoryMutationFn = Apollo.MutationFunction<CreateCategoryMutation, CreateCategoryMutationVariables>;

/**
 * __useCreateCategoryMutation__
 *
 * To run a mutation, you first call `useCreateCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCategoryMutation, { data, loading, error }] = useCreateCategoryMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCategoryMutation(baseOptions?: Apollo.MutationHookOptions<CreateCategoryMutation, CreateCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCategoryMutation, CreateCategoryMutationVariables>(CreateCategoryDocument, options);
      }
export type CreateCategoryMutationHookResult = ReturnType<typeof useCreateCategoryMutation>;
export type CreateCategoryMutationResult = Apollo.MutationResult<CreateCategoryMutation>;
export type CreateCategoryMutationOptions = Apollo.BaseMutationOptions<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const UpdateCategoryDocument = gql`
    mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
  updateTransactionCategory(id: $id, input: $input) {
    ...CategoryFields
  }
}
    ${CategoryFieldsFragmentDoc}`;
export type UpdateCategoryMutationFn = Apollo.MutationFunction<UpdateCategoryMutation, UpdateCategoryMutationVariables>;

/**
 * __useUpdateCategoryMutation__
 *
 * To run a mutation, you first call `useUpdateCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCategoryMutation, { data, loading, error }] = useUpdateCategoryMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCategoryMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCategoryMutation, UpdateCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCategoryMutation, UpdateCategoryMutationVariables>(UpdateCategoryDocument, options);
      }
export type UpdateCategoryMutationHookResult = ReturnType<typeof useUpdateCategoryMutation>;
export type UpdateCategoryMutationResult = Apollo.MutationResult<UpdateCategoryMutation>;
export type UpdateCategoryMutationOptions = Apollo.BaseMutationOptions<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const DeleteCategoryDocument = gql`
    mutation DeleteCategory($id: ID!) {
  deleteTransactionCategory(id: $id)
}
    `;
export type DeleteCategoryMutationFn = Apollo.MutationFunction<DeleteCategoryMutation, DeleteCategoryMutationVariables>;

/**
 * __useDeleteCategoryMutation__
 *
 * To run a mutation, you first call `useDeleteCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCategoryMutation, { data, loading, error }] = useDeleteCategoryMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCategoryMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCategoryMutation, DeleteCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCategoryMutation, DeleteCategoryMutationVariables>(DeleteCategoryDocument, options);
      }
export type DeleteCategoryMutationHookResult = ReturnType<typeof useDeleteCategoryMutation>;
export type DeleteCategoryMutationResult = Apollo.MutationResult<DeleteCategoryMutation>;
export type DeleteCategoryMutationOptions = Apollo.BaseMutationOptions<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const GetPeopleDocument = gql`
    query GetPeople {
  people {
    ...PersonFields
  }
}
    ${PersonFieldsFragmentDoc}`;

/**
 * __useGetPeopleQuery__
 *
 * To run a query within a React component, call `useGetPeopleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPeopleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPeopleQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPeopleQuery(baseOptions?: Apollo.QueryHookOptions<GetPeopleQuery, GetPeopleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPeopleQuery, GetPeopleQueryVariables>(GetPeopleDocument, options);
      }
export function useGetPeopleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPeopleQuery, GetPeopleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPeopleQuery, GetPeopleQueryVariables>(GetPeopleDocument, options);
        }
// @ts-ignore
export function useGetPeopleSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPeopleQuery, GetPeopleQueryVariables>): Apollo.UseSuspenseQueryResult<GetPeopleQuery, GetPeopleQueryVariables>;
export function useGetPeopleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPeopleQuery, GetPeopleQueryVariables>): Apollo.UseSuspenseQueryResult<GetPeopleQuery | undefined, GetPeopleQueryVariables>;
export function useGetPeopleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPeopleQuery, GetPeopleQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPeopleQuery, GetPeopleQueryVariables>(GetPeopleDocument, options);
        }
export type GetPeopleQueryHookResult = ReturnType<typeof useGetPeopleQuery>;
export type GetPeopleLazyQueryHookResult = ReturnType<typeof useGetPeopleLazyQuery>;
export type GetPeopleSuspenseQueryHookResult = ReturnType<typeof useGetPeopleSuspenseQuery>;
export type GetPeopleQueryResult = Apollo.QueryResult<GetPeopleQuery, GetPeopleQueryVariables>;
export const CreatePersonDocument = gql`
    mutation CreatePerson($input: CreatePersonInput!) {
  createPerson(input: $input) {
    ...PersonFields
  }
}
    ${PersonFieldsFragmentDoc}`;
export type CreatePersonMutationFn = Apollo.MutationFunction<CreatePersonMutation, CreatePersonMutationVariables>;

/**
 * __useCreatePersonMutation__
 *
 * To run a mutation, you first call `useCreatePersonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePersonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPersonMutation, { data, loading, error }] = useCreatePersonMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreatePersonMutation(baseOptions?: Apollo.MutationHookOptions<CreatePersonMutation, CreatePersonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePersonMutation, CreatePersonMutationVariables>(CreatePersonDocument, options);
      }
export type CreatePersonMutationHookResult = ReturnType<typeof useCreatePersonMutation>;
export type CreatePersonMutationResult = Apollo.MutationResult<CreatePersonMutation>;
export type CreatePersonMutationOptions = Apollo.BaseMutationOptions<CreatePersonMutation, CreatePersonMutationVariables>;
export const UpdatePersonDocument = gql`
    mutation UpdatePerson($id: ID!, $input: UpdatePersonInput!) {
  updatePerson(id: $id, input: $input) {
    ...PersonFields
  }
}
    ${PersonFieldsFragmentDoc}`;
export type UpdatePersonMutationFn = Apollo.MutationFunction<UpdatePersonMutation, UpdatePersonMutationVariables>;

/**
 * __useUpdatePersonMutation__
 *
 * To run a mutation, you first call `useUpdatePersonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePersonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePersonMutation, { data, loading, error }] = useUpdatePersonMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePersonMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePersonMutation, UpdatePersonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePersonMutation, UpdatePersonMutationVariables>(UpdatePersonDocument, options);
      }
export type UpdatePersonMutationHookResult = ReturnType<typeof useUpdatePersonMutation>;
export type UpdatePersonMutationResult = Apollo.MutationResult<UpdatePersonMutation>;
export type UpdatePersonMutationOptions = Apollo.BaseMutationOptions<UpdatePersonMutation, UpdatePersonMutationVariables>;
export const DeletePersonDocument = gql`
    mutation DeletePerson($id: ID!) {
  deletePerson(id: $id)
}
    `;
export type DeletePersonMutationFn = Apollo.MutationFunction<DeletePersonMutation, DeletePersonMutationVariables>;

/**
 * __useDeletePersonMutation__
 *
 * To run a mutation, you first call `useDeletePersonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePersonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePersonMutation, { data, loading, error }] = useDeletePersonMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeletePersonMutation(baseOptions?: Apollo.MutationHookOptions<DeletePersonMutation, DeletePersonMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeletePersonMutation, DeletePersonMutationVariables>(DeletePersonDocument, options);
      }
export type DeletePersonMutationHookResult = ReturnType<typeof useDeletePersonMutation>;
export type DeletePersonMutationResult = Apollo.MutationResult<DeletePersonMutation>;
export type DeletePersonMutationOptions = Apollo.BaseMutationOptions<DeletePersonMutation, DeletePersonMutationVariables>;
export const GetScenariosDocument = gql`
    query GetScenarios($accountId: ID!) {
  scenarios(accountId: $accountId) {
    ...ScenarioFields
  }
}
    ${ScenarioFieldsFragmentDoc}`;

/**
 * __useGetScenariosQuery__
 *
 * To run a query within a React component, call `useGetScenariosQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetScenariosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetScenariosQuery({
 *   variables: {
 *      accountId: // value for 'accountId'
 *   },
 * });
 */
export function useGetScenariosQuery(baseOptions: Apollo.QueryHookOptions<GetScenariosQuery, GetScenariosQueryVariables> & ({ variables: GetScenariosQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetScenariosQuery, GetScenariosQueryVariables>(GetScenariosDocument, options);
      }
export function useGetScenariosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetScenariosQuery, GetScenariosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetScenariosQuery, GetScenariosQueryVariables>(GetScenariosDocument, options);
        }
// @ts-ignore
export function useGetScenariosSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetScenariosQuery, GetScenariosQueryVariables>): Apollo.UseSuspenseQueryResult<GetScenariosQuery, GetScenariosQueryVariables>;
export function useGetScenariosSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetScenariosQuery, GetScenariosQueryVariables>): Apollo.UseSuspenseQueryResult<GetScenariosQuery | undefined, GetScenariosQueryVariables>;
export function useGetScenariosSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetScenariosQuery, GetScenariosQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetScenariosQuery, GetScenariosQueryVariables>(GetScenariosDocument, options);
        }
export type GetScenariosQueryHookResult = ReturnType<typeof useGetScenariosQuery>;
export type GetScenariosLazyQueryHookResult = ReturnType<typeof useGetScenariosLazyQuery>;
export type GetScenariosSuspenseQueryHookResult = ReturnType<typeof useGetScenariosSuspenseQuery>;
export type GetScenariosQueryResult = Apollo.QueryResult<GetScenariosQuery, GetScenariosQueryVariables>;
export const GetScenarioDetailDocument = gql`
    query GetScenarioDetail($id: ID!, $filter: TransactionFilter) {
  scenario(id: $id) {
    ...ScenarioFields
    account {
      id
      name
    }
    events {
      ...ScenarioEventFields
    }
    grid(filter: $filter) {
      ...ScenarioGridFields
    }
  }
}
    ${ScenarioFieldsFragmentDoc}
${ScenarioEventFieldsFragmentDoc}
${ScenarioGridFieldsFragmentDoc}`;

/**
 * __useGetScenarioDetailQuery__
 *
 * To run a query within a React component, call `useGetScenarioDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetScenarioDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetScenarioDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useGetScenarioDetailQuery(baseOptions: Apollo.QueryHookOptions<GetScenarioDetailQuery, GetScenarioDetailQueryVariables> & ({ variables: GetScenarioDetailQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetScenarioDetailQuery, GetScenarioDetailQueryVariables>(GetScenarioDetailDocument, options);
      }
export function useGetScenarioDetailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetScenarioDetailQuery, GetScenarioDetailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetScenarioDetailQuery, GetScenarioDetailQueryVariables>(GetScenarioDetailDocument, options);
        }
// @ts-ignore
export function useGetScenarioDetailSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetScenarioDetailQuery, GetScenarioDetailQueryVariables>): Apollo.UseSuspenseQueryResult<GetScenarioDetailQuery, GetScenarioDetailQueryVariables>;
export function useGetScenarioDetailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetScenarioDetailQuery, GetScenarioDetailQueryVariables>): Apollo.UseSuspenseQueryResult<GetScenarioDetailQuery | undefined, GetScenarioDetailQueryVariables>;
export function useGetScenarioDetailSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetScenarioDetailQuery, GetScenarioDetailQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetScenarioDetailQuery, GetScenarioDetailQueryVariables>(GetScenarioDetailDocument, options);
        }
export type GetScenarioDetailQueryHookResult = ReturnType<typeof useGetScenarioDetailQuery>;
export type GetScenarioDetailLazyQueryHookResult = ReturnType<typeof useGetScenarioDetailLazyQuery>;
export type GetScenarioDetailSuspenseQueryHookResult = ReturnType<typeof useGetScenarioDetailSuspenseQuery>;
export type GetScenarioDetailQueryResult = Apollo.QueryResult<GetScenarioDetailQuery, GetScenarioDetailQueryVariables>;
export const CreateScenarioDocument = gql`
    mutation CreateScenario($input: CreateScenarioInput!) {
  createScenario(input: $input) {
    ...ScenarioFields
  }
}
    ${ScenarioFieldsFragmentDoc}`;
export type CreateScenarioMutationFn = Apollo.MutationFunction<CreateScenarioMutation, CreateScenarioMutationVariables>;

/**
 * __useCreateScenarioMutation__
 *
 * To run a mutation, you first call `useCreateScenarioMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateScenarioMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createScenarioMutation, { data, loading, error }] = useCreateScenarioMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateScenarioMutation(baseOptions?: Apollo.MutationHookOptions<CreateScenarioMutation, CreateScenarioMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateScenarioMutation, CreateScenarioMutationVariables>(CreateScenarioDocument, options);
      }
export type CreateScenarioMutationHookResult = ReturnType<typeof useCreateScenarioMutation>;
export type CreateScenarioMutationResult = Apollo.MutationResult<CreateScenarioMutation>;
export type CreateScenarioMutationOptions = Apollo.BaseMutationOptions<CreateScenarioMutation, CreateScenarioMutationVariables>;
export const UpdateScenarioDocument = gql`
    mutation UpdateScenario($id: ID!, $input: UpdateScenarioInput!) {
  updateScenario(id: $id, input: $input) {
    ...ScenarioFields
  }
}
    ${ScenarioFieldsFragmentDoc}`;
export type UpdateScenarioMutationFn = Apollo.MutationFunction<UpdateScenarioMutation, UpdateScenarioMutationVariables>;

/**
 * __useUpdateScenarioMutation__
 *
 * To run a mutation, you first call `useUpdateScenarioMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateScenarioMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateScenarioMutation, { data, loading, error }] = useUpdateScenarioMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateScenarioMutation(baseOptions?: Apollo.MutationHookOptions<UpdateScenarioMutation, UpdateScenarioMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateScenarioMutation, UpdateScenarioMutationVariables>(UpdateScenarioDocument, options);
      }
export type UpdateScenarioMutationHookResult = ReturnType<typeof useUpdateScenarioMutation>;
export type UpdateScenarioMutationResult = Apollo.MutationResult<UpdateScenarioMutation>;
export type UpdateScenarioMutationOptions = Apollo.BaseMutationOptions<UpdateScenarioMutation, UpdateScenarioMutationVariables>;
export const DeleteScenarioDocument = gql`
    mutation DeleteScenario($id: ID!) {
  deleteScenario(id: $id)
}
    `;
export type DeleteScenarioMutationFn = Apollo.MutationFunction<DeleteScenarioMutation, DeleteScenarioMutationVariables>;

/**
 * __useDeleteScenarioMutation__
 *
 * To run a mutation, you first call `useDeleteScenarioMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteScenarioMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteScenarioMutation, { data, loading, error }] = useDeleteScenarioMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteScenarioMutation(baseOptions?: Apollo.MutationHookOptions<DeleteScenarioMutation, DeleteScenarioMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteScenarioMutation, DeleteScenarioMutationVariables>(DeleteScenarioDocument, options);
      }
export type DeleteScenarioMutationHookResult = ReturnType<typeof useDeleteScenarioMutation>;
export type DeleteScenarioMutationResult = Apollo.MutationResult<DeleteScenarioMutation>;
export type DeleteScenarioMutationOptions = Apollo.BaseMutationOptions<DeleteScenarioMutation, DeleteScenarioMutationVariables>;
export const CreateScenarioEventDocument = gql`
    mutation CreateScenarioEvent($input: CreateScenarioEventInput!) {
  createScenarioEvent(input: $input) {
    ...ScenarioEventFields
  }
}
    ${ScenarioEventFieldsFragmentDoc}`;
export type CreateScenarioEventMutationFn = Apollo.MutationFunction<CreateScenarioEventMutation, CreateScenarioEventMutationVariables>;

/**
 * __useCreateScenarioEventMutation__
 *
 * To run a mutation, you first call `useCreateScenarioEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateScenarioEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createScenarioEventMutation, { data, loading, error }] = useCreateScenarioEventMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateScenarioEventMutation(baseOptions?: Apollo.MutationHookOptions<CreateScenarioEventMutation, CreateScenarioEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateScenarioEventMutation, CreateScenarioEventMutationVariables>(CreateScenarioEventDocument, options);
      }
export type CreateScenarioEventMutationHookResult = ReturnType<typeof useCreateScenarioEventMutation>;
export type CreateScenarioEventMutationResult = Apollo.MutationResult<CreateScenarioEventMutation>;
export type CreateScenarioEventMutationOptions = Apollo.BaseMutationOptions<CreateScenarioEventMutation, CreateScenarioEventMutationVariables>;
export const UpdateScenarioEventDocument = gql`
    mutation UpdateScenarioEvent($id: ID!, $input: UpdateScenarioEventInput!) {
  updateScenarioEvent(id: $id, input: $input) {
    ...ScenarioEventFields
  }
}
    ${ScenarioEventFieldsFragmentDoc}`;
export type UpdateScenarioEventMutationFn = Apollo.MutationFunction<UpdateScenarioEventMutation, UpdateScenarioEventMutationVariables>;

/**
 * __useUpdateScenarioEventMutation__
 *
 * To run a mutation, you first call `useUpdateScenarioEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateScenarioEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateScenarioEventMutation, { data, loading, error }] = useUpdateScenarioEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateScenarioEventMutation(baseOptions?: Apollo.MutationHookOptions<UpdateScenarioEventMutation, UpdateScenarioEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateScenarioEventMutation, UpdateScenarioEventMutationVariables>(UpdateScenarioEventDocument, options);
      }
export type UpdateScenarioEventMutationHookResult = ReturnType<typeof useUpdateScenarioEventMutation>;
export type UpdateScenarioEventMutationResult = Apollo.MutationResult<UpdateScenarioEventMutation>;
export type UpdateScenarioEventMutationOptions = Apollo.BaseMutationOptions<UpdateScenarioEventMutation, UpdateScenarioEventMutationVariables>;
export const DeleteScenarioEventDocument = gql`
    mutation DeleteScenarioEvent($id: ID!) {
  deleteScenarioEvent(id: $id)
}
    `;
export type DeleteScenarioEventMutationFn = Apollo.MutationFunction<DeleteScenarioEventMutation, DeleteScenarioEventMutationVariables>;

/**
 * __useDeleteScenarioEventMutation__
 *
 * To run a mutation, you first call `useDeleteScenarioEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteScenarioEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteScenarioEventMutation, { data, loading, error }] = useDeleteScenarioEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteScenarioEventMutation(baseOptions?: Apollo.MutationHookOptions<DeleteScenarioEventMutation, DeleteScenarioEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteScenarioEventMutation, DeleteScenarioEventMutationVariables>(DeleteScenarioEventDocument, options);
      }
export type DeleteScenarioEventMutationHookResult = ReturnType<typeof useDeleteScenarioEventMutation>;
export type DeleteScenarioEventMutationResult = Apollo.MutationResult<DeleteScenarioEventMutation>;
export type DeleteScenarioEventMutationOptions = Apollo.BaseMutationOptions<DeleteScenarioEventMutation, DeleteScenarioEventMutationVariables>;
export const CreateTransactionDocument = gql`
    mutation CreateTransaction($input: CreateTransactionInput!) {
  createTransaction(input: $input) {
    ...TransactionFields
  }
}
    ${TransactionFieldsFragmentDoc}`;
export type CreateTransactionMutationFn = Apollo.MutationFunction<CreateTransactionMutation, CreateTransactionMutationVariables>;

/**
 * __useCreateTransactionMutation__
 *
 * To run a mutation, you first call `useCreateTransactionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTransactionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTransactionMutation, { data, loading, error }] = useCreateTransactionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTransactionMutation(baseOptions?: Apollo.MutationHookOptions<CreateTransactionMutation, CreateTransactionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTransactionMutation, CreateTransactionMutationVariables>(CreateTransactionDocument, options);
      }
export type CreateTransactionMutationHookResult = ReturnType<typeof useCreateTransactionMutation>;
export type CreateTransactionMutationResult = Apollo.MutationResult<CreateTransactionMutation>;
export type CreateTransactionMutationOptions = Apollo.BaseMutationOptions<CreateTransactionMutation, CreateTransactionMutationVariables>;
export const UpdateTransactionDocument = gql`
    mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
  updateTransaction(id: $id, input: $input) {
    ...TransactionFields
  }
}
    ${TransactionFieldsFragmentDoc}`;
export type UpdateTransactionMutationFn = Apollo.MutationFunction<UpdateTransactionMutation, UpdateTransactionMutationVariables>;

/**
 * __useUpdateTransactionMutation__
 *
 * To run a mutation, you first call `useUpdateTransactionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTransactionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTransactionMutation, { data, loading, error }] = useUpdateTransactionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTransactionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTransactionMutation, UpdateTransactionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTransactionMutation, UpdateTransactionMutationVariables>(UpdateTransactionDocument, options);
      }
export type UpdateTransactionMutationHookResult = ReturnType<typeof useUpdateTransactionMutation>;
export type UpdateTransactionMutationResult = Apollo.MutationResult<UpdateTransactionMutation>;
export type UpdateTransactionMutationOptions = Apollo.BaseMutationOptions<UpdateTransactionMutation, UpdateTransactionMutationVariables>;
export const DeleteTransactionDocument = gql`
    mutation DeleteTransaction($id: ID!) {
  deleteTransaction(id: $id)
}
    `;
export type DeleteTransactionMutationFn = Apollo.MutationFunction<DeleteTransactionMutation, DeleteTransactionMutationVariables>;

/**
 * __useDeleteTransactionMutation__
 *
 * To run a mutation, you first call `useDeleteTransactionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTransactionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTransactionMutation, { data, loading, error }] = useDeleteTransactionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTransactionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTransactionMutation, DeleteTransactionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTransactionMutation, DeleteTransactionMutationVariables>(DeleteTransactionDocument, options);
      }
export type DeleteTransactionMutationHookResult = ReturnType<typeof useDeleteTransactionMutation>;
export type DeleteTransactionMutationResult = Apollo.MutationResult<DeleteTransactionMutation>;
export type DeleteTransactionMutationOptions = Apollo.BaseMutationOptions<DeleteTransactionMutation, DeleteTransactionMutationVariables>;
export const GetUsersDocument = gql`
    query GetUsers {
  users {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
// @ts-ignore
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>): Apollo.UseSuspenseQueryResult<GetUsersQuery, GetUsersQueryVariables>;
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>): Apollo.UseSuspenseQueryResult<GetUsersQuery | undefined, GetUsersQueryVariables>;
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersSuspenseQueryHookResult = ReturnType<typeof useGetUsersSuspenseQuery>;
export type GetUsersQueryResult = Apollo.QueryResult<GetUsersQuery, GetUsersQueryVariables>;