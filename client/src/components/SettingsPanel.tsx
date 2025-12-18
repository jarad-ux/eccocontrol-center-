import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, Check, X, ExternalLink } from "lucide-react";

interface Settings {
  webhookUrl: string;
  googleSheetId: string;
  googleSheetTab: string;
  lindyWebhookUrl: string;
  lindyApiKey: string;
  retellApiKey: string;
  retellAgentId: string;
  resendApiKey: string;
  resendFromEmail: string;
  resendToEmail: string;
  claudeApiKey: string;
  mcpServerUrl: string;
  mcpApiKey: string;
}

interface SettingsPanelProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onBack: () => void;
  isSaving?: boolean;
}

export default function SettingsPanel({ settings, onSave, onBack, isSaving = false }: SettingsPanelProps) {
  const [formData, setFormData] = useState<Settings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof Settings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const getConnectionStatus = (value: string) => {
    if (!value) return null;
    return (
      <Badge variant="default" className="bg-green-600 gap-1">
        <Check className="h-3 w-3" />
        Configured
      </Badge>
    );
  };

  return (
    <div className="space-y-6" data-testid="settings-panel">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure integrations and webhooks</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-settings">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Primary Webhook</CardTitle>
              <CardDescription>Send sale data to Zapier, Make, or other automation tools</CardDescription>
            </div>
            {getConnectionStatus(formData.webhookUrl)}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={formData.webhookUrl}
                onChange={(e) => handleChange('webhookUrl', e.target.value)}
                placeholder="https://hooks.zapier.com/..."
                data-testid="input-webhook-url"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Google Sheets Backup</CardTitle>
              <CardDescription>Automatically backup sales data to a Google Sheet</CardDescription>
            </div>
            {getConnectionStatus(formData.googleSheetId)}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="googleSheetId">Sheet ID</Label>
                <Input
                  id="googleSheetId"
                  value={formData.googleSheetId}
                  onChange={(e) => handleChange('googleSheetId', e.target.value)}
                  placeholder="1abc123..."
                  data-testid="input-google-sheet-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleSheetTab">Tab Name</Label>
                <Input
                  id="googleSheetTab"
                  value={formData.googleSheetTab}
                  onChange={(e) => handleChange('googleSheetTab', e.target.value)}
                  placeholder="Sales"
                  data-testid="input-google-sheet-tab"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Lindy.ai Integration</CardTitle>
              <CardDescription>AI-powered automation and workflows</CardDescription>
            </div>
            {getConnectionStatus(formData.lindyApiKey)}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lindyWebhookUrl">Webhook URL</Label>
                <Input
                  id="lindyWebhookUrl"
                  value={formData.lindyWebhookUrl}
                  onChange={(e) => handleChange('lindyWebhookUrl', e.target.value)}
                  placeholder="https://api.lindy.ai/..."
                  data-testid="input-lindy-webhook-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lindyApiKey">API Key</Label>
                <Input
                  id="lindyApiKey"
                  type="password"
                  value={formData.lindyApiKey}
                  onChange={(e) => handleChange('lindyApiKey', e.target.value)}
                  placeholder="Enter API key"
                  data-testid="input-lindy-api-key"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Retell AI</CardTitle>
              <CardDescription>Voice agent integrations for automated calls</CardDescription>
            </div>
            {getConnectionStatus(formData.retellApiKey)}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retellApiKey">API Key</Label>
                <Input
                  id="retellApiKey"
                  type="password"
                  value={formData.retellApiKey}
                  onChange={(e) => handleChange('retellApiKey', e.target.value)}
                  placeholder="Enter API key"
                  data-testid="input-retell-api-key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retellAgentId">Agent ID</Label>
                <Input
                  id="retellAgentId"
                  value={formData.retellAgentId}
                  onChange={(e) => handleChange('retellAgentId', e.target.value)}
                  placeholder="agent_..."
                  data-testid="input-retell-agent-id"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Resend Email</CardTitle>
              <CardDescription>Send email notifications for new sales</CardDescription>
            </div>
            {getConnectionStatus(formData.resendApiKey)}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resendApiKey">API Key</Label>
              <Input
                id="resendApiKey"
                type="password"
                value={formData.resendApiKey}
                onChange={(e) => handleChange('resendApiKey', e.target.value)}
                placeholder="re_..."
                data-testid="input-resend-api-key"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resendFromEmail">From Email</Label>
                <Input
                  id="resendFromEmail"
                  type="email"
                  value={formData.resendFromEmail}
                  onChange={(e) => handleChange('resendFromEmail', e.target.value)}
                  placeholder="sales@goecco.com"
                  data-testid="input-resend-from-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resendToEmail">Notification Email</Label>
                <Input
                  id="resendToEmail"
                  type="email"
                  value={formData.resendToEmail}
                  onChange={(e) => handleChange('resendToEmail', e.target.value)}
                  placeholder="manager@goecco.com"
                  data-testid="input-resend-to-email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Claude API (Anthropic)</CardTitle>
              <CardDescription>AI assistant for advanced automation</CardDescription>
            </div>
            {getConnectionStatus(formData.claudeApiKey)}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claudeApiKey">API Key</Label>
              <Input
                id="claudeApiKey"
                type="password"
                value={formData.claudeApiKey}
                onChange={(e) => handleChange('claudeApiKey', e.target.value)}
                placeholder="sk-ant-..."
                data-testid="input-claude-api-key"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Anthropic MCP Server</CardTitle>
              <CardDescription>Model Context Protocol server for AI tool connections</CardDescription>
            </div>
            {getConnectionStatus(formData.mcpServerUrl)}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mcpServerUrl">MCP Server URL</Label>
              <Input
                id="mcpServerUrl"
                value={formData.mcpServerUrl}
                onChange={(e) => handleChange('mcpServerUrl', e.target.value)}
                placeholder="https://mcp.example.com/..."
                data-testid="input-mcp-server-url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mcpApiKey">API Key</Label>
              <Input
                id="mcpApiKey"
                type="password"
                value={formData.mcpApiKey}
                onChange={(e) => handleChange('mcpApiKey', e.target.value)}
                placeholder="mcp-..."
                data-testid="input-mcp-api-key"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base">Zapier MCP Integration</CardTitle>
              <CardDescription>Connect Zapier automations to your AI workflows</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="w-full rounded-md overflow-hidden border border-border"
              data-testid="zapier-mcp-embed-container"
            >
              <zapier-mcp
                embed-id="f0733b87-3f4a-444f-8746-e38eeb36b9dd"
                width="100%"
                height="500px"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
