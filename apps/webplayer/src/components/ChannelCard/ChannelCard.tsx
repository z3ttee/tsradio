export function ChannelCard() {
  return (
    <div className="group relative bg-surface-container rounded-lg w-full h-[200px] shadow border-2">
      <div className="flex flex-col h-full p-4 justify-between">
        <div></div>
        <div className="flex items-center justify-between gap-4">
          <p>1234</p>
          <button className="h-12 w-12 rounded-xl shadow-2xl bg-primary translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-0 group-focus-visible:opacity-100 group-focus-visible:translate-0 transition-all"></button>
        </div>
      </div>
    </div>
  );
}
