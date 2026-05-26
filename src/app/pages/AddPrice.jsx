import AddPriceForm from "../components/AddPriceForm";

export default function AddPrice() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Contribute Data</h2>
        <p className="text-gray-600">Help the community by sharing local mandi prices</p>
      </div>
      <div className="mb-8">
        <AddPriceForm />
      </div>
    </>
  );
}
