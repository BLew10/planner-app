import ATForm from "./ATForm";

const AddAddressBookPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return (
    <section className="container mx-auto my-10 w-full">
      <ATForm id={id === "add" ? null : id} />
    </section>
  );
};

export default AddAddressBookPage;
