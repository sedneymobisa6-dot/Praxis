import IntakeForm from './form';

export default function Page({ params }: { params: { id: string } }) {
  return <IntakeForm clientId={params.id} />;
}