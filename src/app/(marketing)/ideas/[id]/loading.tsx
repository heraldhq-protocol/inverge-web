import { Container } from "@/components/ui/container";

export default function IdeaDetailLoading() {
  return (
    <Container
      className="animate-pulse py-8 sm:py-10"
      role="status"
      aria-label="Loading idea"
    >
      <div className="h-3 w-24 rounded-full bg-border" />
      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,1fr)] lg:gap-12">
        <div>
          <div className="aspect-[3/2] rounded-3xl bg-border/75" />
          <div className="mt-6 h-8 w-3/4 rounded-lg bg-border" />
          <div className="mt-3 h-5 w-full rounded-lg bg-border/75" />
          <div className="mt-3 h-5 w-2/3 rounded-lg bg-border/75" />
        </div>
        <div className="h-96 rounded-3xl bg-border/75" />
      </div>
      <span className="sr-only">Loading idea</span>
    </Container>
  );
}
