import ContactForm from "./ContactForm";

const UpsertContactPage = async ({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) => {
  const { contactId } = await params;

  return <ContactForm id={contactId === "add" ? null : contactId} />;
};

export default UpsertContactPage;
