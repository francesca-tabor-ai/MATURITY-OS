import { CreateOrganisationForm } from '@/components/create-organisation-form';

export default function NewOrganisationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">New organisation</h1>
      <p className="text-zinc-600 mb-6">Create a new organisation and invite your team.</p>
      <CreateOrganisationForm />
    </div>
  );
}
