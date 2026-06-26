"use client";
import { Button } from "../../button"
export function SocialLogin() {
  return (
    <>
      <div className="my-8 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">
          or continue with
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          // signIn("google")
        }}
      >
        Google
      </Button>
    </>
  );
}