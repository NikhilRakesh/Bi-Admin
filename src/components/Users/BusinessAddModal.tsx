import { MdOutlineClose } from "react-icons/md";
import BusinessInformation from "./BusinessInformation";
import { useAppSelector } from "../../redux/hooks";
import { token_api } from "../../lib/api";
import { useState } from "react";
import BusinessLoading from "./BusinessLoading";
import toast, { Toaster } from "react-hot-toast";
import AddProduct from "./AddProduct";
import ServiceManager from "./ServiceManager";
import CategorySelector from "./CategorySelector";
import PricingPage from "./PricingPage";

interface BusinessAddModalProbs {
  close: () => void;
  uid: number;
}

interface BusinessFormData {
  name: string;
  description: string;
  buisness_type: string;
  manager_name: string;
  building_name: string;
  landmark: string;
  locality: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
  whatsapp_number: string;
  email: string;
  incharge_number: string;
  uid: number;
}

export default function BusinessAddModal({
  close,
  uid,
}: BusinessAddModalProbs) {
  const { user } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessFormData | null>(
    null
  );
  const [bid, setBid] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function HandleAddBusiness(data: BusinessFormData) {
    setLoading(true);
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).post("badmin/add_buisness/", data);

      if (response.status === 201) {
        setBid(response.data.id);
        setBusinessData(data);
        setLoading(false);
      }
    } catch (error) {
      console.log("error on handleAddUser:", error);
      setLoading(false);
      toast.error("Something went wrong please try again");
    }
  }

  async function skip() {
    if (step === 1) {
      businessData?.buisness_type === "Service"
        ? setStep(step + 2)
        : setStep(step + 1);
      return;
    }
    if (step === 2) {
      businessData?.buisness_type === "Products & Services"
        ? setStep(step + 1)
        : setStep(step + 2);
    } else {
      setStep(step + 1);
    }
  }

  async function onClick(pvid: number) {
    if (!pvid) return;
    setLoading(true);
    try {
      const response = await token_api(
        user?.access_token,
        user?.refresh_token
      ).post("initiate-payment/", {
        pvid,
        bid: bid,
      });

      if (response?.status === 200) {
        const redirectUrl = response?.data?.redirect_url;
        setLoading(false);
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching plans:", error);
    }
  }

  return (
    <div className="fixed  top-0 h-full bg-gray-800 w-full inset-0 bg-opacity-50 flex justify-center items-center">
      <MdOutlineClose
        className="absolute text-gray-100 top-5 right-5 cursor-pointer"
        onClick={close}
        size={40}
      />

      {step === 1 && (
        <BusinessInformation
          uid={uid}
          onContinue={HandleAddBusiness}
          bid={bid}
          skip={skip}
        />
      )}
      {step === 2 && bid && <AddProduct bid={bid} skip={skip} />}
      {step === 3 && bid && <ServiceManager bid={bid} skip={skip} />}
      {step === 4 && bid && (
        <CategorySelector
          bid={bid}
          skip={skip}
          loading={() => setLoading(true)}
          notloading={() => setLoading(false)}
        />
      )}
      {step === 5 && <PricingPage onClick={onClick} close={close} />}
      {loading && <BusinessLoading />}
      <Toaster />
    </div>
  );
}
