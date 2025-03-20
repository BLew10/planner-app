import ATForm from "./ATForm";

const AddAddressBookPage = ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  return (
    <section className="container mx-auto my-10 w-full">
      <ATForm id={params.id === "add" ? null : params.id} />
    </section>
  );
};

export default AddAddressBookPage;
