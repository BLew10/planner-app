import EventForm from "../EventForm";

const EventFormPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolved = await params;
  let id: string | null = resolved.id;

  if (id === "add") {
    id = null;
  }

  return (
    <section className="container mx-auto px-4 w-full mt-10">
      <EventForm id={id} />
    </section>
  );
};

export default EventFormPage;