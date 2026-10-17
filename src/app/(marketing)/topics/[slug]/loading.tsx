import { Container } from "@/components/ui/container";

export default function TopicLoading() {
  return (
    <Container
      className="animate-pulse py-8 sm:py-10"
      role="status"
      aria-label="Loading topic"
    >
      <div className="h-3 w-28 rounded-full bg-border" />
      <div className="mt-4 h-9 w-2/3 rounded-lg bg-border" />
      <div className="mt-3 h-5 w-1/2 rounded-lg bg-border/75" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-72 rounded-2xl bg-border/75" />
        ))}
      </div>
      <span className="sr-only">Loading topic</span>
    </Container>
  );
}
