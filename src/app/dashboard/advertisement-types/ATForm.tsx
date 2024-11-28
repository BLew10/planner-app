"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./ATForm.module.scss";
import TextInput from "@/app/(components)/form/TextInput";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";

import { getAdvertisementTypeById } from "@/lib/data/advertisementType";
import upsertAdvertisementType, {
  AdvertisementTypeFormData,
} from "@/actions/advertisement-types/upsertAdvertismentType";
import CheckboxInput from "@/app/(components)/form/CheckboxInput";
import { useToast } from "@/hooks/shadcn/use-toast";

interface ATProps {
  id: string | null;
}

const ATForm = ({ id }: ATProps) => {
  const [formData, setFormData] = useState<AdvertisementTypeFormData>({
    isDayType: false,
    perMonth: 0,
    name: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const notifyError = () =>
    toast({
      title: "Something went wrong. Please try again.",
      variant: "destructive",
    });

  useEffect(() => {
    const fetchAdvertisement = async () => {
      const data = await getAdvertisementTypeById(id || "-1");
      if (data) {
        setFormData({
          name: data.name || "",
          isDayType: data.isDayType || false,
          perMonth: data.perMonth || 0,
        });
      } else {
        setFormData({
          name: "",
          isDayType: false,
          perMonth: 0,
        });
      }
    };

    if (id) {
      fetchAdvertisement();
    }
  }, [id]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      perMonth: prev.isDayType ? 35 : prev.perMonth,
    }));
  }, [formData.isDayType]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "isDayType" && checked) {
      setFormData((prev) => ({ ...prev, perMonth: 35 }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const { name, isDayType, perMonth } = formData;
    const data = {
      name: name || "",
      isDayType: isDayType || false,
      perMonth: Number(perMonth) || 0,
    };
    const success = await upsertAdvertisementType(data, id);
    setIsSubmitting(false);
    if (success) {
      router.push("/dashboard/advertisement-types");
    } else {
      notifyError();
    }
  };

  return (
    <AnimateWrapper>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.heading}>
          {id ? "Edit" : "Add"} Advertisement Type
        </h2>
        <div className={styles.instructions}>
          Use this form to either add a new advertisement type or edit an
          existing one.
          <p className={styles.subInstructions}>
            {`The "Quantity per Month" field indicates the total number of this advertisement type that can be used each month.`}
            {`For "Day Type" advertisements, this quantity is automatically set to 35 and cannot be altered, reflecting the fixed availability of day-specific slots within a month.`}
          </p>
        </div>
        <TextInput
          name="name"
          label="Name"
          value={formData.name || ""}
          onChange={handleInputChange}
          isRequired={true}
        />
        <TextInput
          name="perMonth"
          label="Quantity Per Month"
          value={String(formData.perMonth) || ""}
          onChange={handleInputChange}
          isReadOnly={formData.isDayType}
          isRequired={true}
          pattern="^[0-9]+$"
          title="Please enter numbers only."
        />
        <CheckboxInput
          name="isDayType"
          label="Day Type"
          isReadOnly={id ? true : false}
          onChange={handleInputChange}
          checked={formData.isDayType}
        />
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>
    </AnimateWrapper>
  );
};

export default ATForm;
