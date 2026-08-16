import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { AccountTotalsCard } from '../components/AccountTotalsCard';
import { TransactionFilterBar } from '../components/TransactionFilterBar';
import { TransactionsTable } from '../components/TransactionsTable';
import {
  TransactionFormModal,
  type TransactionFormValues,
} from '../components/TransactionFormModal';
import {
  useGetAccountDetailQuery,
  useGetPeopleQuery,
  useGetCategoriesQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  type TransactionFieldsFragment,
  type TransactionFilter,
} from '../graphql/generated';

const PAGE_SIZE = 50;

export function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [filterPersonIds, setFilterPersonIds] = useState<string[]>([]);
  const [filterCategoryIds, setFilterCategoryIds] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TransactionFieldsFragment | null>(null);
  const [submitError, setSubmitError] = useState('');

  const filter: TransactionFilter = {};
  if (filterPersonIds.length > 0) filter.personIds = filterPersonIds;
  if (filterCategoryIds.length > 0) filter.categoryIds = filterCategoryIds;

  const { data, loading, refetch } = useGetAccountDetailQuery({
    variables: {
      id: id!,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      limit: PAGE_SIZE,
      offset,
    },
  });

  const { data: peopleData } = useGetPeopleQuery();
  const { data: categoriesData } = useGetCategoriesQuery();

  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();

  const handleOpenCreate = () => {
    setEditing(null);
    setSubmitError('');
    setShowModal(true);
  };

  const handleOpenEdit = (transaction: TransactionFieldsFragment) => {
    setEditing(transaction);
    setSubmitError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
    setSubmitError('');
  };

  const handleSubmit = async (values: TransactionFormValues) => {
    setSubmitError('');

    try {
      if (editing) {
        await updateTransaction({ variables: { id: editing.id, input: values } });
      } else {
        await createTransaction({ variables: { input: { accountId: id!, ...values } } });
        setOffset(0);
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (!window.confirm('Delete this transaction?')) return;

    try {
      await deleteTransaction({ variables: { id: transactionId } });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handlePersonFilterChange = (ids: string[]) => {
    setFilterPersonIds(ids);
    setOffset(0);
  };

  const handleCategoryFilterChange = (ids: string[]) => {
    setFilterCategoryIds(ids);
    setOffset(0);
  };

  if (loading) return <div>Loading...</div>;

  const account = data?.account;
  if (!account) return <div>Account not found</div>;

  const transactions = account.transactions;
  const people = peopleData?.people ?? [];
  const categories = categoriesData?.transactionCategories ?? [];

  return (
    <div>
      <div className="mb-4">
        <Button variant="secondary" onClick={() => navigate('/')} className="mb-3">
          ← Back to Accounts
        </Button>
        <h2>{account.name}</h2>
        {account.description && <p className="text-muted">{account.description}</p>}
      </div>

      <AccountTotalsCard totals={account.totals} people={account.people} />

      <TransactionFilterBar
        people={people}
        categories={categories}
        personIds={filterPersonIds}
        categoryIds={filterCategoryIds}
        onPersonIdsChange={handlePersonFilterChange}
        onCategoryIdsChange={handleCategoryFilterChange}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Transactions</h3>
        <Button variant="primary" onClick={handleOpenCreate}>
          Add Transaction
        </Button>
      </div>

      <TransactionsTable
        transactions={transactions}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <div className="d-flex gap-2 justify-content-between align-items-center">
        <div>
          <small className="text-muted">
            Showing {transactions.length === 0 ? 0 : offset + 1}–{offset + transactions.length}
          </small>
        </div>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            disabled={offset === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            className="ms-2"
            onClick={() => setOffset(offset + PAGE_SIZE)}
            disabled={transactions.length < PAGE_SIZE}
          >
            Next
          </Button>
        </div>
      </div>

      {showModal && (
        <TransactionFormModal
          key={editing?.id ?? 'new'}
          show={showModal}
          editing={editing}
          people={people}
          categories={categories}
          submitError={submitError}
          onSubmit={handleSubmit}
          onHide={handleCloseModal}
        />
      )}
    </div>
  );
}
