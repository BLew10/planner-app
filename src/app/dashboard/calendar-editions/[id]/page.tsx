import CalendarForm from "../CalendarForm";
import styles from "./page.module.scss";

const CalendarEditionForm = async ({
  params,
}: {
  params: { id: string | null };
}) => {
  let { id } = params;

  if (id == "add") {
    id = null
  }

  return (
    <section className={styles.container}>
      <CalendarForm
      id={id}
      />
    </section>
  );
};

export default CalendarEditionForm;
