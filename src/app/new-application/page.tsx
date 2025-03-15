import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import NewApplicationForm from '@/components/NewApplicationForm';

export default function NewApplicationPage() {
  return (
    <AuthenticatedLayout>
      <NewApplicationForm />
    </AuthenticatedLayout>
  );
}