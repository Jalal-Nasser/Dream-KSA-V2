export function handleSupaError(error: any) {
  if (!error) return null;
  
  const msg = error?.message || "";
  const code = error?.code || "";
  
  // RLS or not authorized typical patterns
  if (code === "42501" || /permission|rls|not allowed|policy/i.test(msg)) {
    return { type: "RLS", message: "You don't have permission for this action." };
  }
  
  return { type: "GENERIC", message: msg || "Something went wrong." };
}

