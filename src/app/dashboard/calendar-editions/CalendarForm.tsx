"use client";

import React, { useState, useEffect } from "react";

import styles from "./CalendarForm.module.scss";
import TextInput from "@/app/(components)/form/TextInput";
import AnimateWrapper from "@/app/(components)/general/AnimateWrapper";

import { getCalendarById } from "@/lib/data/calendarEdition";
import upsertCalendarEdition, {
  CalendarEditionFormData,
} from "@/actions/calendar-editions/upsertCalendarEdition";
import { CalendarEdition } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

interface CalendarFormProps {
  id: string | null;
}

const CalendarForm = ({ id }: CalendarFormProps) => {
  const [formData, setFormData] = useState<CalendarEditionFormData>({
    name: "",
    code: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const notifyError = () =>
    toast.error("Something went wrong. Please try again.");

  useEffect(() => {
    const fetchCalendar = async () => {
      const data = await getCalendarById(id || "-1");
      if (data) {
        setFormData({
          name: data.name || "",
          code: data.code || "",
        });
      }
    };

    if (id) {
      fetchCalendar();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const data = {
      name: formData.name || "",
      code: formData.code.toUpperCase() || "",
    }
    const success = await upsertCalendarEdition(formData, id);
    setIsSubmitting(false);
    if (success) {
      router.push("/dashboard/calendar-editions");
    } else {
      notifyError();
    }
  };

  return (
    <AnimateWrapper>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.heading}>
          {id ? "Edit" : "Add"} Calendar Edition
        </h2>
        <TextInput
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleInputChange}
          isRequired={true}
          title="Name is required"
        />
        <TextInput
          name="code"
          label="Code"
          maxLength={2}
          value={formData.code}
          onChange={handleInputChange}
          isRequired={true}
          title="Code is required"
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

export default CalendarForm;
