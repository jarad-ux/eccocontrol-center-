import SettingsPanel from '../SettingsPanel';
import { Toaster } from '@/components/ui/toaster';

export default function SettingsPanelExample() {
  return (
    <div className="p-6 bg-background min-h-screen">
      <SettingsPanel
        settings={{
          webhookUrl: 'https://hooks.zapier.com/example',
          googleSheetId: '',
          googleSheetTab: 'Sales',
          lidyWebhookUrl: '',
          lidyApiKey: '',
          retellApiKey: '',
          retellAgentId: '',
          resendApiKey: '',
          resendFromEmail: '',
          resendToEmail: ''
        }}
        onSave={(settings) => console.log('Settings saved:', settings)}
        onBack={() => console.log('Back clicked')}
      />
      <Toaster />
    </div>
  );
}
