import ContactOverview from "./ContactOverview";
import styles from "./page.module.scss";

const ContactOverviewPage = async ({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) => {
  let { contactId } = await params;
  return <ContactOverview contactId={contactId} />;
};

export default ContactOverviewPage;
