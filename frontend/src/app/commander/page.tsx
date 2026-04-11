import ChatWindow from "@/components/chat/ChatWindow";
import OrbitSidebar from "@/components/layout/OrbitSidebar";
import Periphery from "@/components/layout/Periphery";

export default function CommanderPage() {
  return (
    <div className="flex w-full">
      <OrbitSidebar />
      <ChatWindow />
      <Periphery />
    </div>
  );
}
