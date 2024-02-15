import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";
import deleteAdvertisementType from "@/actions/advertisement-types/deleteAdvertisementType";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { MdCheck } from "react-icons/md";

const AdvertisementsPage = async () => {
  const advertisements = await getAllAdvertisementTypes();

  const columns = [
    {
      name: "Name",
      size: "default",
    },
    {
      name: "Quanity Per Month",
      size: "default",
    },
    {
      name: "Is Day Type",
      size: "default",
    },
    {
      name: "Actions",
      size: "default",
    },
  ];

  const data = advertisements?.map((at) => {
    return [
      at.name,
      at.perMonth,
      at.isDayType ? <MdCheck /> : "",
      <div className={styles.modWrapper}>
        <Link
          href={`/dashboard/advertisement-types/${at.id}`}
          className={styles.editAction}
        >
          Edit
        </Link>
        <form action={deleteAdvertisementType}>
          <button type="submit" className={styles.deleteAction}>
            Delete
          </button>
          <input type="hidden" name="advertisementId" value={at.id} />
        </form>
      </div>,
    ];
  });

  return (
    <AnimateWrapper>
      <section className={styles.container}>
        <Table tableName="Advertisement Types" columns={columns} data={data} addPath={'/dashboard/advertisement-types/add'} />
      </section>
    </AnimateWrapper>
  );
};

export default AdvertisementsPage;
