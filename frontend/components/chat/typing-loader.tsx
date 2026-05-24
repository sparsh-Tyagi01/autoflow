export default function TypingLoader() {
  return (
    <div className="flex items-center gap-2 bg-muted w-fit rounded-2xl px-4 py-3">
      <div className="w-2 h-2 rounded-full bg-black animate-bounce" />
      <div className="w-2 h-2 rounded-full bg-black animate-bounce delay-100" />
      <div className="w-2 h-2 rounded-full bg-black animate-bounce delay-200" />
    </div>
  )
}