"use client";

import React, { useState, useEffect } from "react";

import styles from "./ATForm.module.scss";
import TextInput from "@/app/(components)/form/TextInput";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";

import { getAdvertisementTypeById } from "@/lib/data/advertisementType";
import upsertAdvertisementType from "@/actions/advertisement-types/upsertAdvertismentType";
import CheckboxInput from "@/app/(components)/form/CheckboxInput";
import { Advertisement } from "@prisma/client";

interface ATProps {
  id: string;
}

const ATForm = ({ id }: ATProps) => {
  const [advertisement, setAdvertisement] =
    useState<Partial<Advertisement | null>>();
  const [isDayType, setIsDayType] = useState(false);
  const [quantityPerMonth, setQuantityPerMonth] = useState("");
  useEffect(() => {
    const fetchAdvertisement = async () => {
      const data = await getAdvertisementTypeById(id);
      setAdvertisement(data);
      setIsDayType(data?.isDayType || false);
      setQuantityPerMonth(String(data?.perMonth || ""));
    };

    if (id) {
      fetchAdvertisement();
    }
  }, [id]);

  useEffect(() => {
    if (isDayType) {
      setQuantityPerMonth("35");
    } else {
      setQuantityPerMonth("");
    }
  }, [isDayType]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDayType(e.target.checked);
    console.log(e.target.checked);
    if (e.target.checked) {
      console.log("setting to 35");
      setQuantityPerMonth("35");
    }
  };

  return (
    <AnimateWrapper>
      <form action={upsertAdvertisementType} className={styles.form}>
        {advertisement && (
          <input
            type="hidden"
            name="advertisementId"
            value={advertisement.id}
          />
        )}
        <h2 className={styles.heading}>
          {advertisement?.id ? "Edit" : "Add"} Advertisement Type
        </h2>
        <div className={styles.instructions}>
          Use this form to either add a new advertisement type or edit an
          existing one.
          <p className={styles.subInstructions}>
            The "Quantity per Month" field indicates the total number of this
            advertisement type that can be used each month.
          </p>
          <p className={styles.subInstructions}>
            For "Day Type" advertisements, this quantity is automatically set to
            35 and cannot be altered, reflecting the fixed availability of
            day-specific slots within a month.
          </p>
        </div>
        <TextInput
          name="name"
          label="Name"
          value={advertisement?.name}
          isRequired={true}
        />
        <TextInput
          name="perMonth"
          label="Quantity per Month"
          value={quantityPerMonth}
          onChange={(e) => setQuantityPerMonth(e.target.value)}
          isReadOnly={isDayType}
          isRequired={true}
          pattern="^[0-9]+$"
          title="Please enter numbers only."
        />
        <CheckboxInput
          name="isDayType"
          label="Day Type"
          isReadOnly={!!advertisement?.id}
          onChange={handleCheckboxChange}
          checked={isDayType}
        />
        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </AnimateWrapper>
  );
};

export default ATForm;
