import Header from '../Header';

export default function HeaderExample() {
  return (
    <Header
      userName="Joey Majors"
      userRole="admin"
      currentView="dashboard"
      onNavigate={(view) => console.log('Navigate to:', view)}
      onLogout={() => console.log('Logout clicked')}
    />
  );
}
