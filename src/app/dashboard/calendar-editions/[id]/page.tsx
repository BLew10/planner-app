import ATForm from "../CalendarForm";
import styles from "./page.module.scss";

const UpdateAdvertisement = async ({
  params,
}: {
  params: { id: string };
}) => {
  let { id } = params;

  if (id == "add") {
    id = ''
  }

  return (
    <section className={styles.container}>
      <ATForm
      id={id}
      />
    </section>
  );
};

export default UpdateAdvertisement;
