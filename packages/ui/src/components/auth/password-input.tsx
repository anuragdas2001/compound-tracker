"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../button"
import { Input } from "../../input"
interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function PasswordInput({
  className,
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={show ? "text" : "password"}
        className={className}
      />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
        onClick={() => setShow((prev) => !prev)}
      >
        {show ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}