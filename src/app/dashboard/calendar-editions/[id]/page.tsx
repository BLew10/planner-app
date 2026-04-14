import CalendarForm from "./CalendarForm";

const CalendarEditionForm = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolved = await params;
  let id: string | null = resolved.id;

  if (id == "add") {
    id = null;
  }

  return (
    <section className="container mx-auto px-4 w-full mt-10">
      <CalendarForm id={id} />
    </section>
  );
};

export default CalendarEditionForm;
