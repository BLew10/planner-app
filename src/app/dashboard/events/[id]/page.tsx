import EventForm from "../EventForm";

const EventFormPage = async ({
  params,
}: {
  params: { id: string | null };
}) => {
  let { id } = params;

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