import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/shadcn/use-toast";
import { getContactById } from "@/lib/data/contact";
import upsertContact, {
  ContactFormData,
} from "@/actions/contact/upsertContact";
import { ContactModel } from "@/lib/models/contact";
import { ContactFormValues } from "@/app/dashboard/contacts/[contactId]/ContactForm";

interface UseContactOptions {
  id: string | null;
}

export const useContact = ({ id }: UseContactOptions) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [contact, setContact] = useState<Partial<ContactModel> | null>(null);

  const fetchContact = useCallback(
    async (cId: string | null) => {
      setIsLoading(true);
      try {
        if (!cId) return null;
        const contactData = await getContactById(cId);
        if (!contactData) {
          router.push("/dashboard/contacts");
          return null;
        }
        setContact(contactData);
      } catch (error) {
        toast({
          title: "Error fetching contact",
          description: "There was a problem loading the contact information.",
          variant: "destructive",
        });
        setContact(null);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchContact(id);
  }, [id, fetchContact]);

  const saveContact = async (data: ContactFormValues) => {
    const submissionData: ContactFormData = {
      customerSince: data?.customerSince || "",
      notes: data?.notes || "",
      category: data?.category || "",
      webAddress: data?.webAddress || "",
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      altContactFirstName: data?.altContactFirstName || "",
      altContactLastName: data?.altContactLastName || "",
      salutation: data?.salutation || "",
      company: data?.company || "",
      extension: data?.extension || "",
      phone: data?.phone || "",
      altPhone: data?.altPhone || "",
      fax: data?.fax || "",
      email: data?.email || "",
      cellPhone: data?.cellPhone || "",
      homePhone: data?.homePhone || "",
      address: data?.address || "",
      address2: data?.address2 || "",
      city: data?.city || "",
      state: data?.state || "",
      country: data?.country || "",
      zip: data?.zip || "",
      addressBooksIds: data?.addressBooksIds?.map((id) => ({ id })) || [],
    };
    setIsLoading(true);
    try {
      const success = await upsertContact(submissionData, id);
      if (success) {
        router.push("/dashboard/contacts");
        toast({
          title: "Contact saved successfully",
          description: "The contact information has been updated.",
        });
        return true;
      } else {
        throw new Error("Failed to save contact");
      }
    } catch (error) {
      toast({
        title: "Error saving contact",
        description:
          "There was a problem saving the contact information. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveContact,
    contact,
  };
};
