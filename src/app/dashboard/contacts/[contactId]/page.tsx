import ContactForm from "../ContactForm";
import styles from "./page.module.scss";

const UpdateContactPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  let  { id } = params;
 if (id === 'add') {
    id = '';
  }
  return (
    <section className={styles.container}>
      <ContactForm
      id={id=== 'add' ? null : id}
      />
    </section>
  );
};

export default UpdateContactPage;
