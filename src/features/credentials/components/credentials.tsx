"use client";
import { formatDistanceToNow } from "date-fns";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { useRouter } from "next/navigation";
import { useEntitySearch } from "../hooks/use-entity-search";
import { WorkflowIcon } from "lucide-react";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { Credential } from "@/generated/prisma/client";

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  );
};

export const CredentialsList = () => {
  const { data: credentials } = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem credential={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <EntityHeader
      title="Credentials"
      description="Create and manage your credentials"
      newButtonLabel="New credential"
      newButtonHref="/credentials/new"
      disabled={disabled}
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      page={credentials.data.page}
      totalPages={credentials.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

interface CredentialStateProps {
  message?: string;
}

export const CredentialsLoading = ({ message }: CredentialStateProps) => {
  return <LoadingView message={message} />;
};

export const CredentialsError = ({ message }: CredentialStateProps) => {
  return <ErrorView message={message} />;
};

export const CredentialsEmpty = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push(`/credentials/new`);
  };
  return (
    <EmptyView
      onNew={handleCreate}
      message="You haven't created any credentials yet. Get started by creating your first credential."
    />
  );
};

export const CredentialItem = ({ credential }: { credential: Credential }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ id: credential.id });
  };

  return (
    <EntityItem
      href={`/credentials/${credential.id}`}
      title={credential.name}
      subtitle={
        <>
          Updated{" "}
          {formatDistanceToNow(credential.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(credential.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};
