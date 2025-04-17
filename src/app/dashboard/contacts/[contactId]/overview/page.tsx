import ContactOverview from "./ContactOverview";
import styles from "./page.module.scss";

const ContactOverviewPage = async ({
  params,
}: {
  params: { contactId: string };
}) => {
  let { contactId } = params;
  return <ContactOverview contactId={contactId} />;
};

export default ContactOverviewPage;
