import { redirect } from 'next/navigation';

export default function IntakeRoot({ params }: { params: { id: string } }) {
  redirect('/firm/clients/' + params.id + '/intake/basic');
}