"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login, type LoginState } from "@/app/election/actions";
import { Button, Field, Input } from "./ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-8 space-y-4" style={{ ["--el-brand" as string]: "#c81e1e" }}>
      <Field label="Username">
        <Input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          className="h-12 text-base"
        />
      </Field>
      <Field label="Password">
        <div className="relative">
          <Input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-12 pr-12 text-base"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-el-muted hover:text-el-text"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>
      {state.error && (
        <p role="alert" className="rounded-lg border border-el-danger/30 bg-el-danger/5 px-3 py-2 text-sm text-el-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
