import ATForm from "../ATForm";
import styles from "./page.module.scss";

const UpdateAdvertisement = async ({
  params,
}: {
  params: { id: string };
}) => {
  const { id } = params;

  return (
    <section className={styles.container}>
      <ATForm
      id={id}
      />
    </section>
  );
};

export default UpdateAdvertisement;
