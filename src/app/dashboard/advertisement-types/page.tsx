"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.scss";
import Table from "@/app/(components)/general/Table";
import { getAllAdvertisementTypes } from "@/lib/data/advertisementType";
import deleteAdvertisementType from "@/actions/advertisement-types/deleteAdvertisementType";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";
import { MdCheck } from "react-icons/md";
import DeleteButton from "@/app/(components)/general/DeleteButton";
import { Advertisement } from "@prisma/client";
import { useToast } from "@/hooks/shadcn/use-toast";

const AdvertisementsPage = () => {
  const [advertisementTypes, setAdvertisementTypes] = useState<
  Partial<Advertisement>[] | null
>();
  const fetchAdvertisementTypes = async () => {
    const advertisements = await getAllAdvertisementTypes();
    setAdvertisementTypes(advertisements);
  };
  const { toast } = useToast();
  const successNotify = () => toast({
    title: "Successfully Deleted",
    variant: "default",
  });
  const errorNotify = () => toast({
    title: "Something went wrong. Deletion failed",
    variant: "destructive",
  });

  useEffect(() => {
    fetchAdvertisementTypes();
  }, []);

  const onAdvertisementTypeDelete = async (adTypeId?: string) => {
   const deleted = await deleteAdvertisementType(adTypeId || "-1");
    await fetchAdvertisementTypes()
    if (deleted) {
      successNotify();
    } else {
      errorNotify();
    }
  }

  const columns = [
    {
      name: "Name",
      size: "default",
    },
    {
      name: "Quantity Per Month",
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

  const data = advertisementTypes?.map((at) => {
    return [
      at.name,
      at.perMonth,
      at.isDayType ? <MdCheck /> : "",
      <div className={styles.modWrapper} key={at.id}>
        <Link
          href={`/dashboard/advertisement-types/${at.id}`}
          className={styles.editAction}
        >
          Edit
        </Link>
        <DeleteButton
          title="Delete Advertisement Type"
          onDelete={() => onAdvertisementTypeDelete(at.id)}
          text={`Are you sure you want to delete ${at.name}?`}
        />
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
