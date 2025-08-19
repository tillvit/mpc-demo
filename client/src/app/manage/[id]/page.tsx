import { ManagePage } from "./ManagePage"

export default async function Manage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ManagePage id={id} />;
}