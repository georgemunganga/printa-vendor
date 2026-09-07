import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Check, RefreshCw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { billingService, type SubscriptionTierDto } from "@/services/billing.service";

const formatPrice = (price: number) =>
  `K${new Intl.NumberFormat("en-ZM", { maximumFractionDigits: 2 }).format(price)}`;

const formatTierName = (name: string) =>
  name.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

const Pricing = () => {
  const [tiers, setTiers] = useState<SubscriptionTierDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTiers = useCallback(async () => {
    setIsLoading(true);
    try {
      const catalogue = await billingService.listTiers();
      setTiers(
        catalogue
          .filter((tier) => tier.is_available)
          .sort((a, b) => a.display_order - b.display_order),
      );
      setError(null);
    } catch {
      setTiers([]);
      setError("Subscription plans could not be loaded. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTiers();
  }, [loadTiers]);

  return (
    <Layout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-16 md:py-24"
      >
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <Badge className="mb-4 bg-red-50 text-printa-red hover:bg-red-50">Vendor plans</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">Simple pricing for your print shop</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 md:text-lg">
            Run your point of sale, inventory, team, and live Printa orders from one workspace. All prices are billed monthly in Zambian kwacha.
          </p>
        </div>

        {isLoading ? (
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2" aria-label="Loading subscription plans">
            {[0, 1].map((item) => (
              <div key={item} className="h-[430px] animate-pulse rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                <div className="h-7 w-28 rounded-lg bg-gray-100" />
                <div className="mt-4 h-4 w-52 rounded bg-gray-100" />
                <div className="mt-8 h-11 w-32 rounded-lg bg-gray-100" />
                <div className="mt-9 space-y-4">
                  {[0, 1, 2, 3, 4].map((line) => <div key={line} className="h-4 rounded bg-gray-100" />)}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto text-printa-red" size={28} />
            <p className="mt-3 text-sm text-gray-700">{error}</p>
            <Button onClick={() => void loadTiers()} variant="outline" className="mt-4 gap-2 border-red-200 text-printa-red hover:bg-white">
              <RefreshCw size={16} /> Try again
            </Button>
          </div>
        ) : tiers.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
            No subscription plans are available right now. Please check again shortly.
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {tiers.map((tier, index) => (
              <motion.article
                key={tier.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`relative overflow-hidden rounded-3xl border bg-white shadow-sm ${tier.is_popular ? "border-printa-red shadow-red-100" : "border-gray-200"}`}
              >
                {tier.is_popular && (
                  <div className="bg-printa-red px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-white">Most popular</div>
                )}
                <div className="p-7 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-900">{formatTierName(tier.name)}</h2>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-gray-500">{tier.description}</p>
                  <div className="mt-7 flex items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">{formatPrice(tier.monthly_price)}</span>
                    <span className="pb-1 text-sm text-gray-500">/ month</span>
                  </div>
                  <ul className="mt-8 space-y-3">
                    {tier.features.filter((feature) => feature.included).map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-printa-red"><Check size={13} /></span>
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="mt-8 block">
                    <Button className={`h-12 w-full rounded-xl font-semibold ${tier.is_popular ? "bg-printa-red hover:bg-printa-red/90" : "bg-gray-900 hover:bg-gray-800"}`}>
                      Start with {formatTierName(tier.name)}
                    </Button>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center">
          <p className="text-sm leading-6 text-gray-600">
            Already have a vendor account? <Link to="/login" className="font-semibold text-printa-red hover:underline">Sign in</Link> to view your current plan, invoices, and payment status.
          </p>
        </div>
      </motion.main>
    </Layout>
  );
};

export default Pricing;
