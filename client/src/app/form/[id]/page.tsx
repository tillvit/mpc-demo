import { FormPage } from "./FormPage"

export default async function Manage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <FormPage id={id} />;
}