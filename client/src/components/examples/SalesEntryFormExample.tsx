import SalesEntryForm from '../SalesEntryForm';

export default function SalesEntryFormExample() {
  return (
    <div className="p-6 bg-background min-h-screen">
      <SalesEntryForm
        userDivision="all"
        onSubmit={(data) => console.log('Form submitted:', data)}
        onCancel={() => console.log('Cancel clicked')}
      />
    </div>
  );
}
