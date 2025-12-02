import { ChannelCard } from "@/components/ChannelCard/ChannelCard";

export default function Home() {
  return (
    <div className="container mx-auto p-6 relative">
      <div className="grid grid-cols-3 mt-6 gap-6 pb-24">
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
        <ChannelCard />
      </div>

      <div className="fixed left-0 right-0 bottom-6">
        <div className="container mx-auto px-6">
          <div className="container mx-auto bg-surface-container rounded-lg p-4 shadow-xl">
            Player bar
          </div>
        </div>
      </div>
    </div>
  );
}
