import { ContactModel } from "@/lib/models/contact";
import { CATEGORIES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContactInfoOverviewProps {
  contact: Partial<ContactModel> | null;
}

interface InfoItemProps {
  label: string;
  value?: string | null;
}

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="flex flex-col space-y-1">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <span className="text-sm">{value || "—"}</span>
  </div>
);

const ContactInfoOverview = ({ contact }: ContactInfoOverviewProps) => {
  const category = CATEGORIES.find(
    (category) =>
      contact?.category !== "0" && category.value === contact?.category
  )?.label;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Telecom Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Phone Number"
            value={contact?.contactTelecomInformation?.phone}
          />
          <InfoItem
            label="Alt Phone Number"
            value={contact?.contactTelecomInformation?.altPhone}
          />
          <InfoItem
            label="Home Phone Number"
            value={contact?.contactTelecomInformation?.homePhone}
          />
          <InfoItem
            label="Email"
            value={contact?.contactTelecomInformation?.email}
          />
          <InfoItem label="Website" value={contact?.webAddress} />
          <InfoItem
            label="Extension"
            value={contact?.contactTelecomInformation?.extension}
          />
          <InfoItem
            label="Fax"
            value={contact?.contactTelecomInformation?.fax}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Contact Name"
            value={`${contact?.contactContactInformation?.firstName || ""} ${
              contact?.contactContactInformation?.lastName || ""
            }`}
          />
          <InfoItem
            label="Alt Contact Name"
            value={`${
              contact?.contactContactInformation?.altContactFirstName || ""
            } ${contact?.contactContactInformation?.altContactLastName || ""}`}
          />
          <InfoItem
            label="Salutation"
            value={contact?.contactContactInformation?.salutation}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Address Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Address Line 1"
            value={contact?.contactAddress?.address}
          />
          <InfoItem
            label="Address Line 2"
            value={contact?.contactAddress?.address2}
          />
          <InfoItem label="City" value={contact?.contactAddress?.city} />
          <InfoItem label="State" value={contact?.contactAddress?.state} />
          <InfoItem label="Zip" value={contact?.contactAddress?.zip} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Other</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Category" value={category} />
          <InfoItem label="Customer Since" value={contact?.customerSince} />
          <InfoItem label="Notes" value={contact?.notes} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfoOverview;
