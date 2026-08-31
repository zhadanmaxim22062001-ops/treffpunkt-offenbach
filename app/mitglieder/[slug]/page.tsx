import { notFound } from "next/navigation";
import { Eyebrow, Heading, Section } from "@/components/ui";
import members from "@/data/members.json";

export function generateStaticParams() {
  return members.members.map((m) => ({ slug: m.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = members.members.find((m) => m.slug === slug);
  if (!member) notFound();
  return (
    <Section>
      <Eyebrow className="mb-4">{member.branche} · {member.street}</Eyebrow>
      <Heading>{member.name}</Heading>
      <p className="prose-body mt-6">{member.line}</p>
    </Section>
  );
}
