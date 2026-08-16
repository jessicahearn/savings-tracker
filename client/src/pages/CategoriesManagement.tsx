import { EntityManager } from '../components/EntityManager';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../graphql/generated';

export function CategoriesManagement() {
  const { data, loading, refetch } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  return (
    <EntityManager
      title="Categories"
      entityName="Category"
      entities={data?.transactionCategories ?? []}
      loading={loading}
      onCreate={async (name) => {
        await createCategory({ variables: { input: { name } } });
        await refetch();
      }}
      onUpdate={async (id, name) => {
        await updateCategory({ variables: { id, input: { name } } });
        await refetch();
      }}
      onDelete={async (id) => {
        await deleteCategory({ variables: { id } });
        await refetch();
      }}
    />
  );
}
