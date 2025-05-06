"use client";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiInfo, FiX } from "react-icons/fi";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { api } from "../../lib/api";

interface PlanVariant {
  id: number;
  duration: string;
  price: string;
  plan: number;
}

interface Plan {
  id: number;
  plan_name: string;
  average_time_spend: boolean;
  bi_assured: boolean;
  bi_certification: boolean;
  bi_verification: boolean;
  chat: boolean;
  google_map: boolean;
  image_gallery: boolean;
  keywords: boolean;
  most_searhed_p_s: boolean;
  products_and_service_visibility: boolean;
  profile_view_count: boolean;
  profile_visit: boolean;
  sa_rate: boolean;
  search_priority_1: boolean;
  search_priority_2: boolean;
  search_priority_3: boolean;
  social_media_paid_promotion_in_bi_youtube: boolean;
  todays_offer: boolean;
  video_gallery: boolean;
  whatsapp_chat: boolean;
  varients: PlanVariant[];
}

const FEATURES_MAP: {
  key: keyof Plan;
  label: string;
  category: string;
  description?: string;
}[] = [
  {
    key: "chat",
    label: "Live Chat",
    category: "Communication",
    description: "Real-time chat with potential customers",
  },
  {
    key: "whatsapp_chat",
    label: "WhatsApp Chat",
    category: "Communication",
    description: "Direct WhatsApp integration for customer inquiries",
  },
  {
    key: "google_map",
    label: "Google Map Integration",
    category: "Visibility",
    description: "Show your business location on Google Maps",
  },
  {
    key: "image_gallery",
    label: "Image Gallery",
    category: "Content",
    description: "Showcase your products/services with high-quality images",
  },
  {
    key: "video_gallery",
    label: "Video Gallery",
    category: "Content",
    description: "Display product demos or business introduction videos",
  },
  {
    key: "keywords",
    label: "Keyword Support",
    category: "SEO",
    description: "Optimize your listing for better search visibility",
  },
  {
    key: "most_searhed_p_s",
    label: "Top Searched Products",
    category: "Analytics",
    description: "See which of your products/services are trending",
  },
  {
    key: "profile_view_count",
    label: "Profile View Count",
    category: "Analytics",
    description: "Track how many visitors view your profile",
  },
  {
    key: "profile_visit",
    label: "Profile Visit Analytics",
    category: "Analytics",
    description: "Detailed insights about your profile visitors",
  },
  {
    key: "search_priority_1",
    label: "Highest Search Priority",
    category: "Visibility",
    description: "Your business appears first in relevant searches",
  },
  {
    key: "search_priority_2",
    label: "High Search Priority",
    category: "Visibility",
    description: "Your business appears prominently in search results",
  },
  {
    key: "search_priority_3",
    label: "Standard Search Priority",
    category: "Visibility",
    description: "Standard visibility in search results",
  },
];

const PricingPage = ({
  onClick,
  close,
}: {
  onClick: (variantId: number, bid: number | null) => void;
  close: () => void;
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<number, number>
  >({});
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [selectedFeature, setSelectedFeature] = useState<{
    label: string;
    description: string;
  } | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get("users/plans/");
      if (response.status === 200) {
        setPlans(response.data);
        const defaultSelections = response.data.reduce(
          (acc: Record<number, number>, plan: Plan) => {
            if (plan.varients.length > 0) {
              acc[plan.id] = plan.varients[0].id;
            }
            return acc;
          },
          {}
        );
        setSelectedVariants(defaultSelections);

        // Initialize expanded categories
        const categories = FEATURES_MAP.reduce((acc, { category }) => {
          acc[category] = false;
          return acc;
        }, {} as Record<string, boolean>);
        setExpandedCategories(categories);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantChange = (planId: number, variantId: number) => {
    setSelectedVariants((prev) => ({ ...prev, [planId]: variantId }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getFeaturesByCategory = (plan: Plan) => {
    const featuresByCategory: Record<
      string,
      { label: string; included: boolean; description?: string }[]
    > = {};

    FEATURES_MAP.forEach(({ key, label, category, description }) => {
      if (!featuresByCategory[category]) {
        featuresByCategory[category] = [];
      }
      featuresByCategory[category].push({
        label,
        included: plan[key] as boolean,
        description,
      });
    });

    return featuresByCategory;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-full overflow-y-scroll relative bg-gradient-to-br w-full  from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={close}
        className="text-gray-300 absolute top-5 right-5 text-sm px-3 py-1 rounded-md bg-black"
      >
        skip
      </button>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Grow Your Business With Us
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan to boost your online presence and reach more
            customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const featuresByCategory = getFeaturesByCategory(plan);
            const isPopular = index === 1;
            const selectedVariant = plan.varients.find(
              (v) => v.id === selectedVariants[plan.id]
            );

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isPopular
                    ? "border-2 border-blue-500 shadow-xl transform md:-translate-y-2"
                    : "border border-gray-200 shadow-lg hover:shadow-xl"
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className="bg-white p-6">
                  <div className="mb-6">
                    <h2
                      className={`text-2xl font-bold mb-2 ${
                        isPopular ? "text-blue-600" : "text-gray-800"
                      }`}
                    >
                      {plan.plan_name}
                    </h2>

                    <div className="mb-6">
                      <div className="flex items-end mb-2">
                        <span className="text-3xl font-bold text-gray-900">
                          ₹{selectedVariant?.price}
                        </span>
                        <span className="text-gray-500 ml-1 mb-1">
                          /{selectedVariant?.duration} days
                        </span>
                      </div>
                      <div className="space-y-3">
                        {plan.varients.map((variant) => (
                          <label
                            key={variant.id}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                              selectedVariants[plan.id] === variant.id
                                ? "bg-blue-50 border border-blue-200"
                                : "bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name={`variant-${plan.id}`}
                                value={variant.id}
                                checked={
                                  selectedVariants[plan.id] === variant.id
                                }
                                onChange={() =>
                                  handleVariantChange(plan.id, variant.id)
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-3 text-gray-700 font-medium">
                                {variant.duration} days
                              </span>
                            </div>
                            <span className="text-gray-900 font-bold">
                              ₹{variant.price}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Plan Features
                    </h3>

                    <div className="space-y-4">
                      {Object.entries(featuresByCategory).map(
                        ([category, features]) => (
                          <div key={category}>
                            <button
                              onClick={() => toggleCategory(category)}
                              className="flex items-center justify-between w-full text-left"
                            >
                              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                                {category}
                              </h4>
                              {expandedCategories[category] ? (
                                <FaChevronUp className="text-gray-400" />
                              ) : (
                                <FaChevronDown className="text-gray-400" />
                              )}
                            </button>

                            <AnimatePresence>
                              {expandedCategories[category] && (
                                <motion.ul
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-2 mt-2 overflow-hidden"
                                >
                                  {features.map(
                                    ({ label, included, description }) => (
                                      <motion.li
                                        key={label}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-start"
                                      >
                                        <span
                                          className={`flex-shrink-0 ${
                                            included
                                              ? "text-green-500"
                                              : "text-gray-300"
                                          }`}
                                        >
                                          <FaCheckCircle className="h-5 w-5" />
                                        </span>
                                        <div className="ml-2">
                                          <span
                                            className={`${
                                              included
                                                ? "text-gray-700"
                                                : "text-gray-400 line-through"
                                            }`}
                                          >
                                            {label}
                                          </span>
                                          {description && included && (
                                            <button
                                              onClick={() =>
                                                setSelectedFeature({
                                                  label,
                                                  description,
                                                })
                                              }
                                              className="ml-2 text-blue-500 hover:text-blue-700"
                                            >
                                              <FiInfo className="inline" />
                                            </button>
                                          )}
                                        </div>
                                      </motion.li>
                                    )
                                  )}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const selectedId = selectedVariants[plan.id];
                      if (selectedId) onClick(selectedId, null);
                    }}
                    className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all ${
                      isPopular
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600"
                        : "bg-white border border-blue-500 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Get Started
                    <FiArrowRight className="ml-2" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Not sure which plan is right for you?
          </p>
          <button
            onClick={() => setShowComparison(true)}
            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            Compare all plans <FiArrowRight className="inline ml-1" />
          </button>
        </div>
      </div>

      {/* Feature Detail Modal */}
      <Transition appear show={!!selectedFeature} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setSelectedFeature(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {selectedFeature?.label}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {selectedFeature?.description}
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setSelectedFeature(null)}
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Comparison Modal */}
      <Transition appear show={showComparison} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowComparison(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold leading-6 text-gray-900"
                    >
                      Plan Comparison
                    </Dialog.Title>
                    <button
                      onClick={() => setShowComparison(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Feature
                          </th>
                          {plans.map((plan) => (
                            <th
                              key={plan.id}
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {plan.plan_name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {FEATURES_MAP.map((feature) => (
                          <tr key={feature.key}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {feature.label}
                              {feature.description && (
                                <button
                                  onClick={() =>
                                    setSelectedFeature({
                                      label: feature.label,
                                      description: feature.description || "",
                                    })
                                  }
                                  className="ml-2 text-blue-500 hover:text-blue-700"
                                >
                                  <FiInfo className="inline" />
                                </button>
                              )}
                            </td>
                            {plans.map((plan) => (
                              <td
                                key={`${plan.id}-${feature.key}`}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                              >
                                {plan[feature.key] ? (
                                  <FaCheckCircle className="text-green-500 h-5 w-5" />
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setShowComparison(false)}
                    >
                      Close Comparison
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default PricingPage;
