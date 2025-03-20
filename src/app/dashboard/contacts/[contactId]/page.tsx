import ContactForm from "./ContactForm";

const UpsertContactPage = async ({
  params,
}: {
  params: { contactId: string };
}) => {
  const { contactId } = params;

  return <ContactForm id={contactId === "add" ? null : contactId} />;
};

export default UpsertContactPage;
