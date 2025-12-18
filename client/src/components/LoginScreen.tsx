import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
  isLoading?: boolean;
}

export default function LoginScreen({ onLogin, isLoading = false }: LoginScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background" data-testid="login-screen">
      <Card className="w-full max-w-md">
        <CardContent className="p-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              GE
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Go Ecco Climate Control
            </h1>
            <p className="text-muted-foreground text-sm">Field Sales Portal</p>
          </div>

          <Button 
            onClick={onLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
            data-testid="button-login"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign in with Replit'
            )}
          </Button>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Secure access for authorized personnel only
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
