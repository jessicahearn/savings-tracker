import { EntityManager } from '../components/EntityManager';
import {
  useGetPeopleQuery,
  useCreatePersonMutation,
  useUpdatePersonMutation,
  useDeletePersonMutation,
} from '../graphql/generated';

export function PeopleManagement() {
  const { data, loading, refetch } = useGetPeopleQuery();
  const [createPerson] = useCreatePersonMutation();
  const [updatePerson] = useUpdatePersonMutation();
  const [deletePerson] = useDeletePersonMutation();

  return (
    <EntityManager
      title="People"
      entityName="Person"
      entities={data?.people ?? []}
      loading={loading}
      onCreate={async (name) => {
        await createPerson({ variables: { input: { name } } });
        await refetch();
      }}
      onUpdate={async (id, name) => {
        await updatePerson({ variables: { id, input: { name } } });
        await refetch();
      }}
      onDelete={async (id) => {
        await deletePerson({ variables: { id } });
        await refetch();
      }}
    />
  );
}
