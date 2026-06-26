import { Card, CardContent } from "../../card";

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({
  children,
}: AuthCardProps) {
  return (
    <Card className="border-border/50 bg-card/70 backdrop-blur">
      <CardContent className="p-8">
        {children}
      </CardContent>
    </Card>
  );
}