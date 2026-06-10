import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button className="btn btn-secondary" type="submit">
        <LogOut size={16} />
        Salir
      </button>
    </form>
  );
}
