import { SidebarTrigger } from "@/components/ui/sidebar";

export const AppHeader = () => {
  return (
    <header className="flex h-14 shrink-0 gap-2 border-b bg-background items-center px-4">
      <SidebarTrigger />
    </header>
  );
};
